import React from 'react';
import Image from 'next/image'
import Link from "next/link";


export default function ProductCard({ product }) {
    // Calculate discounted price
    const hasDiscount = product.mrp != null && product.mrp > 0;
    const discountedPrice = hasDiscount
        ? Math.round((product.mrp - product.price) / (product.mrp) * 100)
        : product.price;

    const ratingArr = Array.isArray(product.rating) ? product.rating : [];
    const rating = ratingArr.length > 0
        ? Math.round(ratingArr.reduce((acc, curr) => acc + curr.rating, 0) / ratingArr.length)
        : 0;

    return (
        <div className="">
            <Link href={`/pages/product_detail/${product.id}`}>
                <div
                    className="card bg-white border border-gray-200 rounded-lg hover:cursor-pointer hover:-translate-y-1 transition-transform duration-300"
                >
                    <figure className="relative w-full h-64 overflow-hidden rounded-t-lg">
                        <Image
                            width={500}
                            height={500}
                            src={
                                Array.isArray(product.images) && product.images.length > 0
                                    ? product.images[0].startsWith("http")
                                        ? product.images[0]
                                        : `/article/${product.images[0]}`
                                    : "/images/default.png"
                            }
                            alt={product.name || "Product image"}
                            className="w-full h-full object-cover"
                        />
                        <div className="badge badge-primary absolute top-2 right-2">
                            {product.category}
                        </div>
                        {hasDiscount && (
                            <div className="badge badge-warning absolute bottom-2 left-2">
                                -{discountedPrice}%
                            </div>
                        )}
                    </figure>

                    <div className="card-body px-3 py-3">
                        <h2 className="card-title text-sm md:text-base font-semibold text-gray-800 truncate">
                            {product.name}
                        </h2>

                        <div className="flex items-center gap-2 mt-2">
                            <div className="rating rating-sm">
                                {Array(5).fill('').map((_, index) => (
                                    <input
                                        key={index}
                                        type="radio"
                                        name={`rating-${product.id}`}
                                        className="mask mask-star-2 bg-orange-400"
                                        defaultChecked={index + 1 < rating}
                                    />


                                ))}
                            </div>
                            <span className="text-xs text-gray-500">
                                ({product.rating?.length || 0} reviews)
                            </span>
                        </div>

                        {product.price !== product.mrp ? (
                            <div className="mt-2">
                                <span className="text-gray-400 line-through mr-2">
                                    Rp {(typeof product.mrp === "number" ? product.mrp : 0).toLocaleString("id-ID")}
                                </span>
                                <span className="text-gray-600 font-bold">
                                    Rp {(typeof product.price === "number" ? product.price : 0).toLocaleString("id-ID")}
                                </span>
                            </div>
                        ) : (
                            <p className="text-gray-600 mt-2 font-bold">
                                Rp {(typeof product.price === "number" ? product.price : 0).toLocaleString("id-ID")}
                            </p>
                        )}
                    </div>
                </div>
            </Link>
        </div>
    );
}