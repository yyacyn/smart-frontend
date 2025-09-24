"use client";

import { useEffect, useState } from "react";
import Navbar from "../navbar/Navbar";
import Footer from "../footer/Footer";
import { fetchProducts } from "../../api";
import ProductCard from "../product/Card";

export default function LandingPage() {
    const [products, setProducts] = useState([]);

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
        const scrollContainer = document.querySelector('.scroll-container');
        const scrollLeftBtn = document.querySelector('.scroll-left');
        const scrollRightBtn = document.querySelector('.scroll-right');

        if (scrollContainer && scrollLeftBtn && scrollRightBtn) {
            scrollLeftBtn.addEventListener('click', () => {
                scrollContainer.scrollBy({ left: -200, behavior: 'smooth' });
            });

            scrollRightBtn.addEventListener('click', () => {
                scrollContainer.scrollBy({ left: 200, behavior: 'smooth' });
            });
        }

        return () => {
            if (scrollLeftBtn) scrollLeftBtn.removeEventListener('click', () => { });
            if (scrollRightBtn) scrollRightBtn.removeEventListener('click', () => { });
        };
    }, []);

    return (
        <div className="min-h-screen bg-white">
            <Navbar />

            {/* Hero Section */}
            <section className="bg-[#ED775A] py-10">
                <div className="max-w-7xl mx-auto px-4 my-5 sm:px-6 lg:px-8">
                    <div className="flex flex-col lg:flex-row gap-4">
                        <div className="bg-gray-200 rounded-lg lg:w-[70%] h-88 flex items-center justify-center">
                            <span className="text-gray-500">Banner Promosi 1</span>
                        </div>
                        <div className="bg-gray-200 rounded-lg h-88 lg:w-[30%] flex items-center justify-center">
                            <span className="text-gray-500">Banner Promosi 2</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Categories Section */}
            <section className="py-12 mt-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ">
                    <div className="flex justify-between items-center mb-4 ">
                        <h2 className="text-2xl font-bold text-gray-900">Cari berdasarkan Kategori</h2>
                        <div className="flex space-x-2">
                            <button className="btn btn-circle bg-[#ED775A] hover:bg-[#e86646] outline-none border-none scroll-left">←</button>
                            <button className="btn btn-circle bg-[#ED775A] hover:bg-[#e86646] outline-none border-none scroll-right">→</button>
                        </div>
                    </div>
                    <div className="relative">
                        <div className="flex scrollbar-hide gap-5 pb-4 scroll-container overflow-x-hidden h-105">
                            <div className="bg-white rounded-lg outline-1 outline-gray-200 mx-1 my-3 hover:cursor-pointer md:w-[250px] flex flex-col items-center justify-center min-w-[250px] flex-shrink-0 hover:-translate-y-1 transition-transform duration-400">
                                <img src="/images/categories/local.jpg" alt="Kerajinan Lokal" className="h-full object-cover rounded-t-lg" />
                                <span className="text-gray-700 my-4 p-2 text-center font-bold">Kerajinan Lokal</span>
                            </div>
                            <div className="bg-white rounded-lg outline-1 outline-gray-200 mx-1 my-3 hover:cursor-pointer md:w-[250px] flex flex-col items-center justify-center min-w-[250px] flex-shrink-0 hover:-translate-y-1 transition-transform duration-400">
                                <img src="/images/categories/food.jpg" alt="Makanan & Minuman" className="h-full object-cover rounded-t-lg" />
                                <span className="text-gray-700 my-4 p-2 text-center">Makanan & Minuman</span>
                            </div>
                            <div className="bg-white rounded-lg outline-1 outline-gray-200 mx-1 my-3 hover:cursor-pointer md:w-[250px] flex flex-col items-center justify-center min-w-[250px] flex-shrink-0 hover:-translate-y-1 transition-transform duration-400">
                                <img src="/images/categories/clothes.jpg" alt="Pakaian" className="h-full object-cover rounded-t-lg" />
                                <span className="text-gray-700 my-4 p-2 text-center">Pakaian</span>
                            </div>
                            <div className="bg-white rounded-lg outline-1 outline-gray-200 mx-1 my-3 hover:cursor-pointer md:w-[250px] flex flex-col items-center justify-center min-w-[250px] flex-shrink-0 hover:-translate-y-1 transition-transform duration-400">
                                <img src="/images/categories/dailies.jpg" alt="Kebutuhan Harian" className="h-full object-cover rounded-t-lg" />
                                <span className="text-gray-700 my-4 p-2 text-center">Kebutuhan Harian</span>
                            </div>
                            <div className="bg-white rounded-lg outline-1 outline-gray-200 mx-1 my-3 hover:cursor-pointer md:w-[250px] flex flex-col items-center justify-center min-w-[250px] flex-shrink-0 hover:-translate-y-1 transition-transform duration-400">
                                <img src="/images/categories/drugs.jpg" alt="Elektronik" className="h-full object-cover rounded-t-lg" />
                                <span className="text-gray-700 my-4 p-2 text-center">Kesehatan & Kecantikan</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Flash Sale Section */}
            <section className="py-4 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-bold text-gray-900">FLASH SALE</h2>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-6 px-1 py-2">
                        {flashSales.map((product) => {
                            const discountedPrice =
                                product.harga - (product.harga * product.discount) / 100;

                            // fake rating + reviews
                            const rating = Math.floor(Math.random() * 3) + 3; // 3–5 stars
                            const reviews = Math.floor(Math.random() * 200) + 20;

                            return (
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
                                                        readOnly
                                                        checked={i < rating}
                                                    />
                                                ))}
                                            </div>
                                            <span className="text-xs text-gray-500">
                                                ({reviews} reviews)
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <span className="text-red-500 font-bold">
                                                Rp {discountedPrice.toLocaleString()}
                                            </span>
                                            <span className="text-gray-400 line-through text-sm">
                                                Rp {product.harga.toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        <div className="card bg-[#ED775A] flex flex-col justify-center items-center space-y-2">
                            <span className="text-white mx-8 text-center">
                                Lihat semua produk diskon
                            </span>
                            <button className="btn btn-circle hover:bg-gray-100 bg-white text-[#ED775A] outline-none border-none scroll-right">
                                →
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            <div className="bg-gray-200">
                {/* Products Section */}
                <section className="py-15 mt-15">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-8">Produk Terlaku</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 overflow-x-auto scrollbar-hide px-1 py-2">
                            {products.length > 0 ? (
                                products.slice(0, 4).map((product) => (
                                    <ProductCard key={product.ID} product={product} />
                                ))
                            ) : (
                                <p className="text-gray-500 text-center col-span-full">
                                    No products available
                                </p>
                            )}
                            <div className="card bg-[#ED775A] flex flex-col justify-center items-center space-y-2">
                                <span className="text-white mx-8 text-center">
                                    Lihat semua produk terlaku
                                </span>
                                <button className="btn btn-circle hover:bg-gray-100 bg-white text-[#ED775A] outline-none border-none scroll-right">
                                    →
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Recommendations Section */}
                <section className="py-12 ">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-8">Rekomendasi untukmu</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                            {/* Recommendations content */}
                        </div>
                    </div>
                </section>

            </div>
        

            {/* Information Section */}
            <section className="py-12 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        {/* Information content */}
                    </div>
                </div>
            </section>

            <Footer />
        </div>


    );
}