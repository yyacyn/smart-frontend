"use client";
import { useState, useRef, useEffect } from "react";
import { FiSend, FiSearch, FiMoreVertical, FiImage, FiPaperclip } from "react-icons/fi";
import Navbar from "../../components/navbar/Navbar";
import Footer from "../../components/footer/Footer";
import { useRouter } from "next/navigation";

export default function ChatPage() {
    const [selectedChat, setSelectedChat] = useState(null);
    const [messageInput, setMessageInput] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const messagesEndRef = useRef(null);
    const router = useRouter();
    const messagesContainerRef = useRef(null);

    // Sample chat data
    const chatList = [
        {
            id: 1,
            name: "Toko Elektronik Jaya",
            avatar: "/images/categories/elektronik.png",
            lastMessage: "Pesanan Anda sudah siap dikirim",
            timestamp: "10:30",
            unread: 2,
            isOnline: true,
            messages: [
                { id: 1, sender: "store", message: "Halo! Ada yang bisa kami bantu?", timestamp: "09:15" },
                { id: 2, sender: "user", message: "Saya ingin tanya tentang laptop yang kemarin saya pesan", timestamp: "09:16" },
                { id: 3, sender: "store", message: "Baik, laptop Anda sudah kami siapkan dan akan dikirim hari ini", timestamp: "09:20" },
                { id: 4, sender: "store", message: "Pesanan Anda sudah siap dikirim", timestamp: "10:30" }
            ]
        },
        {
            id: 2,
            name: "Warung Bu Siti",
            avatar: "/images/categories/makanan.png",
            lastMessage: "Terima kasih sudah berbelanja",
            timestamp: "Yesterday",
            unread: 0,
            isOnline: false,
            messages: [
                { id: 1, sender: "store", message: "Selamat pagi! Kami ada promo rendang hari ini", timestamp: "08:00" },
                { id: 2, sender: "user", message: "Berapa harga per porsinya?", timestamp: "08:05" },
                { id: 3, sender: "store", message: "Rp 25.000 per porsi, sudah termasuk nasi", timestamp: "08:07" },
                { id: 4, sender: "user", message: "Oke, saya pesan 2 porsi ya", timestamp: "08:10" },
                { id: 5, sender: "store", message: "Terima kasih sudah berbelanja", timestamp: "08:15" }
            ]
        },
        {
            id: 3,
            name: "Fashion Store",
            avatar: "/images/categories/fashion.png",
            lastMessage: "Stok baju sudah ready",
            timestamp: "2 days ago",
            unread: 1,
            isOnline: true,
            messages: [
                { id: 1, sender: "store", message: "Halo kak, stok baju yang ditanyakan kemarin sudah ready", timestamp: "2 days ago" },
                { id: 2, sender: "store", message: "Stok baju sudah ready", timestamp: "2 days ago" }
            ]
        },
        {
            id: 4,
            name: "Admin SMART",
            avatar: "/images/categories/admin.png",
            lastMessage: "Selamat datang di SMART!",
            timestamp: "1 week ago",
            unread: 0,
            isOnline: true,
            messages: [
                { id: 1, sender: "admin", message: "Selamat datang di SMART marketplace!", timestamp: "1 week ago" },
                { id: 2, sender: "admin", message: "Jika ada pertanyaan, jangan ragu untuk menghubungi kami", timestamp: "1 week ago" },
                { id: 3, sender: "admin", message: "Selamat datang di SMART!", timestamp: "1 week ago" }
            ]
        }
    ];

    // Filter chats based on search
    const filteredChats = chatList.filter(chat =>
        chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Send message function
    const sendMessage = () => {
        if (messageInput.trim() && selectedChat) {
            const newMessage = {
                id: Date.now(),
                sender: "user",
                message: messageInput,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };

            // Update the selected chat's messages
            const updatedChat = {
                ...selectedChat,
                messages: [...selectedChat.messages, newMessage]
            };

            setSelectedChat(updatedChat);
            setMessageInput("");
            // Scroll only the chat container to bottom
            setTimeout(() => {
                if (messagesContainerRef.current) {
                    messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
                }
            }, 100);
        }
    };

    // Handle Enter key press
    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    // Removed auto-scroll effect

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="container mx-auto px-4 py-8 mt-16">
                {/* Header */}
                <div className="mb-6 flex items-center gap-2">
                    <button onClick={() => router.back()} className="btn btn-sm btn-ghost shadow-none border-none text-gray-700 border border-gray-300 hover:bg-gray-100">
                        &larr;
                    </button>
                    <h1 className="text-2xl font-bold text-gray-900">Keranjang Belanja</h1>
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
                                {filteredChats.map((chat) => (
                                    <div
                                        key={chat.id}
                                        onClick={() => setSelectedChat(chat)}
                                        className={`p-4 border-b border-gray-100 cursor-pointer transition-colors ${selectedChat?.id === chat.id ? 'bg-[#ED775A] bg-opacity-10 border-l-4 border-l-[#ED775A]' : 'hover:bg-gray-50'}`}
                                    >
                                        <div className="flex items-center space-x-3">
                                            <div className="relative">
                                                <img
                                                    src={chat.avatar}
                                                    alt={chat.name}
                                                    className="w-12 h-12 rounded-full object-cover border border-gray-200"
                                                />
                                                {chat.isOnline && (
                                                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between">
                                                    <h3 className={`font-semibold truncate ${selectedChat?.id === chat.id ? 'text-white' : 'text-gray-900'}`}>{chat.name}</h3>
                                                    <span className={`text-xs ${selectedChat?.id === chat.id ? 'text-gray-200' : 'text-gray-500'}`}>{chat.timestamp}</span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <p className={`text-sm truncate mt-1 ${selectedChat?.id === chat.id ? 'text-gray-200' : 'text-gray-600'}`}>{chat.lastMessage}</p>
                                                    {/* Hide unread badge if selected */}
                                                    {chat.unread > 0 && selectedChat?.id !== chat.id && (
                                                        <div className="mt-2">
                                                            <span className="inline-block bg-[#ED775A] text-white text-xs px-2.5 py-1 rounded-full">
                                                                {chat.unread}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Chat Interface */}
                        <div className="flex-1 flex flex-col">
                            {selectedChat ? (
                                <>
                                    {/* Chat Header */}
                                    <div className="p-4 border-b border-gray-200 bg-white">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                <div className="relative">
                                                    <img
                                                        src={selectedChat.avatar}
                                                        alt={selectedChat.name}
                                                        className="w-10 h-10 rounded-full object-cover"
                                                    />
                                                    {selectedChat.isOnline && (
                                                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                                                    )}
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-gray-900">{selectedChat.name}</h3>
                                                    <p className="text-sm text-gray-500">
                                                        {selectedChat.isOnline ? 'Online' : 'Offline'}
                                                    </p>
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
                                            {selectedChat.messages.map((message) => (
                                                <div
                                                    key={message.id}
                                                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                                >
                                                    <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${message.sender === 'user'
                                                        ? 'bg-[#ED775A] text-white'
                                                        : 'bg-white text-gray-900 border border-gray-200'
                                                        }`}>
                                                        <p className="text-sm">{message.message}</p>
                                                        <p className={`text-xs mt-1 ${message.sender === 'user' ? 'text-orange-100' : 'text-gray-500'
                                                            }`}>
                                                            {message.timestamp}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                            <div ref={messagesEndRef} />
                                        </div>
                                    </div>

                                    {/* Message Input */}
                                    <div className="p-4 border-t border-gray-200 bg-white">
                                        <div className="flex items-center space-x-3">
                                            <button className="p-2 hover:bg-gray-100 rounded-full">
                                                <FiPaperclip className="w-5 h-5 text-gray-600" />
                                            </button>
                                            <button className="p-2 hover:bg-gray-100 rounded-full">
                                                <FiImage className="w-5 h-5 text-gray-600" />
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
                                                disabled={!messageInput.trim()}
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