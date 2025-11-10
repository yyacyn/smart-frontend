"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useUser, useAuth } from "@clerk/nextjs";
import Navbar from "../../../components/navbar/Navbar";
import Footer from "../../../components/footer/Footer";
import { fetchOrders } from "../../../api";
import { FiCheckCircle, FiClock, FiXCircle, FiPackage, FiCalendar, FiMapPin, FiCreditCard } from "react-icons/fi";
import Swal from 'sweetalert2';

export default function OrderPage() {
    const router = useRouter();
    const { user } = useUser();
    const { getToken } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [filter, setFilter] = useState("all"); // all, pending, processing, shipped, delivered, completed, cancelled

    useEffect(() => {
        async function getUserOrders() {
            if (!user) return;
            setLoading(true);
            setError("");
            try {
                // Get user token from useAuth
                const token = await getToken();
                // Fetch all orders from backend
                const response = await fetchOrders(token);
                const allOrders = response.orders || response || [];
                // Filter orders based on Clerk user.id only
                const userOrders = allOrders.filter(order => 
                    order.userId === user.id || 
                    order.user_id === user.id ||
                    order.user?.id === user.id
                );
                setOrders(userOrders);
            } catch (err) {
                console.error("Error fetching orders:", err);
                setError("Gagal mengambil data pesanan. Periksa koneksi atau coba lagi.");
                Swal.fire({
                  icon: 'error',
                  title: 'Gagal',
                  text: 'Gagal mengambil data pesanan. Periksa koneksi atau coba lagi.',
                });
            } finally {
                setLoading(false);
            }
        }
        getUserOrders();
    }, [user, getToken]);

    // Helper functions
    const getStatusDisplay = (status) => {
        switch (status?.toLowerCase()) {
            case "pending":
                return { 
                    icon: <FiClock className="w-5 h-5 text-yellow-500" />, 
                    text: "Menunggu Konfirmasi",
                    color: "text-yellow-600",
                    bgColor: "bg-yellow-50 border-yellow-200"
                };
            case "processing":
                return { 
                    icon: <FiClock className="w-5 h-5 text-blue-500" />, 
                    text: "Sedang Diproses",
                    color: "text-blue-600",
                    bgColor: "bg-blue-50 border-blue-200"
                };
            case "shipped":
                return { 
                    icon: <FiPackage className="w-5 h-5 text-purple-500" />, 
                    text: "Sedang Dikirim",
                    color: "text-purple-600",
                    bgColor: "bg-purple-50 border-purple-200"
                };
            case "delivered":
                return { 
                    icon: <FiCheckCircle className="w-5 h-5 text-green-500" />, 
                    text: "Telah Sampai",
                    color: "text-green-600",
                    bgColor: "bg-green-50 border-green-200"
                };
            case "completed":
                return { 
                    icon: <FiCheckCircle className="w-5 h-5 text-green-500" />, 
                    text: "Selesai",
                    color: "text-green-600",
                    bgColor: "bg-green-50 border-green-200"
                };
            case "cancelled":
                return { 
                    icon: <FiXCircle className="w-5 h-5 text-red-500" />, 
                    text: "Dibatalkan",
                    color: "text-red-600",
                    bgColor: "bg-red-50 border-red-200"
                };
            default:
                return { 
                    icon: <FiClock className="w-5 h-5 text-gray-500" />, 
                    text: "Status Tidak Diketahui",
                    color: "text-gray-600",
                    bgColor: "bg-gray-50 border-gray-200"
                };
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "-";
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString("id-ID", {
                day: "2-digit",
                month: "short", 
                year: "numeric"
            });
        } catch {
            return "-";
        }
    };

    // Filter orders based on selected filter
    const filteredOrders = orders.filter(order => {
        if (filter === "all") return true;
        return order.status?.toLowerCase() === filter;
    });

    // Show loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="container mx-auto px-4 py-8 mt-16 mb-20">
                    <div className="flex items-center gap-2 mb-6">
                        <button
                            onClick={() => router.back()}
                            className="btn btn-sm btn-ghost text-gray-700 border-none shadow-none hover:bg-gray-100"
                        >
                            &larr;
                        </button>
                        <h1 className="text-2xl font-bold text-gray-900">Pesanan Saya</h1>
                    </div>
                    <div className="flex flex-col items-center justify-center py-20">
                        <span className="loading loading-spinner loading-lg"></span>
                        <p className="mt-4 text-gray-500">Memuat pesanan...</p>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    // Show error state
    if (error) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="container mx-auto px-4 py-8 mt-16 mb-20">
                    <div className="flex items-center gap-2 mb-6">
                        <button
                            onClick={() => router.back()}
                            className="btn btn-sm btn-ghost text-gray-700 border-none shadow-none hover:bg-gray-100"
                        >
                            &larr;
                        </button>
                        <h1 className="text-2xl font-bold text-gray-900">Pesanan Saya</h1>
                    </div>
                    <div className="flex flex-col items-center justify-center py-20">
                        <FiXCircle className="w-16 h-16 text-red-500" />
                        <p className="mt-4 text-red-500 text-center">{error}</p>
                        <button 
                            onClick={() => window.location.reload()}
                            className="mt-4 btn bg-[#ED775A] text-white hover:bg-[#d86a4a] border-none"
                        >
                            Coba Lagi
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
            <div className="container mx-auto px-4 py-8 mt-16 mb-20">
                {/* Header */}
                <div className="flex items-center gap-2 mb-6">
                    <button
                        onClick={() => router.back()}
                        className="btn btn-sm btn-ghost text-gray-700 border-none shadow-none hover:bg-gray-100"
                    >
                        &larr;
                    </button>
                    <h1 className="text-2xl font-bold text-gray-900">Pesanan Saya</h1>
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                    <button
                        onClick={() => setFilter("all")}
                        className={`btn btn-sm ${filter === "all" ? "bg-[#ED775A] text-white border-[#ED775A]" : "btn-outline"} whitespace-nowrap shadow-none`}
                    >
                        Semua
                    </button>
                    <button
                        onClick={() => setFilter("pending")}
                        className={`btn btn-sm ${filter === "pending" ? "bg-[#ED775A] text-white border-[#ED775A]" : "btn-outline"} whitespace-nowrap shadow-none`}
                    >
                        Menunggu
                    </button>
                    <button
                        onClick={() => setFilter("processing")}
                        className={`btn btn-sm ${filter === "processing" ? "bg-[#ED775A] text-white border-[#ED775A]" : "btn-outline"} whitespace-nowrap shadow-none`}
                    >
                        Diproses
                    </button>
                    <button
                        onClick={() => setFilter("shipped")}
                        className={`btn btn-sm ${filter === "shipped" ? "bg-[#ED775A] text-white border-[#ED775A]" : "btn-outline"} whitespace-nowrap shadow-none`}
                    >
                        Dikirim
                    </button>
                    <button
                        onClick={() => setFilter("completed")}
                        className={`btn btn-sm ${filter === "completed" ? "bg-[#ED775A] text-white border-[#ED775A]" : "btn-outline"} whitespace-nowrap shadow-none`}
                    >
                        Selesai
                    </button>
                </div>

                {/* Orders List */}
                {filteredOrders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <FiPackage className="w-16 h-16 text-gray-400" />
                        <p className="mt-4 text-gray-500 text-center">
                            {filter === "all" ? "Belum ada pesanan" : `Tidak ada pesanan dengan status "${getStatusDisplay(filter).text}"`}
                        </p>
                        <button 
                            onClick={() => router.push("/pages/marketplace")}
                            className="mt-4 btn bg-[#ED775A] text-white hover:bg-[#d86a4a] border-none shadow-none"
                        >
                            Mulai Berbelanja
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredOrders.map((order) => {
                            const statusDisplay = getStatusDisplay(order.status);
                            return (
                                <div
                                    key={order.id}
                                    className="bg-white rounded-lg border shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                                    onClick={() => router.push(`/pages/status/${order.id}`)}
                                >
                                    <div className="p-6">
                                        {/* Order Header */}
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                                            <div className="flex items-center gap-3 mb-2 sm:mb-0">
                                                <div className={`px-3 py-1 rounded-full border ${statusDisplay.bgColor}`}>
                                                    <div className="flex items-center gap-2">
                                                        {statusDisplay.icon}
                                                        <span className={`text-sm font-medium ${statusDisplay.color}`}>
                                                            {statusDisplay.text}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm text-gray-600">Order #{order.id}</p>
                                                <p className="text-xs text-gray-500 flex items-center gap-1 justify-end">
                                                    <FiCalendar className="w-3 h-3" />
                                                    {formatDate(order.createdAt || order.created_at)}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Store Name */}
                                        {order.store?.name && (
                                            <div className="flex items-center gap-2 mb-3">
                                                <div className="w-3 h-3 bg-purple-500 rounded"></div>
                                                <span className="font-medium text-gray-800">{order.store.name}</span>
                                            </div>
                                        )}

                                        {/* Order Items */}
                                        <div className="space-y-3 mb-4">
                                            {order.items && order.items.length > 0 ? (
                                                order.items.slice(0, 2).map((item, index) => (
                                                    <div key={item.id || index} className="flex gap-3">
                                                        <div className="w-12 h-12 bg-gray-200 rounded flex-shrink-0">
                                                            <img
                                                                src={item.image || item.product?.images?.[0] || "/images/default.png"}
                                                                alt={item.name || item.product?.name || "Product"}
                                                                className="w-full h-full object-cover rounded"
                                                            />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-medium text-sm text-gray-900 truncate">
                                                                {item.name || item.product?.name || `Produk #${item.id}`}
                                                            </p>
                                                            <p className="text-xs text-gray-500">
                                                                Qty: {item.quantity || 1} × Rp{(item.price || item.product?.price || 0).toLocaleString("id-ID")}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="flex gap-3">
                                                    <div className="w-12 h-12 bg-gray-200 rounded flex-shrink-0"></div>
                                                    <div className="flex-1">
                                                        <p className="font-medium text-sm text-gray-500">Tidak ada produk</p>
                                                    </div>
                                                </div>
                                            )}
                                            {order.items && order.items.length > 2 && (
                                                <p className="text-xs text-gray-500 ml-15">
                                                    +{order.items.length - 2} produk lainnya
                                                </p>
                                            )}
                                        </div>

                                        {/* Order Summary */}
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-4 border-t border-gray-100">
                                            <div className="flex items-center gap-4 mb-2 sm:mb-0">
                                                {order.paymentMethod && (
                                                    <div className="flex items-center gap-1 text-xs text-gray-600">
                                                        <FiCreditCard className="w-3 h-3" />
                                                        <span className="capitalize">{order.paymentMethod}</span>
                                                    </div>
                                                )}
                                                {order.shippingAddress?.city && (
                                                    <div className="flex items-center gap-1 text-xs text-gray-600">
                                                        <FiMapPin className="w-3 h-3" />
                                                        <span>{order.shippingAddress.city}</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs text-gray-600">Total Belanja</p>
                                                <p className="font-bold text-lg text-[#ED775A]">
                                                    Rp{(order.total || 0).toLocaleString("id-ID")}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
}

