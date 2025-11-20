"use client";
import { useEffect, useState, useRef } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import { FiSend, FiSearch, FiMoreVertical, FiImage, FiPaperclip } from "react-icons/fi";
import Navbar from "../../components/navbar/Navbar";
import Footer from "../../components/footer/Footer";
import { useRouter } from "next/navigation";
import { fetchUsersWithStores } from "../../api";

export default function ChatPage() {
    const { user } = useUser();
    const { session } = useClerk();
    const [users, setUsers] = useState([]); // Users with active conversations
    const [allUsers, setAllUsers] = useState([]); // All users (for search)
    const [selectedUser, setSelectedUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [messageInput, setMessageInput] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
    const [files, setFiles] = useState([]);
    const [previewImages, setPreviewImages] = useState([]); // Store the preview URLs
    const [lastMessageTimestamp, setLastMessageTimestamp] = useState(null);
    const messagesContainerRef = useRef(null);
    const router = useRouter();
    const pollingIntervalRef = useRef(null);

    // Ambil daftar user dari API - only users with active conversations
    useEffect(() => {
        if (!user) return;

        // Fetch conversation partners (users with whom the current user has had conversations)
        const fetchConversations = async () => {
            try {
                // Get Clerk token for authentication
                let token = null;
                try {
                    token = await session.getToken();
                } catch (error) {
                    console.error('Error getting Clerk token:', error);
                }

                const response = await fetch(`https://besukma.vercel.app/api/chat?receiverId=${user.id}`, {
                    headers: token ? { 'Authorization': `Bearer ${token}` } : {}
                });

                const fetchedUsers = await response.json();

                // Filter out current user
                const filteredUsers = fetchedUsers.filter(u =>
                    u.id !== user.id
                );

                // Merge with existing users to preserve order and any additional data
                setUsers(prevUsers => {
                    const existingUserMap = new Map(prevUsers.map(u => [u.id, u]));
                    const newUserMap = new Map(filteredUsers.map(u => [u.id, u]));

                    // Keep existing users and update with new data where available
                    const updatedUsers = prevUsers.map(u => {
                        const newUserData = newUserMap.get(u.id);
                        return newUserData ? { ...u, ...newUserData } : u;
                    });

                    // Add new users that weren't in the previous list
                    const newUsersToAdd = filteredUsers.filter(u => !existingUserMap.has(u.id));

                    return [...newUsersToAdd, ...updatedUsers];
                });
            } catch (err) {
                console.error("Failed to fetch conversations:", err);
            }
        };

        fetchConversations();

        // Also set up a periodic refresh to keep the list updated
        const interval = setInterval(fetchConversations, 30000); // Refresh every 30 seconds

        return () => clearInterval(interval);
    }, [user, session]);

    // Fetch all users for search functionality
    useEffect(() => {
        if (!user) return;

        fetchUsersWithStores()
            .then(fetchedUsers => {
                // Filter out the current user and their own store
                const filteredUsers = fetchedUsers.filter(u =>
                    u.id !== user.id &&
                    !(u.hasStore && u.userId === user.id)
                );
                setAllUsers(filteredUsers);

                // Also update the main users list with any conversations we might have missed
                // (in case new conversations appeared since last fetch)
                const fetchConversations = async () => {
                    try {
                        // Get Clerk token for authentication
                        let token = null;
                        try {
                            token = await session.getToken();
                        } catch (error) {
                            console.error('Error getting Clerk token:', error);
                        }

                        const response = await fetch(`https://besukma.vercel.app/api/chat?receiverId=${user.id}`, {
                            headers: token ? { 'Authorization': `Bearer ${token}` } : {}
                        });

                        const conversationUsers = await response.json();

                        // Filter out current user from conversation list
                        const filteredConversationUsers = conversationUsers.filter(u =>
                            u.id !== user.id
                        );

                        // Merge with existing users, avoiding duplicates
                        setUsers(prevUsers => {
                            const userIds = new Set(prevUsers.map(u => u.id));
                            const newUsers = filteredConversationUsers.filter(u => !userIds.has(u.id));
                            return [...prevUsers, ...newUsers];
                        });
                    } catch (err) {
                        console.error("Failed to fetch conversations:", err);
                    }
                };

                fetchConversations();
            })
            .catch((err) => {
                console.error("Failed to fetch all users for search:", err);
            });
    }, [user, session]);

    // Ambil pesan saat memilih user
    useEffect(() => {
        if (!selectedUser || !user) return;

        const loadMessages = async () => {
            try {
                // The receiverId might be the user ID or store ID depending on how the system is set up
                // For now, we'll use the user.id from the selectedUser object
                const receiverId = selectedUser.id;

                // Get Clerk token for authentication
                let token = null;
                try {
                    token = await session.getToken();
                } catch (error) {
                    console.error('Error getting Clerk token:', error);
                }

                const res = await fetch(`https://besukma.vercel.app/api/chat?senderId=${user.id}&receiverId=${receiverId}`, {
                    headers: token ? { 'Authorization': `Bearer ${token}` } : {}
                });
                const data = await res.json();
                if (Array.isArray(data)) {
                    setMessages(data);

                    // Update the last message timestamp for polling
                    if (data.length > 0) {
                        const latestMessage = data.reduce((latest, current) =>
                            new Date(current.createdAt) > new Date(latest.createdAt) ? current : latest
                        );
                        setLastMessageTimestamp(new Date(latestMessage.createdAt).getTime());

                        // Update the sidebar with the latest message for this conversation
                        const lastMessageContent = latestMessage.attachments && latestMessage.attachments.length > 0 
                            ? `${latestMessage.attachments.length} foto` 
                            : (latestMessage.content || '');

                        setUsers(prev =>
                            prev.map(u =>
                                u.id === selectedUser.id
                                    ? {
                                        ...u,
                                        lastMessage: lastMessageContent,
                                        lastAt: latestMessage.createdAt
                                    }
                                    : u
                            )
                        );
                    }
                } else {
                    setMessages([]);
                }

                // Attempt to mark messages from partner as read on the recipient side
                // (this ensures server updates `readAt` without requiring a manual refresh)
                try {
                    let token = null;
                    try {
                        token = await session.getToken();
                    } catch (error) {
                        console.error('Error getting Clerk token:', error);
                    }

                    const patchRes = await fetch('https://besukma.vercel.app/api/chat', {
                        method: 'PATCH',
                        headers: {
                            'Content-Type': 'application/json',
                            ...(token && { 'Authorization': `Bearer ${token}` })
                        },
                        body: JSON.stringify({ partnerId: receiverId })
                    });

                    // Only proceed if the request was successful
                    if (patchRes.ok) {
                        const patchJson = await patchRes.json().catch(() => ({}));

                        // choose ids to mark locally: prefer server-provided ids, fallback to locally-known partner-sent message ids
                        const localIds = Array.isArray(data) ? data.filter(m => String(m.senderId) === String(receiverId)).map(m => m.id) : [];
                        const ids = (patchJson?.messageIds && Array.isArray(patchJson.messageIds) && patchJson.messageIds.length) ? patchJson.messageIds : localIds;

                        // optimistic local update for UI
                        if (ids && ids.length) {
                            setMessages(prev => Array.isArray(prev) ? prev.map(m => ids.includes(m.id) ? { ...m, readAt: new Date().toISOString() } : m) : prev);

                            // Update the unread count in the users list since we've read messages
                            setUsers(prev =>
                                prev.map(u =>
                                    u.id === selectedUser.id
                                        ? { ...u, unread: 0 }
                                        : u
                                )
                            );
                        }
                    } else {
                        console.warn('Mark read request failed:', patchRes.status, patchRes.statusText);
                        // Even if the server request failed, we can still update the UI locally
                        // to show that messages are read in this session
                        setUsers(prev =>
                            prev.map(u =>
                                u.id === selectedUser.id
                                    ? { ...u, unread: 0 }
                                    : u
                            )
                        );
                    }
                } catch (err) {
                    console.error('Failed to mark messages read (recipient):', err);
                    // Still update the UI locally to show the conversation as read
                    setUsers(prev =>
                        prev.map(u =>
                            u.id === selectedUser.id
                                ? { ...u, unread: 0 }
                                : u
                        )
                    );
                }

            } catch (err) {
                console.error("Failed to fetch messages:", err);
            }
        };

        loadMessages();
    }, [selectedUser, user]);

    // Polling effect for new messages when a chat is selected
    useEffect(() => {
        if (!selectedUser || !user) return;

        // Clear any existing interval
        if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
        }

        // Set up new polling interval
        pollingIntervalRef.current = setInterval(async () => {
            try {
                const receiverId = selectedUser.id;

                // Get Clerk token for authentication
                let token = null;
                try {
                    token = await session.getToken();
                } catch (error) {
                    console.error('Error getting Clerk token:', error);
                }

                const res = await fetch(`https://besukma.vercel.app/api/chat?senderId=${user.id}&receiverId=${receiverId}`, {
                    headers: token ? { 'Authorization': `Bearer ${token}` } : {}
                });
                const data = await res.json();

                if (Array.isArray(data)) {
                    // Find new messages by comparing timestamps
                    const newMessages = lastMessageTimestamp
                        ? data.filter(msg => new Date(msg.createdAt).getTime() > lastMessageTimestamp)
                        : data;

                    if (newMessages.length > 0) {
                        // Update messages with new ones
                        setMessages(prev => {
                            // Combine existing and new messages, avoiding duplicates
                            const existingIds = new Set(prev.map(msg => msg.id));
                            const uniqueNewMessages = newMessages.filter(msg => !existingIds.has(msg.id));
                            return [...prev, ...uniqueNewMessages];
                        });

                        // Update the last message timestamp
                        const latestMessage = data.reduce((latest, current) =>
                            new Date(current.createdAt) > new Date(latest.createdAt) ? current : latest
                        );
                        setLastMessageTimestamp(new Date(latestMessage.createdAt).getTime());

                        // Update the sidebar with the latest message for this conversation
                        const lastMessageContent = latestMessage.attachments && latestMessage.attachments.length > 0 
                            ? `${latestMessage.attachments.length} foto` 
                            : (latestMessage.content || '');

                        setUsers(prev =>
                            prev.map(u =>
                                u.id === selectedUser.id
                                    ? {
                                        ...u,
                                        lastMessage: lastMessageContent,
                                        lastAt: latestMessage.createdAt
                                    }
                                    : u
                            )
                        );
                    }
                }
            } catch (err) {
                console.error("Polling error:", err);
            }
        }, 2000); // Poll every 2 seconds

        // Cleanup interval on component unmount or when selected user changes
        return () => {
            if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current);
                pollingIntervalRef.current = null;
            }
        };
    }, [selectedUser, user, lastMessageTimestamp]);

    // Global polling effect for non-selected chats to update sidebar
    useEffect(() => {
        // Set up global polling interval to update conversations list
        const globalPollingInterval = setInterval(async () => {
            if (!user) return;

            try {
                // Get Clerk token for authentication
                let token = null;
                try {
                    token = await session.getToken();
                } catch (error) {
                    console.error('Error getting Clerk token:', error);
                }

                const response = await fetch(`https://besukma.vercel.app/api/chat?receiverId=${user.id}`, {
                    headers: token ? { 'Authorization': `Bearer ${token}` } : {}
                });

                const fetchedUsers = await response.json();

                // Filter out current user
                const filteredUsers = fetchedUsers.filter(u =>
                    u.id !== user.id
                );

                setUsers(prevUsers => {
                    const existingUserMap = new Map(prevUsers.map(u => [u.id, u]));

                    // Update existing users with new data from API
                    // For non-selected users, always use API data for lastMessage/lastAt
                    // For selected user, preserve local state unless API has newer data
                    const updatedUsers = prevUsers.map(prevUser => {
                        const updatedData = filteredUsers.find(newUser => newUser.id === prevUser.id);
                        if (updatedData) {
                            // If this is not the currently selected user, always use API data
                            if (!selectedUser || selectedUser.id !== prevUser.id) {
                                return {
                                    ...prevUser, 
                                    ...updatedData,
                                    lastMessage: updatedData.lastMessage,
                                    lastAt: updatedData.lastAt,
                                    unread: updatedData.unread
                                };
                            }
                            // For selected user, only update if API has newer data
                            else {
                                const apiDate = new Date(updatedData.lastAt || 0);
                                const localDate = new Date(prevUser.lastAt || 0);
                                
                                if (apiDate > localDate) {
                                    return {
                                        ...prevUser, 
                                        ...updatedData,
                                        lastMessage: updatedData.lastMessage,
                                        lastAt: updatedData.lastAt,
                                        unread: updatedData.unread
                                    };
                                }
                                // Keep local state for selected user if it's newer
                                return { ...prevUser, unread: updatedData.unread };
                            }
                        }
                        return prevUser;
                    });

                    // Find new users that weren't in the previous list
                    const newUsers = filteredUsers.filter(newUser =>
                        !existingUserMap.has(newUser.id)
                    );

                    return [...newUsers, ...updatedUsers];
                });
            } catch (err) {
                console.error("Global polling error:", err);
            }
        }, 3000); // Poll every 3 seconds for global updates

        return () => {
            clearInterval(globalPollingInterval);
        };
    }, [user, session]);

    // Auto-scroll to bottom when messages change
    useEffect(() => {
        if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
    }, [messages]);


    // Implement debounce for search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
        }, 300); // 300ms delay

        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Filter users based on search
    // If search query is empty, show only users with active conversations
    // If search query exists, show matching users from all users
    const filteredUsers = debouncedSearchQuery
        ? allUsers.filter(user =>
            user.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
            (user.email && user.email.toLowerCase().includes(debouncedSearchQuery.toLowerCase())) ||
            (user.storeId && user.storeId.toLowerCase().includes(debouncedSearchQuery.toLowerCase())) ||
            (user.lastMessage && user.lastMessage.toLowerCase().includes(debouncedSearchQuery.toLowerCase()))
        )
        : users; // Only users with active conversations when no search

    // Kirim pesan
    const sendMessage = async () => {
        // Now allows sending with just images, no text required
        if ((messageInput.trim() === "" && files.length === 0) || !selectedUser || !user) return;

        const hasFiles = files && files.length > 0;
        let savedMessage = null;
        try {
            if (hasFiles) {
                const form = new FormData();
                form.append('senderId', user.id);
                form.append('receiverId', selectedUser.id);
                form.append('content', messageInput.trim()); // Can be empty string if sending only images
                files.forEach((f) => form.append('attachments', f));

                // Get Clerk token for authentication
                let token = null;
                try {
                    token = await session.getToken();
                } catch (error) {
                    console.error('Error getting Clerk token:', error);
                }

                const res = await fetch('https://besukma.vercel.app/api/chat', {
                    method: 'POST',
                    body: form,
                    headers: token ? { 'Authorization': `Bearer ${token}` } : {}
                });
                savedMessage = await res.json();
            } else {
                const payload = {
                    senderId: user.id,
                    receiverId: selectedUser.id,
                    content: messageInput.trim()
                };

                // Get Clerk token for authentication
                let token = null;
                try {
                    token = await session.getToken();
                } catch (error) {
                    console.error('Error getting Clerk token:', error);
                }

                const res = await fetch('https://besukma.vercel.app/api/chat', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        ...(token && { 'Authorization': `Bearer ${token}` })
                    },
                    body: JSON.stringify(payload)
                });
                savedMessage = await res.json();
            }

            if (!savedMessage?.id) return;

            // Tambah di UI (sender)
            setMessages((prev) => [...prev, savedMessage]);

            // After sending a message, make sure the conversation appears in the list
            // Check if selected user is already in the users list, if not, add them
            const userExists = users.some(u => u.id === selectedUser.id);
            if (!userExists) {
                // If the user is not in the conversation list, add them
                // Use the actual saved message content for lastMessage
                const lastMessageContent = savedMessage.attachments && savedMessage.attachments.length > 0 
                    ? `${savedMessage.attachments.length} foto` 
                    : (savedMessage.content || '');
                
                const newConversation = {
                    ...selectedUser,
                    lastMessage: lastMessageContent,
                    lastAt: savedMessage.createdAt || new Date().toISOString(),
                    unread: 0
                };
                setUsers(prev => [newConversation, ...prev]);
            } else {
                // If the user already exists, update the last message and time
                // Use the actual saved message content for lastMessage
                const lastMessageContent = savedMessage.attachments && savedMessage.attachments.length > 0 
                    ? `${savedMessage.attachments.length} foto` 
                    : (savedMessage.content || '');
                    
                setUsers(prev =>
                    prev.map(u =>
                        u.id === selectedUser.id
                            ? {
                                ...u,
                                lastMessage: lastMessageContent,
                                lastAt: savedMessage.createdAt || new Date().toISOString()
                            }
                            : u
                    )
                );
            }

            // Kosongkan input
            setMessageInput("");
            setFiles([]);
            // Clear the preview images and revoke their object URLs
            previewImages.forEach(url => URL.revokeObjectURL(url));
            setPreviewImages([]);
        } catch (err) {
            console.error('Failed to send message with attachments:', err);
        }
    };

    const handleFileChange = (e) => {
        const newFiles = Array.from(e.target.files || []);

        // Create preview URLs for the selected images
        const newPreviews = newFiles.map(file => URL.createObjectURL(file));

        // Set new files and previews, replacing existing ones
        setFiles(newFiles);
        setPreviewImages(newPreviews);

        // Reset the file input to allow selecting the same file again if needed
        e.target.value = '';
    };

    const removePreviewImage = (index) => {
        setFiles(prevFiles => {
            const newFiles = prevFiles.filter((_, i) => i !== index);
            return newFiles;
        });

        setPreviewImages(prevPreviews => {
            // Revoke the object URL for the image being removed before filtering
            const previewToRemove = prevPreviews[index];
            if (previewToRemove) {
                URL.revokeObjectURL(previewToRemove);
            }
            return prevPreviews.filter((_, i) => i !== index);
        });
    };

    // Handle Enter key press
    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="container mx-auto px-4 py-8 mt-16">
                {/* Header */}
                <div className="mb-6 flex items-center gap-2">
                    <button onClick={() => router.back()} className="btn btn-sm btn-ghost shadow-none border-none text-gray-700 border border-gray-300 hover:bg-gray-100">
                        &larr;
                    </button>
                    <h1 className="text-2xl font-bold text-gray-900">Chat</h1>
                </div>

                {/* Chat Container */}
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden" style={{ height: '70vh' }}>
                    <div className="flex h-full">
                        {/* Chat List Sidebar */}
                        <div className="w-1/3 border-r border-gray-200 flex flex-col">
                            {/* Search Bar */}
                            <div className="p-4 border-b border-gray-200">
                                <div className="relative">
                                    <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Cari percakapan..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ED775A] focus:border-transparent"
                                    />
                                </div>
                            </div>

                            {/* Chat List */}
                            <div className="flex-1 overflow-y-auto">
                                {filteredUsers.length > 0 ? (
                                    filteredUsers.map((u) => (
                                        <div
                                            key={u.id}
                                            onClick={() => {
                                                setSelectedUser(u);
                                            }}
                                            className={`p-4 border-b border-gray-100 cursor-pointer transition-colors ${selectedUser?.id === u.id ? 'bg-[#ED775A] bg-opacity-10  border-l-[#ED775A]' : 'hover:bg-gray-50'}`}
                                        >
                                            <div className="flex items-center space-x-3">
                                                <div className="relative">
                                                    <img
                                                        src={u.image || "/default-avatar.png"}
                                                        alt={u.name}
                                                        className="w-12 h-12 rounded-full object-cover border border-gray-200"
                                                    />
                                                    {/* Assuming online status if last message was recent */}
                                                    {/* Note: This is a simplified check - consider adding real-time online status if needed */}
                                                    {/* <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div> */}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between">
                                                        <h3 className={`font-semibold truncate ${selectedUser?.id === u.id ? 'text-white' : 'text-gray-900'}`}>
                                                            {u.name}
                                                            {u.hasStore && (
                                                                <span className="ml-2 text-xs bg-[#ED775A] text-white px-2 py-0.5 rounded-full">
                                                                    Toko
                                                                </span>
                                                            )}
                                                        </h3>
                                                        <span className={`text-xs ${selectedUser?.id === u.id ? 'text-gray-200' : 'text-gray-500'}`}>
                                                            {u.lastAt ? new Date(u.lastAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <p className={`text-sm truncate mt-1 ${selectedUser?.id === u.id ? 'text-gray-200' : 'text-gray-600'}`}>
                                                            {u.lastMessage || 'No messages yet'}
                                                        </p>
                                                        {/* Hide unread badge if selected */}
                                                        {u.unread > 0 && selectedUser?.id !== u.id && (
                                                            <div className="mt-2">
                                                                <span className="inline-block bg-[#ED775A] text-white text-xs px-2.5 py-1 rounded-full">
                                                                    {u.unread}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : searchQuery ? (
                                    <div className="p-4 text-center text-gray-500">
                                        <p>No users or stores match your search.</p>
                                    </div>
                                ) : (
                                    <div className="p-4 text-center text-gray-500">
                                        <p>No active conversations yet.</p>
                                        <p className="text-sm mt-1">Search for users or stores to start a chat.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Chat Interface */}
                        <div className="flex-1 flex flex-col">
                            {selectedUser ? (
                                <>
                                    {/* Chat Header */}
                                    <div className="p-4 border-b border-gray-200 bg-white">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                <div className="relative">
                                                    <img
                                                        src={selectedUser.image || "/default-avatar.png"}
                                                        alt={selectedUser.name}
                                                        className="w-10 h-10 rounded-full object-cover"
                                                    />
                                                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-gray-900">
                                                        {selectedUser.name}
                                                        {selectedUser.hasStore && (
                                                            <span className="ml-2 text-xs bg-[#ED775A] text-white px-2 py-0.5 rounded-full">
                                                                Toko
                                                            </span>
                                                        )}
                                                    </h3>
                                                </div>
                                            </div>
                                            <button className="p-2 hover:bg-gray-100 rounded-full">
                                                <FiMoreVertical className="w-5 h-5 text-gray-600" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Messages */}
                                    <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                                        <div ref={messagesContainerRef} className="space-y-4 h-full overflow-y-auto">
                                            {messages.map((msg) => (
                                                <div
                                                    key={msg.id || msg._id}
                                                    className={`flex ${msg.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
                                                >
                                                    <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${msg.senderId === user?.id
                                                        ? 'bg-[#ED775A] text-white'
                                                        : 'bg-white text-gray-900 border border-gray-200'
                                                        }`}>
                                                        {msg.content && <p className="text-sm">{msg.content}</p>}
                                                        {Array.isArray(msg.attachments) && msg.attachments.length > 0 && (
                                                            <div className="mt-2 flex gap-2">
                                                                {msg.attachments.map((a, i) => (
                                                                    <img key={i} src={a} alt={`attachment-${i}`} className="w-32 h-32 object-cover rounded" />
                                                                ))}
                                                            </div>
                                                        )}
                                                        <p className={`text-xs mt-1 ${msg.senderId === user?.id ? 'text-orange-100' : 'text-gray-500'
                                                            }`}>
                                                            {new Date(msg.createdAt || msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Message Input */}
                                    <div className="p-4 border-t border-gray-200 bg-white">
                                        {/* Image Previews */}
                                        {previewImages.length > 0 && (
                                            <div className="mb-3 flex flex-wrap gap-2">
                                                {previewImages.map((preview, index) => (
                                                    <div key={index} className="relative group">
                                                        <img
                                                            src={preview}
                                                            alt={`Preview ${index}`}
                                                            className="w-16 h-16 object-cover rounded border border-gray-300"
                                                        />
                                                        <button
                                                            type="button"
                                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                            onClick={() => removePreviewImage(index)}
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        <div className="flex items-center space-x-3">
                                            <button className="p-2 hover:bg-gray-100 rounded-full">
                                                <FiImage className="w-5 h-5 text-gray-600"
                                                    onClick={() => document.getElementById('image-upload').click()} />
                                                <input
                                                    id="image-upload"
                                                    type="file"
                                                    className="hidden"
                                                    multiple
                                                    accept="image/*"
                                                    onChange={handleFileChange} />
                                            </button>
                                            <div className="flex-1">
                                                <input
                                                    type="text"
                                                    value={messageInput}
                                                    onChange={(e) => setMessageInput(e.target.value)}
                                                    onKeyPress={handleKeyPress}
                                                    placeholder="Ketik pesan..."
                                                    className="w-full px-4 py-2 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-[#ED775A] focus:border-transparent"
                                                />
                                            </div>
                                            <button
                                                onClick={sendMessage}
                                                disabled={(!messageInput.trim() && files.length === 0) || !selectedUser}
                                                className="p-2 bg-[#ED775A] text-white rounded-full hover:bg-[#d86a4a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                            >
                                                <FiSend className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                /* No Chat Selected */
                                <div className="flex-1 flex items-center justify-center bg-gray-50">
                                    <div className="text-center">
                                        <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                                            <FiSend className="w-8 h-8 text-gray-400" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-600 mb-2">Pilih Percakapan</h3>
                                        <p className="text-gray-500">Pilih percakapan dari daftar untuk mulai berkirim pesan</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}