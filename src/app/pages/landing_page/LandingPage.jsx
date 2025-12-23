"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "../../components/navbar/Navbar";
import Footer from "../../components/footer/Footer";
import ProductCard from "@/app/components/product/Card";
import { flashSales, recommendedProducts } from "../../data/products";
import { fetchProducts, fetchCategories } from "../../api";
import CTA from "@/app/components/CTA";
import { useGlobalData } from "../../contexts/GlobalDataContext";
import { FiZap, FiShoppingBag, FiShoppingCart, FiTrendingUp, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

export default function LandingPage() {
    const router = useRouter();
    const [countdown, setCountdown] = useState("23:59:45");
    const [precomputedFlashSales, setPrecomputedFlashSales] = useState([]);
    const [precomputedProducts, setPrecomputedProducts] = useState([]);
    const [recommendedProductsList, setRecommendedProductsList] = useState([]);
    const [categories, setCategories] = useState([]);
    const [categoriesLoading, setCategoriesLoading] = useState(true);
    const { cachedProducts, cachedCategories, loading: globalLoading } = useGlobalData();

    useEffect(() => {
        if (cachedProducts) {
            // Filter products to only include those with discounts (mrp > price)
            const discountedProducts = cachedProducts.filter(product =>
                product.mrp != null && product.price != null && product.mrp > product.price
            );
            setPrecomputedFlashSales(discountedProducts);

            // Use all available products for best selling and recommendations
            setPrecomputedProducts(cachedProducts);
            setRecommendedProductsList(cachedProducts);
        }
    }, [cachedProducts]);

    useEffect(() => {
        if (cachedCategories !== undefined && cachedCategories !== null) {
            // Use cached categories if available
            if (Array.isArray(cachedCategories)) {
                setCategories(cachedCategories);
                setCategoriesLoading(false);
            } else {
                fetchCategoriesFromAPI();
            }
        } else {
            fetchCategoriesFromAPI();
        }
    }, [cachedCategories]);

    const fetchCategoriesFromAPI = async () => {
        setCategoriesLoading(true);
        try {
            const data = await fetchCategories();
            if (data && data.success && Array.isArray(data.data)) {
                setCategories(data.data);
            } else {
                setCategories([]);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
            setCategories([]);
        } finally {
            setCategoriesLoading(false);
        }
    };

    useEffect(() => {
        const targetTime = new Date();
        targetTime.setHours(23, 59, 59, 999); // Set target time to 23:59:59 of the current day

        const interval = setInterval(() => {
            const now = new Date();
            const timeLeft = targetTime - now;

            if (timeLeft <= 0) {
                clearInterval(interval);
                setCountdown("00:00:00");
            } else {
                const hours = String(Math.floor((timeLeft / (1000 * 60 * 60)) % 24)).padStart(2, "0");
                const minutes = String(Math.floor((timeLeft / (1000 * 60)) % 60)).padStart(2, "0");
                const seconds = String(Math.floor((timeLeft / 1000) % 60)).padStart(2, "0");
                setCountdown(`${hours}:${minutes}:${seconds}`);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const scrollContainer = document.querySelector('.scroll-container');
        const scrollLeftBtn = document.querySelector('.scroll-left');
        const scrollRightBtn = document.querySelector('.scroll-right');

        if (scrollContainer && scrollLeftBtn && scrollRightBtn) {
            scrollLeftBtn.addEventListener('click', () => {
                scrollContainer.scrollBy({ left: -800, behavior: 'smooth' });
            });

            scrollRightBtn.addEventListener('click', () => {
                scrollContainer.scrollBy({ left: 800, behavior: 'smooth' });
            });
        }

        return () => {
            if (scrollLeftBtn) scrollLeftBtn.removeEventListener('click', () => { });

            if (scrollRightBtn) scrollRightBtn.removeEventListener('click', () => { });
        };
    }, []);


    // Category click handler
    const handleCategoryClick = (category) => {
        router.push(`/pages/marketplace?category=${encodeURIComponent(category)}`);
    };



    // useEffect(() => {
    //     setPrecomputedProducts(sampleProducts);
    // }, []);

    const handleProductClick = (productId) => {
        router.push(`/product_detail/${productId}`);
    };

    return (
        <div className="min-h-screen bg-white">
            <Navbar />

            {/* Hero Section - Modern Design */}
            <section className="bg-gradient-to-br h-screen flex items-center from-indigo-50 via-white to-orange-50 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col lg:flex-row items-center gap-8">
                        {/* Hero Content */}
                        <div className="flex-1 w-full max-w-2xl relative z-10">
                            <div className="space-y-4">
                                <h1 className="text-5xl lg:text-6xl font-bold">
                                    <span className="bg-gradient-to-r from-orange-600 via-orange-500 to-orange-400 bg-clip-text text-transparent">
                                        Belanja Hemat,
                                    </span>
                                    <br />
                                    <span className="text-slate-900">Ekonomi Lokal Kuat</span>
                                </h1>
                                <p className="text-lg text-slate-600 max-w-xl">
                                    Platform jual beli online terpercaya untuk masyarakat Sukmajaya. Temukan produk lokal berkualitas dari penjual terverifikasi!
                                </p>
                                <div className="flex flex-wrap gap-3 pt-4">
                                    <Link href="/pages/marketplace" className="btn bg-[#ED775A] shadow-none hover:bg-[#d86a4a] text-white border-none">
                                        <FiShoppingBag className="w-5 h-5" />
                                        Mulai Belanja
                                    </Link>
                                    <Link href="/pages/addstore" className="btn btn-outline border-[#ED775A] text-[#ED775A] shadow-none hover:bg-[#ED775A] hover:text-white hover:border-[#ED775A]">
                                        Buka Toko
                                    </Link>
                                </div>

                            </div>
                        </div>

                        {/* Hero Visual - Horizontal Scrolling Products */}
                        <div className="flex-1 w-full lg:max-w-none relative z-10">
                            <div className="relative">
                                {/* Main Visual - Horizontal Scrolling */}
                                <div className="bg-white rounded-xl p-3 shadow-2xl border border-slate-100 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-orange-100 to-transparent rounded-bl-full opacity-50"></div>
                                    <div className="space-y-2">
                                        {/* Promo Banner */}
                                        <div className="relative bg-gradient-to-r from-[#ED775A] to-[#FFB347] rounded-lg p-4 text-white overflow-hidden">
                                            <div className="relative z-10 flex justify-between items-center">
                                                <div className="text-white font-bold text-lg">
                                                    Promo Spesial
                                                </div>
                                                <Link href="/pages/marketplace?discount=true" className="btn btn-sm bg-white text-[#ED775A] border-none hover:bg-orange-50 hover:shadow-none shadow-none">
                                                    Lihat Promo
                                                </Link>
                                            </div>
                                            <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-white/10 rounded-full"></div>
                                        </div>

                                        {/* Horizontal Scrolling Products - Bigger */}
                                        <div className="relative flex-1">
                                            <div className="overflow-x-auto scrollbar-hide pb-2 h-full" style={{ minHeight: '270px' }}>
                                                {precomputedFlashSales.length > 0 ? (
                                                    <div className="flex gap-3" id="hero-products-scroll">
                                                        {precomputedFlashSales.slice(0, 3).map((product, idx) => (
                                                            <div key={idx}>
                                                                <Link href={`/pages/product_detail/${product.id}`} className="bg-slate-50 p-3 rounded-xl flex-shrink-0 w-[180px] cursor-pointer hover:bg-orange-50 transition-colors border border-slate-100 flex flex-col">
                                                                    <div className="w-full h-32 bg-white rounded-lg flex items-center justify-center mb-2 overflow-hidden relative">
                                                                        <img src={product.images?.[0] || '/images/default.png'} alt={product.name} className="w-full h-full object-cover" />
                                                                    </div>
                                                                    <div className="flex-1 flex flex-col">
                                                                        <p className="font-bold text-slate-800 text-sm truncate leading-tight mb-2">
                                                                            {product.name || 'Produk'}
                                                                        </p>
                                                                        <div className="mt-auto">
                                                                            <div className="flex items-center gap-2 mb-1">
                                                                                <p className="text-[#ED775A] font-bold text-base leading-none">
                                                                                    Rp {(product.price || 0).toLocaleString("id-ID")}
                                                                                </p>
                                                                                {product.mrp > product.price && (
                                                                                    <span className="badge badge-error badge-sm py-0 px-1.5 text-[9px] font-bold">
                                                                                        -{Math.round(((product.mrp - product.price) / product.mrp) * 100)}%
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                            {product.mrp > product.price && (
                                                                                <p className="text-gray-400 text-xs line-through">
                                                                                    Rp {product.mrp.toLocaleString("id-ID")}
                                                                                </p>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </Link>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="flex gap-3" id="hero-products-scroll">
                                                        {/* Loading skeleton for Hero Products */}
                                                        {Array.from({ length: 5 }).map((_, idx) => (
                                                            <div key={idx} className="bg-slate-50 p-3 rounded-xl flex-shrink-0 w-[180px] border border-slate-100 flex flex-col animate-pulse">
                                                                <div className="w-full h-32 bg-slate-200 rounded-lg mb-2"></div>
                                                                <div className="flex-1 flex flex-col space-y-2">
                                                                    <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                                                                    <div className="h-4 bg-slate-200 rounded w-1/2 mt-auto"></div>
                                                                    <div className="h-3 bg-slate-200 rounded w-1/3"></div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Background decoration */}
                                <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-orange-200/30 to-blue-200/30 rounded-full blur-2xl"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Categories Section */}
            <section className="py-8 bg-gradient-to-b from-white to-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Cari berdasarkan Kategori</h2>
                        <p className="text-sm text-gray-600">Temukan produk lokal berkualitas dari berbagai kategori</p>
                        <div className="flex justify-center mt-4 space-x-2">
                            <button className="btn btn-circle bg-[#ED775A] hover:bg-[#ED775A]/80 text-white border-none shadow-none scroll-left">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                                </svg>
                            </button>
                            <button className="btn btn-circle bg-[#ED775A] hover:bg-[#ED775A]/80 text-white border-none shadow-none scroll-right">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                                </svg>
                            </button>
                        </div>
                    </div>
                    <div className="relative">
                        <div className="flex scrollbar-hide gap-4 pb-2 scroll-container overflow-x-hidden ">
                            {categoriesLoading ? (
                                <div className="flex gap-4 pb-2">
                                    {/* Loading skeleton for Categories */}
                                    {Array.from({ length: 5 }).map((_, idx) => (
                                        <div key={idx} className="card bg-slate-200 mx-1 my-2 w-[200px] min-w-[200px] h-[280px] flex-shrink-0 border border-gray-200 animate-pulse"></div>
                                    ))}
                                </div>
                            ) : categories.length > 0 ? (
                                categories.map((category, index) => (
                                    <Link
                                        key={category.id || index}
                                        href={`/pages/marketplace?category=${encodeURIComponent(category.name)}`}
                                        target="_blank"
                                        className="card bg-white mx-1 my-2 hover:cursor-pointer w-[200px] min-w-[200px] h-[280px] flex-shrink-0 hover:-translate-y-1 transition-all duration-300 border border-gray-200"
                                    >
                                        <figure className="relative overflow-hidden h-full w-full">
                                            <img
                                                src={category.image || "/images/categories/default.jpg"}
                                                alt={category.name}
                                                className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                                        </figure>
                                        <div className="card-body text-center py-1.5">
                                            <h3 className="card-title justify-center text-sm font-bold text-[#84994F]">{category.name}</h3>
                                        </div>
                                    </Link>
                                ))
                            ) : (
                                <div className="text-center text-gray-500 w-full py-8">
                                    <p>No categories found.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Flash Sale Section */}
            <section className="py-10 bg-gradient-to-r from-[#ED775A] to-[#FFE797]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-8">
                        <div className="flex items-center justify-center gap-3 mb-3">
                            <h2 className="text-3xl font-bold text-white drop-shadow-lg">FLASH SALE</h2>
                        </div>
                        <p className="text-base text-white/90 font-medium">Buruan! Penawaran terbatas waktu dengan diskon fantastis</p>
                    </div>
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-4 px-1 py-2">
                        {precomputedFlashSales.length > 0 ? (
                            <>
                                {precomputedFlashSales.slice(0, 5).map((product) => (
                                    <ProductCard
                                        key={product.id || product.ID}
                                        product={product}
                                    />
                                ))}
                                <Link href="/pages/marketplace?discount=true" className="card bg-gradient-to-br from-white to-[#FFE797]/30 border border-white/50 flex flex-col justify-center items-center space-y-2 transition-all duration-300 hover:-translate-y-1 p-3">
                                    <div className="text-center">
                                        <FiShoppingCart className="text-2xl mb-1 mx-auto text-[#ED775A]" />
                                        <span className="text-[#ED775A] font-bold text-xs text-center block mb-1">
                                            Lihat Semua Produk Flash Sale
                                        </span>
                                    </div>
                                    <button className="btn btn-primary btn-xs">
                                        Lihat Semua
                                    </button>
                                </Link>
                            </>
                        ) : (
                            <>
                                {Array.from({ length: 5 }).map((_, idx) => (
                                    <div key={idx} className="card bg-white border border-gray-200 flex flex-col animate-pulse">
                                        <div className="bg-slate-200 h-24 w-full"></div>
                                        <div className="p-2 flex flex-col space-y-2">
                                            <div className="h-3 bg-slate-200 rounded w-11/12"></div>
                                            <div className="h-3 bg-slate-200 rounded w-3/4"></div>
                                            <div className="h-3 bg-slate-200 rounded w-1/2 mt-2"></div>
                                        </div>
                                    </div>
                                ))}
                                <div className="card bg-gradient-to-br from-white to-[#FFE797]/30 border border-white/50 flex flex-col justify-center items-center space-y-2 transition-all duration-300 p-3 animate-pulse">
                                    <div className="text-center">
                                        <div className="bg-slate-200 h-6 w-6 rounded-full mx-auto mb-1"></div>
                                        <div className="bg-slate-200 h-3 rounded w-3/4 mx-auto mb-1"></div>
                                    </div>
                                    <div className="btn btn-primary btn-xs bg-slate-200 border-slate-200">
                                        <div className="bg-slate-300 h-3 w-8 rounded"></div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </section>

            {/* Best Selling Section */}
            <div className="bg-gradient-to-b from-gray-50 to-white">
                <section className="py-12">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-8">
                            <div className="flex items-center justify-center gap-2 mb-2">
                                <h2 className="text-2xl font-bold text-gray-900">Produk Terlaku</h2>
                            </div>
                            <p className="text-sm text-gray-600">Produk pilihan yang paling diminati pelanggan SMART</p>
                        </div>
                        <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-4 overflow-x-auto scrollbar-hide px-1 py-2">
                            {recommendedProductsList.length > 0 ? (
                                <>
                                    {recommendedProductsList.slice().sort((a, b) => {
                                        // Sort by the number of reviewers (length of rating array)
                                        const aRatingCount = Array.isArray(a.rating) ? a.rating.length : 0;
                                        const bRatingCount = Array.isArray(b.rating) ? b.rating.length : 0;
                                        return bRatingCount - aRatingCount;
                                    }).slice(0, 5).map((product, index) => (
                                        <ProductCard key={product.id || product.ID || index} product={product} />
                                    ))}
                                    <Link href="/pages/marketplace" passHref className="card bg-gradient-to-br from-[#84994F] to-[#476EAE] text-white flex flex-col justify-center items-center space-y-2 transition-all duration-300 hover:-translate-y-1 cursor-pointer p-3" >
                                        <div className="text-center">
                                            <FiTrendingUp className="text-2xl mb-1 mx-auto" />
                                            <span className="text-white font-bold text-xs text-center block mb-1">
                                                Lihat Semua Produk Terlaku
                                            </span>
                                        </div>
                                        <button className="btn btn-primary btn-xs">
                                            Lihat Semua
                                        </button>
                                    </Link>
                                </>
                            ) : (
                                <>
                                    {Array.from({ length: 5 }).map((_, idx) => (
                                        <div key={idx} className="card bg-white border border-gray-200 flex flex-col animate-pulse">
                                            <div className="bg-slate-200 h-24 w-full"></div>
                                            <div className="p-2 flex flex-col space-y-2">
                                                <div className="h-3 bg-slate-200 rounded w-11/12"></div>
                                                <div className="h-3 bg-slate-200 rounded w-3/4"></div>
                                                <div className="h-3 bg-slate-200 rounded w-1/2 mt-2"></div>
                                            </div>
                                        </div>
                                    ))}
                                    <div className="card bg-gradient-to-br from-[#84994F] to-[#476EAE] text-white flex flex-col justify-center items-center space-y-2 transition-all duration-300 p-3 animate-pulse">
                                        <div className="text-center">
                                            <div className="bg-slate-200 h-6 w-6 rounded-full mx-auto mb-1"></div>
                                            <div className="bg-slate-200 h-3 rounded w-3/4 mx-auto mb-1"></div>
                                        </div>
                                        <div className="btn btn-circle btn-xs bg-slate-200 border-slate-200">
                                            <div className="bg-slate-300 h-2 w-2 rounded-full"></div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </section>

                {/* Recommendations Section */}
                <section className="py-12 bg-gradient-to-b from-white to-[#FFE797]/10">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-8">
                            <div className="flex items-center justify-center gap-2 mb-2">
                                <h2 className="text-2xl font-bold text-gray-900">Rekomendasi Untukmu</h2>
                            </div>
                            <p className="text-sm text-gray-600">Dipilih khusus berdasarkan preferensi dan minat Anda</p>
                        </div>
                        <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-4">
                            {recommendedProductsList.length > 0 ? (
                                <>
                                    {recommendedProductsList.slice(0, 10).map((product) => (
                                        <ProductCard
                                            key={product.id || product.ID}
                                            product={product}
                                        />
                                    ))}
                                </>
                            ) : (
                                <>
                                    {Array.from({ length: 6 }).map((_, idx) => (
                                        <div key={idx} className="card bg-white border border-gray-200 flex flex-col animate-pulse">
                                            <div className="bg-slate-200 h-24 w-full"></div>
                                            <div className="p-2 flex flex-col space-y-2">
                                                <div className="h-3 bg-slate-200 rounded w-11/12"></div>
                                                <div className="h-3 bg-slate-200 rounded w-3/4"></div>
                                                <div className="h-3 bg-slate-200 rounded w-1/2 mt-2"></div>
                                            </div>
                                        </div>
                                    ))}
                                </>
                            )}
                        </div>
                    </div>
                </section>
            </div>


            {/* Information Section */}
            <section className="py-24 bg-gradient-to-br from-white via-[#FFE797]/5 to-[#84994F]/5">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-left mb-12">
                        {/* ...existing information content... */}
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Nikmati Mudah dan Nyaman Berjualan Online di SMART</h2>
                        <p className="text-md text-gray-700 leading-relaxed mb-8">
                            SMART adalah platform jual beli online khusus untuk wilayah Sukmajaya. Tujuan kami adalah memudahkan masyarakat Sukmajaya dalam melakukan transaksi jual beli secara digital, sekaligus mendukung pertumbuhan ekonomi lokal dengan mempertemukan penjual dan pembeli dalam satu ekosistem online yang terintegrasi.
                        </p>
                        <p className="text-md text-gray-700 leading-relaxed mb-8">
                            Anda memiliki usaha? Saatnya membawa bisnis Anda ke ranah online! Bergabunglah sebagai SMART Seller dan nikmati kemudahan mempromosikan produk Anda ke lebih banyak pelanggan di sekitar Sukmajaya. Proses pendaftarannya sangat mudah cukup isi data diri, buat nama lapak Anda, dan mulai unggah produk.
                        </p>
                        <p className="text-md text-gray-700 leading-relaxed mb-8">
                            Untuk pelaku usaha yang ingin lebih menonjol, kami menyediakan fitur SMART Pro dengan berbagai keuntungan, seperti:
                        </p>
                        <ul className="list-disc list-inside text-left text-md text-gray-700 mb-8">
                            <li>Tanda verifikasi resmi di lapak Anda untuk meningkatkan kepercayaan pembeli.</li>
                            <li>Produk Anda tampil di halaman utama aplikasi.</li>
                            <li>Akses ke fitur promosi khusus yang membantu meningkatkan visibilitas dan penjualan.</li>
                        </ul>
                        <p className="text-md text-gray-700 leading-relaxed mb-8">
                            Ayo, kembangkan usaha Anda bersama komunitas lokal Sukmajaya melalui SMART!
                        </p>
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Belanja Produk Lokal Berkualitas di SMART</h2>
                        <p className="text-md text-gray-700 leading-relaxed mb-8">
                            SMART menghadirkan pengalaman berbelanja online yang lebih dekat dan relevan bagi warga Sukmajaya. Di sini, Anda bisa menemukan beragam produk kebutuhan sehari-hari dari penjual lokal mulai dari makanan, kerajinan tangan, hingga produk fesyen dan rumah tangga.
                        </p>
                        <p className="text-md text-gray-700 leading-relaxed mb-8">
                            Karena SMART belum memiliki sistem pembayaran di dalam aplikasi, proses transaksi dilakukan langsung antara pembeli dan penjual. Anda bisa memilih metode pembayaran yang disepakati bersama, seperti transfer bank atau pembayaran di tempat (COD).
                        </p>
                        <p className="text-md text-gray-700 leading-relaxed mb-8">
                            Pengiriman barang juga dilakukan oleh kurir lokal atau melalui metode yang telah disepakati antara pembeli dan penjual, sehingga prosesnya lebih fleksibel dan efisien.
                        </p>
                        <p className="text-md text-gray-700 leading-relaxed mb-8">
                            Kami memastikan kenyamanan dan keamanan transaksi dengan menyediakan informasi lengkap lapak dan produk, serta sistem komunikasi langsung melalui aplikasi untuk mempermudah interaksi antara penjual dan pembeli.
                        </p>
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Belanja Produk Original dan Khas Sukmajaya di Lapak Terverifikasi SMART</h2>
                        <p className="text-md text-gray-700 leading-relaxed mb-8">
                            Masih ragu belanja online karena takut tertipu? Di SMART, Anda bisa berbelanja dengan tenang lewat fitur Lapak Terverifikasi. Lapak ini telah melewati proses verifikasi oleh tim SMART, sehingga produk yang ditawarkan memiliki kualitas yang lebih terjamin dan berasal dari pelaku usaha lokal terpercaya.
                        </p>
                        <p className="text-md text-gray-700 leading-relaxed mb-8">
                            Temukan produk khas Sukmajaya, mulai dari kuliner tradisional, fesyen dari UMKM lokal, hingga berbagai kebutuhan rumah tangga.
                        </p>
                        <p className="text-md text-gray-700 leading-relaxed mb-8">
                            Untuk membuat belanja Anda lebih menyenangkan, SMART juga menyediakan berbagai promo dan voucher menarik, seperti:
                        </p>
                        <ul className="list-disc list-inside text-left text-md text-gray-700 mb-8">
                            <li>Voucher Cashback (dari lapak tertentu)</li>
                            <li>Promo Gratis Ongkir Lokal (dengan ketentuan tertentu)</li>
                            <li>Diskon Produk dari lapak yang berpartisipasi</li>
                        </ul>
                        <p className="text-md text-gray-700 leading-relaxed">
                            Dukung pelaku usaha lokal dan nikmati pengalaman berbelanja yang lebih personal dengan menggunakan aplikasi SMART Pasar Online Sukmajaya.
                        </p>
                        {/* Buka Toko Button */}
                        <div className="flex justify-center mt-10">
                            <Link href="/pages/addstore" className="btn btn-lg bg-[#ED775A] text-white hover:bg-[#d86a4a] border-none shadow-none rounded-full px-8 py-3 text-xl font-bold transition-all duration-300">
                                Buka Toko di SMART
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
            <Footer />
        </div>


    );
}