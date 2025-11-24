"use client";
import React from "react";
import { useState, useRef, useEffect } from "react";
import Navbar from "../../../components/navbar/Navbar";
import Footer from "../../../components/footer/Footer";
import { FiSend, FiCheckCircle, FiMessageSquare, FiStar, FiImage, FiFileText, FiClock, FiXCircle } from "react-icons/fi";
import { useRouter, useParams } from "next/navigation";
import { useUser, useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { fetchOrderById, fetchOrders, fetchStoreById } from "../../../api";

export default function StatusPage() {
    const router = useRouter();
    const params = useParams();
    const { user } = useUser();
    const orderId = params.id;

    // Order data state
    const [order, setOrder] = useState(null);
    const [store, setStore] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [accepted, setAccepted] = useState(false);
    const [reviewing, setReviewing] = useState(false);
    const [review, setReview] = useState("");
    const [rating, setRating] = useState(0);

    // State for store-specific chat data
    const [storeChats, setStoreChats] = useState({});

    // Individual refs for message containers
    const messageInputs = useRef({});
    const imageFiles = useRef({});
    const messagesEndRefs = useRef({});
    const messagesContainerRefs = useRef({});

    const { getToken } = useAuth();

    // Fetch order from API
    useEffect(() => {
        async function fetchOrderDetails() {
            if (!user) return;

            setLoading(true);
            setError("");

            try {
                const token = await getToken();
                const response = await fetchOrders(token);
                const orders = response.orders || response;

                // Find the order with the matching ID
                const orderDetail = orders.find(order => order.id === orderId);

                if (orderDetail) {
                    setOrder(orderDetail);

                    // If store information is not available in the order, fetch it separately
                    if (!orderDetail.store && orderDetail.storeId) {
                        try {
                            const storeResponse = await fetchStoreById(orderDetail.storeId, token);
                            setStore(storeResponse.store || storeResponse);
                        } catch (storeErr) {
                            console.error("Error fetching store:", storeErr);
                        }
                    }

                    // Initialize store-specific chat data based on stores in the order
                    if (orderDetail.orderItems && orderDetail.orderItems.length > 0) {
                        const storeMap = new Map();
                        orderDetail.orderItems.forEach(item => {
                            if (item.product && item.product.storeId) {
                                if (!storeMap.has(item.product.storeId)) {
                                    storeMap.set(item.product.storeId, {
                                        storeId: item.product.storeId,
                                        storeName: item.product.store?.name || `Toko ${item.product.storeId.substring(0, 4)}`,
                                        messages: [
                                            { id: 1, sender: "store", message: `Halo! Terima kasih telah memesan dari ${item.product.store?.name || `Toko ${item.product.storeId.substring(0, 4)}`}.` },
                                            { id: 2, sender: "user", message: "Terima kasih, mohon info pengiriman." },
                                            { id: 3, sender: "store", message: "Barang akan segera dikirim. Mohon ditunggu." },
                                        ],
                                        messageInput: '',
                                        imageFile: null
                                    });
                                }
                            }
                        });

                        // Set initial store chat data
                        const initialChats = {};
                        storeMap.forEach((value, key) => {
                            initialChats[key] = value;
                        });

                        setStoreChats(initialChats);
                    }
                } else {
                    setError("Pesanan tidak ditemukan");
                }
            } catch (err) {
                console.error("Error fetching orders:", err);
                setError("Gagal mengambil data pesanan. Silakan coba lagi nanti.");
            } finally {
                setLoading(false);
            }
        }

        fetchOrderDetails();
    }, [orderId, user, getToken]);

    // Helper functions
    const getStatusDisplay = (status) => {
        switch (status?.toUpperCase()) {
            case "ORDER_PLACED":
                return {
                    icon: <FiClock className="w-6 h-6 text-[#f59e0b]" />,
                    text: "Menunggu Konfirmasi",
                    color: "text-[#ca8a04]"
                };
            case "PROCESSING":
                return {
                    icon: <FiClock className="w-6 h-6 text-[#3b82f6]" />,
                    text: "Sedang Diproses",
                    color: "text-[#1d4ed8]"
                };
            case "SHIPPED":
                return {
                    icon: <FiCheckCircle className="w-6 h-6 text-[#8b5cf6]" />,
                    text: "Sedang Dikirim",
                    color: "text-[#7e22ce]"
                };
            case "DELIVERED":
                return {
                    icon: <FiCheckCircle className="w-6 h-6 text-[#10b981]" />,
                    text: "Telah Sampai",
                    color: "text-[#047857]"
                };
            case "COMPLETED":
                return {
                    icon: <FiCheckCircle className="w-6 h-6 text-[#10b981]" />,
                    text: "Pesanan Selesai",
                    color: "text-[#047857]"
                };
            case "CANCELLED":
                return {
                    icon: <FiXCircle className="w-6 h-6 text-[#ef4444]" />,
                    text: "Pesanan Dibatalkan",
                    color: "text-[#dc2626]"
                };
            default:
                return {
                    icon: <FiClock className="w-6 h-6 text-[#6b7280]" />,
                    text: "Status Tidak Diketahui",
                    color: "text-[#4b5563]"
                };
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "-";
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString("id-ID", {
                day: "2-digit",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                timeZone: "Asia/Jakarta"
            }) + " WIB";
        } catch {
            return "-";
        }
    };

    const sendMessage = () => {
        if (messageInput.trim() || imageFile) {
            setMessages([
                ...messages,
                {
                    id: Date.now(),
                    sender: "user",
                    message: messageInput,
                    image: imageFile ? URL.createObjectURL(imageFile) : null,
                },
            ]);
            setMessageInput("");
            setImageFile(null);
            setTimeout(() => {
                if (messagesContainerRef.current) {
                    messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
                }
            }, 100);
        };
    };

    // Show loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="w-full px-10 py-8 mt-16">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex items-center gap-2 mb-6">
                            <button
                                onClick={() => router.back()}
                                className="btn btn-sm btn-ghost shadow-none border-none text-gray-700 hover:bg-gray-100"
                            >
                                &larr;
                            </button>
                            <h2 className="text-2xl font-bold text-gray-900">Detail Pesanan</h2>
                        </div>
                        <div className="flex flex-col items-center justify-center py-20">
                            <span className="loading loading-spinner loading-lg"></span>
                            <p className="mt-4 text-gray-500">Memuat detail pesanan...</p>
                        </div>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    // Show error state
    if (error || !order) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="w-full px-10 py-8 mt-16">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex items-center gap-2 mb-6">
                            <button
                                onClick={() => router.back()}
                                className="btn btn-sm btn-ghost shadow-none border-none text-gray-700 hover:bg-gray-100"
                            >
                                &larr;
                            </button>
                            <h2 className="text-2xl font-bold text-gray-900">Detail Pesanan</h2>
                        </div>
                        <div className="flex flex-col items-center justify-center py-20">
                            <FiXCircle className="w-16 h-16 text-red-500" />
                            <p className="mt-4 text-red-500 text-center">{error || "Pesanan tidak ditemukan"}</p>
                            <button
                                onClick={() => router.push("/pages/marketplace")}
                                className="mt-4 btn bg-[#ED775A] text-white hover:bg-[#d86a4a] border-none"
                            >
                                Kembali ke Marketplace
                            </button>
                        </div>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    const statusDisplay = getStatusDisplay(order.status);

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="w-full px-10 py-8 mt-16">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center gap-2 mb-6">
                        <button
                            onClick={() => router.back()}
                            className="btn btn-sm btn-ghost shadow-none border-none text-gray-700 hover:bg-gray-100"
                        >
                            &larr;
                        </button>
                        <h2 className="text-2xl font-bold text-gray-900">Detail Pesanan</h2>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Section - Transaction Details */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Order Status */}
                            <div className="bg-white rounded-lg shadow p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    {statusDisplay.icon}
                                    <span className={`text-lg font-semibold ${statusDisplay.color}`}>{statusDisplay.text}</span>
                                </div>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-gray-600">No. Pesanan</p>
                                        <p className="font-mono font-semibold">{order.id}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600">Tanggal Pembelian</p>
                                        <p className="font-semibold">{formatDate(order.createdAt || order.created_at)}</p>
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <Link href={`/pages/receipt/${order.id}`} className="inline-flex items-center gap-2 text-[#ED775A] hover:text-[#d86a4a] font-semibold">
                                        <FiFileText className="w-4 h-4" />
                                        Lihat Invoice
                                    </Link>
                                </div>
                            </div>

                            {/* Product Details */}
                            <div className="bg-white rounded-lg shadow p-6">
                                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                                    <span className="w-4 h-4 bg-purple-500 rounded"></span>
                                    {order.store?.name || store?.name || "Toko"}
                                </h3>
                                <div className="space-y-4">
                                    {order.orderItems && order.orderItems.length > 0 ? (
                                        order.orderItems.map((item, index) => (
                                            <div key={item.productId || index} className="flex gap-4">
                                                <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0">
                                                    <img
                                                        src={item.product?.images?.[0] || "/images/default.png"}
                                                        alt={item.product?.name || "Product"}
                                                        className="w-full h-full object-cover rounded-lg"
                                                    />
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-medium">
                                                        {item.product?.name || `Produk #${item.productId}`}
                                                    </h4>
                                                    <p className="text-sm font-semibold mt-1">
                                                        {item.quantity || 1} x Rp{(item.product?.price || item.price || 0).toLocaleString("id-ID")}
                                                    </p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="flex gap-4">
                                            <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0"></div>
                                            <div className="flex-1">
                                                <h4 className="font-medium text-gray-500">Tidak ada produk ditemukan</h4>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Shipping Info */}
                            <div className="bg-white rounded-lg shadow p-6">
                                <h3 className="font-semibold text-lg mb-4">Info Pengiriman</h3>
                                <div className="space-y-3 text-sm">
                                    {order.trackingNumber && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">No Resi</span>
                                            <span className="font-mono">{order.trackingNumber}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between items-start">
                                        <span className="text-gray-600">Alamat</span>
                                        <div className="text-right max-w-xs">
                                            <p className="font-semibold">{order.address?.name || user?.fullName || "-"}</p>
                                            {order.address?.phone && (
                                                <p className="text-gray-600">(+62){order.address.phone}</p>
                                            )}
                                            <p className="text-gray-600 text-xs leading-relaxed">
                                                {order.address?.street || order.address?.address || "Alamat tidak tersedia"}
                                                {order.address?.city && `, ${order.address.city}`}
                                                {order.address?.zip && ` ${order.address.zip}`}
                                                {order.address?.country && `, ${order.address.country}`}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Summary */}
                            <div className="bg-white rounded-lg shadow p-6">
                                <h3 className="font-semibold text-lg mb-4">Rincian Pembayaran</h3>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span>Metode Pembayaran</span>
                                        <span className="font-semibold capitalize">
                                            {order.paymentMethod === 'BANK_TRANSFER' ? 'Bank Transfer' :
                                                order.paymentMethod === 'COD' ? 'Cash on Delivery' :
                                                    order.paymentMethod === 'EWALLET' ? 'E-Wallet' :
                                                        order.paymentMethod?.toLowerCase().split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') || 'Belum ditentukan'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Subtotal Harga Barang</span>
                                        <span>Rp{(order.total || 0).toLocaleString("id-ID")}</span>
                                    </div>
                                    {order.discount > 0 && (
                                        <div className="flex justify-between">
                                            <span>Diskon</span>
                                            <span className="text-red-600">-Rp{order.discount.toLocaleString("id-ID")}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between">
                                        <span>Ongkos Kirim</span>
                                        <span>{order.shippingCost > 0 ? `Rp${order.shippingCost.toLocaleString("id-ID")}` : "GRATIS"}</span>
                                    </div>
                                    {order.tax > 0 && (
                                        <div className="flex justify-between">
                                            <span>Pajak</span>
                                            <span>Rp{order.tax.toLocaleString("id-ID")}</span>
                                        </div>
                                    )}
                                    <hr className="my-2" />
                                    <div className="flex justify-between font-bold text-lg">
                                        <span>Total Belanja</span>
                                        <span>Rp{(order.total || 0).toLocaleString("id-ID")}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col gap-3">
                                {(order.status === "DELIVERED" || order.status === "delivered") && !accepted ? (
                                    <button
                                        className="btn btn-lg bg-[#ED775A] text-white hover:bg-[#d86a4a] border-none shadow-lg rounded-lg px-8 py-3 text-lg font-bold transition-all duration-300"
                                        onClick={() => setAccepted(true)}
                                    >
                                        Terima Barang
                                    </button>
                                ) : (order.status === "COMPLETED" || order.status === "completed") || accepted ? (
                                    <button
                                        className="btn btn-lg bg-[#476EAE] text-white hover:bg-[#3a5c8e] border-none shadow-lg rounded-lg px-8 py-3 text-lg font-bold transition-all duration-300"
                                        onClick={() => setReviewing(true)}
                                    >
                                        Review Barang
                                    </button>
                                ) : (order.status === "ORDER_PLACED" || order.status === "order_placed" || order.status === "pending") ? (
                                    <button
                                        className="btn btn-lg bg-red-500 text-white hover:bg-red-600 border-none shadow-lg rounded-lg px-8 py-3 text-lg font-bold transition-all duration-300"
                                        onClick={() => {
                                            if (confirm("Apakah Anda yakin ingin membatalkan pesanan ini?")) {
                                                // TODO: Add cancel order API call
                                                alert("Fitur pembatalan pesanan akan segera tersedia.");
                                            }
                                        }}
                                    >
                                        Batalkan Pesanan
                                    </button>
                                ) : null}
                                {reviewing && (
                                    <div className="p-4 border rounded-lg bg-gray-50">
                                        <h3 className="font-semibold mb-2">Beri Ulasan</h3>
                                        <div className="flex gap-1 mb-2">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    key={star}
                                                    type="button"
                                                    className={`mask mask-star-2 w-8 h-8 ${rating >= star ? "bg-yellow-400" : "bg-gray-300"}`}
                                                    onClick={() => setRating(star)}
                                                />
                                            ))}
                                        </div>
                                        <textarea
                                            className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#ED775A]"
                                            rows={3}
                                            placeholder="Tulis ulasan Anda..."
                                            value={review}
                                            onChange={e => setReview(e.target.value)}
                                        />
                                        <button
                                            className="mt-3 btn btn-sm bg-[#ED775A] text-white hover:bg-[#d86a4a] border-none rounded-lg px-6 py-2 font-bold"
                                            onClick={async () => {
                                                try {
                                                    // TODO: Add review submission API call
                                                    // const reviewData = { rating, review, orderId: order.id };
                                                    // await submitReview(reviewData, token);

                                                    alert("Terima kasih atas ulasan Anda!");
                                                    setReviewing(false);
                                                    setReview("");
                                                    setRating(0);

                                                    // Update order status in state
                                                    setOrder(prev => ({ ...prev, status: "completed" }));
                                                } catch (error) {
                                                    alert("Gagal mengirim ulasan. Silakan coba lagi.");
                                                }
                                            }}
                                        >
                                            Kirim Ulasan
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right Section - Store Chats */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-lg border shadow-none border-gray-200 h-fit sticky top-6 p-4">
                                <div className="flex items-center gap-2 mb-4">
                                    <FiMessageSquare className="w-5 h-5 text-[#ED775A]" />
                                    <h3 className="font-semibold text-gray-800">Chat dengan Toko</h3>
                                </div>

                                {/* Store-specific chat sections */}
                                {Object.keys(storeChats).length > 0 && (
                                    <div className="space-y-4">
                                        {Object.values(storeChats).map((storeChat) => {
                                            // Ensure refs exist for this store
                                            if (!messagesContainerRefs.current[storeChat.storeId]) {
                                                messagesContainerRefs.current[storeChat.storeId] = React.createRef();
                                                messagesEndRefs.current[storeChat.storeId] = React.createRef();
                                            }

                                            const sendMessage = (storeId) => {
                                                const messageText = messageInputs.current[storeId]?.value || '';
                                                const imageFile = imageFiles.current[storeId]?.files?.[0] || null;

                                                if (messageText.trim() || imageFile) {
                                                    setStoreChats(prevChats => {
                                                        const updatedChats = { ...prevChats };
                                                        const currentChat = { ...updatedChats[storeId] };
                                                        currentChat.messages = [
                                                            ...currentChat.messages,
                                                            {
                                                                id: Date.now(),
                                                                sender: "user",
                                                                message: messageText,
                                                                image: imageFile ? URL.createObjectURL(imageFile) : null,
                                                            }
                                                        ];
                                                        updatedChats[storeId] = currentChat;

                                                        // Clear input and file
                                                        messageInputs.current[storeId].value = '';
                                                        if (imageFiles.current[storeId]) {
                                                            imageFiles.current[storeId].value = '';
                                                        }

                                                        return updatedChats;
                                                    });

                                                    // Auto-scroll to bottom
                                                    setTimeout(() => {
                                                        const containerRef = messagesContainerRefs.current[storeId];
                                                        if (containerRef && containerRef.current) {
                                                            containerRef.current.scrollTop = containerRef.current.scrollHeight;
                                                        }
                                                    }, 100);
                                                }
                                            };

                                            const handleKeyPress = (e, storeId) => {
                                                if (e.key === 'Enter') {
                                                    sendMessage(storeId);
                                                }
                                            };

                                            const handleFileChange = (e, storeId) => {
                                                // Process file change - it's handled in sendMessage
                                            };

                                            return (
                                                <div key={storeChat.storeId} className="border border-gray-200 rounded-lg p-3 mb-3">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <FiMessageSquare className="w-4 h-4 text-[#ED775A]" />
                                                        <span className="font-medium text-gray-800">Chat: {storeChat.storeName}</span>
                                                    </div>
                                                    <div
                                                        ref={messagesContainerRefs.current[storeChat.storeId]}
                                                        className="border rounded-lg border-gray-200 bg-gray-50 p-3 h-40 overflow-y-auto mb-2"
                                                    >
                                                        {storeChat.messages.map((msg) => (
                                                            <div key={msg.id} className={`mb-3 flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                                                                <div className={`px-3 py-2 rounded-lg max-w-xs ${msg.sender === "user" ? "bg-[#ED775A] text-white" : "bg-white text-gray-900 border border-gray-200"}`}>
                                                                    {msg.image && (
                                                                        <img src={msg.image} alt="chat-img" className="mb-2 rounded-lg max-h-32 object-cover" />
                                                                    )}
                                                                    <span className="text-sm">{msg.message}</span>
                                                                </div>
                                                            </div>
                                                        ))}
                                                        <div ref={messagesEndRefs.current[storeChat.storeId]} />
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            className="hidden"
                                                            id={`chat-image-upload-${storeChat.storeId}`}
                                                            ref={el => imageFiles.current[storeChat.storeId] = el}
                                                            onChange={e => handleFileChange(e, storeChat.storeId)}
                                                        />
                                                        <label htmlFor={`chat-image-upload-${storeChat.storeId}`} className="p-2 bg-gray-100 rounded-full cursor-pointer hover:bg-gray-200">
                                                            <FiImage className="w-4 h-4 text-gray-500" />
                                                        </label>
                                                        <input
                                                            type="text"
                                                            ref={el => messageInputs.current[storeChat.storeId] = el}
                                                            onKeyPress={e => handleKeyPress(e, storeChat.storeId)}
                                                            placeholder="Ketik pesan..."
                                                            className="flex-1 px-3 py-2 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-[#ED775A] text-sm"
                                                        />
                                                        <button
                                                            onClick={() => sendMessage(storeChat.storeId)}
                                                            className="p-2 bg-[#ED775A] text-white rounded-full hover:bg-[#d86a4a]"
                                                        >
                                                            <FiSend className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}