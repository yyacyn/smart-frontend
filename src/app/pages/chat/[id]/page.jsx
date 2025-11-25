"use client";
import { useEffect, useState, useRef } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import { FiSend, FiImage, FiPaperclip } from "react-icons/fi";
import Navbar from "../../../components/navbar/Navbar";
import Footer from "../../../components/footer/Footer";
import { useRouter, useParams } from "next/navigation";
import { fetchStoreById } from "../../../api";
import { useGlobalData } from '../../../contexts/GlobalDataContext';

export default function StoreChatPage() {
    const { user } = useUser();
    const { session } = useClerk();
    const router = useRouter();
    const params = useParams();
    const storeId = params.id;
    const { cachedStores, setCachedStores } = useGlobalData();

    const [store, setStore] = useState(null);
    const [storeOwnerId, setStoreOwnerId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [messageInput, setMessageInput] = useState("");
    const [files, setFiles] = useState([]);
    const [previewImages, setPreviewImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const messagesContainerRef = useRef(null);
    const pollingIntervalRef = useRef(null);

    // Load store information and chat history
    useEffect(() => {
        const loadStoreAndMessages = async () => {
            try {
                // Check if stores are already cached
                let storeInfo = null;

                if (cachedStores) {
                    // Find the specific store using cached data
                    if (Array.isArray(cachedStores)) {
                        storeInfo = cachedStores.find(s => s.id === storeId);
                    } else if (cachedStores.store && cachedStores.store.id === storeId) {
                        storeInfo = cachedStores.store;
                    } else if (cachedStores.id === storeId) {
                        storeInfo = cachedStores;
                    }
                }

                if (storeInfo) {
                    // Use cached store data
                    setStore(storeInfo);
                    const ownerId = storeInfo.userId || storeInfo.ownerId;
                    setStoreOwnerId(ownerId);

                    // Load messages for this store conversation
                    if (ownerId) {
                        const token = await session.getToken();
                        const res = await fetch(`https://besukma.vercel.app/api/chat?senderId=${user?.id}&receiverId=${ownerId}`, {
                            headers: token ? { 'Authorization': `Bearer ${token}` } : {}
                        });
                        const data = await res.json();
                        if (Array.isArray(data)) {
                            setMessages(data);
                        }
                    }
                } else {
                    // If store is not in cache, fetch it individually
                    const token = await session.getToken();
                    const storeData = await fetchStoreById(storeId, token);
                    const fetchedStore = storeData.store || storeData;
                    setStore(fetchedStore);

                    // Extract store owner ID from the store data
                    const ownerId = fetchedStore.userId || fetchedStore.ownerId;
                    setStoreOwnerId(ownerId);

                    // Load messages for this store conversation
                    if (ownerId) {
                        const res = await fetch(`https://besukma.vercel.app/api/chat?senderId=${user?.id}&receiverId=${ownerId}`, {
                            headers: token ? { 'Authorization': `Bearer ${token}` } : {}
                        });
                        const data = await res.json();
                        if (Array.isArray(data)) {
                            setMessages(data);
                        }
                    }

                    // Add this store to the cache for future use
                    if (cachedStores) {
                        const updatedStores = Array.isArray(cachedStores)
                            ? [...cachedStores, fetchedStore]
                            : [cachedStores, fetchedStore];
                        setCachedStores(updatedStores);
                    } else {
                        setCachedStores([fetchedStore]);
                    }
                }
            } catch (err) {
                console.error("Failed to load store or messages:", err);
                // Potentially redirect user or show error message
            } finally {
                setLoading(false);
            }
        };

        if (user && storeId) {
            loadStoreAndMessages();
        }
    }, [user, storeId, session, cachedStores, setCachedStores]);

    // Polling for new messages
    useEffect(() => {
        if (!user || !storeOwnerId) return;

        pollingIntervalRef.current = setInterval(async () => {
            try {
                const token = await session.getToken();
                const res = await fetch(`https://besukma.vercel.app/api/chat?senderId=${user.id}&receiverId=${storeOwnerId}`, {
                    headers: token ? { 'Authorization': `Bearer ${token}` } : {}
                });
                const data = await res.json();

                if (Array.isArray(data)) {
                    setMessages(prev => {
                        // Find new messages by comparing timestamps
                        const existingIds = new Set(prev.map(m => m.id || m._id));
                        const newMessages = data.filter(m => !existingIds.has(m.id || m._id));

                        if (newMessages.length > 0) {
                            return [...prev, ...newMessages];
                        }
                        return prev;
                    });
                }
            } catch (err) {
                console.error("Polling error:", err);
            }
        }, 2000); // Poll every 2 seconds

        return () => {
            if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current);
            }
        };
    }, [user, storeOwnerId, session]);

    // Auto-scroll to bottom when messages change
    useEffect(() => {
        if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
    }, [messages]);

    // Send message function
    const sendMessage = async () => {
        if ((!messageInput.trim() && files.length === 0) || !user || !storeOwnerId) {
            return;
        }

        setIsSending(true);
        try {
            let response;
            if (files.length > 0) {
                // Send with attachments
                const formData = new FormData();
                formData.append('senderId', user.id);
                formData.append('receiverId', storeOwnerId);
                formData.append('content', messageInput.trim());
                files.forEach((file) => formData.append('attachments', file));

                const token = await session.getToken();
                response = await fetch('https://besukma.vercel.app/api/chat', {
                    method: 'POST',
                    body: formData,
                    headers: token ? { 'Authorization': `Bearer ${token}` } : {}
                });
            } else {
                // Send text message only
                const payload = {
                    senderId: user.id,
                    receiverId: storeOwnerId,
                    content: messageInput.trim()
                };

                const token = await session.getToken();
                response = await fetch('https://besukma.vercel.app/api/chat', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        ...(token && { 'Authorization': `Bearer ${token}` })
                    },
                    body: JSON.stringify(payload)
                });
            }

            const savedMessage = await response.json();

            if (savedMessage?.id) {
                setMessages(prev => [...prev, savedMessage]);
                setMessageInput("");
                setFiles([]);
                setPreviewImages([]);
                // Revoke object URLs for preview images
                previewImages.forEach(url => URL.revokeObjectURL(url));
            } else {
                console.error('Failed to send message:', savedMessage);
                if (savedMessage?.error && savedMessage.details?.includes('Foreign key constraint')) {
                    alert('Error: Cannot send message to this store. The store may no longer exist or the owner may have changed.');
                } else {
                    alert('Failed to send message. Please try again.');
                }
            }
        } catch (err) {
            console.error('Failed to send message:', err);
            alert('Network error. Please check your connection and try again.');
        } finally {
            setIsSending(false);
        }
    };

    const handleFileChange = (e) => {
        const newFiles = Array.from(e.target.files || []);
        
        // Create preview URLs for the selected images
        const newPreviews = newFiles.map(file => URL.createObjectURL(file));

        // Set new files and previews
        setFiles(prev => [...prev, ...newFiles]);
        setPreviewImages(prev => [...prev, ...newPreviews]);

        // Reset the file input
        e.target.value = '';
    };

    const removePreviewImage = (index) => {
        setFiles(prevFiles => {
            const newFiles = prevFiles.filter((_, i) => i !== index);
            return newFiles;
        });

        setPreviewImages(prevPreviews => {
            // Revoke the object URL for the image being removed
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

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="flex items-center justify-center h-screen">
                    <span className="loading loading-spinner loading-lg text-[#ED775A]"></span>
                </div>
                <Footer />
            </div>
        );
    }

    if (!store) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="flex items-center justify-center h-screen">
                    <div className="text-center">
                        <p className="text-red-500">Store not found</p>
                        <button
                            onClick={() => router.back()}
                            className="btn bg-[#ED775A] text-white mt-4"
                        >
                            Back
                        </button>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    if (!storeOwnerId) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="flex items-center justify-center h-screen">
                    <div className="text-center">
                        <p className="text-red-500">Cannot chat with this store</p>
                        <p className="text-sm text-gray-600 mt-2">The store owner information is not available.</p>
                        <button
                            onClick={() => router.back()}
                            className="btn bg-[#ED775A] text-white mt-4"
                        >
                            Back
                        </button>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="container mx-auto px-4 py-8 mt-16 bg-white mb-15">
                {/* Header */}
                <div className="mb-6 flex items-center gap-2">
                    <button 
                        onClick={() => router.back()} 
                        className="btn btn-sm btn-ghost shadow-none border-none text-gray-700 border border-gray-300 hover:bg-gray-100"
                    >
                        &larr;
                    </button>
                    <div className="flex items-center gap-3">
                        <img
                            src={store.logo || "/default-store.png"}
                            alt={store.name}
                            className="w-10 h-10 rounded-full object-cover border border-gray-200"
                        />
                        <h1 className="text-xl font-bold text-gray-900">{store.name}</h1>
                        <span className="ml-2 text-xs bg-[#ED775A] text-white px-2 py-0.5 rounded-full">
                            Toko
                        </span>
                    </div>
                </div>

                {/* Chat Container */}
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden" style={{ height: '70vh' }}>
                    <div className="flex flex-col h-full">
                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                            <div ref={messagesContainerRef} className="space-y-4 h-full">
                                {messages.length === 0 ? (
                                    <div className="flex items-center justify-center h-full text-gray-500">
                                        <p>Belum ada pesan. Kirim pesan pertama Anda!</p>
                                    </div>
                                ) : (
                                    messages.map((msg) => (
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
                                                        {msg.attachments.map((attachment, i) => (
                                                            <img 
                                                                key={i} 
                                                                src={attachment} 
                                                                alt={`attachment-${i}`} 
                                                                className="w-32 h-32 object-cover rounded" 
                                                            />
                                                        ))}
                                                    </div>
                                                )}
                                                <p className={`text-xs mt-1 ${msg.senderId === user?.id ? 'text-orange-100' : 'text-gray-500'}`}>
                                                    {new Date(msg.createdAt || msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                )}
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
                                <label className="p-2 hover:bg-gray-100 rounded-full cursor-pointer">
                                    <FiPaperclip className="w-5 h-5 text-gray-600" />
                                    <input
                                        type="file"
                                        className="hidden"
                                        multiple
                                        accept="image/*"
                                        onChange={handleFileChange}
                                    />
                                </label>
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
                                    disabled={(!messageInput.trim() && files.length === 0) || isSending}
                                    className="p-2 bg-[#ED775A] text-white rounded-full hover:bg-[#d86a4a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    {isSending ? (
                                        <span className="loading loading-spinner loading-xs" />
                                    ) : (
                                        <FiSend className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}