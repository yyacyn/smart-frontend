"use client";

import { useState, useRef, useEffect } from "react";
import Navbar from "../../../components/navbar/Navbar";
import Footer from "../../../components/footer/Footer";
import { FiSend, FiCheckCircle, FiMessageSquare, FiStar, FiImage, FiFileText } from "react-icons/fi";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

export default function StatusPage() {
    const router = useRouter();
    const params = useParams();
    const transactionId = params.id;

    // Dummy delivery status and store info
    const [deliveryStatus, setDeliveryStatus] = useState("Sedang dikirim");
    const [storeName] = useState("Toko Elektronik Jaya");
    const [messages, setMessages] = useState([
        { id: 1, sender: "store", message: "Pesanan Anda sedang diproses." },
        { id: 2, sender: "user", message: "Terima kasih, mohon info pengiriman." },
        { id: 3, sender: "store", message: "Barang sudah dikirim, silakan cek resi." },
    ]);
    const [messageInput, setMessageInput] = useState("");
    const [imageFile, setImageFile] = useState(null);
    const messagesEndRef = useRef(null);
    const messagesContainerRef = useRef(null);
    const [accepted, setAccepted] = useState(false);
    const [reviewing, setReviewing] = useState(false);
    const [review, setReview] = useState("");
    const [rating, setRating] = useState(0);

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
        }
    };

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
                                    <FiCheckCircle className="w-6 h-6 text-green-500" />
                                    <span className="text-lg font-semibold text-gray-800">{deliveryStatus}</span>
                                </div>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-gray-600">No. Pesanan</p>
                                        <p className="font-mono font-semibold">{transactionId}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600">Tanggal Pembelian</p>
                                        <p className="font-semibold">06 Juli 2025, 20:44 WIB</p>
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <Link href={`/pages/receipt/${transactionId}`} className="inline-flex items-center gap-2 text-[#ED775A] hover:text-[#d86a4a] font-semibold">
                                        <FiFileText className="w-4 h-4" />
                                        Lihat Invoice
                                    </Link>
                                </div>
                            </div>

                            {/* Product Details */}
                            <div className="bg-white rounded-lg shadow p-6">
                                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                                    <span className="w-4 h-4 bg-purple-500 rounded"></span>
                                    {storeName}
                                </h3>
                                <div className="flex gap-4">
                                    <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0">
                                        <img src="/api/placeholder/64/64" alt="Product" className="w-full h-full object-cover rounded-lg" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-medium">Rexus Xierra S5 Aviator - Mouse Wireless - Design Keren Dan Stylish - Black, Standar</h4>
                                        <p className="text-sm font-semibold mt-1">1 x Rp149.000</p>
                                    </div>
                                </div>
                            </div>

                            {/* Shipping Info */}
                            <div className="bg-white rounded-lg shadow p-6">
                                <h3 className="font-semibold text-lg mb-4">Info Pengiriman</h3>
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">No Resi</span>
                                        <span className="font-mono">JX5334622923</span>
                                    </div>
                                    <div className="flex justify-between items-start">
                                        <span className="text-gray-600">Alamat</span>
                                        <div className="text-right">
                                            <p className="font-semibold">Yashin Al Fauzy</p>
                                            <p className="text-gray-600">(+62)812/56611640</p>
                                            <p className="text-gray-600">Jl.Lodaya II Cilibende RT 02/05 no 05 kost teh Reni Bogor Tengah Kota Bogor Jawa Barat 16128</p>
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
                                        <span className="font-semibold">GoPay</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Subtotal Harga Barang</span>
                                        <span>Rp149.000</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Diskon Barang dari Penjual</span>
                                        <span className="text-red-600">-Rp42.000</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Total Ongkos Kirim</span>
                                        <span>Rp11.500</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Kupon Diskon Ongkos Kirim dari Platform</span>
                                        <span className="text-red-600">-Rp11.500</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Total Proteksi Produk</span>
                                        <span>Rp8.500</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Asuransi Pengiriman</span>
                                        <span>Rp800</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Biaya Jasa Aplikasi</span>
                                        <span>Rp1.000</span>
                                    </div>
                                    <hr className="my-2" />
                                    <div className="flex justify-between font-bold text-lg">
                                        <span>Total Belanja</span>
                                        <span>Rp117.300</span>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col gap-3">
                                {!accepted ? (
                                    <button
                                        className="btn btn-lg bg-[#ED775A] text-white hover:bg-[#d86a4a] border-none shadow-lg rounded-lg px-8 py-3 text-lg font-bold transition-all duration-300"
                                        onClick={() => setAccepted(true)}
                                    >
                                        Terima Barang
                                    </button>
                                ) : (
                                    <button
                                        className="btn btn-lg bg-[#476EAE] text-white hover:bg-[#3a5c8e] border-none shadow-lg rounded-lg px-8 py-3 text-lg font-bold transition-all duration-300"
                                        onClick={() => setReviewing(true)}
                                    >
                                        Review Barang
                                    </button>
                                )}
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
                                            onClick={() => {
                                                setReviewing(false);
                                                setReview("");
                                                setRating(0);
                                                setDeliveryStatus("Pesanan Selesai");
                                                const completedTransactionId = `TXN-${Date.now()}-COMPLETED`;
                                                console.log(`New completed transaction ID: ${completedTransactionId}`);
                                            }}
                                        >
                                            Kirim Ulasan
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right Section - Chat */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-lg border shadow-none border-gray-200 h-fit sticky top-6 p-4">
                                {/* <div className="p-4 border-b">
                                    <h3 className="font-semibold">Bantuan</h3>
                                </div>
                                <div className="p-4 space-y-3">
                                    <div className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
                                        <span className="font-medium">Pusat Bantuan</span>
                                    </div>
                                </div> */}
                                <div className="flex items-center gap-2 mb-4">
                                    <FiMessageSquare className="w-5 h-5 text-[#ED775A]" />
                                    <span className="font-semibold text-gray-800">Chat dengan {storeName}</span>
                                </div>
                                <div ref={messagesContainerRef} className="border rounded-lg border-gray-200 bg-gray-50 p-3 h-64 overflow-y-auto mb-2">
                                    {messages.map((msg) => (
                                        <div key={msg.id} className={`mb-3 flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                                            <div className={`px-3 py-2 rounded-lg max-w-xs ${msg.sender === "user" ? "bg-[#ED775A] text-white" : "bg-white text-gray-900 border border-gray-200"}`}>
                                                {msg.image && (
                                                    <img src={msg.image} alt="chat-img" className="mb-2 rounded-lg max-h-32 object-cover" />
                                                )}
                                                <span className="text-sm">{msg.message}</span>
                                            </div>
                                        </div>
                                    ))}
                                    <div ref={messagesEndRef} />
                                </div>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        id="chat-image-upload"
                                        onChange={e => {
                                            if (e.target.files && e.target.files[0]) {
                                                setImageFile(e.target.files[0]);
                                            }
                                        }}
                                    />
                                    <label htmlFor="chat-image-upload" className="p-2 bg-gray-100 rounded-full cursor-pointer hover:bg-gray-200">
                                        <FiImage className="w-4 h-4 text-gray-500" />
                                    </label>
                                    <input
                                        type="text"
                                        value={messageInput}
                                        onChange={e => setMessageInput(e.target.value)}
                                        onKeyDown={e => { if (e.key === "Enter") sendMessage(); }}
                                        placeholder="Ketik pesan..."
                                        className="flex-1 px-3 py-2 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-[#ED775A] text-sm"
                                    />
                                    <button
                                        onClick={sendMessage}
                                        className="p-2 bg-[#ED775A] text-white rounded-full hover:bg-[#d86a4a]"
                                        disabled={!messageInput.trim() && !imageFile}
                                    >
                                        <FiSend className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}