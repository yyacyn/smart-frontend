import React from "react";
import Link from "next/link";

export default function ProductCard({ product }) {
    if (!product) {
        return <div className="text-gray-500">Product data is unavailable</div>;
    }

    return (
        <div className="">
            <Link
                href={`/pages/product_detail/${product.ID}`}
            >
                <div className="card bg-white border border-gray-200 rounded-lg hover:cursor-pointer hover:-translate-y-1 transition-transform duration-300">
                    <figure className="relative w-full h-64 overflow-hidden rounded-t-lg">
                        <img
                            src={product.image}
                            alt={product.nama_produk}
                            className="w-full h-full object-cover"
                        />
                        <div className="badge badge-primary absolute top-2 right-2">
                            {product.kategori}
                        </div>
                    </figure>

                    <div className="card-body px-3 py-3">
                        <h2 className="card-title text-sm md:text-base font-semibold text-gray-800 truncate">
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

                        <p className="text-gray-600 mt-2 font-medium truncate">
                            Rp {product.harga.toLocaleString("id-ID")}
                        </p>
                    </div>
                </div>
            </Link>
        </div>
    );
}
