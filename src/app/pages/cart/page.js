"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "../../components/navbar/Navbar";
import Footer from "../../components/footer/Footer";
import ProductCard from "../../components/product/Card";
import CTA from "../../components/CTA";
import { sampleProducts, cartItems as initialCartItems } from "../../data/products";
import { stores } from "../../data/store";
import { FiTrash2, FiMinus, FiPlus, FiShoppingBag } from "react-icons/fi";


// Helper to get store name by id
function getStoreName(store_id) {
    const store = stores.find(s => s.store_id === store_id);
    return store ? store.name : `Toko #${store_id}`;
}

export default function CartPage() {
    const router = useRouter();
    const [cartItems, setCartItems] = useState(initialCartItems);
    const [selectedItems, setSelectedItems] = useState([]);
    const [selectAll, setSelectAll] = useState(false);
    const [recommendedProducts, setRecommendedProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        setRecommendedProducts(sampleProducts.slice(0, 4));
    }, []);

    const updateQuantity = (id, newQuantity) => {
        if (newQuantity < 1) return;
        setCartItems(items =>
            items.map(item =>
                item.id === id ? { ...item, quantity: Math.min(newQuantity, item.stok) } : item
            )
        );
    };

    const removeItem = (id) => {
        setCartItems(items => items.filter(item => item.id !== id));
        setSelectedItems(selected => selected.filter(itemId => itemId !== id));
    };

    const toggleItemSelection = (id) => {
        setSelectedItems(selected => {
            const isSelected = selected.includes(id);
            const newSelected = isSelected
                ? selected.filter(itemId => itemId !== id)
                : [...selected, id];

            setSelectAll(newSelected.length === cartItems.length);
            return newSelected;
        });
    };

    const toggleSelectAll = () => {
        const newSelectAll = !selectAll;
        setSelectAll(newSelectAll);
        setSelectedItems(newSelectAll ? cartItems.map(item => item.id) : []);
    };

    const calculatePrice = (item) => {
        return item.harga;
    };

    // Filtered cart items based on search
    const filteredCartItems = cartItems.filter(item => {
        const term = searchTerm.trim().toLowerCase();
        if (!term) return true;
        return (
            item.nama_produk.toLowerCase().includes(term) ||
            (item.variant && item.variant.toLowerCase().includes(term))
        );
    });

    const selectedItemsData = filteredCartItems.filter(item => selectedItems.includes(item.id));
    const totalItems = selectedItemsData.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = selectedItemsData.reduce((sum, item) => sum + (calculatePrice(item) * item.quantity), 0);

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="container mx-auto px-4 py-8 mt-15 mb-20 text-black">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <button onClick={() => router.back()} className="btn btn-sm btn-ghost shadow-none border-none text-gray-700 border border-gray-300 hover:bg-gray-100">
                            &larr;
                        </button>
                        <h1 className="text-2xl font-bold text-gray-900">Keranjang Belanja</h1>
                    </div>
                    <div className="w-64">
                        <input
                            type="text"
                            placeholder="Cari produk di keranjang..."
                            className="input input-bordered w-full bg-white  border-gray-200 focus:outline-none "
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {cartItems.length === 0 ? (
                    <div className="text-center py-16">
                        <FiShoppingBag className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">Keranjang Kosong</h2>
                        <p className="text-gray-500 mb-6">Ayo mulai berbelanja dan tambahkan produk ke keranjang!</p>
                        <Link href="/pages/marketplace" className="btn bg-[#ED775A] border-none hover:bg-[#eb6b4b] text-white">
                            Mulai Belanja
                        </Link>
                    </div>
                ) : (
                    <div className="grid gap-6 lg:grid-cols-[1fr_350px]">
                        {/* Cart Items */}
                        <div className="bg-white rounded-lg border-1 border-gray-200">
                            {/* Select All Header */}
                            <div className="p-4 border-b border-gray-200">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="checkbox checkbox-sm border-gray-400 text-black"
                                        checked={selectAll}
                                        onChange={toggleSelectAll}
                                    />
                                    <span className="font-medium text-gray-900">Pilih Semua ({cartItems.length} produk)</span>
                                </label>
                            </div>

                            {/* Cart Items List */}
                            <div className="divide-y divide-gray-200">
                                {filteredCartItems.length === 0 ? (
                                    <div className="p-8 text-center text-gray-500">Tidak ada produk yang cocok dengan pencarian.</div>
                                ) : (
                                    filteredCartItems.map((item) => (
                                        <div key={item.id} className="p-4">
                                            <div className="flex items-start gap-4">
                                                {/* Checkbox */}
                                                <input
                                                    type="checkbox"
                                                    className="checkbox checkbox-sm border-gray-400 mt-4 text-black"
                                                    checked={selectedItems.includes(item.id)}
                                                    onChange={() => toggleItemSelection(item.id)}
                                                />

                                                {/* Product Image */}
                                                <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                                                    <img
                                                        src={item.image}
                                                        alt={item.nama_produk}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>

                                                {/* Product Details */}
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-semibold text-gray-900 mb-1 truncate">{item.nama_produk}</h3>
                                                    <p className="text-xs text-gray-500 mb-1">{getStoreName(item.store_id)}</p>
                                                    <p className="text-sm text-gray-500 mb-2">Varian: {item.variant}</p>
                                                    {/* Price */}
                                                    <div className="flex items-center gap-2 mb-3">
                                                        <span className="font-bold text-[#ED775A] text-lg">
                                                            Rp {calculatePrice(item).toLocaleString("id-ID")}
                                                        </span>
                                                        {item.originalPrice && (
                                                            <>
                                                                <span className="text-sm line-through text-gray-400">
                                                                    Rp {item.originalPrice.toLocaleString("id-ID")}
                                                                </span>
                                                                <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded">
                                                                    -{item.discount}%
                                                                </span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex flex-row items-center justify-between mt-auto h-full mb-2 gap-3">
                                                    {/* Quantity Controls */}
                                                    <div className="flex items-center bg-gray-50 rounded-full border border-gray-200 overflow-hidden">
                                                        <button
                                                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                            className="px-3 py-1 hover:bg-gray-100 text-gray-600 disabled:opacity-40"
                                                            disabled={item.quantity <= 1}
                                                        >
                                                            <FiMinus className="w-3 h-3" />
                                                        </button>
                                                        <span className="w-10 text-center font-medium text-gray-800 text-sm">{item.quantity}</span>
                                                        <button
                                                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                            className="px-3 py-1 hover:bg-gray-100 text-gray-600 disabled:opacity-40"
                                                            disabled={item.quantity >= item.stok}
                                                        >
                                                            <FiPlus className="w-3 h-3" />
                                                        </button>
                                                    </div>

                                                    {/* Remove Button */}
                                                    <button
                                                        onClick={() => removeItem(item.id)}
                                                        className="text-red-500 hover:text-red-600 hover:bg-red-50 transition-colors rounded-full p-2"
                                                        title="Hapus produk"
                                                    >
                                                        <FiTrash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Order Summary */}
                        <div className="bg-white rounded-lg border-1 border-gray-200 p-6 h-fit sticky top-20">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Ringkasan Pesanan</h2>

                            <div className="space-y-3 mb-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Total Barang ({totalItems})</span>
                                    <span className="font-medium">Rp {subtotal.toLocaleString("id-ID")}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Ongkos Kirim</span>
                                    <span className="font-medium">Rp {Number(12000).toLocaleString("id-ID")}</span>
                                </div>
                                <div className="border-t border-gray-200 pt-3">
                                    <div className="flex justify-between">
                                        <span className="font-semibold text-gray-900">Total</span>
                                        <span className="font-bold text-xl text-[#ED775A]">
                                            Rp {(subtotal + 12000).toLocaleString("id-ID")}
                                        </span>
                                    </div>
                                </div>
                            </div>


                            <button
                                className={`w-full btn mb-3 ${selectedItems.length === 0 ? 'bg-gray-400 text-white border-none cursor-not-allowed' : 'bg-[#ED775A] border-none hover:bg-[#eb6b4b] shadow-none text-white'}`}
                                hidden={selectedItems.length === 0}
                                onClick={() => {
                                    if (selectedItems.length > 0) {
                                        // Create cart items string for checkout
                                        const cartItemsParam = selectedItems.join(',');
                                        router.push(`/pages/checkout/?cartItems=${cartItemsParam}`);
                                    }
                                }}
                            >
                                Checkout ({selectedItems.length})
                            </button>

                            {/* <Link href="/pages/marketplace" className="w-full btn btn-outline">
                                Lanjut Belanja
                            </Link> */}
                        </div>
                    </div>
                )}

                {/* Recommended Products */}
                {cartItems.length > 0 && (
                    <div className="mt-16">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Kamu Mungkin Juga Suka</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {recommendedProducts.map((product) => (
                                <ProductCard key={product.ID} product={product} />
                            ))}
                        </div>
                    </div>
                )}

                {/* CTA Banner */}
                <div className="mt-16">
                    <CTA />
                </div>
            </div>

            <Footer />
        </div>
    );
}

