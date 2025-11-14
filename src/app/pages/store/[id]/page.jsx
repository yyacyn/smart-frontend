"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useStoreRefresh } from "../../../hooks/useStoreRefresh";
import Navbar from "../../../components/navbar/Navbar";
import Footer from "../../../components/footer/Footer";
import ProductCard from "../../../components/product/Card";
import { fetchProducts, fetchStores } from "../../../api";
import { FiStar, FiMessageCircle, FiFlag, FiMapPin, FiPhone, FiMail, FiClock, FiUsers, FiShoppingBag, FiHeart, FiChevronLeft, FiChevronRight, FiEdit } from "react-icons/fi";
import { FaStar } from "react-icons/fa";
import ReportModal from "../../../components/ReportModal";

export default function StorePage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useUser();
    const { refreshStore } = useStoreRefresh();
    const storeId = params.id;

    const [currentStore, setCurrentStore] = useState(null);
    const [storeProducts, setStoreProducts] = useState([]);
    const [popularProducts, setPopularProducts] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [sortBy, setSortBy] = useState("name");
    const [displayedProductsCount, setDisplayedProductsCount] = useState(12);
    const [isLoading, setIsLoading] = useState(false);
    const [isProductsLoading, setIsProductsLoading] = useState(true);
    const productsPerLoad = 12;
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);

    useEffect(() => {
        async function fetchStoreAndProducts() {
            setIsProductsLoading(true);
            try {
                // Try to get store info from sessionStorage (set by product detail page)
                let store = null;
                if (typeof window !== 'undefined') {
                    const storeInfoStr = window.sessionStorage.getItem('storeInfo');
                    if (storeInfoStr) {
                        const parsed = JSON.parse(storeInfoStr);
                        if (parsed && parsed.id === storeId) {
                            store = parsed;
                        }
                    }
                }
                if (!store) {
                    // fallback: fetch from API if not found in sessionStorage
                    try {
                        const storeRes = await fetchStores();
                        const stores = storeRes.stores || [];
                        store = stores.find(s => s.id === storeId);
                    } catch (error) {
                        console.error('Error fetching stores:', error);
                        // Check if it's an authentication error
                        if (error.response?.status === 401) {
                            console.warn('Authentication failed when fetching stores. User may need to re-authenticate.');
                        }
                    }
                }
                setCurrentStore(store);

                // Fetch products
                const prodRes = await fetchProducts();
                const products = prodRes.products || [];
                const storeProds = products.filter(p => p.store?.id === storeId);
                setStoreProducts(storeProds);
                setPopularProducts(storeProds.slice(0, 4));
            } catch (err) {
                setCurrentStore(null);
                setStoreProducts([]);
                setPopularProducts([]);
            } finally {
                setIsProductsLoading(false);
            }
        }
        fetchStoreAndProducts();
    }, [storeId]);

    // Get unique categories for filter
    // Extract category names for filter dropdown
    const categories = [
        "all",
        ...Array.from(
            new Set(
                storeProducts.map(p =>
                    typeof p.category === "object" && p.category !== null
                        ? p.category.name
                        : p.category
                )
            )
        ).filter(Boolean)
    ];

    // Filter and sort products
    const filteredProducts = storeProducts.filter(product => {
        const catName = typeof product.category === "object" && product.category !== null
            ? product.category.name
            : product.category;
        return selectedCategory === "all" || catName === selectedCategory;
    });

    const sortedProducts = [...filteredProducts].sort((a, b) => {
        switch (sortBy) {
            case "name":
                return (a.name || "").localeCompare(b.name || "");
            case "price_low":
                return (a.price || 0) - (b.price || 0);
            case "price_high":
                return (b.price || 0) - (a.price || 0);
            case "newest":
                return (b.createdAt ? new Date(b.createdAt).getTime() : 0) - (a.createdAt ? new Date(a.createdAt).getTime() : 0);
            default:
                return 0;
        }
    });

    // Get displayed products for infinite scroll
    const displayedProducts = sortedProducts.slice(0, displayedProductsCount);
    const hasMoreProducts = displayedProductsCount < sortedProducts.length;

    // Infinite scroll effect
    const handleScroll = useCallback(() => {
        if (isLoading || !hasMoreProducts) return;

        const scrollPosition = window.innerHeight + window.scrollY;
        const documentHeight = document.documentElement.offsetHeight;

        // Load more when user is within 500px of bottom
        if (scrollPosition >= documentHeight - 500) {
            setIsLoading(true);

            // Simulate loading delay
            setTimeout(() => {
                setDisplayedProductsCount(prev => prev + productsPerLoad);
                setIsLoading(false);
            }, 500);
        }
    }, [isLoading, hasMoreProducts, productsPerLoad]);

    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        // Clean up the event listener
        return () => window.removeEventListener('scroll', handleScroll);
    }, [handleScroll]);

    // Reset displayed products count when filters change
    useEffect(() => {
        setDisplayedProductsCount(productsPerLoad);
    }, [selectedCategory, sortBy, productsPerLoad]);



    const handleChatStore = useCallback(() => {
        alert(`Memulai chat dengan ${currentStore?.name}`);
    }, [currentStore?.name]);

    const handleReportSubmit = useCallback(async (reportData) => {
        // This would normally send the report to your backend
        // For now, we'll simulate this with a timeout
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log('Report submitted:', reportData);
                alert(`Laporan berhasil dikirim untuk toko: ${currentStore?.name}`);
                resolve();
            }, 1000);
        });
    }, [currentStore?.name]);

    if (!currentStore) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="loading loading-spinner loading-lg"></div>
                    <p className="mt-4">Loading store...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="container mx-auto px-4 py-8 mt-16 mb-20 text-black">
                {/* Header */}
                <div className="flex items-center gap-2 mb-6">
                    <button
                        onClick={() => router.back()}
                        className="btn btn-sm btn-ghost shadow-none border-none text-gray-700 hover:bg-gray-100"
                    >
                        &larr;
                    </button>
                    <h1 className="text-2xl font-bold text-gray-900">Detail Toko</h1>
                </div>

                {/* Report Modal */}
                <ReportModal
                    isOpen={isReportModalOpen}
                    onClose={() => setIsReportModalOpen(false)}
                    onSubmit={handleReportSubmit}
                    targetType="store"
                    targetId={currentStore?.id}
                    targetName={currentStore?.name}
                />

                {/* Store Profile Section */}
                <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
                    <div className="flex flex-col lg:flex-row gap-6">
                        {/* Store Image */}
                        <div className="flex-shrink-0">
                            <div className="w-32 h-32 rounded-lg overflow-hidden bg-gray-200">
                                <img
                                    src={currentStore.logo}
                                    alt={currentStore.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>

                        {/* Store Details */}
                        <div className="flex-1">
                            <div className="flex flex-col sm:flex-row justify-between items-start mb-3">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h2 className="text-3xl font-bold text-gray-900 mb-2">{currentStore.name}</h2>
                                        {currentStore.userId === user?.id && (
                                            <button
                                                onClick={() => router.push(`/pages/editstore/${currentStore.id}`)}
                                                className="btn btn-ghost btn-sm p-1 border-none shadow-none  hover:bg-white hover:text-[#ED775A]"
                                            >
                                                <FiEdit size={18} />
                                            </button>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="font-semibold text-base text-gray-700">@{currentStore.username}</span>
                                        {currentStore.status && (
                                            <span className={`badge text-xs ml-2 ${currentStore.status === 'approved' ? 'bg-green-100 text-green-700 border-none' : 'bg-yellow-100 text-yellow-700'}`}>{currentStore.status}</span>
                                        )}
                                    </div>
                                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-2">
                                        {currentStore.email && (
                                            <div className="flex items-center gap-1">
                                                <FiMail className="w-4 h-4" />
                                                <span>{currentStore.email}</span>
                                            </div>
                                        )}
                                        {currentStore.contact && (
                                            <div className="flex items-center gap-1">
                                                <FiPhone className="w-4 h-4" />
                                                <span>{currentStore.contact}</span>
                                            </div>
                                        )}
                                        {currentStore.address && (
                                            <div className="flex items-center gap-1">
                                                <FiMapPin className="w-4 h-4" />
                                                <span>{currentStore.address}</span>
                                            </div>
                                        )}
                                        {currentStore.createdAt && (
                                            <div className="flex items-center gap-1">
                                                <FiClock className="w-4 h-4" />
                                                <span>Bergabung {new Date(currentStore.createdAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'long' })}</span>
                                            </div>
                                        )}
                                    </div>
                                    {currentStore.website && (
                                        <div className="flex items-center gap-1 text-blue-600">
                                            <span>Website:</span>
                                            <a href={currentStore.website} target="_blank" rel="noopener noreferrer" className="underline">{currentStore.website}</a>
                                        </div>
                                    )}
                                </div>
                                {/* Action Buttons */}
                                <div className="flex flex-col sm:flex-row gap-2">
                                    <button
                                        onClick={handleChatStore}
                                        className="btn bg-[#ED775A] border-none hover:bg-[#eb6b4b] text-white shadow-none"
                                    >
                                        <FiMessageCircle className="w-4 h-4" />
                                        Chat Toko
                                    </button>
                                    <button
                                        onClick={() => setIsReportModalOpen(true)}
                                        className="btn btn-outline border-red-500 text-red-500 hover:bg-red-500 hover:text-white shadow-none"
                                    >
                                        <FiFlag className="w-4 h-4" />
                                        Laporkan
                                    </button>
                                </div>
                            </div>
                            {/* Store status, description, etc. */}
                            {currentStore.isActive !== undefined && (
                                <div className="text-xs text-gray-500 mb-2">
                                    Status: {currentStore.isActive ? 'Aktif' : 'Tidak Aktif'}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Store Description */}
                    <div className="mt-6 pt-6 border-t border-gray-200">
                        <h3 className="font-semibold text-gray-900 mb-2">Tentang Toko</h3>
                        <p className="text-gray-600 text-sm leading-relaxed">
                            {currentStore.description}
                        </p>
                    </div>
                </div>

                {/* Popular Products Section */}
                {popularProducts.length > 0 && (
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-900">Produk Terpopuler</h2>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {popularProducts.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    </div>
                )}

                {/* All Products Section */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4 lg:mb-0">Semua Produk ({storeProducts.length})</h2>

                        {/* Filters and Sort */}
                        <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-[35%]">
                            {/* Category Filter */}
                            <select
                                className="select select-bordered bg-white border-gray-200 focus:outline-none"
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                            >
                                {categories.map(category => (
                                    <option key={category} value={category}>
                                        {category === "all" ? "Semua Kategori" : category}
                                    </option>
                                ))}
                            </select>

                            {/* Sort By */}
                            <select
                                className="select select-bordered bg-white border-gray-200 focus:outline-none w-full"
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                            >
                                <option value="name">Urutkan: Nama A-Z</option>
                                <option value="price_low">Harga: Rendah ke Tinggi</option>
                                <option value="price_high">Harga: Tinggi ke Rendah</option>
                                <option value="newest">Terbaru</option>
                            </select>
                        </div>
                    </div>

                    {/* Products Grid with loading */}
                    {isProductsLoading ? (
                        <div className="flex justify-center py-20">
                            <div className="loading loading-spinner loading-lg text-[#ED775A]"></div>
                        </div>
                    ) : sortedProducts.length > 0 ? (
                        <>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                {displayedProducts.map((product) => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>

                            {/* Loading indicator for infinite scroll */}
                            {isLoading && (
                                <div className="flex justify-center mt-8">
                                    <div className="loading loading-spinner loading-md text-[#ED775A]"></div>
                                </div>
                            )}

                            {/* Load more message */}
                            {!hasMoreProducts && displayedProducts.length > productsPerLoad && (
                                <div className="text-center mt-8 text-gray-500">
                                    <p>Semua produk telah ditampilkan</p>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="text-center py-20">
                            <FiShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-gray-600 mb-2">Tidak Ada Produk</h3>
                            <p className="text-gray-500">
                                {selectedCategory === "all"
                                    ? "Toko ini belum memiliki produk"
                                    : `Tidak ada produk dalam kategori \"${selectedCategory}\"`}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <Footer />
        </div>
    );
}