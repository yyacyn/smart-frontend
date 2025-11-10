"use client";
import { PackageIcon } from "lucide-react";
import Link from "next/link";
import { FiSearch, FiShoppingCart, FiHeart, FiBell } from "react-icons/fi";
import { FiMessageSquare } from "react-icons/fi";
import { useState } from "react";
import { useUser, useClerk, UserButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export default function Navbar() {

    const {user} = useUser();
    const { openSignIn } = useClerk();
    const router = useRouter();

    const [searchQuery, setSearchQuery] = useState("");
    const [showNotifications, setShowNotifications] = useState(false);
    const [showChats, setShowChats] = useState(false);
    const notifications = [
        { id: 1, text: "Pesanan #1234 telah dikirim." },
        { id: 2, text: "Produk baru tersedia di toko favorit Anda." },
        { id: 3, text: "Promo diskon 20% untuk semua produk hari ini!" },
        { id: 4, text: "Pesanan #1235 sedang diproses." },
        { id: 5, text: "Penjual membalas pesan Anda." },
        { id: 6, text: "Produk favorit Anda turun harga!" },
        { id: 7, text: "Pesanan #1236 telah dibatalkan." },
        { id: 8, text: "Ada update pada pesanan #1237." },
        { id: 9, text: "Voucher baru tersedia untuk Anda." },
        { id: 10, text: "Jangan lewatkan flash sale hari ini!" },
    ];
    const [notifLimit, setNotifLimit] = useState(4);
    const visibleNotifications = notifications.slice(0, notifLimit);

    const chats = [
        { id: 1, sender: "Penjual", avatar: "/images/categories/penjual.png", text: "Halo, pesanan Anda sudah diproses." },
        { id: 2, sender: "Admin", avatar: "/images/categories/admin.png", text: "Selamat datang di SMART!" },
        { id: 3, sender: "Penjual", avatar: "/images/categories/penjual.png", text: "Apakah Anda ingin menanyakan produk?" },
        { id: 4, sender: "Admin", avatar: "/images/categories/admin.png", text: "Promo baru tersedia minggu ini." },
        { id: 5, sender: "Penjual", avatar: "/images/categories/penjual.png", text: "Terima kasih atas pembelian Anda." },
        { id: 6, sender: "Admin", avatar: "/images/categories/admin.png", text: "Jangan lupa cek wishlist Anda." },
        { id: 7, sender: "Penjual", avatar: "/images/categories/penjual.png", text: "Barang akan dikirim hari ini." },
        { id: 8, sender: "Admin", avatar: "/images/categories/admin.png", text: "Ada update sistem terbaru." },
        { id: 9, sender: "Penjual", avatar: "/images/categories/penjual.png", text: "Silakan cek detail pesanan." },
        { id: 10, sender: "Admin", avatar: "/images/categories/admin.png", text: "Butuh bantuan? Hubungi kami." },
    ];
    const [chatLimit, setChatLimit] = useState(4);
    const visibleChats = chats.slice(0, chatLimit);

    return (
        <header className="bg-white border-1 border-gray-200 fixed top-0 left-0 w-full z-50">
            <div className="navbar max-w-7xl mx-auto px-4 py-2 sm:px-6 lg:px-8">
                <div className="navbar-start">
                    <Link href="/" className="items-center">
                        <h1 className="text-2xl font-bold text-[#ED775A]">SMART</h1>
                        <span className="text-sm text-gray-600">Sukmajaya Market & Trade</span>
                    </Link>
                </div>

                <div className="navbar-center hidden lg:flex">
                    <div className="form-control">
                        <div className="input-group border-gray-200 border-1 rounded-md text-gray-500 flex">
                            <input
                                type="text"
                                placeholder="Cari disini..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="input w-64 bg-white focus:ring-0 focus:border-transparent focus:outline-none"
                            />
                            <span className=" my-2 w-[1.6px] bg-gray-200"></span>
                            <button className="btn btn-square bg-white focus:outline-none border-none shadow-none">
                                <FiSearch className="text-gray-400" />
                            </button>
                        </div>
                    </div>
                </div>


                <div className="navbar-end space-x-2 relative">
                    {user ? (
                        <>
                            {/* Notification Bell with Dropdown */}
                            <div className="relative inline-block">
                                <button
                                    className="btn btn-ghost btn-circle hover:bg-orange-custom hover:text-white border-none shadow-none hover:bg-[#ED775A] hover:border-none"
                                    onClick={() => {
                                        setShowNotifications((prev) => !prev);
                                        setNotifLimit(4);
                                        setShowChats(false);
                                    }}
                                >
                                    <FiBell size={20} />
                                    {notifications.length > 0 && (
                                        <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
                                    )}
                                </button>
                                {showNotifications && (
                                    <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                                        <div className="p-4 border-b border-gray-100 font-semibold text-gray-700">Notifikasi</div>
                                        <ul className="max-h-64 overflow-y-auto">
                                            {visibleNotifications.length > 0 ? (
                                                visibleNotifications.map((notif) => (
                                                    <li key={notif.id} className="px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 border-b border-gray-100 last:border-b-0">
                                                        {notif.text}
                                                    </li>
                                                ))
                                            ) : (
                                                <li className="px-4 py-3 text-sm text-gray-400">Tidak ada notifikasi baru.</li>
                                            )}
                                        </ul>
                                        {notifLimit < notifications.length && (
                                            <button
                                                className="w-full py-2 text-sm text-[#ED775A] font-semibold hover:bg-orange-50 border-t border-gray-100"
                                                onClick={() => setNotifLimit((prev) => Math.min(prev + 6, notifications.length))}
                                            >
                                                Tampilkan lebih banyak
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                            {/* Chat Button with Dropdown */}
                            <div className="relative inline-block">
                                <button href="/"
                                    className="btn btn-ghost btn-circle hover:bg-orange-custom hover:text-white border-none shadow-none hover:bg-[#ED775A] hover:border-none"
                                    onClick={() => {
                                        setShowChats((prev) => !prev);
                                        setChatLimit(4);
                                        setShowNotifications(false);
                                    }}
                                >
                                    <FiMessageSquare size={20} />
                                    {chats.length > 0 && (
                                        <span className="absolute top-0 right-0 w-2 h-2 bg-green-500 rounded-full"></span>
                                    )}
                                </button>
                                {showChats && (
                                    <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                                        <div className="p-4 border-b border-gray-100 font-semibold text-gray-700">Pesan</div>
                                        <ul className="max-h-64 overflow-y-auto">
                                            {visibleChats.length > 0 ? (
                                                visibleChats.map((chat) => (
                                                    <li
                                                        key={chat.id}
                                                        className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 border-b border-gray-100 last:border-b-0 cursor-pointer"
                                                        onClick={() => router.push('/pages/chat')}
                                                    >
                                                        <img src={chat.avatar} alt={chat.sender} className="w-8 h-8 rounded-full object-cover border border-gray-200" />
                                                        <div>
                                                            <span className="font-semibold mr-1">{chat.sender}:</span>
                                                            <span>{chat.text}</span>
                                                        </div>
                                                    </li>
                                                ))
                                            ) : (
                                                <li className="px-4 py-3 text-sm text-gray-400">Tidak ada pesan baru.</li>
                                            )}
                                        </ul>
                                        {chatLimit < chats.length && (
                                            <button
                                                className="w-full py-2 text-sm text-[#ED775A] font-semibold hover:bg-orange-50 border-t border-gray-100"
                                                onClick={() => setChatLimit((prev) => Math.min(prev + 6, chats.length))}
                                            >
                                                Tampilkan lebih banyak
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                            {/* Wishlist Button */}
                            <Link href="/pages/wishlist" className="btn btn-ghost btn-circle hover:bg-orange-custom hover:text-white border-none shadow-none hover:bg-[#ED775A] hover:border-none">
                                <FiHeart size={20} />
                            </Link>
                            {/* Cart Button */}
                            <Link href="/pages/cart" className="btn btn-ghost btn-circle hover:bg-orange-custom hover:text-white shadow-none border-none hover:bg-[#ED775A] hover:border-none mr-5">
                                <FiShoppingCart size={20} />
                            </Link>
                            {/* User Menu */}
                            <UserButton>
                                <UserButton.MenuItems>
                                    <UserButton.Action labelIcon={<PackageIcon size={16}/>} label="My Orders" onClick={() => router.push('/pages/order')}/>
                                </UserButton.MenuItems>
                            </UserButton>
                        </>
                    ) : (
                        <button onClick={openSignIn} className="btn btn-ghost hover:bg-orange-custom hover:text-white px-5 border-none shadow-none rounded-4xl hover:bg-[#ED775A] hover:border-none">
                            <div className="">Login</div>
                        </button>
                    )}
                </div>
            </div>
        </header>
    );
}