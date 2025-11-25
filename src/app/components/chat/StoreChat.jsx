"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import { FiSend, FiImage, FiX } from "react-icons/fi";
import { fetchStoreById } from "@/app/api";

export default function StoreChat({ storeId, storeName, userId, onMessagesUpdate }) {
    const { user } = useUser();
    const { session } = useClerk();
    const [messages, setMessages] = useState([]);
    const [messageInput, setMessageInput] = useState("");
    const [files, setFiles] = useState([]);
    const [previewImages, setPreviewImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const [storeInfo, setStoreInfo] = useState({ name: storeName });
    const [storeOwnerId, setStoreOwnerId] = useState(null);
    const [imageModal, setImageModal] = useState({ isOpen: false, imageUrl: null });
    const messagesContainerRef = useRef(null);
    const pollingIntervalRef = useRef(null);
    const lastMessageTimestampRef = useRef(null);

    // Fetch store information and owner ID
    useEffect(() => {
        const fetchStoreInfo = async () => {
            if (storeId) {
                try {
                    const token = await session.getToken();
                    const response = await fetchStoreById(storeId, token);
                    const storeData = response.store || response;
                    setStoreInfo(storeData);
                    // Set the store owner's user ID for messaging
                    if (storeData.userId || storeData.ownerId) {
                        setStoreOwnerId(storeData.userId || storeData.ownerId);
                    } else {
                        console.error('Store owner ID not found in store data:', storeData);
                        setStoreOwnerId(null);
                    }
                } catch (error) {
                    console.error("Error fetching store info:", error);
                    setStoreInfo({ name: storeName || `Toko ${storeId.substring(0, 4)}` });
                    setStoreOwnerId(null);
                }
            }
        };

        fetchStoreInfo();
    }, [storeId, storeName, session]);

    // Load messages for this store
    useEffect(() => {
        const loadMessages = async () => {
            if (!user || !storeOwnerId) return;

            try {
                const token = await session.getToken();
                const res = await fetch(`https://besukma.vercel.app/api/chat?senderId=${user.id}&receiverId=${storeOwnerId}`, {
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
                        lastMessageTimestampRef.current = new Date(latestMessage.createdAt).getTime();
                    }
                } else {
                    setMessages([]);
                }
            } catch (err) {
                console.error("Failed to fetch messages:", err);
            } finally {
                setLoading(false);
            }
        };

        loadMessages();
    }, [user, storeOwnerId, session]);

    // Setup polling for new messages
    useEffect(() => {
        if (!user || !storeOwnerId) return;

        // Clear any existing interval
        if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
        }

        // Set up new polling interval
        pollingIntervalRef.current = setInterval(async () => {
            try {
                const token = await session.getToken();
                const res = await fetch(`https://besukma.vercel.app/api/chat?senderId=${user.id}&receiverId=${storeOwnerId}`, {
                    headers: token ? { 'Authorization': `Bearer ${token}` } : {}
                });
                const data = await res.json();

                if (Array.isArray(data)) {
                    // Find new messages by comparing timestamps
                    const newMessages = lastMessageTimestampRef.current
                        ? data.filter(msg => new Date(msg.createdAt).getTime() > lastMessageTimestampRef.current)
                        : data;

                    if (newMessages.length > 0) {
                        // Add new messages to existing ones, avoiding duplicates by ID
                        setMessages(prev => {
                            const existingIds = new Set(prev.map(msg => msg.id));
                            const uniqueNewMessages = newMessages.filter(msg => !existingIds.has(msg.id));
                            return [...prev, ...uniqueNewMessages];
                        });

                        // Update the last message timestamp
                        const latestMessage = data.reduce((latest, current) =>
                            new Date(current.createdAt) > new Date(latest.createdAt) ? current : latest
                        );
                        lastMessageTimestampRef.current = new Date(latestMessage.createdAt).getTime();

                        // Notify parent component of message updates
                        if (onMessagesUpdate) {
                            onMessagesUpdate(storeId, [...messages, ...newMessages]);
                        }
                    }
                }
            } catch (err) {
                console.error("Polling error:", err);
            }
        }, 2000); // Poll every 2 seconds

        // Cleanup interval on component unmount
        return () => {
            if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current);
                pollingIntervalRef.current = null;
            }
        };
    }, [user, storeOwnerId, session, messages, onMessagesUpdate]);

    // Auto-scroll to bottom when messages change
    useEffect(() => {
        if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
    }, [messages]);

    // Send message function
    const sendMessage = async () => {
        console.log('sendMessage called:', { messageInput, files, user: !!user, storeId, storeOwnerId });

        if ((!messageInput.trim() && files.length === 0) || !user || !storeOwnerId) {
            console.log('Early return - missing required data');
            if (!storeOwnerId) {
                alert('Error: Cannot send message - store owner not found.');
            }
            return;
        }

        // Validate storeOwnerId format
        if (typeof storeOwnerId !== 'string' || storeOwnerId.length === 0) {
            console.error('Invalid storeOwnerId format:', storeOwnerId);
            alert('Error: Invalid store owner ID. Cannot send message.');
            return;
        }

        setIsSending(true);
        const hasFiles = files && files.length > 0;
        let savedMessage = null;

        try {
            if (hasFiles) {
                const form = new FormData();
                form.append('senderId', user.id);
                form.append('receiverId', storeOwnerId);
                form.append('content', messageInput.trim()); // Can be empty string if sending only images
                files.forEach((f) => form.append('attachments', f));

                const token = await session.getToken();
                const res = await fetch('https://besukma.vercel.app/api/chat', {
                    method: 'POST',
                    body: form,
                    headers: token ? { 'Authorization': `Bearer ${token}` } : {}
                });
                savedMessage = await res.json();
            } else {
                const payload = {
                    senderId: user.id,
                    receiverId: storeOwnerId,
                    content: messageInput.trim()
                };

                const token = await session.getToken();
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

            if (savedMessage?.id) {
                console.log('Message sent successfully:', savedMessage);
                // Add the new message to the state
                setMessages(prev => [...prev, savedMessage]);

                // Update the last message timestamp
                lastMessageTimestampRef.current = new Date(savedMessage.createdAt || Date.now()).getTime();

                // Clear input and files
                setMessageInput("");
                setFiles([]);
                setPreviewImages([]);
                // Clear the preview images and revoke their object URLs
                previewImages.forEach(url => URL.revokeObjectURL(url));
            } else {
                console.error('No message ID returned:', savedMessage);
                if (savedMessage?.error) {
                    if (savedMessage.details?.includes('Foreign key constraint')) {
                        alert('Error: Cannot send message to this store. The store may no longer exist.');
                    } else {
                        alert(`Error sending message: ${savedMessage.error}`);
                    }
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

    // Function to open image modal
    const openImageModal = (imageUrl) => {
        setImageModal({ isOpen: true, imageUrl });
    };

    // Function to close image modal
    const closeImageModal = () => {
        setImageModal({ isOpen: false, imageUrl: null });
    };

    if (loading) {
        return (
            <div className="p-4 border border-gray-200 rounded-lg h-60 flex items-center justify-center">
                <div className="text-center">
                    <span className="loading loading-spinner loading-md"></span>
                    <p className="text-sm text-gray-500 mt-2">Loading chat...</p>
                </div>
            </div>
        );
    }

    if (!storeOwnerId) {
        return (
            <div className="p-4 border border-gray-200 rounded-lg h-60 flex items-center justify-center">
                <div className="text-center text-gray-500">
                    <p className="text-sm">Chat tidak tersedia</p>
                    <p className="text-xs mt-1">Pemilik toko tidak ditemukan</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="border border-gray-200 rounded-lg p-3 mb-3">
                <div className="flex items-center gap-2 mb-2">
                    <FiSend className="w-4 h-4 text-[#ED775A]" />
                    <span className="font-medium text-gray-800">Chat: {storeInfo.name || `Toko ${storeId.substring(0, 4)}`}</span>
                </div>

                <div
                    ref={messagesContainerRef}
                    className="border rounded-lg border-gray-200 bg-gray-50 p-3 h-40 overflow-y-auto mb-2"
                >
                    {messages.map((msg) => (
                        <div
                            key={`${storeId}-${msg.id || msg.createdAt || Math.random()}`}
                            className={`mb-3 flex ${msg.senderId === user?.id ? "justify-end" : "justify-start"}`}
                        >
                            <div className={`max-w-xs px-4 py-2 rounded-lg ${msg.senderId === user?.id
                                ? "bg-[#ED775A] text-white"
                                : "bg-white text-gray-900 border border-gray-200"
                                }`}>
                                {msg.content && <p className="text-sm">{msg.content}</p>}
                                {Array.isArray(msg.attachments) && msg.attachments.length > 0 && (
                                    <div className="mt-2 flex gap-2">
                                        {msg.attachments.map((a, i) => (
                                            <div key={i} className="cursor-pointer" onClick={() => openImageModal(a)}>
                                                <img src={a} alt={`attachment-${i}`} className="w-16 h-16 object-cover rounded" />
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <p className={`text-xs mt-1 ${msg.senderId === user?.id ? "text-orange-100" : "text-gray-500"}`}>
                                    {new Date(msg.createdAt || msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

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

                <div className="flex items-center gap-2">
                    <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        id={`chat-image-upload-store-${storeId}`}
                        onChange={handleFileChange}
                    />
                    <label htmlFor={`chat-image-upload-store-${storeId}`} className="p-2 bg-gray-100 rounded-full cursor-pointer hover:bg-gray-200">
                        <FiImage className="w-4 h-4 text-gray-500" />
                    </label>
                    <input
                        type="text"
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Ketik pesan..."
                        className="flex-1 px-3 py-2 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-[#ED775A] text-sm"
                    />
                    <button
                        onClick={() => {
                            console.log('Send button clicked');
                            sendMessage();
                        }}
                        disabled={(!messageInput.trim() && files.length === 0) || isSending}
                        className="p-2 bg-[#ED775A] text-white rounded-full hover:bg-[#d86a4a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {isSending ? (
                            <span className="loading loading-spinner loading-xs" />
                        ) : (
                            <FiSend className="w-4 h-4" />
                        )}
                    </button>
                </div>
            </div>

            {/* Image Modal */}
            {imageModal.isOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4" onClick={closeImageModal}>
                    <div className="relative max-w-4xl max-h-full">
                        <button
                            className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full p-2 z-10"
                            onClick={closeImageModal}
                        >
                            <FiX className="w-6 h-6" />
                        </button>
                        <img
                            src={imageModal.imageUrl}
                            alt="Enlarged view"
                            className="max-w-full max-h-[90vh] object-contain"
                            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking on the image
                        />
                    </div>
                </div>
            )}
        </>
    );
}