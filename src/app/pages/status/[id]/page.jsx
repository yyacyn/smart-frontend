"use client";
import React from "react";
import { useState, useRef, useEffect, useCallback } from "react";
import Navbar from "../../../components/navbar/Navbar";
import Footer from "../../../components/footer/Footer";
import { FiSend, FiCheckCircle, FiMessageSquare, FiStar, FiImage, FiFileText, FiClock, FiXCircle } from "react-icons/fi";
import { useRouter, useParams } from "next/navigation";
import { useUser, useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { fetchOrderById, fetchOrders, fetchStoreById, postRating, fetchProducts } from "../../../api";
import StoreChat from "../../../components/chat/StoreChat";
import { useGlobalData } from '../../../contexts/GlobalDataContext';

export default function StatusPage() {
    const router = useRouter();
    const params = useParams();
    const { user } = useUser();
    const orderId = params.id;
    const { cachedOrders, setCachedOrders } = useGlobalData();

    // Order data state
    const [order, setOrder] = useState(null);
    const [store, setStore] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [accepted, setAccepted] = useState(false);
    const [reviewing, setReviewing] = useState(false);
    const [review, setReview] = useState("");
    const [rating, setRating] = useState(0);
    // Product reviews state
    const [productReviews, setProductReviews] = useState({});


    const { getToken } = useAuth();

    // Fetch order from API
    useEffect(() => {
        const fetchOrderDetails = async () => {
            if (!user) return;

            setLoading(true);
            setError("");

            try {
                // Try to fetch the specific order by ID
                const token = await getToken();

                // Attempt to fetch the specific order directly
                try {
                    const orderResponse = await fetchOrderById(orderId, token);
                    const orderDetail = orderResponse.order || orderResponse;

                    if (orderDetail) {
                        setOrder(orderDetail);

                        // If store information is not available in the order, fetch it separately
                        if (!orderDetail.store && orderDetail.storeId) {
                            try {
                                const storeResponse = await fetchStoreById(orderDetail.storeId, await getToken());
                                setStore(storeResponse.store || storeResponse);
                            } catch (storeErr) {
                                console.error("Error fetching store:", storeErr);
                            }
                        }
                    } else {
                        setError("Pesanan tidak ditemukan");
                    }
                } catch (specificOrderErr) {
                    // If direct fetch fails, fall back to fetching all orders and finding by ID
                    let orders = cachedOrders;

                    if (!orders) {
                        const response = await fetchOrders(token);
                        orders = response.orders || response;

                        // Cache the orders for future use
                        setCachedOrders(orders);
                    }

                    // Find the order with the matching ID
                    const orderDetail = orders.find(order => order.id === orderId);

                    if (orderDetail) {
                        setOrder(orderDetail);

                        // If store information is not available in the order, fetch it separately
                        if (!orderDetail.store && orderDetail.storeId) {
                            try {
                                const storeResponse = await fetchStoreById(orderDetail.storeId, await getToken());
                                setStore(storeResponse.store || storeResponse);
                            } catch (storeErr) {
                                console.error("Error fetching store:", storeErr);
                            }
                        }
                    } else {
                        setError("Pesanan tidak ditemukan");
                    }
                }
            } catch (err) {
                console.error("Error fetching orders:", err);
                setError("Gagal mengambil data pesanan. Silakan coba lagi nanti.");
            } finally {
                setLoading(false);
            }
        };

        fetchOrderDetails();
    }, [orderId, user, getToken, cachedOrders, setCachedOrders]);

    // Fetch product reviews for products in the order
    useEffect(() => {
        async function fetchProductReviews() {
            if (!user || !order || !order.orderItems || order.orderItems.length === 0) return;

            try {
                const token = await getToken();
                const response = await fetchProducts();
                const allProducts = response.products || response;

                // Create a mapping of product ID to its reviews
                const reviewsMap = {};

                // For each product in the order
                for (const item of order.orderItems) {
                    const productId = item.productId;
                    if (!productId) continue;

                    // Find the product in all products
                    const product = allProducts.find(p => p.id === productId);
                    if (product && product.rating && Array.isArray(product.rating)) {
                        // For now, store all ratings for this product
                        // In the future, we could enhance this to filter by user when the API provides user IDs in ratings
                        reviewsMap[productId] = product.rating;
                    }
                }

                setProductReviews(reviewsMap);
            } catch (err) {
                console.error("Error fetching product reviews:", err);
            }
        }

        fetchProductReviews();
    }, [order, user, getToken]);


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

    // Show loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="pt-10 pb-12">
                    <div className="max-w-7xl mx-auto px-4 py-8 mt-8">
                        <div className="flex items-center gap-2 mb-6">
                            <button
                                onClick={() => router.back()}
                                className="btn btn-sm btn-ghost shadow-none border-none text-gray-700 hover:bg-gray-100"
                            >
                                &larr;
                            </button>
                            <h2 className="text-2xl font-bold text-gray-900">Detail Pesanan</h2>
                        </div>
                        <div className="space-y-6">
                            <div className="flex flex-col items-center justify-center py-20">
                                <span className="loading loading-spinner loading-lg"></span>
                                <p className="mt-4 text-gray-500">Memuat detail pesanan...</p>
                            </div>
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
                <div className="pt-10 pb-12">
                    <div className="max-w-7xl mx-auto px-4 py-8 mt-8">
                        <div className="flex items-center gap-2 mb-6">
                            <button
                                onClick={() => router.back()}
                                className="btn btn-sm btn-ghost shadow-none border-none text-gray-700 hover:bg-gray-100"
                            >
                                &larr;
                            </button>
                            <h2 className="text-2xl font-bold text-gray-900">Detail Pesanan</h2>
                        </div>
                        <div className="space-y-6">
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
                </div>
                <Footer />
            </div>
        );
    }

    const statusDisplay = getStatusDisplay(order.status);

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="pt-10 pb-12">
                <div className="max-w-7xl mx-auto px-4 py-8 mt-8">
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
                            <div className="bg-white rounded-lg shadow-none border border-gray-200 p-6">
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
                            <div className="bg-white rounded-lg p-6  shadow-none border border-gray-200">
                                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                                    <span className="w-4 h-4 bg-purple-500 rounded"></span>
                                    {order.store?.name || store?.name || "Toko"}
                                </h3>
                                <div className="space-y-4">
                                    {order.orderItems && order.orderItems.length > 0 ? (
                                        order.orderItems.map((item, index) => {
                                            // Get the user's reviews for this product
                                            const userReviews = productReviews[item.productId] || [];

                                            return (
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
                                                        {item.variant && (
                                                            <p className="text-xs text-gray-600 mt-1">
                                                                Varian: {item.variant.variant}
                                                            </p>
                                                        )}
                                                        {item.variantId && !item.variant && item.product?.variants && (
                                                            // If we have variantId but no variant object, find the variant by ID
                                                            (() => {
                                                                const variant = item.product.variants.find(v => v.id === item.variantId);
                                                                return variant ? (
                                                                    <p className="text-xs text-gray-600 mt-1">
                                                                        Varian: {variant.variant}
                                                                    </p>
                                                                ) : null;
                                                            })()
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })
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
                            <div className="bg-white rounded-lg shadow-none border border-gray-200 p-6">
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
                            <div className="bg-white rounded-lg shadow-none border border-gray-200 p-6">
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
                                {/* Only show "Review Barang" button if there are products without reviews from the current user */}
                                {((order.status === "DELIVERED" || order.status === "delivered" || order.status === "COMPLETED" || order.status === "completed")
                                    && order.orderItems
                                    && order.orderItems.some(item => {
                                        const allReviews = productReviews[item.productId] || [];
                                        // Check if any of the reviews belong to the current user
                                        const hasCurrentUserReview = allReviews.some(review =>
                                            review.user && (
                                                review.user.name === user.fullName ||
                                                review.user.name === user.firstName + " " + user.lastName ||
                                                review.user.name === user.username
                                            )
                                        );
                                        // Show button only if this product hasn't been reviewed by the user yet
                                        return !hasCurrentUserReview;
                                    })) ? (
                                    <button
                                        className="btn btn-lg bg-[#476EAE] text-white hover:bg-[#3a5c8e] border-none shadow-none rounded-lg px-8 py-3 text-lg font-bold transition-all duration-300"
                                        onClick={() => setReviewing(true)}
                                    >
                                        Review Barang
                                    </button>
                                ) : null}
                                {reviewing && (
                                    <div className="p-4 border rounded-lg border-gray-200 bg-gray-50">
                                        <h3 className="font-semibold mb-2">Beri Ulasan</h3>
                                        <div className="flex gap-1 mb-2">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    key={star}
                                                    type="button"
                                                    className={`mask mask-star-2 w-8 h-8 shadow-none ${rating >= star ? "bg-yellow-400" : "bg-gray-300"}`}
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
                                            className="mt-3 btn btn-sm bg-[#ED775A] text-white hover:bg-[#d86a4a] border-none rounded-lg px-6 py-2 font-bold shadow-none"
                                            onClick={async () => {
                                                if (rating === 0) {
                                                    alert("Silakan berikan rating terlebih dahulu!");
                                                    return;
                                                }

                                                try {
                                                    const token = await getToken();

                                                    // Submit rating for each product in the order that hasn't been reviewed yet
                                                    for (const item of order.orderItems) {
                                                        // Check if the user has already reviewed this product
                                                        const allReviews = productReviews[item.productId] || [];
                                                        const hasCurrentUserReview = allReviews.some(review =>
                                                            review.user && (
                                                                review.user.name === user.fullName ||
                                                                review.user.name === user.firstName + " " + user.lastName ||
                                                                review.user.name === user.username
                                                            )
                                                        );

                                                        // Only submit a rating if the user hasn't reviewed this product yet
                                                        if (!hasCurrentUserReview) {
                                                            const ratingData = {
                                                                orderId: order.id,
                                                                productId: item.productId,
                                                                rating: rating,
                                                                review: review
                                                            };

                                                            await postRating(ratingData, token);
                                                        }
                                                    }

                                                    alert("Terima kasih atas ulasan Anda!");
                                                    setReviewing(false);
                                                    setReview("");
                                                    setRating(0);

                                                    // Update order status in state
                                                    setOrder(prev => ({ ...prev, status: "completed" }));

                                                    // Refresh the page to show the updated reviews
                                                    window.location.reload();
                                                } catch (error) {
                                                    console.error("Gagal mengirim ulasan:", error);
                                                    if (error.response?.data?.error) {
                                                        alert(`Gagal mengirim ulasan: ${error.response.data.error}`);
                                                    } else {
                                                        alert("Gagal mengirim ulasan. Silakan coba lagi.");
                                                    }
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
                            {/* Store-specific chat sections */}
                            {order.orderItems && order.orderItems.length > 0 && (
                                <div className="space-y-4 bg-white">
                                    {/* Get unique store IDs from the order items, filtering out invalid ones */}
                                    {(() => {
                                        const validStoreIds = [...new Set(
                                            order.orderItems
                                                .map(item => item.product?.storeId)
                                                .filter(storeId => storeId && typeof storeId === 'string' && storeId.length > 0)
                                        )];

                                        if (validStoreIds.length === 0) {
                                            return (
                                                <div className="text-gray-500 text-sm text-center py-4">
                                                    Chat tidak tersedia untuk pesanan ini
                                                </div>
                                            );
                                        }

                                        return validStoreIds.map(storeId => {
                                            // Find at least one product from the same store to get the store name
                                            const storeProduct = order.orderItems.find(item => item.product?.storeId === storeId);
                                            const storeName = storeProduct?.product?.store?.name ||
                                                (order.store && order.store.id === storeId ? order.store.name :
                                                    store && store.id === storeId ? store.name :
                                                        `Toko ${storeId.substring(0, 4)}`);

                                            return (
                                                <StoreChat
                                                    key={storeId}
                                                    storeId={storeId}
                                                    storeName={storeName}
                                                    userId={user?.id}
                                                />
                                            );
                                        });
                                    })()}
                                </div>
                            )}

                            {/* Reviews Section */}
                            {order.orderItems && order.orderItems.length > 0 && (
                                <div className="bg-white rounded-lg border shadow-none border-gray-200 h-fit p-4 mt-4">
                                    <div className="flex items-center gap-2 mb-4">
                                        <FiStar className="w-5 h-5 text-[#ED775A]" />
                                        <h3 className="font-semibold text-gray-800">Ulasan Produk Anda</h3>
                                    </div>
                                    <div className="space-y-4">
                                        {order.orderItems.map((item, index) => {
                                            const allReviews = productReviews[item.productId] || [];
                                            // Filter reviews to only show those by the current user
                                            const currentUserReviews = allReviews.filter(review =>
                                                review.user &&
                                                (review.user.name === user.fullName ||
                                                    review.user.name === user.firstName + " " + user.lastName ||
                                                    review.user.name === user.username)
                                            );

                                            return currentUserReviews.length > 0 ? (
                                                <div key={`review-${item.productId}-${index}`} className="space-y-2">
                                                    <h4 className="font-medium text-sm text-gray-700">
                                                        {item.product?.name || `Produk #${item.productId}`}
                                                    </h4>
                                                    {currentUserReviews.map((review, reviewIndex) => (
                                                        <div key={reviewIndex} className="p-2 rounded bg-blue-50 border border-blue-200">
                                                            <div className="flex items-center gap-1 mb-1">
                                                                {[...Array(5)].map((_, i) => (
                                                                    <FiStar
                                                                        key={i}
                                                                        className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                                                                    />
                                                                ))}
                                                                <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                                                    Anda
                                                                </span>
                                                            </div>
                                                            {review.review && (
                                                                <p className="text-sm text-gray-700">{review.review}</p>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div key={`noreview-${item.productId}-${index}`} className="space-y-2">
                                                    <h4 className="font-medium text-sm text-gray-700">
                                                        {item.product?.name || `Produk #${item.productId}`}
                                                    </h4>
                                                    <div className="text-xs text-gray-500 italic">
                                                        Belum memberikan ulasan
                                                    </div>
                                                </div>
                                            );
                                        })}
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