// backend
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getAuth } from '@clerk/nextjs/server';
import imageKit from '@/configs/imageKit';
import axios from 'axios';

const prisma = new PrismaClient();

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const senderId = searchParams.get("senderId");
    const receiverId = searchParams.get("receiverId");
    // If both senderId and receiverId provided -> return messages between the two
    if (senderId && receiverId) {
      console.log("Fetching messages between:", senderId, "and", receiverId);
      const messages = await prisma.message.findMany({
        where: {
          OR: [
            { senderId, receiverId },
            { senderId: receiverId, receiverId: senderId },
          ],
        },
        orderBy: { createdAt: "asc" },
      });

      return NextResponse.json(messages);
    }

    // If only receiverId is provided -> return conversation partners for that user
    if (receiverId && !senderId) {
      console.log("Fetching conversation partners for:", receiverId);

      // fetch recent messages involving receiverId (as sender or receiver), newest first
      const recent = await prisma.message.findMany({
        where: {
          OR: [
            { senderId: receiverId },
            { receiverId },
          ],
        },
        orderBy: { createdAt: 'desc' },
        take: 1000,
      });

      // map latest message per partner
      const partnersMap = new Map();
      for (const m of recent) {
        const partnerId = m.senderId === receiverId ? m.receiverId : m.senderId;
        if (!partnersMap.has(partnerId)) {
          const preview = (Array.isArray(m.attachments) && m.attachments.length) ? `${m.attachments.length} foto` : (m.content || null);
          partnersMap.set(partnerId, { lastMessage: preview, lastAt: m.createdAt, partnerId });
        }
      }

      const partnerIds = Array.from(partnersMap.keys());

      if (partnerIds.length === 0) return NextResponse.json([], { status: 200 });

      // fetch partner user info
      const users = await prisma.user.findMany({ where: { id: { in: partnerIds } }, select: { id: true, name: true, email: true, image: true } });

      // compute unread counts for each partner (messages sent by partner to receiverId where readAt is null)
      const unreadCounts = {};
      await Promise.all(partnerIds.map(async (pid) => {
        try {
          // try counting using readAt (if Prisma schema has it)
          const c = await prisma.message.count({ where: { senderId: pid, receiverId, readAt: null } });
          unreadCounts[pid] = c;
        } catch (e) {
          // If readAt doesn't exist in Prisma schema, fall back gracefully to zero unread
          // (avoid throwing 500). Developer should run prisma migrate to enable read tracking.
          unreadCounts[pid] = 0;
        }
      }));

      // assemble response: include user info and last message
      const partners = users.map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        image: u.image,
        lastMessage: partnersMap.get(u.id)?.lastMessage || null,
        lastAt: partnersMap.get(u.id)?.lastAt || null,
        unread: unreadCounts[u.id] || 0,
      }));

      // sort by lastAt desc
      partners.sort((a, b) => new Date(b.lastAt) - new Date(a.lastAt));

      return NextResponse.json(partners);
    }

    // missing required query params -> return empty
    console.warn("Missing senderId and/or receiverId in query");
    return NextResponse.json([], { status: 200 });
  } catch (err) {
    console.error("Failed to fetch messages:", err);
    return NextResponse.json(
      { error: "Failed to fetch messages", details: err.message },
      { status: 500 }
    );
  }
}

