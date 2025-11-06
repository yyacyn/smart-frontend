"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "../../components/navbar/Navbar";
import Footer from "../../components/footer/Footer";
import ProductCard from "@/app/components/product/Card2";
import { sampleProducts, flashSales, recommendedProducts } from "../../data/products";
import BestSelling from "@/app/components/landing_page/BestSelling";
import CTA from "@/app/components/CTA";

export default function LandingPage() {
    const router = useRouter();
    const [products, setProducts] = useState([]);
    const [countdown, setCountdown] = useState("23:59:45");
    const [precomputedFlashSales, setPrecomputedFlashSales] = useState([]);
    const [precomputedProducts, setPrecomputedProducts] = useState([]);
    const [recommendedProductsList, setRecommendedProductsList] = useState([]);

    useEffect(() => {
        setProducts(sampleProducts);
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


    // Category click handler
    const handleCategoryClick = (category) => {
        router.push(`/pages/marketplace?category=${encodeURIComponent(category)}`);
    };

    useEffect(() => {
        setPrecomputedFlashSales(flashSales);
    }, []);

    useEffect(() => {
        setPrecomputedProducts(sampleProducts);
    }, []);

    useEffect(() => {
        setRecommendedProductsList(recommendedProducts);
    }, []);

    const handleProductClick = (productId) => {
        router.push(`/product_detail/${productId}`);
    };

    return (
        <div className="min-h-screen bg-white">
            <Navbar />

            {/* Hero Section */}
            <section className="bg-gradient-to-br from-[#ED775A] to-[#FFE797] py-16 mt-16">
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
                            <Link href={`/pages/marketplace?category=${encodeURIComponent('Kerajinan Lokal')}`} target="_blank" className="card bg-white mx-1 my-3 hover:cursor-pointer w-[280px] min-w-[280px] flex-shrink-0 hover:-translate-y-2 transition-all duration-500 border border-[#FFE797]/30">
                                <figure className="relative overflow-hidden h-full w-full">
                                    <img
                                        src="/images/categories/local.jpg"
                                        alt="Kerajinan Lokal"
                                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                                </figure>
                                <div className="card-body text-center py-2">
                                    <h3 className="card-title justify-center text-lg font-bold text-[#84994F]">Kerajinan Lokal</h3>
                                </div>
                            </Link>
                            <Link href={`/pages/marketplace?category=${encodeURIComponent('Makanan & Minuman')}`} target="_blank" className="card bg-white mx-1 h-[400px] my-3 hover:cursor-pointer w-[280px] min-w-[280px] flex-shrink-0 hover:-translate-y-2 transition-all duration-500 border border-[#476EAE]/30">
                                <figure className="relative overflow-hidden h-full w-full">
                                    <img src="/images/categories/food.jpg" alt="Makanan & Minuman" className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                                </figure>
                                <div className="card-body text-center py-2">
                                    <h3 className="card-title justify-center text-lg font-bold text-[#476EAE]">Makanan & Minuman</h3>
                                </div>
                            </Link>
                            <Link href={`/pages/marketplace?category=${encodeURIComponent('Pakaian')}`} target="_blank" className="card bg-white mx-1 my-3 hover:cursor-pointer w-[280px] min-w-[280px] flex-shrink-0 hover:-translate-y-2 transition-all duration-500 border border-[#ED775A]/30">
                                <figure className="relative overflow-hidden h-full w-full">
                                    <img src="/images/categories/clothes.jpg" alt="Pakaian" className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                                </figure>
                                <div className="card-body text-center py-2">
                                    <h3 className="card-title justify-center text-lg font-bold text-[#ED775A]">Pakaian</h3>
                                </div>
                            </Link>
                            <Link href={`/pages/marketplace?category=${encodeURIComponent('Kebutuhan Harian')}`} target="_blank" className="card bg-white mx-1 my-3 hover:cursor-pointer w-[280px] min-w-[280px] flex-shrink-0 hover:-translate-y-2 transition-all duration-500 border border-[#84994F]/30">
                                <figure className="relative overflow-hidden h-full w-full">
                                    <img src="/images/categories/dailies.jpg" alt="Kebutuhan Harian" className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                                </figure>
                                <div className="card-body text-center py-2">
                                    <h3 className="card-title justify-center text-lg font-bold text-[#84994F]">Kebutuhan Harian</h3>
                                </div>
                            </Link>

                            <Link href={`/pages/marketplace?category=${encodeURIComponent('Kesehatan & Kecantikan')}`} target="_blank" className="card bg-white mx-1 my-3 hover:cursor-pointer w-[280px] min-w-[280px] flex-shrink-0 hover:-translate-y-2 transition-all duration-500 border border-[#476EAE]/30">
                                <figure className="relative overflow-hidden h-full w-full">
                                    <img src="/images/categories/drugs.jpg" alt="Kesehatan & Kecantikan" className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                                </figure>
                                <div className="card-body text-center py-2">
                                    <h3 className="card-title justify-center text-lg font-bold text-[#476EAE]">Kesehatan & Kecantikan</h3>
                                </div>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Flash Sale Section */}
            <section className="py-16 bg-gradient-to-r from-[#ED775A] to-[#FFE797]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <div className="flex items-center justify-center gap-4 mb-4">
                            <h2 className="text-4xl font-bold text-white drop-shadow-lg">FLASH SALE</h2>
                        </div>
                        <p className="text-xl text-white/90 font-medium">Buruan! Penawaran terbatas waktu dengan diskon fantastis</p>
                        <div className="flex justify-center mt-4">
                            <div className="stats shadow-lg bg-white/20 backdrop-blur-sm border border-white/30">
                                <div className="stat place-items-center">
                                    <div className="stat-title text-white/80">Berakhir dalam</div>
                                    <div className="stat-value text-white text-2xl w-30">{countdown}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-6 px-1 py-2">
                        {precomputedFlashSales.slice(0, 4).map((product) => (
                            <ProductCard
                                key={product.ID}
                                product={product}
                            />
                        ))}
                        <div className="card bg-gradient-to-br from-white to-[#FFE797]/30 border border-white/50 flex flex-col justify-center items-center space-y-4 transition-all duration-300 hover:-translate-y-1">
                            <div className="text-center">
                                <div className="text-3xl mb-2">🛍️</div>
                                <span className="text-[#ED775A] font-bold text-lg mx-8 text-center block mb-2">
                                    Lihat Semua Produk Flash Sale
                                </span>
                                <p className="text-gray-600 text-sm">Jangan sampai terlewat!</p>
                            </div>
                            <Link href={{ pathname: '/pages/marketplace', query: { discount: 'true' } }} className="btn btn-primary">
                                Lihat Semua
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            <div className="bg-gradient-to-b from-gray-50 to-white">
                <BestSelling />

                {/* Recommendations Section */}
                <section className="py-20 bg-gradient-to-b from-white to-[#FFE797]/10">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <div className="flex items-center justify-center gap-3 mb-4">
                                <h2 className="text-4xl font-bold text-gray-900">Rekomendasi Untukmu</h2>
                            </div>
                            <p className="text-xl text-gray-600">Dipilih khusus berdasarkan preferensi dan minat Anda</p>
                        </div>
                        <div className="grid grid-cols-2 grid-rows-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
                            {(Array.isArray(recommendedProductsList) ? recommendedProductsList : []).map((product) => (
                                <ProductCard
                                    key={product?.ID ?? Math.random()}
                                    product={product}
                                />
                            ))}
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