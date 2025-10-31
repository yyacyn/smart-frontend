"use client"


import { useMemo, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Navbar from "../../../components/navbar/Navbar"
import Footer from "../../../components/footer/Footer"
import { FiUser, FiSettings, FiBell, FiLock, FiEdit3, FiCamera, FiShoppingBag, FiGift } from "react-icons/fi"
import { user as userData } from "../../../data/user"

export default function UserProfilePage({ params }) {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("profile");
    const [userProfile, setUserProfile] = useState(userData);

    const [isEditing, setIsEditing] = useState(false);

    const handleInputChange = (field, value) => {
        setUserProfile(prev => ({ ...prev, [field]: value }));
    };

    const handleSaveProfile = () => {
        // Save profile logic here
        setIsEditing(false);
        alert("Profil berhasil disimpan!");
    };

    const renderProfileSection = () => (
        <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Profil Saya</h2>
                <button 
                    onClick={() => setIsEditing(!isEditing)}
                    className="btn btn-sm bg-[#ED775A] text-white border-none hover:bg-[#eb6b4b] shadow-none"
                >
                    <FiEdit3 className="w-4 h-4" />
                    {isEditing ? "Batal" : "Edit"}
                </button>
            </div>

            <div className="grid md:grid-cols-[300px_1fr] gap-8">
                {/* Profile Picture Section */}
                <div className="text-center flex flex-col justify-center items-center">
                    <div className="relative inline-block">
                        <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center mx-auto mb-4">
                            {userProfile.avatar ? (
                                <img src={userProfile.avatar} alt="Profile" className="w-full h-full rounded-full object-cover" />
                            ) : (
                                <FiUser className="w-12 h-12 text-gray-400" />
                            )}
                        </div>
                        {isEditing && (
                            <button className="absolute bottom-4 right-4 btn btn-sm btn-circle bg-[#ED775A] text-white border-none shadow-none">
                                <FiCamera className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                    <button className="btn btn-outline btn-sm w-[50%] bg-[#ED775A] hover:shadow-none text-white border-none hover:bg-[#eb6b4b] mt-2">
                        Pilih Gambar
                    </button>
                </div>

                {/* Profile Form */}
                <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                            <input
                                type="text"
                                value={userProfile.username}
                                onChange={(e) => handleInputChange('username', e.target.value)}
                                disabled={!isEditing}
                                className={`input input-bordered w-full focus:outline-none border-gray-200`}
                                style={!isEditing ? { backgroundColor: '#f3f4f6', color: '#6b7280' } : { backgroundColor: '#fff', color: '#111827' }}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nama</label>
                            <input
                                type="text"
                                value={userProfile.nama}
                                onChange={(e) => handleInputChange('nama', e.target.value)}
                                disabled={!isEditing}
                                className={`input input-bordered w-full focus:outline-none border-gray-200`}
                                style={!isEditing ? { backgroundColor: '#f3f4f6', color: '#6b7280' } : { backgroundColor: '#fff', color: '#111827' }}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            type="email"
                            value={userProfile.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            disabled={!isEditing}
                            className={`input input-bordered w-full focus:outline-none border-gray-200`}
                            style={!isEditing ? { backgroundColor: '#f3f4f6', color: '#6b7280' } : { backgroundColor: '#fff', color: '#111827' }}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nomor Telepon</label>
                        <input
                            type="tel"
                            value={userProfile.nomorTelepon}
                            onChange={(e) => handleInputChange('nomorTelepon', e.target.value)}
                            disabled={!isEditing}
                            className={`input input-bordered w-full focus:outline-none border-gray-200`}
                            style={!isEditing ? { backgroundColor: '#f3f4f6', color: '#6b7280' } : { backgroundColor: '#fff', color: '#111827' }}
                        />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Kelamin</label>
                            <select
                                value={userProfile.jenisKelamin}
                                onChange={(e) => handleInputChange('jenisKelamin', e.target.value)}
                                disabled={!isEditing}
                                className={`select select-bordered w-full border-gray-200`}
                                style={!isEditing ? { backgroundColor: '#f3f4f6', color: '#6b7280' } : { backgroundColor: '#fff', color: '#111827' }}
                            >
                                <option value="Laki-laki">Laki-laki</option>
                                <option value="Perempuan">Perempuan</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Lahir</label>
                            <input
                                type="date"
                                value={userProfile.tanggalLahir}
                                onChange={(e) => handleInputChange('tanggalLahir', e.target.value)}
                                disabled={!isEditing}
                                className={`input input-bordered w-full focus:outline-none border-gray-200`}
                                style={!isEditing ? { backgroundColor: '#f3f4f6', color: '#6b7280' } : { backgroundColor: '#fff', color: '#111827' }}
                            />
                        </div>
                    </div>

                    {isEditing && (
                        <div className="pt-4">
                            <button 
                                onClick={handleSaveProfile}
                                className="btn shadow-none bg-[#ED775A] text-white border-none hover:bg-[#eb6b4b]"
                            >
                                Simpan
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    const renderAccountSettings = () => (
        <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Akun Saya</h3>
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div>
                            <h4 className="font-medium text-gray-900">Profil</h4>
                            <p className="text-sm text-gray-600">Kelola informasi profil Anda</p>
                        </div>
                        <button className="btn btn-ghost btn-sm">
                            <FiEdit3 className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div>
                            <h4 className="font-medium text-gray-900">Alamat</h4>
                            <p className="text-sm text-gray-600">Kelola alamat pengiriman</p>
                        </div>
                        <button className="btn btn-ghost btn-sm">
                            <FiEdit3 className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div>
                            <h4 className="font-medium text-gray-900">Pengaturan Notifikasi</h4>
                            <p className="text-sm text-gray-600">Atur preferensi notifikasi</p>
                        </div>
                        <button className="btn btn-ghost btn-sm">
                            <FiBell className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div>
                            <h4 className="font-medium text-gray-900">Pengaturan Privasi</h4>
                            <p className="text-sm text-gray-600">Kontrol privasi akun Anda</p>
                        </div>
                        <button className="btn btn-ghost btn-sm">
                            <FiLock className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div>
                            <h4 className="font-medium text-gray-900">Ubah Password</h4>
                            <p className="text-sm text-gray-600">Ubah kata sandi akun Anda</p>
                        </div>
                        <button className="btn btn-ghost btn-sm">
                            <FiLock className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderOrderHistory = () => (
        <div className="bg-white rounded-lg p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Pesanan Saya</h3>
            <div className="text-center py-12">
                <FiShoppingBag className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">Belum ada pesanan</h4>
                <p className="text-gray-500 mb-6">Anda belum memiliki riwayat pesanan</p>
                <button 
                    onClick={() => router.push('/pages/marketplace')}
                    className="btn bg-[#ED775A] text-white border-none hover:bg-[#eb6b4b] shadow-none"
                >
                    Mulai Belanja
                </button>
            </div>
        </div>
    );

    const renderVouchers = () => (
        <div className="bg-white rounded-lg p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Voucher Saya</h3>
            <div className="text-center py-12">
                <FiGift className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">Belum ada voucher</h4>
                <p className="text-gray-500">Anda belum memiliki voucher aktif</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen ">
            <Navbar />
            
            <div className="container mx-auto px-4 py-8 mt-15 mb-20">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6 mt-5">
                    <button 
                        onClick={() => router.back()} 
                        className="btn btn-sm btn-ghost text-gray-700 border-none hover:bg-gray-100"
                    >
                        &larr;
                    </button>
                    <h1 className="text-2xl font-bold text-gray-900">Profil Pengguna</h1>
                </div>

                <div className="grid lg:grid-cols-[250px_1fr] gap-6">
                    {/* Sidebar */}
                    <div className="bg-white rounded-lg p-4 border border-gray-200 h-fit">
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center mx-auto mb-2">
                                <FiUser className="w-6 h-6 text-gray-400" />
                            </div>
                            <h3 className="font-medium text-gray-900">{userProfile.username}</h3>
                            <p className="text-sm text-gray-500">Ubah Profil</p>
                        </div>

                        <nav className="space-y-2">
                            <button
                                onClick={() => setActiveTab("profile")}
                                className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                                    activeTab === "profile" 
                                        ? "bg-[#ED775A] text-white" 
                                        : "text-gray-700 hover:bg-gray-100"
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <FiUser className="w-4 h-4" />
                                    <span>Profil</span>
                                </div>
                            </button>

                            <button
                                onClick={() => setActiveTab("account")}
                                className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                                    activeTab === "account" 
                                        ? "bg-[#ED775A] text-white" 
                                        : "text-gray-700 hover:bg-gray-100"
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <FiSettings className="w-4 h-4" />
                                    <span>Akun Saya</span>
                                </div>
                            </button>

                            <button
                                onClick={() => setActiveTab("orders")}
                                className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                                    activeTab === "orders" 
                                        ? "bg-[#ED775A] text-white" 
                                        : "text-gray-700 hover:bg-gray-100"
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <FiShoppingBag className="w-4 h-4" />
                                    <span>Pesanan Saya</span>
                                </div>
                            </button>

                            <button
                                onClick={() => setActiveTab("vouchers")}
                                className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                                    activeTab === "vouchers" 
                                        ? "bg-[#ED775A] text-white" 
                                        : "text-gray-700 hover:bg-gray-100"
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <FiGift className="w-4 h-4" />
                                    <span>Voucher Saya</span>
                                </div>
                            </button>
                        </nav>
                    </div>

                    {/* Main Content */}
                    <div>
                        {activeTab === "profile" && renderProfileSection()}
                        {activeTab === "account" && renderAccountSettings()}
                        {activeTab === "orders" && renderOrderHistory()}
                        {activeTab === "vouchers" && renderVouchers()}
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}

