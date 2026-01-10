"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useUser, useAuth } from "@clerk/nextjs";
import Navbar from "../../../components/navbar/Navbar";
import Footer from "../../../components/footer/Footer";
import { fetchOrderById, fetchOrders, fetchStoreById } from "../../../api";
import { FiXCircle, FiFileText, FiPrinter } from "react-icons/fi";
import { useGlobalData } from '../../../contexts/GlobalDataContext';

export default function ReceiptPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useUser();
    const { getToken } = useAuth();
    const { id } = params;
    const { cachedOrders, setCachedOrders } = useGlobalData();

    const [order, setOrder] = useState(null);
    const [store, setStore] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

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
                    const orderResponse = await fetchOrderById(id, token);
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
                    const orderDetail = orders.find(order => order.id === id);

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
    }, [id, user, getToken, cachedOrders, setCachedOrders]);

    // Show loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="flex items-center justify-center py-20">
                    <span className="loading loading-spinner loading-lg"></span>
                    <p className="ml-4 text-gray-500">Memuat receipt...</p>
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
                <div className="container mx-auto px-4 py-8 mt-16">
                    <div className="flex flex-col items-center justify-center py-20">
                        <FiXCircle className="w-16 h-16 text-red-500" />
                        <p className="mt-4 text-red-500 text-center">{error || "Receipt tidak ditemukan"}</p>
                        <button
                            onClick={() => router.back()}
                            className="mt-4 btn bg-[#ED775A] text-white hover:bg-[#d86a4a] border-none"
                        >
                            Kembali
                        </button>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    // Format date
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
            });
        } catch {
            return "-";
        }
    };

    // Format payment method
    const formatPaymentMethod = (paymentMethod) => {
        if (!paymentMethod) return "Belum ditentukan";
        switch (paymentMethod) {
            case 'BANK_TRANSFER':
                return 'Bank Transfer';
            case 'COD':
                return 'Cash on Delivery';
            case 'EWALLET':
                return 'E-Wallet';
            default:
                return paymentMethod?.toLowerCase().split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
        }
    };


    // Add print styles
    const printStyles = `
      @media print {
        body {
          margin: 0;
          padding: 20px;
          background-color: white;
          font-size: 12px;
        }
        .no-print {
          display: none !important;
        }
        #receipt-content {
          box-shadow: none;
          border: 1px solid #ddd;
          border-radius: 0;
          max-width: 100%;
          width: 100%;
          margin: 0 !important;
          padding: 20px;
          font-size: 12px;
        }
        .container {
          max-width: 100% !important;
          padding: 0 !important;
          margin: 0 !important;
        }
        h1, h2, h3 {
          font-size: 16px;
          margin-bottom: 8px;
        }
        table {
          font-size: 10px;
        }
        th, td {
          padding: 4px;
        }
        .bg-gray-50 {
          background-color: #f9fafb !important;
        }
        .bg-gradient-to-r {
          background: white !important;
          color: black !important;
        }
        .text-white {
          color: black !important;
        }
      }
    `;

    return (
        <>
            <style>{printStyles}</style>
            <div className="min-h-screen bg-gray-50">
                <Navbar className="no-print" />
                <div className="container mx-auto px-4 py-8 mt-16">
                    <div id="receipt-content" className="max-w-3xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
                        {/* Receipt Header */}
                        <div style={{ background: 'linear-gradient(to right, #ED775A, #D9534F)' }} className="p-6 text-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h1 className="text-2xl font-bold flex items-center gap-2">
                                        <FiFileText className="w-6 h-6" />
                                        Bukti Pembayaran
                                    </h1>
                                    <p className="opacity-80">No. Pesanan: {order.id}</p>
                                </div>
                                <div className="text-right">
                                    <button
                                        onClick={() => window.print()}
                                        className="btn btn-sm border-none shadow flex items-center gap-1"
                                        style={{ backgroundColor: 'white', color: '#ED775A' }}
                                    >
                                        <FiPrinter className="w-4 h-4" />
                                        Cetak
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Receipt Body */}
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <h2 className="text-lg font-semibold mb-2">Info Pembeli</h2>
                                    <p className="text-gray-700">{order.address?.name || user?.fullName || "Pelanggan"}</p>
                                    <p className="text-gray-700">{order.address?.phone || "Nomor Telepon Tidak Tersedia"}</p>
                                    <p className="text-gray-700">{order.address?.email || user?.emailAddresses?.[0]?.emailAddress || "Email Tidak Tersedia"}</p>
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold mb-2">Info Pengiriman</h2>
                                    <p className="text-gray-700">{order.address?.street || "Alamat Tidak Tersedia"}</p>
                                    <p className="text-gray-700">{order.address?.city}, {order.address?.zip}</p>
                                    <p className="text-gray-700">{order.address?.country}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <h2 className="text-lg font-semibold mb-2">Info Pesanan</h2>
                                    <p className="text-gray-700">Tanggal: {formatDate(order.createdAt)}</p>
                                    <p className="text-gray-700">Status:
                                        <span className="ml-2 font-semibold" style={{
                                            color: order.status === 'DELIVERED' || order.status === 'COMPLETED' ? '#16a34a' :
                                                order.status === 'SHIPPED' ? '#2563eb' :
                                                    order.status === 'PROCESSING' ? '#eab308' :
                                                        order.status === 'CANCELLED' ? '#dc2626' : '#6b7280'
                                        }}>
                                            {order.status === 'ORDER_PLACED' ? 'Pesanan Diterima' :
                                                order.status === 'PROCESSING' ? 'Sedang Diproses' :
                                                    order.status === 'SHIPPED' ? 'Dikirim' :
                                                        order.status === 'DELIVERED' ? 'Sudah Sampai' :
                                                            order.status === 'COMPLETED' ? 'Selesai' :
                                                                order.status === 'CANCELLED' ? 'Dibatalkan' : order.status}
                                        </span>
                                    </p>
                                    <p className="text-gray-700">Metode Pembayaran: {formatPaymentMethod(order.paymentMethod)}</p>
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold mb-2">Info Toko</h2>
                                    <p className="text-gray-700">{order.store?.name || store?.name || "Nama Toko Tidak Tersedia"}</p>
                                    <p className="text-gray-700">ID Toko: {order.storeId}</p>
                                </div>
                            </div>

                            {/* Order Items */}
                            <div className="mb-6">
                                <h2 className="text-lg font-semibold mb-4">Daftar Barang</h2>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produk</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jumlah</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Harga</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subtotal</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {order.orderItems && order.orderItems.length > 0 ? (
                                                order.orderItems.map((item, index) => (
                                                    <tr key={item.productId || index}>
                                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                                            <div>
                                                                {item.product?.name || `Produk #${item.productId}`}
                                                                {item.variant && (
                                                                    <div className="text-xs text-gray-500">
                                                                        Varian: {item.variant.variant}
                                                                    </div>
                                                                )}
                                                                {item.variantId && !item.variant && item.product?.variants && (
                                                                    // If we have variantId but no variant object, find the variant by ID
                                                                    (() => {
                                                                        const variant = item.product.variants.find(v => v.id === item.variantId);
                                                                        return variant ? (
                                                                            <div className="text-xs text-gray-500">
                                                                                Varian: {variant.variant}
                                                                            </div>
                                                                        ) : null;
                                                                    })()
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                                            {item.quantity || 1}
                                                        </td>
                                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                                            Rp{(item.price || item.product?.price || 0).toLocaleString("id-ID")}
                                                        </td>
                                                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                                            Rp{((item.quantity || 1) * (item.price || item.product?.price || 0)).toLocaleString("id-ID")}
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="4" className="px-4 py-3 text-center text-sm text-gray-500">
                                                        Tidak ada produk dalam pesanan ini
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Payment Summary */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <div className="grid grid-cols-2 gap-4">
                                    <div></div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span>Subtotal Barang:</span>
                                            <span>Rp{order.orderItems?.reduce((sum, item) => sum + (item.quantity * (item.product?.price || item.price || 0)), 0).toLocaleString("id-ID") || '0'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Ongkos Kirim:</span>
                                            <span>Rp{(order.shippingCost || 0).toLocaleString("id-ID")}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Diskon:</span>
                                            <span style={{ color: '#dc2626' }}>-Rp{(order.discount || 0).toLocaleString("id-ID")}</span>
                                        </div>
                                        <div className="border-t border-gray-300 pt-2 mt-2">
                                            <div className="flex justify-between font-bold text-lg">
                                                <span>Total Pembayaran:</span>
                                                <span>Rp{(order.total || 0).toLocaleString("id-ID")}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Notes */}
                            {order.notes && (
                                <div className="mt-6 p-4 rounded-lg" style={{ backgroundColor: '#eff6ff' }}>
                                    <h3 className="font-semibold" style={{ color: '#1e40af' }}>Catatan:</h3>
                                    <p style={{ color: '#1d4ed8' }}>{order.notes}</p>
                                </div>
                            )}
                        </div>

                        {/* Receipt Footer */}
                        <div className="bg-gray-100 p-4 text-center text-sm text-gray-600">
                            Terima kasih telah berbelanja di toko kami!
                        </div>
                    </div>
                </div>
                <Footer className="no-print" />
            </div>
        </>
    );
}
