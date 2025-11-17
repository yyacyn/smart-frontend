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
import { fetchWishlist, removeFromWishlistAPI, addToWishlistAPI } from "@/lib/features/wishlist/wishlistSlice";

export default function WishlistPage() {
    const router = useRouter();
    const [viewMode, setViewMode] = useState("grid"); // grid or list
    const [searchTerm, setSearchTerm] = useState("");
    const [currentCart, setCurrentCart] = useState({});
    const [products, setProducts] = useState([]);

    const { getToken } = useAuth();
    const dispatch = useDispatch();
    const { wishlistItems: reduxWishlistItems, isInitialized } = useSelector(state => state.wishlist);

    // Fetch wishlist on component mount
    useEffect(() => {
        const loadWishlist = async () => {
            if (getToken) {
                try {
                    const token = await getToken();
                    if (token) {
                        await dispatch(fetchWishlist({ token }));
                    }
                } catch (error) {
                    console.error('Error getting token:', error);
                }
            }
        };
        loadWishlist();
    }, [dispatch, getToken]);

    // Fetch all products to match with wishlist items
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await axios.get("https://besukma.vercel.app/api/products");
                setProducts(response.data.products || []);
            } catch (error) {
                console.error("Error fetching products:", error);
                setProducts([]);
            }
        };
        fetchProducts();
    }, []);

    // Map wishlist items to actual product data
    const wishlistItems = products.filter(product => reduxWishlistItems && reduxWishlistItems[product.id]);

    const removeFromWishlist = async (productId) => {
        try {
            const token = await getToken();
            if (!token) {
                throw new Error('Authentication token not available');
            }
            await dispatch(removeFromWishlistAPI({
                productId,
                token
            }));
        } catch (err) {
            console.error("Gagal menghapus dari wishlist:", err.response?.data || err.message);
        }
    };

    const addToCart = async (product) => {
        try {
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
        }
    };

    const moveAllToCart = async () => {
        if (wishlistItems.length === 0) return;

        try {
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
            wishlistItems.forEach(item => {
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

            // 5️⃣ Hapus semua item wishlist dari Redux store (this will sync with backend)
            if (!token) {
                throw new Error('Authentication token not available');
            }
            for (const item of wishlistItems) {
                await dispatch(removeFromWishlistAPI({
                    productId: item.id,
                    token
                }));
            }

            setCurrentCart(updatedCart);

            alert(`${wishlistItems.length} produk berhasil dipindahkan ke keranjang!`);
        } catch (err) {
            console.error("Gagal memindahkan semua:", err.response?.data || err.message);
            alert("Terjadi kesalahan saat memindahkan produk ke keranjang.");
        }
    };



    // Filtered wishlist items based on search
    const filteredItems = wishlistItems.filter(item => {
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
                            <p className="text-sm text-gray-600">{wishlistItems.length} produk</p>
                        </div>
                    </div>

                    {/* View Mode Toggle */}
                    <div className="flex items-center gap-4">
                        <div className="flex border border-gray-200 rounded-lg overflow-hidden">
                            <button
                                onClick={() => setViewMode("grid")}
                                className={`p-2 ${viewMode === "grid" ? "bg-[#ED775A] text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}
                            >
                                <FiGrid className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setViewMode("list")}
                                className={`p-2 ${viewMode === "list" ? "bg-[#ED775A] text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}
                            >
                                <FiList className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Search and Actions Bar */}
                {wishlistItems.length > 0 && (
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
                            className="btn bg-[#ED775A] border-none hover:bg-[#eb6b4b] text-white shadow-none"
                        >
                            <FiShoppingCart className="w-4 h-4" />
                            Pindahkan Semua ke Keranjang
                        </button>
                    </div>
                )}

                {/* Wishlist Content */}
                {filteredItems.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="max-w-md mx-auto">
                            <FiHeart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-gray-600 mb-2">
                                {wishlistItems.length === 0 ? "Wishlist Kosong" : "Tidak ada hasil pencarian"}
                            </h3>
                            <p className="text-gray-500 mb-6">
                                {wishlistItems.length === 0
                                    ? "Mulai tambahkan produk favorit Anda ke wishlist untuk melihatnya di sini"
                                    : "Coba kata kunci yang berbeda"
                                }
                            </p>
                            {wishlistItems.length === 0 && (
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
                                    <ProductCard product={product} />
                                    {/* Wishlist Actions Overlay */}
                                    <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => removeFromWishlist(product.id)}
                                            className="p-2 bg-white rounded-full shadow-lg hover:bg-red-50 text-red-500"
                                            title="Hapus dari wishlist"
                                        >
                                            <FiTrash2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => addToCart(product)}
                                            className="p-2 bg-white rounded-full shadow-lg hover:bg-orange-50 text-[#ED775A]"
                                            title="Tambah ke keranjang"
                                        >
                                            <FiShoppingCart className="w-4 h-4" />
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
                                            className="btn btn-sm bg-[#ED775A] border-none hover:bg-[#eb6b4b] text-white shadow-none"
                                        >
                                            <FiShoppingCart className="w-4 h-4" />
                                            Tambah ke Keranjang
                                        </button>
                                        <button
                                            onClick={() => removeFromWishlist(product.id)}
                                            className="btn btn-sm btn-outline border-red-500 text-red-500 hover:bg-red-500 hover:text-white shadow-none"
                                        >
                                            <FiTrash2 className="w-4 h-4" />
                                            Hapus
                                        </button>
                                    </div>
                                </div>
                            )
                        ))}
                    </div>
                )}

                {/* Recently Viewed or Recommended Products */}
                {wishlistItems.length > 0 && (
                    <div className="mt-16">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">Produk Lainnya untuk Anda</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {sampleProducts.slice(6, 10).map((product) => (
                                <ProductCard key={product.ID} product={product} />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <Footer />
        </div>
    );
}