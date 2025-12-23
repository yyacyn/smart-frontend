import React from 'react';
import Image from 'next/image'
import Link from "next/link";

export default function ProductCard({ product }) {
    // Calculate discounted price
    const hasDiscount = product.mrp != null && product.price != null && product.mrp > 0 && product.mrp > product.price;
    const discountedPrice = hasDiscount
        ? Math.round((product.mrp - product.price) / (product.mrp) * 100)
        : 0;

    const ratingArr = product.rating || [];
    const validRatings = Array.isArray(ratingArr)
        ? ratingArr.filter(curr => {
            // Handle both rating objects and numeric ratings
            if (typeof curr === 'object' && curr !== null && typeof curr.rating === 'number') {
                return true;
            } else if (typeof curr === 'number') {
                return true;
            }
            return false;
        })
        : [];

    const rating = validRatings.length > 0
        ? Math.round(
            validRatings.reduce((acc, curr) => {
                if (typeof curr === 'object' && curr !== null && typeof curr.rating === 'number') {
                    return acc + curr.rating;
                } else if (typeof curr === 'number') {
                    return acc + curr;
                }
                return acc;
            }, 0) / validRatings.length
        )
        : 0;

    return (
        <div>
            <Link href={`/pages/product_detail/${product.id}`}>
                <div className="card bg-white border border-gray-200 rounded-lg hover:cursor-pointer hover:-translate-y-1 transition-transform duration-200">
                    <figure className="relative w-full h-40 overflow-hidden rounded-t-lg">
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
                        <div className="badge badge-primary absolute top-1.5 right-1.5 text-[10px] py-0.5 px-1.5">
                            {product.category?.name}
                        </div>
                        {hasDiscount && discountedPrice > 0 && (
                            <div className="badge badge-error absolute top-1.5 left-1.5 text-[10px] py-0.5 px-1.5 font-bold">
                                -{discountedPrice}%
                            </div>
                        )}
                    </figure>

                    <div className="card-body px-2 py-2">
                        <h2 className="card-title text-xs font-semibold text-gray-800 truncate leading-tight">
                            {product.name}
                        </h2>
                        {product.store && product.store.name && (
                            <h3 className="text-[10px] text-gray-500 truncate mb-0.5">
                                {product.store.name}
                            </h3>
                        )}


                        <div className="flex items-center gap-1">
                            <div className="rating rating-xs">
                                {Array(5).fill('').map((_, index) => {
                                    const isFilled = index < rating;

                                    return (
                                        <input
                                            key={index}
                                            type="radio"
                                            name={`rating-${product.id}`}
                                            className={`mask mask-star-2`}
                                            style={{
                                                backgroundColor: isFilled ? '#fb923c' : '#d7d7d7ff',
                                                opacity: 1
                                            }}
                                            checked={isFilled}
                                            readOnly
                                        />
                                    );
                                })}
                            </div>
                            <span className="text-[9px] text-gray-500">
                                ({validRatings.length})
                            </span>
                        </div>

                        {product.price !== product.mrp ? (
                            <div className="mt-1">
                                <span className="text-gray-400 line-through text-[10px] mr-1">
                                    Rp {(typeof product.mrp === "number" ? product.mrp : 0).toLocaleString("id-ID")}
                                </span>
                                <span className="text-gray-900 font-bold text-sm">
                                    Rp {(typeof product.price === "number" ? product.price : 0).toLocaleString("id-ID")}
                                </span>
                            </div>
                        ) : (
                            <p className="text-gray-900 mt-1 font-bold text-sm">
                                Rp {(typeof product.price === "number" ? product.price : 0).toLocaleString("id-ID")}
                            </p>
                        )}
                    </div>
                </div>
            </Link>
        </div>
    );
}