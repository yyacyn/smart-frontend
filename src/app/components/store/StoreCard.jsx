import React from 'react';
import Image from 'next/image';
import Link from "next/link";
import { FiStar, FiMapPin } from "react-icons/fi";

export default function StoreCard({ store }) {
    // Calculate store rating from all products
    const rating = store.rating || 0;
    const totalReviews = store.totalReviews || 0;

    return (
        <div>
            <Link href={`/pages/store/${store.id}`}>
                <div className="card bg-white border border-gray-200 rounded-lg hover:cursor-pointer hover:-translate-y-1 transition-transform duration-200">
                    <figure className="relative w-full h-50 overflow-hidden rounded-t-lg bg-gray-100">
                        <Image
                            width={500}
                            height={500}
                            src={store.logo || "/images/default-store.png"}
                            alt={store.name || "Store logo"}
                            className="w-full h-full object-cover"
                        />
                        {/* {store.status && (
                            <div className={`badge absolute top-1.5 right-1.5 text-[10px] py-0.5 px-1.5 ${store.status === 'approved'
                                    ? 'bg-green-100 text-green-700 border-none'
                                    : 'bg-yellow-100 text-yellow-700 border-none'
                                }`}>
                                {store.status}
                            </div>
                        )} */}
                    </figure>

                    <div className="card-body px-2 py-2 gap-1">
                        <h2 className="card-title text-sm font-semibold text-gray-800 truncate leading-tight">
                            {store.name}
                        </h2>
                        {store.username && (
                            <h3 className="text-[10px] text-gray-500 truncate mb-0.5">
                                @{store.username}
                            </h3>
                        )}

                        <div className="flex items-center gap-1 mb-1">
                            <FiStar className="w-3 h-3 text-yellow-500" />
                            <span className="text-[10px] font-semibold text-gray-700">
                                {rating.toFixed(1)}
                            </span>
                            <span className="text-[9px] text-gray-500">
                                ({totalReviews} ulasan)
                            </span>
                        </div>

                        {store.address && (
                            <div className="flex items-center gap-1">
                                <FiMapPin className="w-3 h-3 text-gray-400" />
                                <span className="text-[10px] text-gray-500 truncate">
                                    {store.address}
                                </span>
                            </div>
                        )}

                        {store.description && (
                            <p className="text-[10px] text-gray-600 line-clamp-2 mt-1">
                                {store.description}
                            </p>
                        )}
                    </div>
                </div>
            </Link>
        </div>
    );
}
