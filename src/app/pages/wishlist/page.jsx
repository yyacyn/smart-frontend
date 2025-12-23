"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import Navbar from "../../components/navbar/Navbar";
import Footer from "../../components/footer/Footer";
import ProductCard from "../../components/product/Card";
import { sampleProducts } from "../../data/products";
import { FiHeart, FiTrash2, FiShoppingCart, FiGrid, FiList } from "react-icons/fi";
import { useAuth } from "@clerk/nextjs";
import axios from "axios"
import { fetchProducts as fetchProductsAPI } from "../../api";
import { useGlobalData } from '../../contexts/GlobalDataContext';

export default function WishlistPage() {
    const router = useRouter();
    const [viewMode, setViewMode] = useState("grid"); // grid or list
    const [searchTerm, setSearchTerm] = useState("");
    const [currentCart, setCurrentCart] = useState({});
    const { cachedProducts, setCachedProducts, cachedWishlist, addToWishlistContext, removeFromWishlistContext, isWishlisted, getWishlistCount, loading: globalLoading, wishlistLoading } = useGlobalData();

    const { getToken } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [loadingItem, setLoadingItem] = useState(null); // Track loading state for individual items
    const dispatch = useDispatch(); // We still need this for cart operations

    // Update loading state based on both global loading and wishlist loading
    useEffect(() => {
        // Show loading when either global context is loading or wishlist is loading
        setIsLoading(globalLoading || wishlistLoading);
    }, [globalLoading, wishlistLoading]);

    // Use cached products if available, otherwise fetch them
    useEffect(() => {
        if (cachedProducts && cachedProducts.length > 0) {
            // Use cached products
            return; // Do nothing since we're using cached data
        } else {
            // Fetch products if not cached
            const fetchProducts = async () => {
                try {
                    const response = await axios.get("https://besukma.vercel.app/api/products");
                    const productsData = response.data.products || [];

                    // Cache the products for future use
                    setCachedProducts(productsData);
                } catch (error) {
                    console.error("Error fetching products:", error);
                }
            };
            fetchProducts();
        }
    }, [cachedProducts, setCachedProducts]);

    // Map wishlist items to actual product data
    const wishlistProductData = (cachedProducts || []).filter(product => cachedWishlist && cachedWishlist[product.id]);

    const handleRemoveFromWishlist = async (productId) => {
        try {
            setLoadingItem(productId);
            const success = await removeFromWishlistContext(productId);
            if (!success) {
                throw new Error("Failed to remove from wishlist");
            }
        } catch (err) {
            console.error("Gagal menghapus dari wishlist:", err.message);
        } finally {
            setLoadingItem(null);
        }
    };

    const addToCart = async (product) => {
        try {
            setLoadingItem(product.id);
            const token = await getToken();

            // 1️⃣ Ambil cart lama
            const res = await axios.get("https://besukma.vercel.app/api/cart", {
                headers: { Authorization: `Bearer ${token}` },
            });
            const currentCart = res.data.cart || {};
            console.log("Current cart:", currentCart);

            // 2️⃣ Update cart di memory
            const updatedCart = {
                ...currentCart,
                [product.id]: (currentCart[product.id] || 0) + 1, // tambah quantity jika sudah ada
            };

            // 3️⃣ Simpan ke backend
            await axios.post(
                "https://besukma.vercel.app/api/cart",
                { cart: updatedCart },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setCurrentCart(updatedCart); // update state lokal
            alert(`${product.name} berhasil ditambahkan ke keranjang!`);
        } catch (err) {
            console.error("Gagal menambah ke cart:", err.response?.data || err.message);
            alert("Terjadi kesalahan saat menambahkan ke keranjang.");
        } finally {
            setLoadingItem(null);
        }
    };

    const moveAllToCart = async () => {
        if (getWishlistCount() === 0) return;

        try {
            setLoadingItem('all');
            const token = await getToken();

            // 1️⃣ Ambil cart lama
            const res = await axios.get("https://besukma.vercel.app/api/cart", {
                headers: { Authorization: `Bearer ${token}` },
            });
            const currentCart = res.data.cart || {};
            console.log("Current cart:", currentCart);

            // 2️⃣ Buat salinan object cart baru
            const updatedCart = { ...currentCart };

            // 3️⃣ Tambahkan semua produk wishlist ke cart
            wishlistProductData.forEach(item => {
                if (updatedCart[item.id]) {
                    updatedCart[item.id] += 1; // tambah quantity kalau sudah ada
                } else {
                    updatedCart[item.id] = 1; // tambahkan produk baru
                }
            });

            // 4️⃣ Simpan cart baru ke backend
            await axios.post(
                "https://besukma.vercel.app/api/cart",
                { cart: updatedCart },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // 5️⃣ Hapus semua item wishlist dari context (this will handle backend removal)
            for (const item of wishlistProductData) {
                await removeFromWishlistContext(item.id);
            }

            setCurrentCart(updatedCart);

            alert(`${getWishlistCount()} produk berhasil dipindahkan ke keranjang!`);
        } catch (err) {
            console.error("Gagal memindahkan semua:", err.response?.data || err.message);
            alert("Terjadi kesalahan saat memindahkan produk ke keranjang.");
        } finally {
            setLoadingItem(null);
        }
    };



    // Filtered wishlist items based on search
    const filteredItems = wishlistProductData.filter(item => {
        const term = searchTerm.trim().toLowerCase();
        if (!term) return true;
        return item.name.toLowerCase().includes(term);
    });

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="container mx-auto px-4 py-8 mt-16 mb-20 text-black">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => router.back()}
                            className="btn btn-sm btn-ghost shadow-none border-none text-gray-700 hover:bg-gray-100"
                        >
                            &larr;
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Wishlist Saya</h1>
                            <p className="text-sm text-gray-600">{getWishlistCount()} produk</p>
                        </div>
                    </div>
                </div>

                {/* Search and Actions Bar */}
                {getWishlistCount() > 0 && (
                    <div className="flex flex-col sm:flex-row gap-4 mb-6">
                        <div className="flex-1">
                            <input
                                type="text"
                                placeholder="Cari produk di wishlist..."
                                className="input input-bordered w-full bg-white border-gray-200 focus:outline-none"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button
                            onClick={moveAllToCart}
                            className={`btn bg-[#ED775A] border-none ${loadingItem === 'all' ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#eb6b4b]'} text-white shadow-none flex items-center gap-2`}
                            disabled={loadingItem === 'all'}
                        >
                            {loadingItem === 'all' ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            ) : (
                                <FiShoppingCart className="w-4 h-4" />
                            )}
                            Pindahkan Semua ke Keranjang
                        </button>
                    </div>
                )}

                {/* Wishlist Content */}
                {isLoading ? (
                    // Loading indicator while fetching wishlist
                    <div className="flex justify-center items-center py-20">
                        <div className="flex flex-col items-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ED775A] mb-4"></div>
                            <p className="text-gray-600">Memuat wishlist Anda...</p>
                        </div>
                    </div>
                ) : filteredItems.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="max-w-md mx-auto">
                            <FiHeart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-gray-600 mb-2">
                                {getWishlistCount() === 0 ? "Wishlist Kosong" : "Tidak ada hasil pencarian"}
                            </h3>
                            <p className="text-gray-500 mb-6">
                                {getWishlistCount() === 0
                                    ? "Mulai tambahkan produk favorit Anda ke wishlist untuk melihatnya di sini"
                                    : "Coba kata kunci yang berbeda"
                                }
                            </p>
                            {getWishlistCount() === 0 && (
                                <Link
                                    href="/pages/marketplace"
                                    className="btn bg-[#ED775A] border-none hover:bg-[#eb6b4b] text-white shadow-none"
                                >
                                    Mulai Belanja
                                </Link>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className={viewMode === "grid"
                        ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
                        : "space-y-4"
                    }>
                        {filteredItems.map((product) => (
                            viewMode === "grid" ? (
                                <div key={product.id} className="relative group">
                                    <ProductCard product={product} loading={loadingItem === product.id} />
                                    {/* Wishlist Actions Overlay */}
                                    <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => handleRemoveFromWishlist(product.id)}
                                            className={`p-2 bg-white rounded-full shadow-lg ${loadingItem === product.id ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-50'} text-red-500`}
                                            title="Hapus dari wishlist"
                                            disabled={loadingItem === product.id}
                                        >
                                            {loadingItem === product.id ? (
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500"></div>
                                            ) : (
                                                <FiTrash2 className="w-4 h-4" />
                                            )}
                                        </button>
                                        <button
                                            onClick={() => addToCart(product)}
                                            className={`p-2 bg-white rounded-full shadow-lg ${loadingItem === product.id ? 'opacity-50 cursor-not-allowed' : 'hover:bg-orange-50'} text-[#ED775A]`}
                                            title="Tambah ke keranjang"
                                            disabled={loadingItem === product.id}
                                        >
                                            {loadingItem === product.id ? (
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#ED775A]"></div>
                                            ) : (
                                                <FiShoppingCart className="w-4 h-4" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div key={product.id} className="bg-white rounded-lg border border-gray-200 p-4 flex gap-4 hover:shadow-md transition-shadow">
                                    {/* Product Image */}
                                    <Link href={`/pages/product_detail/${product.id}`} className="flex-shrink-0">
                                        <div className="w-24 h-24 bg-gray-200 rounded-lg overflow-hidden">
                                            <img
                                                src={product.image}
                                                alt={product.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    </Link>

                                    {/* Product Details */}
                                    <div className="flex-1 min-w-0">
                                        <Link href={`/pages/product_detail/${product.id}`}>
                                            <h3 className="font-semibold text-gray-900 mb-1 hover:text-[#ED775A] transition-colors">
                                                {product.name}
                                            </h3>
                                        </Link>
                                        <p className="text-sm text-gray-500 mb-2">{product.category}</p>
                                        <div className="flex items-center gap-2">
                                            <span className="text-lg font-bold text-[#ED775A]">
                                                Rp {product.price.toLocaleString("id-ID")}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex flex-col gap-2">
                                        <button
                                            onClick={() => addToCart(product)}
                                            className={`btn btn-sm bg-[#ED775A] border-none ${loadingItem === product.id ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#eb6b4b]'} text-white shadow-none flex items-center gap-2`}
                                            disabled={loadingItem === product.id}
                                        >
                                            {loadingItem === product.id ? (
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            ) : (
                                                <FiShoppingCart className="w-4 h-4" />
                                            )}
                                            Tambah ke Keranjang
                                        </button>
                                        <button
                                            onClick={() => handleRemoveFromWishlist(product.id)}
                                            className={`btn btn-sm ${loadingItem === product.id ? 'opacity-50 cursor-not-allowed' : 'btn-outline border-red-500 text-red-500 hover:bg-red-500 hover:text-white'} shadow-none flex items-center gap-2`}
                                            disabled={loadingItem === product.id}
                                        >
                                            {loadingItem === product.id ? (
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500"></div>
                                            ) : (
                                                <FiTrash2 className="w-4 h-4" />
                                            )}
                                            Hapus
                                        </button>
                                    </div>
                                </div>
                            )
                        ))}
                    </div>
                )}

            </div>

            <Footer />
        </div>
    );
}