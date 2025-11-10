'use client'
import { useSelector } from 'react-redux'
import ProductCard from "../product/Card";
import Link from "next/link";

const BestSelling = () => {

    const displayQuantity = 8
    const products = useSelector(state => state.product.list)

    return (
        <div>
            {/* <Title title='Best Selling' description={`Showing ${products.length < displayQuantity ? products.length : displayQuantity} of ${products.length} products`} href='/shop' /> */}
            {/* Products Section */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <div className="flex items-center justify-center gap-3 mb-4">
                            <h2 className="text-4xl font-bold text-gray-900">Produk Terlaku</h2>
                        </div>
                        <p className="text-xl text-gray-600">Produk pilihan yang paling diminati pelanggan SMART</p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 overflow-x-auto scrollbar-hide px-1 py-2">
                        {products.length > 0 ? (
                            <>
                                {products.slice().sort((a, b) => b.rating.length - a.rating.length).slice(0, displayQuantity).map((product, index) => (
                                    <ProductCard key={index} product={product} />
                                ))}
                                {/* Only show the 'Lihat Semua Produk Terlaku' card after products are rendered */}
                                {products.length > 0 && (
                                    <Link href="/pages/marketplace" passHref className="card bg-gradient-to-br from-[#84994F] to-[#476EAE] text-white flex flex-col justify-center items-center space-y-4 transition-all duration-300 hover:-translate-y-1 cursor-pointer" >
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
                                    </Link>
                                )}
                            </>
                        ) : (
                            <p className="text-gray-500 text-center col-span-full">
                                Belum ada produk
                            </p>
                        )}
                    </div>
                </div>
            </section>

            </div>
    )
}

export default BestSelling