// backend
import { NextResponse } from "next/server";
import { getAuth } from '@clerk/nextjs/server';
import imageKit from '@/configs/imageKit';
import axios from 'axios';

// Mock Prisma implementation if the real one isn't available
let prisma;

try {
  const { PrismaClient } = require('@prisma/client');
  prisma = new PrismaClient();
} catch (error) {
  console.warn('Prisma not available, using mock implementation:', error.message);

  // Create a mock Prisma implementation with in-memory storage
  let mockMessages = [];
  let mockUsers = [
    { id: 'user1', name: 'Toko Elektronik Jaya', email: 'toko@elektronik.com', image: '/images/categories/elektronik.png' },
    { id: 'user2', name: 'Warung Bu Siti', email: 'warung@sitifood.com', image: '/images/categories/makanan.png' },
    { id: 'user3', name: 'Fashion Store', email: 'fashion@store.com', image: '/images/categories/fashion.png' },
    { id: 'user4', name: 'Admin SMART', email: 'admin@smart.com', image: '/images/categories/admin.png' }
  ];

  prisma = {
    message: {
      findMany: async ({ where, orderBy, take }) => {
        // Mock implementation - filter messages based on where clause
        console.log('Mock Prisma: findMany', { where, orderBy, take });

        let filteredMessages = [...mockMessages];

        if (where.OR) {
          // Handle OR condition for senderId and receiverId
          const conditions = where.OR;
          filteredMessages = mockMessages.filter(msg => {
            return conditions.some(condition =>
              (msg.senderId === condition.senderId && msg.receiverId === condition.receiverId) ||
              (msg.senderId === condition.receiverId && msg.receiverId === condition.senderId)
            );
          });
        }

        if (orderBy) {
          filteredMessages.sort((a, b) => {
            if (orderBy.createdAt === 'asc') {
              return new Date(a.createdAt) - new Date(b.createdAt);
            } else {
              return new Date(b.createdAt) - new Date(a.createdAt);
            }
          });
        }

        if (take) {
          filteredMessages = filteredMessages.slice(0, take);
        }

        return filteredMessages;
      },
      create: async ({ data }) => {
        console.log('Mock Prisma: create', { data });
        // Mock creating a message
        const message = { id: Date.now().toString(), ...data, createdAt: new Date().toISOString() };
        mockMessages.push(message);
        return message;
      },
      count: async ({ where }) => {
        console.log('Mock Prisma: count', { where });
        // Filter messages by where conditions
        const filteredMessages = mockMessages.filter(msg => {
          return msg.senderId === where.senderId &&
            msg.receiverId === where.receiverId &&
            msg.readAt === where.readAt;
        });
        return filteredMessages.length;
      },
      updateMany: async ({ where, data }) => {
        console.log('Mock Prisma: updateMany', { where, data });
        // Find messages matching where conditions and update them
        const updatedCount = mockMessages.reduce((count, msg) => {
          if (msg.senderId === where.senderId &&
            msg.receiverId === where.receiverId &&
            msg.readAt === where.readAt) {
            // Update the message
            Object.assign(msg, data);
            count++;
          }
          return count;
        }, 0);

        return { count: updatedCount };
      },
      findUnique: async ({ where }) => {
        console.log('Mock Prisma: findUnique', { where });
        return mockMessages.find(msg => msg.id === where.id) || null;
      }
    },
    user: {
      findMany: async ({ where, select }) => {
        console.log('Mock Prisma: findMany users', { where, select });
        // Filter users based on where clause
        let filteredUsers = [...mockUsers];

        if (where.id && where.id.in) {
          filteredUsers = mockUsers.filter(user => where.id.in.includes(user.id));
        }

        // Apply select to limit fields returned
        if (select) {
          filteredUsers = filteredUsers.map(user => {
            const selected = {};
            Object.keys(select).forEach(key => {
              if (select[key]) {
                selected[key] = user[key];
              }
            });
            return selected;
          });
        }

        return filteredUsers;
      }
    }
  };
}

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