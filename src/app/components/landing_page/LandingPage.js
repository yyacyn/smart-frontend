"use client";

import { useEffect, useState } from "react";
import Navbar from "../navbar/Navbar";
import Footer from "../footer/Footer";
import { fetchProducts } from "../../api";

export default function LandingPage() {
    const [products, setProducts] = useState([]);

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
            if (scrollLeftBtn) scrollLeftBtn.removeEventListener('click', () => {});
            if (scrollRightBtn) scrollRightBtn.removeEventListener('click', () => {});
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
            <section className="py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ">
                    <div className="flex justify-between items-center mb-4 ">
                        <h2 className="text-2xl font-bold text-gray-900">Cari berdasarkan Kategori</h2>
                        <div className="flex space-x-2">
                            <button className="btn btn-circle bg-[#ED775A] outline-none border-none scroll-left">←</button>
                            <button className="btn btn-circle bg-[#ED775A] outline-none border-none scroll-right">→</button>
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
                                <span className="text-gray-700 my-4 p-2 text-center">Elektronik</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Flash Sale Section */}
            <section className="py-12 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-bold text-gray-900">FLASH SALE</h2>
                        <div className="bg-orange-500 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
                            <span>Lihat semua</span>
                            <span>→</span>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {/* Flash sale products */}
                    </div>
                </div>
            </section>

            {/* Products Section */}
            <section className="py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-8">Produk Terbaru</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                        {products.length > 0 ? (
                            products.map((product) => (
                                <div key={product.ID} className="bg-white rounded-lg shadow-md flex flex-col items-center justify-center p-4">
                                    <img src={`https://backend-go-gin-production.up.railway.app/uploads/products/${product.ID}/1.jpg`} alt={product.nama_produk} className="w-full h-32 object-cover rounded-t-lg" />
                                    <span className="text-gray-700 mt-4 text-center font-bold">{product.nama_produk}</span>
                                    <span className="text-gray-500 mt-2 text-center">Rp {product.harga.toLocaleString()}</span>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500 text-center col-span-full">No products available</p>
                        )}
                    </div>
                </div>
            </section>

            {/* Recommendations Section */}
            <section className="py-12 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-8">Rekomendasi untukmu</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                        {/* Recommendations content */}
                    </div>
                </div>
            </section>

            {/* Information Section */}
            <section className="py-12 bg-gray-100">
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