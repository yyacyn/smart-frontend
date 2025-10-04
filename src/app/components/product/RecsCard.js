import React from 'react';
import Link from "next/link";

export default function RecsCard() {
    const recommendedProducts = [
        {
            ID: 0,
            nama_produk: 'Dummy Product',
            harga: 10000,
            discount: 20,
            rating: 4,
            reviews: 34,
            kategori: 'Dummy',
            image: 'https://soccerwearhouse.com/cdn/shop/files/Portugal_2025_Home_Jersey_by_PUMA_-_Cristiano_Ronaldo.jpg?v=1736466474',
        },
    ];

    return (
        <div className="">
            {recommendedProducts.map((product) => (
                <Link
                    key={product.ID}
                    href={{
                        pathname: "/pages/product_detail",
                        query: { id: product.ID }, // you can add more fields here if needed
                    }}
                >
                    <div
                        key={product.ID}
                        className="card bg-white border border-gray-200 rounded-lg hover:cursor-pointer hover:-translate-y-1 transition-transform duration-300"
                    >
                        <figure className="relative w-full h-64 overflow-hidden rounded-t-lg">
                            <img
                                src={product.image}
                                alt={product.nama_produk}
                                className="w-full h-full object-cover"
                            />
                            <div className="badge badge-warning absolute top-2 right-2">
                                💖 Rekomendasi
                            </div>
                        </figure>

                        <div className="card-body px-4 py-3">
                            <h2 className="card-title text-sm md:text-base font-semibold text-gray-800">
                                {product.nama_produk}
                            </h2>

                            <div className="flex items-center gap-2 mt-2">
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

                            <p className="text-gray-600 mt-2 font-medium">
                                Rp {product.harga.toLocaleString("id-ID")}
                            </p>
                        </div>
                    </div>
                </Link>
            ))}
        </div>
    );
}