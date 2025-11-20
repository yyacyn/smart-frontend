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

    // Smart localStorage with User Session Persistence
    const getChatHistoryKey = () => `smart_chat_history_${user?.id}`;
    const getGlobalChatKey = () => 'smart_chat_global';
    const getUserSessionKey = () => `smart_chat_session_${user?.id}`;
    
    // Debounced save to prevent rapid saves that cause blinking
    const saveTimeoutRef = useRef(null);
    
    const saveChatHistory = (conversations) => {
        if (!user?.id) return;
        
        // Clear existing timeout to debounce saves
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }
        
        saveTimeoutRef.current = setTimeout(() => {
            try {
                const timestamp = new Date().toISOString();
                const historyData = {
                    userId: user.id,
                    conversations: conversations,
                    lastUpdated: timestamp,
                    sessionId: Date.now()
                };
                
                // Save to user-specific key
                localStorage.setItem(getChatHistoryKey(), JSON.stringify(historyData));
                
                // Save to global chat registry for cross-session recovery
                const globalData = JSON.parse(localStorage.getItem(getGlobalChatKey()) || '{}');
                globalData[user.id] = {
                    lastSeen: timestamp,
                    conversationCount: conversations.length
                };
                localStorage.setItem(getGlobalChatKey(), JSON.stringify(globalData));
                
                console.log('💾 Chat history saved (debounced)');
            } catch (error) {
                console.error('Failed to save chat history:', error);
            }
        }, 300); // 300ms debounce
    };
    
    const loadChatHistory = () => {
        if (!user?.id) return [];
        try {
            // Try to load from user-specific key first
            const primaryKey = getChatHistoryKey();
            const primaryData = localStorage.getItem(primaryKey);
            
            if (primaryData) {
                const parsed = JSON.parse(primaryData);
                console.log('📚 Loaded chat history from primary storage:', parsed.conversations?.length || 0, 'conversations');
                return parsed.conversations || [];
            }
            
            // Fallback: Try to recover from any existing chat history keys
            console.log('🔍 Primary storage empty, searching for recoverable data...');
            const allKeys = Object.keys(localStorage);
            const chatKeys = allKeys.filter(key => key.includes('chat_history') && key.includes(user.id));
            
            for (const key of chatKeys) {
                try {
                    const data = localStorage.getItem(key);
                    if (data) {
                        const parsed = Array.isArray(JSON.parse(data)) ? JSON.parse(data) : JSON.parse(data).conversations;
                        if (parsed && parsed.length > 0) {
                            console.log('🔄 Recovered chat history from:', key, '(', parsed.length, 'conversations)');
                            // Migrate to new format
                            saveChatHistory(parsed);
                            return parsed;
                        }
                    }
                } catch (e) {
                    console.warn('Failed to parse legacy chat data from:', key);
                }
            }
            
            console.log('💭 No existing chat history found, starting fresh');
            return [];
        } catch (error) {
            console.error('Failed to load chat history:', error);
            return [];
        }
    };
    
    const addToOrUpdateChatHistory = (userToAdd) => {
        console.log("📝 Adding/updating chat history for:", userToAdd.name);
        const currentHistory = loadChatHistory();
        const existingIndex = currentHistory.findIndex(u => u.id === userToAdd.id);
        
        const updatedUser = {
            ...userToAdd,
            lastChatAt: new Date().toISOString(),
            sessionActivity: Date.now(),
            persistent: true
        };
        
        let newHistory;
        if (existingIndex >= 0) {
            // Update existing user and move to top
            console.log("🔄 Updating existing conversation for:", userToAdd.name);
            newHistory = [updatedUser, ...currentHistory.filter((_, i) => i !== existingIndex)];
        } else {
            // Add new user to top
            console.log("➕ Adding new conversation for:", userToAdd.name);
            newHistory = [updatedUser, ...currentHistory];
        }
        
        console.log("📊 Chat history now has", newHistory.length, "conversations");
        
        // Keep only last 100 conversations
        newHistory = newHistory.slice(0, 100);
        
        // Use immediate save (not debounced) for explicit user actions
        try {
            const timestamp = new Date().toISOString();
            const historyData = {
                userId: user.id,
                conversations: newHistory,
                lastUpdated: timestamp,
                sessionId: Date.now()
            };
            localStorage.setItem(getChatHistoryKey(), JSON.stringify(historyData));
            console.log("💾 Chat history immediately saved:", newHistory.length, "conversations");
        } catch (error) {
            console.error('Failed to save chat history:', error);
        }
        
        return newHistory;
    };
    
    // Smart cleanup function to remove very old or inactive conversations
    const cleanupChatHistory = (conversations) => {
        const now = Date.now();
        const oneMonthAgo = now - (30 * 24 * 60 * 60 * 1000); // 30 days
        
        return conversations.filter(conv => {
            // Keep conversations that are:
            // 1. Recent (within 30 days)
            // 2. Marked as persistent
            // 3. Have recent activity
            const lastActivity = new Date(conv.lastChatAt || conv.lastAt || 0).getTime();
            const isRecent = lastActivity > oneMonthAgo;
            const isPersistent = conv.persistent;
            const hasRecentSession = (conv.sessionActivity || 0) > (now - (7 * 24 * 60 * 60 * 1000)); // 7 days
            
            return isRecent || isPersistent || hasRecentSession;
        });
    };

    // Smart session-persistent chat history loading
    useEffect(() => {
        if (!user) return;
        
        console.log("� Initializing smart chat history for user:", user.id);
        
        // Load and clean up chat history
        let savedHistory = loadChatHistory();
        console.log("📚 Raw chat history loaded:", savedHistory.length, "conversations");
        
        if (savedHistory.length > 0) {
            // Clean up old conversations
            savedHistory = cleanupChatHistory(savedHistory);
            console.log("🧹 After cleanup:", savedHistory.length, "conversations");
            
            // Mark session start for all existing conversations
            const sessionMarkedHistory = savedHistory.map(conv => ({
                ...conv,
                sessionStart: new Date().toISOString(),
                isActive: true
            }));
            
            setUsers(sessionMarkedHistory);
            
            // Save the cleaned up history back
            if (sessionMarkedHistory.length !== savedHistory.length) {
                saveChatHistory(sessionMarkedHistory);
            }
            
            console.log("✅ Smart chat history restored:", sessionMarkedHistory.map(u => ({ 
                name: u.name, 
                lastMessage: u.lastMessage,
                lastChatAt: u.lastChatAt 
            })));
        } else {
            console.log("💭 No chat history found, starting fresh session");
        }
        
        // Set up session heartbeat to keep data fresh (but don't trigger re-renders)
        const sessionHeartbeat = setInterval(() => {
            // Only save to localStorage, don't update state to avoid blinking
            try {
                const currentKey = getChatHistoryKey();
                const currentData = localStorage.getItem(currentKey);
                if (currentData) {
                    const parsed = JSON.parse(currentData);
                    if (parsed.conversations && parsed.conversations.length > 0) {
                        const heartbeatData = {
                            ...parsed,
                            lastUpdated: new Date().toISOString(),
                            conversations: parsed.conversations.map(u => ({
                                ...u,
                                lastHeartbeat: new Date().toISOString()
                            }))
                        };
                        localStorage.setItem(currentKey, JSON.stringify(heartbeatData));
                        console.log("💓 Silent heartbeat saved (no UI update)");
                    }
                }
            } catch (error) {
                console.warn("Heartbeat save failed:", error);
            }
        }, 5 * 60 * 1000); // Every 5 minutes
        
        return () => {
            clearInterval(sessionHeartbeat);
            // Save final state before component unmounts
            if (users.length > 0) {
                const finalSaveData = users.map(u => ({
                    ...u,
                    sessionEnd: new Date().toISOString(),
                    persistent: true // Mark all as persistent on session end
                }));
                saveChatHistory(finalSaveData);
                console.log("💾 Final chat history saved on session end");
            }
        };
    }, [user, users]);

    // Handle page visibility changes to save data when user leaves/returns
    useEffect(() => {
        if (!user) return;
        
        const handleVisibilityChange = () => {
            if (document.hidden) {
                // User is leaving - save current state without triggering re-render
                if (users.length > 0) {
                    const exitSaveData = users.map(u => ({
                        ...u,
                        lastExit: new Date().toISOString(),
                        persistent: true
                    }));
                    // Just save to localStorage, don't update state
                    const historyData = {
                        userId: user.id,
                        conversations: exitSaveData,
                        lastUpdated: new Date().toISOString(),
                        sessionId: Date.now()
                    };
                    localStorage.setItem(getChatHistoryKey(), JSON.stringify(historyData));
                    console.log("🚪 Chat history saved on page hide (silent)");
                }
            } else {
                // User returned - only refresh if there are actual changes
                console.log("👋 User returned, checking for updates");
                const refreshedHistory = loadChatHistory();
                setUsers(prevUsers => {
                    // Only update if there are actual conversation differences
                    const prevUserIds = prevUsers.map(u => u.id).sort();
                    const newUserIds = refreshedHistory.map(u => u.id).sort();
                    const differentUsers = prevUserIds.join(',') !== newUserIds.join(',');
                    
                    if (differentUsers || refreshedHistory.length !== prevUsers.length) {
                        console.log("🔄 Chat history updated from other tab");
                        return refreshedHistory;
                    }
                    console.log("✅ Chat history unchanged, no update needed");
                    return prevUsers;
                });
            }
        };
        
        const handleBeforeUnload = () => {
            // Browser is closing - final save
            if (users.length > 0) {
                const finalData = users.map(u => ({
                    ...u,
                    browserExit: new Date().toISOString(),
                    persistent: true
                }));
                localStorage.setItem(getChatHistoryKey(), JSON.stringify({
                    userId: user.id,
                    conversations: finalData,
                    lastUpdated: new Date().toISOString(),
                    sessionId: Date.now()
                }));
            }
        };
        
        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('beforeunload', handleBeforeUnload);
        
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [user, users]);

    // Ambil daftar user dari API - only users with active conversations
    useEffect(() => {
        if (!user) return;

        // Fetch conversation partners (users with whom the current user has had conversations)
        const fetchConversations = async () => {
            try {
                console.log("🚀 Initial fetch of conversations for user:", user.id);
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

                console.log("🌐 Initial fetch response status:", response.status);
                const fetchedUsers = await response.json();
                console.log("📋 Initial conversations RAW response:", fetchedUsers);
                console.log("📋 Initial conversations fetched:", Array.isArray(fetchedUsers) ? fetchedUsers.length : 'NOT_ARRAY', "users");
                
                if (!Array.isArray(fetchedUsers)) {
                    console.error("❌ Initial API returned non-array data:", typeof fetchedUsers, fetchedUsers);
                    console.log("🔧 FALLBACK: Using empty array for conversations");
                    // Use empty array as fallback
                    const filteredUsers = [];
                    setUsers(prevUsers => {
                        // Keep any existing users
                        return prevUsers;
                    });
                    return;
                }

                if (fetchedUsers.length === 0) {
                    console.log("⚠️ Initial conversations API returned empty array. This might be a backend issue.");
                    console.log("🔧 FALLBACK: Will rely on search functionality to find users");
                }

                console.log("📋 Initial conversations data details:", fetchedUsers.map(u => ({
                    id: u.id,
                    name: u.name,
                    lastMessage: u.lastMessage,
                    lastAt: u.lastAt,
                    unread: u.unread
                })));
                console.log("Initial conversations data:", fetchedUsers.map(u => ({
                    name: u.name,
                    lastMessage: u.lastMessage,
                    lastAt: u.lastAt,
                    unread: u.unread
                })));

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

                        // Update local state and save to history
                        const updatedConversation = {
                            ...selectedUser,
                            lastMessage: lastMessageContent,
                            lastAt: latestMessage.createdAt
                        };
                        
                        setUsers(prev => {
                            const updated = prev.map(u =>
                                u.id === selectedUser.id ? { ...u, ...updatedConversation } : u
                            );
                            // Save updated conversations to localStorage
                            saveChatHistory(updated);
                            return updated;
                        });
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
                console.log(`💬 Selected user polling for: ${selectedUser.name} (${receiverId})`);

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
                console.log("🌐 Selected user response status:", res.status);
                const data = await res.json();
                console.log("📨 Selected user RAW response:", data);

                if (Array.isArray(data)) {
                    console.log(`📨 Fetched ${data.length} messages for selected user`);
                    // Find new messages by comparing timestamps
                    const newMessages = lastMessageTimestamp
                        ? data.filter(msg => new Date(msg.createdAt).getTime() > lastMessageTimestamp)
                        : data;

                    console.log(`🆕 Found ${newMessages.length} new messages for selected user`);

                    if (newMessages.length > 0) {
                        console.log("🔥 NEW MESSAGES in selected conversation:", newMessages.map(m => ({
                            content: m.content,
                            senderId: m.senderId,
                            createdAt: m.createdAt
                        })));

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

                        console.log(`📝 Updating sidebar for selected user with: "${lastMessageContent}"`);

                        setUsers(prev => {
                            const updated = prev.map(u =>
                                u.id === selectedUser.id
                                    ? {
                                        ...u,
                                        lastMessage: lastMessageContent,
                                        lastAt: latestMessage.createdAt
                                    }
                                    : u
                            );
                            // Save updated conversations to localStorage
                            saveChatHistory(updated);
                            return updated;
                        });
                    }
                } else {
                    console.log("⚠️ Selected user polling: data is not an array", data);
                }
            } catch (err) {
                console.error("❌ Selected user polling error:", err);
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

    // Simplified global polling with anti-flicker protection
    useEffect(() => {
        if (!user) return;
        
        const globalPollingInterval = setInterval(async () => {
            // Skip polling if user is currently typing or actively chatting
            if (messageInput.trim().length > 0) {
                console.log("⏸️ Skipping polling - user is typing");
                return;
            }
            
            console.log("🔄 Checking for conversation updates...");
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
                
                // Only process if we get valid data (backend is working)
                if (Array.isArray(fetchedUsers) && fetchedUsers.length > 0) {
                    console.log("✅ Backend API working! Updating conversations from server");
                    const filteredUsers = fetchedUsers.filter(u => u.id !== user.id);
                    
                    setUsers(prevUsers => {
                        // Merge server data with local history
                        const localUserMap = new Map(prevUsers.map(u => [u.id, u]));
                        const serverUserMap = new Map(filteredUsers.map(u => [u.id, u]));
                        
                        // Update existing users with server data where available
                        const updatedUsers = prevUsers.map(localUser => {
                            const serverData = serverUserMap.get(localUser.id);
                            if (serverData) {
                                return { ...localUser, ...serverData };
                            }
                            return localUser;
                        });
                        
                        // Add new users from server that aren't in local history
                        const newUsersFromServer = filteredUsers.filter(serverUser => 
                            !localUserMap.has(serverUser.id)
                        );
                        
                        const finalUsers = [...newUsersFromServer, ...updatedUsers];
                        
                        // Only update if we have new users or meaningful changes
                        const hasNewUsers = newUsersFromServer.length > 0;
                        const hasSignificantChanges = prevUsers.length !== finalUsers.length || 
                            finalUsers.some(user => {
                                const prevUser = prevUsers.find(p => p.id === user.id);
                                return !prevUser || prevUser.lastMessage !== user.lastMessage;
                            });
                        
                        if (hasNewUsers || hasSignificantChanges) {
                            console.log("✅ Significant changes detected, updating conversations");
                            saveChatHistory(finalUsers);
                            return finalUsers;
                        } else {
                            console.log("ℹ️ No significant changes, maintaining current state");
                            return prevUsers;
                        }
                    });
                } else {
                    console.log("⚠️ Backend API still broken, relying on localStorage chat history");
                }
            } catch (err) {
                console.log("⚠️ Global polling failed, using localStorage:", err.message);
            }
        }, 10000); // Check every 10 seconds (less frequent since we have localStorage backup)

        return () => {
            clearInterval(globalPollingInterval);
        };
    }, [user, session]); // Removed messageInput from dependencies to prevent constant recreating

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

            // After sending a message, make sure the conversation appears in the list and is saved to history
            const lastMessageContent = savedMessage.attachments && savedMessage.attachments.length > 0 
                ? `${savedMessage.attachments.length} foto` 
                : (savedMessage.content || '');
            
            const updatedConversation = {
                ...selectedUser,
                lastMessage: lastMessageContent,
                lastAt: savedMessage.createdAt || new Date().toISOString(),
                unread: 0
            };
            
            // Save to localStorage and update state
            console.log("💾 Saving conversation to chat history:", updatedConversation.name);
            console.log("📊 Current conversations before update:", users.length);
            
            setUsers(prevUsers => {
                const existingIndex = prevUsers.findIndex(u => u.id === selectedUser.id);
                let newUsers;
                
                if (existingIndex >= 0) {
                    // Update existing and move to top
                    newUsers = [updatedConversation, ...prevUsers.filter((_, i) => i !== existingIndex)];
                } else {
                    // Add new conversation to top
                    newUsers = [updatedConversation, ...prevUsers];
                }
                
                console.log("📊 Conversations after update:", newUsers.length);
                
                // Save to localStorage
                try {
                    const historyData = {
                        userId: user.id,
                        conversations: newUsers,
                        lastUpdated: new Date().toISOString(),
                        sessionId: Date.now()
                    };
                    localStorage.setItem(getChatHistoryKey(), JSON.stringify(historyData));
                    console.log("✅ Chat history saved with", newUsers.length, "conversations");
                } catch (error) {
                    console.error('Failed to save:', error);
                }
                
                return newUsers;
            });

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
                                                // If this user is from search (not in conversations), add them to conversations and history
                                                if (debouncedSearchQuery && !users.some(existingUser => existingUser.id === u.id)) {
                                                    console.log("📝 Adding user from search to conversations and chat history:", u.name);
                                                    const userWithChatInfo = {
                                                        ...u,
                                                        lastMessage: u.lastMessage || 'No messages yet',
                                                        lastAt: new Date().toISOString(),
                                                        unread: 0
                                                    };
                                                    const newHistory = addToOrUpdateChatHistory(userWithChatInfo);
                                                    setUsers(newHistory);
                                                }
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