// PATCH /api/chat - mark messages from partner as read (authenticated)
export async function PATCH(req) {
  try {
    const { userId } = getAuth(req);
    if (!userId) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

    const body = await req.json();
    const partnerId = body.partnerId || body.senderId;
    if (!partnerId) return NextResponse.json({ error: 'partnerId is required' }, { status: 400 });

    // find messages to update. Prisma client may be out-of-sync if migrations not applied (no `readAt` yet)
    let toUpdate = [];
    try {
      toUpdate = await prisma.message.findMany({ where: { senderId: partnerId, receiverId: userId, readAt: null }, select: { id: true } });
    } catch (e) {
      // If readAt doesn't exist in the runtime Prisma client, avoid throwing and return empty result.
      console.warn('Prisma client likely missing `readAt` field; skipping mark-read update.', e?.message || e);
      return NextResponse.json({ updatedCount: 0, messageIds: [] });
    }

    if (toUpdate.length === 0) return NextResponse.json({ updatedCount: 0, messageIds: [] });

    const now = new Date();
    let res = { count: 0 };
    try {
      res = await prisma.message.updateMany({ where: { senderId: partnerId, receiverId: userId, readAt: null }, data: { readAt: now } });
    } catch (e) {
      console.warn('Failed to update readAt (Prisma schema mismatch?), skipping update.', e?.message || e);
      return NextResponse.json({ updatedCount: 0, messageIds: [] });
    }

    // return updated ids for client to update UI
    const ids = toUpdate.map(m => m.id);

    // Notify socket-server so broadcasts are sent from the server (ensures other clients update live)
    try {
      const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:8080';
      // if NEXT_PUBLIC_SOCKET_URL points to ws:// or https://... make sure to use http(s)
      const emitUrl = socketUrl.replace(/^ws:\/\//, 'http://').replace(/^wss:\/\//, 'https://') + '/emit/mark-read';
      await axios.post(emitUrl, {
        partnerId,
        readerId: userId,
        messageIds: ids
      }, {
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (e) {
      console.warn('Failed to notify socket-server about mark-read:', e?.message || e);
    }

    return NextResponse.json({ updatedCount: res.count, messageIds: ids });
  } catch (err) {
    console.error('Failed to mark messages read:', err);
    return NextResponse.json({ error: 'Failed to mark messages read', details: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const contentType = req.headers.get('content-type') || '';
    let body = null;
    let attachments = [];

    if (contentType.includes('multipart/form-data')) {
      const form = await req.formData();
      const senderId = form.get('senderId');
      const receiverId = form.get('receiverId');
      const text = form.get('content') || '';

      if (!senderId || !receiverId) return NextResponse.json({ error: 'Missing senderId or receiverId' }, { status: 400 });

      // collect files (attachments)
      const files = form.getAll('attachments');
      if (files && files.length) {
          const urls = await Promise.all(files.map(async (f) => {
            try {
              const buffer = Buffer.from(await f.arrayBuffer());
              const resp = await imageKit.upload({ file: buffer, fileName: f.name || `chat-${Date.now()}`, folder: 'chat' });

            
              console.log('ImageKit upload resp:', resp);

              // Helper: extract first http(s) URL from a string
              const extractUrl = (str) => {
                if (!str || typeof str !== 'string') return null;
                const m = str.match(/https?:\/\/[^\s"']+/i);
                return m ? m[0] : null;
              };

              let url = null;
              if (resp?.url && typeof resp.url === 'string') {
                url = extractUrl(resp.url) || resp.url;
              }

              if (!url && resp?.filePath && typeof resp.filePath === 'string') {
                // filePath may be absolute or relative; try to extract an absolute URL first
                url = extractUrl(resp.filePath) || null;
                if (!url) {
                  // fallback: build a URL using imageKit.url for the stored path (no transformations)
                  try {
                    url = imageKit.url({ path: resp.filePath });
                  } catch (e) {
                    console.warn('Failed to build imageKit URL from filePath:', resp.filePath, e?.message || e);
                    url = null;
                  }
                }
              }

              return url;
            } catch (err) {
              console.error('ImageKit upload failed for chat attachment:', err);
              return null;
            }
          }));
        attachments = urls.filter(Boolean);
      }

      body = { senderId, receiverId, content: text, attachments };
    } else {
      body = await req.json();
      attachments = Array.isArray(body.attachments) ? body.attachments : [];
    }

    const { senderId, receiverId, content } = body;
    console.log('Chat POST body:', { senderId, receiverId, content, attachmentsCount: Array.isArray(attachments) ? attachments.length : 0 });
    if (!senderId || !receiverId || (!content && attachments.length === 0)) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    let message = null;
    try {
      message = await prisma.message.create({ data: { senderId, receiverId, content: content || '', attachments } });
      console.log('Prisma created message id:', message?.id);
    
      // Debug: immediately read back the created record from the DB to verify persistence
      try {
        if (message && message.id) {
          const persisted = await prisma.message.findUnique({ where: { id: message.id } });
          console.log('Post-create readback (db record):', persisted);
        }
      } catch (rbErr) {
        console.warn('Post-create readback failed:', rbErr?.message || rbErr);
      }
    } catch (e) {
      // If runtime Prisma client doesn't know `attachments` (migration not applied),
      // fall back to creating the message without attachments to avoid 500.
      const msg = e?.message || '';
      console.warn('Prisma create failed, falling back. Error message:', msg);
      if (msg.includes("Unknown argument `attachments`") || msg.includes('Unknown arg `attachments`')) {
        console.warn('Prisma client missing `attachments` field; creating message without attachments.');
        message = await prisma.message.create({ data: { senderId, receiverId, content: content || '' } });
        console.log('Prisma created fallback message id:', message?.id);
      } else {
        throw e;
      }
    }

    console.log("Message sent:", content || '[attachment]', 'attachments:', attachments);
    if (!message) console.warn('No message object created');
    return NextResponse.json(message);
  } catch (err) {
    console.error("Failed to send message:", err);
    return NextResponse.json(
      { error: "Failed to send message", details: err.message },
      { status: 500 }
    );
  }
}


//front-end page example
"use client";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import io from "socket.io-client";

let socket;

export default function ChatPage() {
    const { user } = useUser();
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState("");
    const [files, setFiles] = useState([]);
    const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL;

    // Inisialisasi socket & join room
    useEffect(() => {
        if (!user) return;

        // Hindari socket ganda
        if (!socket) {
            socket = io(SOCKET_URL, { transports: ["websocket"], withCredentials: true, });
            console.log("🔌 Socket initialized");
        }

        // Join ke room ID user
        socket.emit("joinRoom", user.id);

        // Cleanup sebelum pasang listener baru
        socket.off("connect");
        socket.off("newMessage");

        socket.on("connect", () => {
            console.log("✅ Connected:", socket.id);
        });

        return () => {
            socket.off("connect");
            socket.off("newMessage");
            socket.disconnect();
            socket = null;
        };
    }, [user]);

    // Ambil daftar user dari API
    useEffect(() => {
        fetch("/api/users")
            .then((res) => res.json())
            .then(setUsers)
            .catch((err) => console.error("Failed to fetch users:", err));
    }, []);

    // Ambil pesan saat memilih user
    useEffect(() => {
        if (!selectedUser || !user) return;

        const loadMessages = async () => {
            try {
                const res = await fetch(`/api/chat?senderId=${user.id}&receiverId=${selectedUser.id}`, { credentials: 'include' });
                const data = await res.json();
                if (Array.isArray(data)) setMessages(data);
                else setMessages([]);

                // Attempt to mark messages from partner as read on the recipient side
                // (this ensures server updates `readAt` without requiring a manual refresh)
                try {
                    const patchRes = await fetch('/api/chat', {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include',
                        body: JSON.stringify({ partnerId: selectedUser.id })
                    });
                    const patchJson = await patchRes.json().catch(() => ({}));

                    // choose ids to mark locally: prefer server-provided ids, fallback to locally-known partner-sent message ids
                    const localIds = Array.isArray(data) ? data.filter(m => String(m.senderId) === String(selectedUser.id)).map(m => m.id) : [];
                    const ids = (patchJson?.messageIds && Array.isArray(patchJson.messageIds) && patchJson.messageIds.length) ? patchJson.messageIds : localIds;

                    // emit socket markRead so sender clients update live
                    try {
                        socket?.emit('markRead', { partnerId: selectedUser.id, readerId: user.id, messageIds: ids });
                    } catch (e) { console.warn('socket emit markRead failed', e); }

                    // optimistic local update for UI
                    if (ids && ids.length) {
                        setMessages(prev => Array.isArray(prev) ? prev.map(m => ids.includes(m.id) ? { ...m, readAt: new Date().toISOString() } : m) : prev);
                    }
                } catch (err) {
                    console.error('Failed to mark messages read (recipient):', err);
                }

            } catch (err) {
                console.error("Failed to fetch messages:", err);
            }
        };

        loadMessages();
    }, [selectedUser, user]);

    // Listener realtime pesan baru
    useEffect(() => {
        if (!socket || !user || !selectedUser) return;

        const handleNewMessage = (msg) => {
            console.log("📩 newMessage event:", msg);

            // Hanya tampilkan kalau pesan ini relevan
            const isRelevant =
                (msg.senderId === user?.id && msg.receiverId === selectedUser?.id) ||
                (msg.senderId === selectedUser?.id && msg.receiverId === user?.id);

            if (!isRelevant) return;

            setMessages((prev) => {
                if (!Array.isArray(prev)) return [msg];
                if (prev.some((m) => m.id === msg.id)) return prev;
                return [...prev, msg];
            });
        };

        socket.on("newMessage", handleNewMessage);

        return () => {
            socket.off("newMessage", handleNewMessage);
        };
    }, [user, selectedUser]);

    // Kirim pesan
    const sendMessage = async () => {
        if (!message.trim() || !selectedUser || !user) return;

        const hasFiles = files && files.length > 0;
        let savedMessage = null;
        try {
            if (hasFiles) {
                const form = new FormData();
                form.append('senderId', user.id);
                form.append('receiverId', selectedUser.id);
                form.append('content', message.trim());
                files.forEach((f) => form.append('attachments', f));

                const res = await fetch('/api/chat', { method: 'POST', body: form });
                savedMessage = await res.json();
            } else {
                const payload = { senderId: user.id, receiverId: selectedUser.id, content: message.trim() };
                const res = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
                savedMessage = await res.json();
            }

            if (!savedMessage?.id) return;

            // Tambah di UI (sender)
            setMessages((prev) => [...prev, savedMessage]);

            // Kirim realtime ke penerima
            socket.emit("sendMessage", savedMessage);

            // Kosongkan input
            setMessage("");
            setFiles([]);
        } catch (err) {
            console.error('Failed to send message with attachments:', err);
        }
    };

    const handleFileChange = (e) => {
        const list = Array.from(e.target.files || []);
        setFiles(list);
    };

    return (
        <div className="flex h-screen">
            {/* Sidebar daftar user */}
            <div className="w-1/3 border-r p-4 overflow-y-auto">
                <h2 className="text-xl font-bold mb-4">Users</h2>
                {users.map((u) => (
                    <div
                        key={u.id}
                        onClick={() => setSelectedUser(u)}
                        className={`flex items-center gap-3 p-2 rounded cursor-pointer ${selectedUser?.id === u.id
                            ? "bg-blue-100"
                            : "hover:bg-gray-100"
                            }`}
                    >
                        <img
                            src={u.image || "/default-avatar.png"}
                            alt={u.name}
                            className="w-8 h-8 rounded-full"
                        />
                        <div>
                            <p className="font-medium">{u.name}</p>
                            <p className="text-xs text-gray-500">{u.email}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
                {selectedUser ? (
                    <>
                        <div className="p-4 border-b">
                            <h3 className="text-lg font-semibold">
                                Chat with {selectedUser.name}
                            </h3>
                        </div>

                        <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
                            {Array.isArray(messages) && messages.length > 0 ? (
                                messages.map((msg) => (
                                    <div
                                        key={msg.id}
                                        className={`p-2 my-1 rounded max-w-[60%] ${msg.senderId === user?.id
                                            ? "bg-blue-200 text-right ml-auto"
                                            : "bg-gray-200"
                                            }`}
                                    >
                                        {msg.content}
                                        {Array.isArray(msg.attachments) && msg.attachments.length > 0 && (
                                            <div className="mt-2 flex gap-2">
                                                {msg.attachments.map((a, i) => (
                                                    <img key={i} src={a} alt={`attachment-${i}`} className="w-32 h-32 object-cover rounded" />
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-400 text-center mt-10">
                                    No messages yet
                                </p>
                            )}
                        </div>

                        <div className="p-4 flex gap-2 border-t">
                            <input type="file" multiple accept="image/*" onChange={handleFileChange} />
                            <input
                                type="text"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Type a message..."
                                className="border p-2 rounded flex-1"
                            />
                            <button
                                onClick={sendMessage}
                                className="bg-blue-500 text-white px-4 py-2 rounded"
                            >
                                Send
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                        Select a user to start chatting
                    </div>
                )}
            </div>
        </div>
    );
}