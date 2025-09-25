"use client";

import { useEffect, useState } from "react";
import Navbar from "../navbar/Navbar";
import Footer from "../footer/Footer";
import { fetchProducts } from "../../api";
import ProductCard from "../product/Card";

export default function LandingPage() {
    const [products, setProducts] = useState([]);
    const [countdown, setCountdown] = useState("23:59:45");
    const [precomputedFlashSales, setPrecomputedFlashSales] = useState([]);
    const [precomputedProducts, setPrecomputedProducts] = useState([]);

    const flashSales = [
        {
            ID: 1,
            nama_produk: "Flash Sale Product 1",
            harga: 25000,
            discount: 10, // 10% discount
            image: "1",
        },
        {
            ID: 2,
            nama_produk: "Flash Sale Product 2",
            harga: 30000,
            discount: 15, // 15% discount
            image: "2",
        },
        {
            ID: 3,
            nama_produk: "Flash Sale Product 3",
            harga: 20000,
            discount: 20, // 20% discount
            image: "3",
        },
        {
            ID: 4,
            nama_produk: "Flash Sale Product 4",
            harga: 15000,
            discount: 5, // 5% discount
            image: "4",
        },
    ];

    useEffect(() => {
        const loadProducts = async () => {
            try {
                const data = await fetchProducts();
                if (data && Array.isArray(data.products)) {
                    setProducts(data.products);
                } else {
                    console.error("Unexpected data format:", data);
                }
            } catch (error) {
                console.error("Failed to fetch products:", error);
            }
        };

        loadProducts();
    }, []);

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

    useEffect(() => {
        const computedSales = flashSales.map((product) => {
            const discountedPrice = product.harga - (product.harga * product.discount) / 100;
            const rating = Math.floor(Math.random() * 3) + 3; // 3–5 stars
            const reviews = Math.floor(Math.random() * 200) + 20;

            return {
                ...product,
                discountedPrice,
                rating,
                reviews,
            };
        });
        setPrecomputedFlashSales(computedSales);
    }, []);

    useEffect(() => {
        const precomputed = products.map((product) => {
            const rating = Math.floor(Math.random() * 3) + 3; // 3–5 stars
            const reviews = Math.floor(Math.random() * 200) + 20;

            return {
                ...product,
                rating,
                reviews,
            };
        });
        setPrecomputedProducts(precomputed);
    }, [products]);

    return (
        <div className="min-h-screen bg-white">
            <Navbar />

            {/* Hero Section */}
            <section className="bg-gradient-to-br from-[#ED775A] to-[#FFE797] py-16">
                <div className="max-w-7xl mx-auto px-4 my-5 sm:px-6 lg:px-8">
                    <div className="flex flex-col lg:flex-row gap-8">
                        <div className="hero bg-gradient-to-r from-white/20 to-white/10 backdrop-blur-sm rounded-xl lg:w-[70%] min-h-96 shadow-2xl border border-white/20">
                            <div className="hero-content text-center">
                                <div className="max-w-md">
                                    <h1 className="text-5xl font-bold text-white drop-shadow-lg">SMART</h1>
                                    <p className="py-6 text-white/90 text-lg font-medium">
                                        Platform jual beli online terpercaya untuk masyarakat Sukmajaya. 
                                        Temukan produk lokal berkualitas dari penjual terverifikasi!
                                    </p>
                                    <button className="btn btn-lg bg-white text-[#ED775A] hover:bg-white/90 border-none shadow-lg">
                                        Mulai Belanja Sekarang
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="card bg-gradient-to-br from-[#476EAE] to-[#84994F] shadow-2xl lg:w-[30%] text-white border border-white/20">
                            <div className="card-body items-center text-center">
                                <div className="badge badge-warning badge-lg mb-4">✨ Promo Spesial</div>
                                <h2 className="card-title text-2xl mb-4">Flash Sale Hari Ini!</h2>
                                <p className="text-white/90 mb-4">Diskon hingga 50% untuk produk pilihan dari lapak terverifikasi</p>
                                <div className="card-actions">
                                    <button className="btn bg-[#FFE797] text-[#476EAE] hover:bg-[#FFE797]/90 border-none">
                                        Lihat Promo
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Categories Section */}
            <section className="py-16 bg-gradient-to-b from-white to-gray-50 mt-5">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">Cari berdasarkan Kategori</h2>
                        <p className="text-xl text-gray-600">Temukan produk lokal berkualitas dari berbagai kategori</p>
                        <div className="flex justify-center mt-6 space-x-2">
                            <button className="btn btn-circle bg-[#ED775A] hover:bg-[#ED775A]/80 text-white border-none shadow-lg scroll-left">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                                </svg>
                            </button>
                            <button className="btn btn-circle bg-[#ED775A] hover:bg-[#ED775A]/80 text-white border-none shadow-lg scroll-right">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                                </svg>
                            </button>
                        </div>
                    </div>
                    <div className="relative">
                        <div className="flex scrollbar-hide gap-6 pb-4 scroll-container overflow-x-hidden">
                            <div className="card bg-white mx-1 my-3 hover:cursor-pointer w-[280px] min-w-[280px] flex-shrink-0 hover:-translate-y-2 transition-all duration-500 border border-[#FFE797]/30">
                                <figure className="relative overflow-hidden">
                                    <img src="/images/categories/local.jpg" alt="Kerajinan Lokal" className="h-48 w-full object-cover transition-transform duration-500 hover:scale-110" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                                    <div className="badge badge-warning absolute top-4 right-4">🏆 Unggulan</div>
                                </figure>
                                <div className="card-body text-center">
                                    <h3 className="card-title justify-center text-lg font-bold text-[#84994F]">Kerajinan Lokal</h3>
                                    <p className="text-gray-600 text-sm">Produk khas Sukmajaya</p>
                                </div>
                            </div>
                            <div className="card bg-white mx-1 my-3 hover:cursor-pointer w-[280px] min-w-[280px] flex-shrink-0 hover:-translate-y-2 transition-all duration-500 border border-[#476EAE]/30">
                                <figure className="relative overflow-hidden">
                                    <img src="/images/categories/food.jpg" alt="Makanan & Minuman" className="h-48 w-full object-cover transition-transform duration-500 hover:scale-110" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                                    <div className="badge bg-[#476EAE] text-white border-none absolute top-4 right-4">🍽️ Fresh</div>
                                </figure>
                                <div className="card-body text-center">
                                    <h3 className="card-title justify-center text-lg font-bold text-[#476EAE]">Makanan & Minuman</h3>
                                    <p className="text-gray-600 text-sm">Kuliner lokal terbaik</p>
                                </div>
                            </div>
                            <div className="card bg-white mx-1 my-3 hover:cursor-pointer w-[280px] min-w-[280px] flex-shrink-0 hover:-translate-y-2 transition-all duration-500 border border-[#ED775A]/30">
                                <figure className="relative overflow-hidden">
                                    <img src="/images/categories/clothes.jpg" alt="Pakaian" className="h-48 w-full object-cover transition-transform duration-500 hover:scale-110" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                                    <div className="badge bg-[#ED775A] text-white border-none absolute top-4 right-4">👕 Trendy</div>
                                </figure>
                                <div className="card-body text-center">
                                    <h3 className="card-title justify-center text-lg font-bold text-[#ED775A]">Pakaian</h3>
                                    <p className="text-gray-600 text-sm">Fashion lokal berkualitas</p>
                                </div>
                            </div>
                            <div className="card bg-white mx-1 my-3 hover:cursor-pointer w-[280px] min-w-[280px] flex-shrink-0 hover:-translate-y-2 transition-all duration-500 border border-[#84994F]/30">
                                <figure className="relative overflow-hidden">
                                    <img src="/images/categories/dailies.jpg" alt="Kebutuhan Harian" className="h-48 w-full object-cover transition-transform duration-500 hover:scale-110" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                                    <div className="badge bg-[#84994F] text-white border-none absolute top-4 right-4">🏠 Daily</div>
                                </figure>
                                <div className="card-body text-center">
                                    <h3 className="card-title justify-center text-lg font-bold text-[#84994F]">Kebutuhan Harian</h3>
                                    <p className="text-gray-600 text-sm">Lengkapi kebutuhan rumah</p>
                                </div>
                            </div>
                            <div className="card bg-white mx-1 my-3 hover:cursor-pointer w-[280px] min-w-[280px] flex-shrink-0 hover:-translate-y-2 transition-all duration-500 border border-[#476EAE]/30">
                                <figure className="relative overflow-hidden">
                                    <img src="/images/categories/drugs.jpg" alt="Kesehatan & Kecantikan" className="h-48 w-full object-cover transition-transform duration-500 hover:scale-110" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                                    <div className="badge bg-[#476EAE] text-white border-none absolute top-4 right-4">💄 Beauty</div>
                                </figure>
                                <div className="card-body text-center">
                                    <h3 className="card-title justify-center text-lg font-bold text-[#476EAE]">Kesehatan & Kecantikan</h3>
                                    <p className="text-gray-600 text-sm">Produk perawatan terpercaya</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Flash Sale Section */}
            <section className="py-16 bg-gradient-to-r from-[#ED775A] to-[#FFE797]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <div className="flex items-center justify-center gap-4 mb-4">
                            <div className="badge badge-lg bg-red-500 text-white border-none animate-pulse">🔥 HOT</div>
                            <h2 className="text-4xl font-bold text-white drop-shadow-lg">FLASH SALE</h2>
                            <div className="badge badge-lg bg-red-500 text-white border-none animate-pulse">⚡ SALE</div>
                        </div>
                        <p className="text-xl text-white/90 font-medium">Buruan! Penawaran terbatas waktu dengan diskon fantastis</p>
                        <div className="flex justify-center mt-4">
                            <div className="stats shadow-lg bg-white/20 backdrop-blur-sm border border-white/30">
                                <div className="stat place-items-center ">
                                    <div className="stat-title text-white/80">Berakhir dalam</div>
                                    <div className="stat-value text-white text-2xl w-30">{countdown}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-6 px-1 py-2">
                        {precomputedFlashSales.map((product) => (
                            <div
                                key={product.ID}
                                className="card bg-white outline-1 hover:cursor-pointer outline-gray-200 hover:-translate-y-1 transition-transform duration-400"
                            >
                                <figure className="relative">
                                    <img
                                        src={`https://backend-go-gin-production.up.railway.app/uploads/products/${product.image}/1.jpg`}
                                        alt={product.nama_produk}
                                        className="w-full h-50 object-cover"
                                    />
                                    <div className="badge badge-primary absolute top-2 right-2">
                                        -{product.discount}%
                                    </div>
                                </figure>

                                <div className="card-body px-3">
                                    <h2 className="card-title text-sm md:text-base">
                                        {product.nama_produk}
                                    </h2>

                                    {/* Rating + reviews */}
                                    <div className="flex items-center gap-2">
                                        <div className="rating rating-sm">
                                            {Array.from({ length: 5 }).map((_, i) => (
                                                <input
                                                    key={i}
                                                    type="radio"
                                                    name={`rating-${product.ID}`}
                                                    className="mask mask-star-2 bg-orange-400"
                                                    defaultChecked={i < product.rating}
                                                />
                                            ))}
                                        </div>
                                        <span className="text-xs text-gray-500">
                                            ({product.reviews} reviews)
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <span className="text-red-500 font-bold">
                                            Rp {product.discountedPrice.toLocaleString("id-ID")}
                                        </span>
                                        <span className="text-gray-400 line-through text-sm">
                                            Rp {product.harga.toLocaleString("id-ID")}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                        <div className="card bg-gradient-to-br from-white to-[#FFE797]/30 border border-white/50 flex flex-col justify-center items-center space-y-4  transition-all duration-300 hover:-translate-y-1">
                            <div className="text-center">
                                <div className="text-3xl mb-2">🛍️</div>
                                <span className="text-[#ED775A] font-bold text-lg mx-8 text-center block mb-2">
                                    Lihat Semua Produk Flash Sale
                                </span>
                                <p className="text-gray-600 text-sm">Jangan sampai terlewat!</p>
                            </div>
                            <button 
                                className="btn btn-circle bg-[#ED775A] hover:bg-[#ED775A]/80 text-white border-none shadow-lg"
                                onClick={() => window.location.href = '/flash-sale'}
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            <div className="bg-gradient-to-b from-gray-50 to-white">
                {/* Products Section */}
                <section className="py-20">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <div className="flex items-center justify-center gap-3 mb-4">
                                <div className="badge badge-lg bg-[#84994F] text-white border-none">🏆 Populer</div>
                                <h2 className="text-4xl font-bold text-gray-900">Produk Terlaku</h2>
                                <div className="badge badge-lg bg-[#84994F] text-white border-none">⭐ Best</div>
                            </div>
                            <p className="text-xl text-gray-600">Produk pilihan yang paling diminati pelanggan SMART</p>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 overflow-x-auto scrollbar-hide px-1 py-2">
                            {precomputedProducts.length > 0 ? (
                                precomputedProducts.slice(0, 4).map((product) => (
                                    <ProductCard key={product.ID} product={product} />
                                ))
                            ) : (
                                <p className="text-gray-500 text-center col-span-full">
                                    No products available
                                </p>
                            )}
                            <div className="card bg-gradient-to-br from-[#84994F] to-[#476EAE] text-white flex flex-col justify-center items-center space-y-4 transition-all duration-300 hover:-translate-y-1">
                                <div className="text-center">
                                    <div className="text-3xl mb-2">📈</div>
                                    <span className="text-white font-bold text-lg mx-8 text-center block mb-2">
                                        Lihat Semua Produk Terlaku
                                    </span>
                                    <p className="text-white/80 text-sm">Trending sekarang!</p>
                                </div>
                                <button className="btn btn-circle bg-white text-[#84994F] hover:bg-white/90 border-none shadow-lg">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Recommendations Section */}
                <section className="py-20 bg-gradient-to-b from-white to-[#FFE797]/10">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <div className="flex items-center justify-center gap-3 mb-4">
                                <div className="badge badge-lg bg-[#476EAE] text-white border-none">🎯 Personal</div>
                                <h2 className="text-4xl font-bold text-gray-900">Rekomendasi Untukmu</h2>
                                <div className="badge badge-lg bg-[#476EAE] text-white border-none">✨ Smart</div>
                            </div>
                            <p className="text-xl text-gray-600">Dipilih khusus berdasarkan preferensi dan minat Anda</p>
                        </div>
                        <div className="grid grid-cols-2 grid-rows-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
                            {precomputedProducts.slice(0, 10).map((product) => (
                                <div
                                    key={product.ID}
                                    className="card bg-white outline-1 hover:cursor-pointer outline-gray-200 hover:-translate-y-1 transition-transform duration-400"
                                >
                                    <figure className="relative">
                                        <img
                                            src={`https://backend-go-gin-production.up.railway.app/uploads/products/${product.ID}/1.jpg`}
                                            alt={product.nama_produk}
                                            className="w-full h-50 object-cover"
                                        />
                                        <div className="badge badge-warning absolute top-2 right-2">💝 Rekomendasi</div>
                                    </figure>

                                    <div className="card-body px-3">
                                        <h2 className="card-title text-sm md:text-base">
                                            {product.nama_produk}
                                        </h2>

                                        {/* Rating + reviews */}
                                        <div className="flex items-center gap-2">
                                            <div className="rating rating-sm">
                                                {Array.from({ length: 5 }).map((_, i) => (
                                                    <input
                                                        key={i}
                                                        type="radio"
                                                        name={`rating-rec-${product.ID}`}
                                                        className="mask mask-star-2 bg-orange-400"
                                                        defaultChecked={i < product.rating}
                                                    />
                                                ))}
                                            </div>
                                            <span className="text-xs text-gray-500">
                                                ({product.reviews} reviews)
                                            </span>
                                        </div>

                                        <p className="text-gray-600">
                                            Rp {product.harga.toLocaleString("id-ID")}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

            </div>


            {/* Information Section */}
            <section className="py-24 bg-gradient-to-br from-white via-[#FFE797]/5 to-[#84994F]/5">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-20">
                        <div className="flex items-center justify-center gap-4 mb-6">
                            <div className="badge badge-lg bg-gradient-to-r from-[#ED775A] to-[#FFE797] text-white border-none">🚀 Unggulan</div>
                            <h2 className="text-5xl font-bold bg-gradient-to-r from-[#ED775A] to-[#476EAE] bg-clip-text text-transparent">Mengapa Memilih SMART?</h2>
                            <div className="badge badge-lg bg-gradient-to-r from-[#84994F] to-[#476EAE] text-white border-none">✨ Terpercaya</div>
                        </div>
                        <p className="text-2xl text-gray-600 font-medium">Platform terpercaya untuk ekonomi digital Sukmajaya</p>
                        <div className="divider divider-warning w-24 mx-auto mt-8"></div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
                        {/* Seller Info Card */}
                        <div className="card bg-gradient-to-br from-[#84994F]/15 to-[#84994F]/5 shadow-2xl border border-[#84994F]/30 hover:shadow-3xl transition-all duration-500 hover:-translate-y-2">
                            <div className="card-body p-10">
                                <div className="flex gap-6 mb-8 items-center">
                                    <span className="text-5xl">🏪</span>
                                    <div>
                                        <h2 className="text-3xl font-bold bg-gradient-to-r from-[#84994F] to-[#476EAE] bg-clip-text text-transparent">Untuk Seller</h2>
                                        <p className="text-[#84994F] font-medium">Wujudkan impian bisnis Anda</p>
                                    </div>
                                </div>

                                <p className="text-gray-700 mb-6 leading-relaxed text-lg">
                                    Bergabunglah sebagai <span className="font-bold text-[#84994F] bg-[#84994F]/10 px-2 py-1 rounded">SMART Seller</span> dan nikmati
                                    kemudahan mempromosikan produk Anda ke lebih banyak pelanggan di sekitar Sukmajaya.
                                </p>

                                <div className="divider">
                                    <div className="badge badge-lg bg-[#84994F] text-white border-none">🚀 SMART Pro Benefits</div>
                                </div>

                                <div className="grid gap-4 mb-8">
                                    {[
                                        { icon: "✅", text: "Tanda verifikasi resmi di lapak Anda", color: "success" },
                                        { icon: "⭐", text: "Produk tampil di halaman utama aplikasi", color: "warning" },
                                        { icon: "📈", text: "Akses ke fitur promosi khusus", color: "info" },
                                    ].map((benefit, index) => (
                                        <div key={index} className="alert outline-none border-none shadow-none bg-white ">
                                            <span className="text-2xl">{benefit.icon}</span>
                                            <span className="text-gray-700 font-medium">{benefit.text}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="card-actions justify-center">
                                    <button className="btn btn-lg bg-gradient-to-r from-[#84994F] to-[#476EAE] hover:from-[#84994F]/80 hover:to-[#476EAE]/80 text-white border-none shadow-xl">
                                        <span className="text-lg">🚀</span>
                                        Mulai Jual Sekarang
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Buyer Info Card */}
                        <div className="card bg-gradient-to-br from-[#476EAE]/15 to-[#476EAE]/5 shadow-2xl border border-[#476EAE]/30 hover:shadow-3xl transition-all duration-500 hover:-translate-y-2">
                            <div className="card-body p-10">
                                <div className="flex gap-6 mb-8 items-center">
                                    <span className="text-5xl">🛒</span>
                                    <div>
                                        <h2 className="text-3xl font-bold bg-gradient-to-r from-[#476EAE] to-[#ED775A] bg-clip-text text-transparent">Untuk Pembeli</h2>
                                        <p className="text-[#476EAE] font-medium">Belanja mudah, aman, terpercaya</p>
                                    </div>
                                </div>

                                <p className="text-gray-700 mb-6 leading-relaxed text-lg">
                                    Temukan beragam produk kebutuhan sehari-hari dari penjual lokal mulai dari makanan, kerajinan tangan,
                                    hingga produk fashion dan rumah tangga yang berkualitas.
                                </p>

                                <div className="divider">
                                    <div className="badge badge-lg bg-[#476EAE] text-white border-none">🎁 Promo Eksklusif</div>
                                </div>

                                <div className="grid gap-4 mb-8">
                                    {[
                                        { icon: "💰", text: "Voucher Cashback dari lapak tertentu", color: "success" },
                                        { icon: "🚚", text: "Promo Gratis Ongkir Lokal", color: "warning" },
                                        { icon: "🏷️", text: "Diskon Produk dari lapak berpartisipasi", color: "error" },
                                    ].map((promo, index) => (
                                        <div key={index} className="alert outline-none border-none shadow-none bg-white">
                                            <span className="text-2xl">{promo.icon}</span>
                                            <span className="text-gray-700 font-medium">{promo.text}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="card-actions justify-center">
                                    <button className="btn btn-lg bg-gradient-to-r from-[#476EAE] to-[#ED775A] hover:from-[#476EAE]/80 hover:to-[#ED775A]/80 text-white border-none shadow-xl">
                                        <span className="text-lg">🛍️</span>
                                        Mulai Belanja Sekarang
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="card bg-gradient-to-r from-[#FFE797]/30 via-[#FFE797]/20 to-[#FFE797]/10 shadow-2xl border-2 border-[#FFE797]/50 hover:shadow-3xl transition-all duration-500">
                        <div className="card-body p-12 text-center">
                            <span className="text-6xl">🏆</span>
                            <h2 className="text-4xl font-bold bg-gradient-to-r from-[#ED775A] to-[#476EAE] bg-clip-text text-transparent mb-6">
                                Belanja Aman di Lapak Terverifikasi
                            </h2>
                            <p className="text-gray-700 mb-8 max-w-4xl mx-auto leading-relaxed text-xl">
                                Gunakan fitur <span className="font-bold text-[#ED775A] bg-[#ED775A]/10 px-3 py-1 rounded-full">Lapak Terverifikasi</span> yang sudah dicek
                                tim SMART agar produk terjamin dan berasal dari pelaku usaha lokal terpercaya. Temukan produk khas
                                Sukmajaya dengan kualitas terbaik!
                            </p>

                            <div className="flex flex-wrap justify-center gap-6 mb-8">
                                <div className="stat bg-gradient-to-br from-[#84994F] to-[#84994F]/80 text-white rounded-2xl shadow-xl">
                                    <span className="text-2xl">✓</span>
                                    <div className="stat-title text-white/80">Jaminan</div>
                                    <div className="stat-value text-lg">Produk Original</div>
                                </div>
                                <div className="stat bg-gradient-to-br from-[#476EAE] to-[#476EAE]/80 text-white rounded-2xl shadow-xl">
                                    <span className="text-2xl">🛡️</span>
                                    <div className="stat-title text-white/80">Terpercaya</div>
                                    <div className="stat-value text-lg">Seller Verified</div>
                                </div>
                                <div className="stat bg-gradient-to-br from-[#ED775A] to-[#ED775A]/80 text-white rounded-2xl shadow-xl">
                                    <span className="text-2xl">🏠</span>
                                    <div className="stat-title text-white/80">Lokal</div>
                                    <div className="stat-value text-lg">Khas Sukmajaya</div>
                                </div>
                            </div>

                            <div className="flex justify-center">
                                <button className="btn btn-lg bg-gradient-to-r from-[#ED775A] to-[#FFE797] hover:from-[#ED775A]/80 hover:to-[#FFE797]/80 text-white border-none shadow-xl">
                                    <span className="text-xl">🔍</span>
                                    Cari Lapak Terverifikasi
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>


    );
}