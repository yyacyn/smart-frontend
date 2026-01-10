"use client"

import { useMemo, useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { useUser, useClerk } from "@clerk/nextjs";
import Navbar from "../../../components/navbar/Navbar"
import Footer from "../../../components/footer/Footer"
import { FiMinus, FiPlus, FiStar, FiMessageSquare, FiChevronUp, FiShare, FiShoppingCart, FiMessageCircle } from "react-icons/fi"
import CTA from "@/app/components/CTA"
import { useRouter } from "next/navigation";
import { FaStar, FaChevronLeft, FaChevronRight, FaWhatsapp } from "react-icons/fa"
// import ProductCard from "../../../components/product/Card"
import ProductCard from "../../../components/product/Card"
import { fetchProducts, addToCart as addToCartAPI, fetchCart, submitReport, fetchWishlist, fetchProductRatings } from "../../../api";
import { useDispatch, useSelector } from "react-redux";
import { addToCart, increaseQuantity } from "@/lib/features/cart/cartSlice";
import Swal from 'sweetalert2';
import Link from "next/link";
import ReportModal from "../../../components/ReportModal";
import { useGlobalData } from '../../../contexts/GlobalDataContext';

export default function ProductPage() {
    const { user } = useUser();
    const { session } = useClerk();
    const router = useRouter();
    const dispatch = useDispatch();
    const cartItems = useSelector((state) => state.cart.items || state.cart.cartItems);
    const { cachedProducts, cachedWishlist, addToWishlistContext, removeFromWishlistContext } = useGlobalData();
    const params = useParams();
    const productId = params.id;

    const [qty, setQty] = useState(1);
    const [activeTab, setActiveTab] = useState("Detail");
    const [currentProduct, setCurrentProduct] = useState(null);
    const [currentStore, setCurrentStore] = useState(null);
    const [selectedRatings, setSelectedRatings] = useState([]);
    const colors = ["Merah", "Kuning", "Hitam", "Putih"];
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [reviews, setReviews] = useState([]); // Add reviews state
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);

    useEffect(() => {
        if (cachedProducts && cachedProducts.length > 0) {
            // Use cached products if available
            const product = cachedProducts.find(p => p.id === productId);
            if (product) {
                // Calculate average rating from the product's rating array
                const productRatings = product.rating || [];

                // Calculate average rating
                let avgRating = 0;
                if (Array.isArray(productRatings) && productRatings.length > 0) {
                    avgRating = productRatings.reduce((acc, rating) => acc + rating.rating, 0) / productRatings.length;
                }

                // Update the product with the average rating
                const updatedProduct = {
                    ...product,
                    averageRating: parseFloat(avgRating.toFixed(1)),
                    totalReviews: productRatings.length
                };

                setCurrentProduct(updatedProduct);
                setReviews(productRatings);

                // Set the first variant as selected if variants exist
                if (product.variants && product.variants.length > 0) {
                    setSelectedVariant(product.variants[0]);
                } else {
                    // If no variants exist, set to null or a default value
                    setSelectedVariant(null);
                }

                if (product.store) {
                    // Calculate store rating based on all products from the same store
                    const storeProducts = cachedProducts.filter(p => p.storeId === product.storeId);
                    let totalStoreRatings = 0;
                    let totalStoreReviews = 0;

                    storeProducts.forEach(storeProduct => {
                        if (storeProduct.rating && Array.isArray(storeProduct.rating)) {
                            storeProduct.rating.forEach(rating => {
                                totalStoreRatings += rating.rating;
                                totalStoreReviews++;
                            });
                        }
                    });

                    let storeAvgRating = 0;
                    if (totalStoreReviews > 0) {
                        storeAvgRating = totalStoreRatings / totalStoreReviews;
                    }

                    // Update the store with calculated rating information
                    const updatedStore = {
                        ...product.store,
                        rating: parseFloat(storeAvgRating.toFixed(1)),
                        reviews: totalStoreReviews
                    };

                    setCurrentStore(updatedStore);
                }
            }
        } else {
            // Fetch products if not cached
            async function getProducts() {
                try {
                    const data = await fetchProducts();
                    if (data && data.products) {
                        const product = data.products.find(p => p.id === productId);
                        if (product) {
                            // Calculate average rating from the product's rating array
                            const productRatings = product.rating || [];

                            // Calculate average rating
                            let avgRating = 0;
                            if (Array.isArray(productRatings) && productRatings.length > 0) {
                                avgRating = productRatings.reduce((acc, rating) => acc + rating.rating, 0) / productRatings.length;
                            }

                            // Update the product with the average rating
                            const updatedProduct = {
                                ...product,
                                averageRating: parseFloat(avgRating.toFixed(1)),
                                totalReviews: productRatings.length
                            };

                            setCurrentProduct(updatedProduct);
                            setReviews(productRatings);

                            // Set the first variant as selected if variants exist
                            if (product.variants && product.variants.length > 0) {
                                setSelectedVariant(product.variants[0]);
                            } else {
                                // If no variants exist, set to null or a default value
                                setSelectedVariant(null);
                            }

                            if (product.store) {
                                // Calculate store rating based on all products from the same store
                                const storeProducts = data.products.filter(p => p.storeId === product.storeId);
                                let totalStoreRatings = 0;
                                let totalStoreReviews = 0;

                                storeProducts.forEach(storeProduct => {
                                    if (storeProduct.rating && Array.isArray(storeProduct.rating)) {
                                        storeProduct.rating.forEach(rating => {
                                            totalStoreRatings += rating.rating;
                                            totalStoreReviews++;
                                        });
                                    }
                                });

                                let storeAvgRating = 0;
                                if (totalStoreReviews > 0) {
                                    storeAvgRating = totalStoreRatings / totalStoreReviews;
                                }

                                // Update the store with calculated rating information
                                const updatedStore = {
                                    ...product.store,
                                    rating: parseFloat(storeAvgRating.toFixed(1)),
                                    reviews: totalStoreReviews
                                };

                                setCurrentStore(updatedStore);
                            }
                        }
                    }
                } catch (error) {
                    setCurrentProduct(null);
                    setCurrentStore(null);
                    setReviews([]);
                }
            }
            getProducts();
        }
    }, [productId, cachedProducts]);

    // Check if product is in wishlist when component loads
    useEffect(() => {
        if (cachedWishlist !== undefined && cachedWishlist !== null && productId) {
            setIsWishlisted(!!cachedWishlist[productId]);
        }
    }, [cachedWishlist, productId]);


    const handleRatingChange = (r) => {
        setSelectedRatings((prev) =>
            prev.includes(r)
                ? prev.filter((rating) => rating !== r)
                : [...prev, r]
        );
    };

    // Gallery image selection
    const [selectedImageIdx, setSelectedImageIdx] = useState(0);

    // Calculate discount percentage
    let discountPercent = 0;
    if (currentProduct && currentProduct.mrp > currentProduct.price) {
        discountPercent = Math.round(((currentProduct.mrp - currentProduct.price) / currentProduct.mrp) * 100);
    }

    // Function to handle report submission
    const handleReportSubmit = async (reportData) => {
        try {
            // Prepare the report data according to backend requirements
            const reportPayload = {
                productId: currentProduct?.id,
                subject: reportData.type,
                message: reportData.description,
                category: reportData.type,
                // Include target images as attachments
                attachments: reportData.attachments
            };

            // Submit the report via API
            await submitReport(reportPayload);

            // Close the modal before showing the success message
            setIsReportModalOpen(false);

            // Show success message
            await Swal.fire({
                icon: 'success',
                title: 'Laporan Terkirim!',
                text: `Laporan Anda untuk produk ${currentProduct.name} telah berhasil dikirim.`,
                timer: 2000,
                showConfirmButton: false
            });
        } catch (error) {
            console.error('Error submitting report:', error);
            throw new Error(error?.response?.data?.error || 'Gagal mengirim laporan. Silakan coba lagi.');
        }
    };

    // Show loading if product data isn't loaded yet
    if (!currentProduct || !currentStore) {
        return (
            <div className="min-h-dvh flex items-center justify-center">
                <div className="text-center">
                    <div className="loading loading-spinner loading-lg"></div>
                    <p className="mt-4">Loading product...</p>
                </div>
            </div>
        );
    }

    // Tab content
    const tabContents = {
        Detail: (
            <div className="py-6">
                <h4 className="font-semibold mb-2 text-black">Deskripsi Produk</h4>
                <p className="text-sm opacity-80 text-black">
                    {currentProduct?.description}
                </p>
            </div>
        ),
        Spesifikasi: (
            <div className="py-6">
                <h4 className="font-semibold mb-2 text-black">Spesifikasi</h4>
                <div className="space-y-2">
                    {currentProduct?.weight && (
                        <div className="flex justify-between border-b border-gray-100 py-2">
                            <span className="text-sm opacity-70">Berat</span>
                            <span className="text-sm font-medium">{currentProduct.weight} g</span>
                        </div>
                    )}
                    {currentProduct?.dimensions && (
                        <div className="flex justify-between border-b border-gray-100 py-2">
                            <span className="text-sm opacity-70">Dimensi</span>
                            <span className="text-sm font-medium">{currentProduct.dimensions}</span>
                        </div>
                    )}
                    {currentProduct?.model && (
                        <div className="flex justify-between border-b border-gray-100 py-2">
                            <span className="text-sm opacity-70">Model</span>
                            <span className="text-sm font-medium">{currentProduct.model}</span>
                        </div>
                    )}
                    {currentProduct?.sku && (
                        <div className="flex justify-between border-b border-gray-100 py-2">
                            <span className="text-sm opacity-70">SKU</span>
                            <span className="text-sm font-medium">{currentProduct.sku}</span>
                        </div>
                    )}
                    {currentProduct?.barcode && (
                        <div className="flex justify-between border-b border-gray-100 py-2">
                            <span className="text-sm opacity-70">Barcode</span>
                            <span className="text-sm font-medium">{currentProduct.barcode}</span>
                        </div>
                    )}
                    {currentProduct?.warranty && (
                        <div className="flex justify-between border-b border-gray-100 py-2">
                            <span className="text-sm opacity-70">Garansi</span>
                            <span className="text-sm font-medium">{currentProduct.warranty}</span>
                        </div>
                    )}
                    {currentProduct?.returnPolicy && (
                        <div className="flex justify-between border-b border-gray-100 py-2">
                            <span className="text-sm opacity-70">Kebijakan Retur</span>
                            <span className="text-sm font-medium">{currentProduct.returnPolicy}</span>
                        </div>
                    )}
                    {currentProduct?.tags && (
                        <div className="flex justify-between border-b border-gray-100 py-2">
                            <span className="text-sm opacity-70">Tags</span>
                            <span className="text-sm font-medium">{currentProduct.tags}</span>
                        </div>
                    )}
                    {currentProduct?.shippingWeight && (
                        <div className="flex justify-between border-b border-gray-100 py-2">
                            <span className="text-sm opacity-70">Berat Pengiriman</span>
                            <span className="text-sm font-medium">{currentProduct.shippingWeight} g</span>
                        </div>
                    )}
                    {currentProduct?.shippingLength && currentProduct?.shippingWidth && currentProduct?.shippingHeight && (
                        <div className="flex justify-between border-b border-gray-100 py-2">
                            <span className="text-sm opacity-70">Dimensi Pengiriman</span>
                            <span className="text-sm font-medium">{currentProduct.shippingLength} x {currentProduct.shippingWidth} x {currentProduct.shippingHeight} cm</span>
                        </div>
                    )}
                    {currentProduct?.additionalInfo && (
                        <div className="flex justify-between border-b border-gray-100 py-2">
                            <span className="text-sm opacity-70">Info Tambahan</span>
                            <span className="text-sm font-medium">{currentProduct.additionalInfo}</span>
                        </div>
                    )}
                </div>
                {!(currentProduct?.weight || currentProduct?.dimensions || currentProduct?.model ||
                    currentProduct?.sku || currentProduct?.barcode || currentProduct?.warranty ||
                    currentProduct?.returnPolicy || currentProduct?.tags || currentProduct?.additionalInfo ||
                    currentProduct?.shippingWeight || (currentProduct?.shippingLength && currentProduct?.shippingWidth && currentProduct?.shippingHeight)) && (
                        <p className="text-sm opacity-60 italic">Spesifikasi produk belum tersedia.</p>
                    )}
            </div>
        ),
        Ulasan: (
            <section className="mt-6 grid gap-6 grid-cols-1 lg:grid-cols-[280px_1fr] text-black">
                {/* Filter */}
                <aside className="rounded-box border p-4 border-gray-100 shadow-2xs">
                    <h4 className="mb-4 text-sm font-semibold">Filter Ulasan</h4>
                    <div className="form-control">
                        <label className="label cursor-pointer justify-start gap-3">
                            <input type="checkbox" className="checkbox checkbox-m text-black border-black" />
                            <span className="label-text text-black">Dengan Foto</span>
                        </label>
                        <label className="label cursor-pointer justify-start gap-3">
                            <input type="checkbox" className="checkbox checkbox-m text-black border-black" />
                            <span className="label-text text-black">Pembelian Terverifikasi</span>
                        </label>
                    </div>

                    <div className="mt-4">
                        <p className="mb-2 text-sm font-semibold text-black">Rating</p>
                        <div className="form-control space-y-1">
                            {[5, 4, 3, 2, 1].map((r) => (
                                <label
                                    key={r}
                                    className="flex items-center cursor-pointer gap-3 text-black"
                                >
                                    <input
                                        type="checkbox"
                                        className="checkbox checkbox-m border-black text-black"
                                        checked={selectedRatings.includes(r)}
                                        onChange={() => handleRatingChange(r)}
                                    />
                                    <span className="flex items-center">
                                        {Array.from({ length: 5 }).map((_, i) => (
                                            <FaStar
                                                key={i}
                                                className={i < r ? 'text-yellow-500' : 'opacity-30'}
                                                aria-hidden="true"
                                            />
                                        ))}
                                        <span className="ml-2">{r} bintang</span>
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>
                </aside>

                {/* Reviews List */}
                <div className="space-y-4 ">
                    {reviews.length === 0 ? (
                        <div className="text-center py-8">
                            <FiMessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                            <p className="text-gray-500 text-sm">No review yet</p>
                            <p className="text-gray-400 text-xs mt-1">Be the first to review this product</p>
                        </div>
                    ) : (
                        reviews.map((review, index) => (
                            <article key={`${review.user?.name || 'user'}-${index}-${review.createdAt}`} className="rounded-box border border-gray-100 shadow-2xs p-4">
                                <div className="flex items-center gap-3">
                                    {review.user?.image ? (
                                        <div className="avatar">
                                            <div className="h-10 w-10 rounded-full bg-gray-200">
                                                <img src={review.user.image} alt={review.user.name} className="rounded-full object-cover" />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="avatar placeholder">
                                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                                <span className="text-xs text-gray-600">{review.user?.name?.[0] || 'U'}</span>
                                            </div>
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">{review.user?.name || 'Anonymous User'}</p>
                                        <div className="rating rating-sm mt-1">
                                            <input
                                                type="radio"
                                                name={`review-rating-${index}`}
                                                className="mask mask-star-2 bg-yellow-400"
                                                checked={review.rating >= 1}
                                                readOnly
                                                disabled
                                            />
                                            <input
                                                type="radio"
                                                name={`review-rating-${index}`}
                                                className="mask mask-star-2 bg-yellow-400"
                                                checked={review.rating >= 2}
                                                readOnly
                                                disabled
                                            />
                                            <input
                                                type="radio"
                                                name={`review-rating-${index}`}
                                                className="mask mask-star-2 bg-yellow-400"
                                                checked={review.rating >= 3}
                                                readOnly
                                                disabled
                                            />
                                            <input
                                                type="radio"
                                                name={`review-rating-${index}`}
                                                className="mask mask-star-2 bg-yellow-400"
                                                checked={review.rating >= 4}
                                                readOnly
                                                disabled
                                            />
                                            <input
                                                type="radio"
                                                name={`review-rating-${index}`}
                                                className="mask mask-star-2 bg-yellow-400"
                                                checked={review.rating >= 5}
                                                readOnly
                                                disabled
                                            />
                                        </div>
                                    </div>
                                    <span className="text-xs opacity-60">{review.createdAt ? new Date(review.createdAt).toLocaleDateString('id-ID') : 'Recently'}</span>
                                </div>
                                <p className="mt-3 text-sm">
                                    {review.review || 'No comment provided.'}
                                </p>
                            </article>
                        ))
                    )}
                </div>
            </section>
        ),
    }

    return (
        <div className="min-h-dvh mt-16 pt-10 text-black ">
            <Navbar />
            {/* Breadcrumbs */}
            <div className="flex mx-auto max-w-7xl px-4 text-black ">
                <div className="breadcrumbs py-4 text-sm">
                    <ul>
                        <li>
                            <Link href="/">Home</Link>
                        </li>
                        <li>
                            <Link href={`/pages/marketplace?category=${encodeURIComponent(currentProduct?.category?.name)}`}>
                                {currentProduct?.category?.name}
                            </Link>
                        </li>
                        <li className="font-medium">{currentProduct?.name}</li>
                    </ul>
                </div>
            </div>

            {/* Top Section: Gallery + Info + Quantity Card */}
            <main className="mx-auto max-w-7xl px-4 pb-12">
                {/* Report Modal */}
                <ReportModal
                    isOpen={isReportModalOpen}
                    onClose={() => setIsReportModalOpen(false)}
                    onSubmit={handleReportSubmit}
                    targetType="product"
                    targetId={currentProduct?.id}
                    targetName={currentProduct?.name}
                    targetImages={currentProduct?.images || []}
                    className="text-black"
                />
                <div className="grid gap-8 grid-cols-1 lg:grid-cols-[1.1fr_1.2fr_0.8fr]">
                    {/* Gallery */}
                    <section aria-labelledby="gallery" className="space-y-4">
                        <div className="aspect-[5/5] w-full overflow-hidden rounded-box ">
                            <img
                                alt={currentProduct?.name}
                                className="h-full w-full object-cover"
                                src={Array.isArray(currentProduct?.images) && currentProduct.images.length > 0 ? currentProduct.images[selectedImageIdx] : "/images/default.png"}
                            />
                        </div>
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                            {Array.isArray(currentProduct?.images) && currentProduct.images.slice(0, 4).map((img, i) => (
                                <button
                                    key={i}
                                    className={`aspect-square overflow-hidden rounded-box hover:ring-1 hover:ring-[#ED775A] hover:ring-offset-2 ${selectedImageIdx === i ? "ring-2 ring-[#ED775A]" : ""}`}
                                    onClick={() => setSelectedImageIdx(i)}
                                >
                                    <img
                                        alt={`Thumbnail ${i + 1}`}
                                        className="h-full w-full object-cover"
                                        src={img}
                                    />
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* Product info */}
                    <section className="space-y-4 text-black">

                        <h1 className="text-pretty text-3xl font-semibold leading-tight flex flex-col">
                            <div className="flex items-center gap-4 justify-between">
                                {currentProduct?.name}
                                {currentProduct?.userId !== user?.id && currentStore.userId !== user?.id && (
                                    <button
                                        className="ml-3 px-3 py-1 rounded border border-red-500 text-red-500 bg-white hover:bg-red-50 text-xs font-semibold self-start mt-1"
                                        onClick={() => setIsReportModalOpen(true)}
                                    >
                                        Report
                                    </button>
                                )}
                            </div>
                            {/* Product Tags */}
                            {currentProduct?.category?.name && (
                                <div className="mb-1">
                                    <span className="badge badge-outline text-xs font-medium mr-2">
                                        {currentProduct.category.name}
                                    </span>
                                </div>
                            )}
                            {/* Product Rating */}
                            <div className="flex items-center gap-2 mt-4">
                                <div className="rating rating-sm">
                                    <input
                                        type="radio"
                                        name={`rating-${currentProduct?.id}`}
                                        className="mask mask-star-2 bg-yellow-400"
                                        checked={currentProduct?.averageRating >= 1}
                                        readOnly
                                        disabled
                                    />
                                    <input
                                        type="radio"
                                        name={`rating-${currentProduct?.id}`}
                                        className="mask mask-star-2 bg-yellow-400"
                                        checked={currentProduct?.averageRating >= 2}
                                        readOnly
                                        disabled
                                    />
                                    <input
                                        type="radio"
                                        name={`rating-${currentProduct?.id}`}
                                        className="mask mask-star-2 bg-yellow-400"
                                        checked={currentProduct?.averageRating >= 3}
                                        readOnly
                                        disabled
                                    />
                                    <input
                                        type="radio"
                                        name={`rating-${currentProduct?.id}`}
                                        className="mask mask-star-2 bg-yellow-400"
                                        checked={currentProduct?.averageRating >= 4}
                                        readOnly
                                        disabled
                                    />
                                    <input
                                        type="radio"
                                        name={`rating-${currentProduct?.id}`}
                                        className="mask mask-star-2 bg-yellow-400"
                                        checked={currentProduct?.averageRating >= 5}
                                        readOnly
                                        disabled
                                    />
                                </div>
                                <span className="text-sm text-gray-600">
                                    {(currentProduct?.averageRating || 0).toFixed(1)}
                                    {currentProduct?.totalReviews > 0 && ` dari ${currentProduct?.totalReviews} ulasan`}
                                </span>
                            </div>
                        </h1>

                        {/* <div className="flex gap-2 text-sm text-base-content/70">
                            <span className="badge bg-[#ED775A] border-none">Official</span>
                            <span className="badge bg-[#ED775A] border-none">Terlaris</span>
                            <span className="badge bg-[#ED775A] border-none">Gratis Ongkir</span>
                        </div> */}


                        <div className="divider my-2" />

                        {/* Price display with discount */}
                        {currentProduct?.mrp > currentProduct?.price ? (
                            <div className="flex items-center gap-2">
                                <span className="text-2xl font-bold tracking-tight text-[#ED775A]">
                                    Rp {currentProduct.price.toLocaleString("id-ID")}
                                </span>
                                <span className="text-base line-through opacity-60">
                                    Rp {currentProduct.mrp.toLocaleString("id-ID")}
                                </span>
                                {discountPercent > 0 && (
                                    <span className="badge badge-accent text-xs font-semibold text-white bg-[#ED775A] border-none">
                                        Diskon {discountPercent}%
                                    </span>
                                )}
                            </div>
                        ) : (
                            <p className="text-2xl font-bold tracking-tight">Rp {currentProduct?.price.toLocaleString("id-ID")}</p>
                        )}

                        <div className="space-y-3">
                            {currentProduct?.variants && currentProduct.variants.length > 0 ? (
                                <div className="space-y-3">
                                    <div className="text-sm">
                                        <span className="font-medium">Pilih varian:</span>{" "}
                                        <span className="opacity-80">{selectedVariant ? selectedVariant.variant : 'Tidak ada varian'}</span>
                                    </div>

                                    {/* variant options */}
                                    <div className="flex flex-wrap gap-2 text-xs">
                                        {currentProduct.variants.map((variant) => (
                                            <button
                                                key={variant.id}
                                                type="button"
                                                className={`px-4 py-2 rounded-md border ${
                                                    selectedVariant && selectedVariant.id === variant.id
                                                        ? 'border-[#ED775A] bg-[#ED775A] text-white'
                                                        : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-100'
                                                }`}
                                                onClick={() => setSelectedVariant(variant)}
                                                disabled={variant.stock <= 0}
                                            >
                                                {variant.variant} {variant.stock <= 0 ? '(Stok Habis)' : `(Stok: ${variant.stock})`}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-sm">
                                    <span className="font-medium">Varian:</span>{" "}
                                    <span className="opacity-80">Tidak ada varian (Produk ini tidak memiliki varian)</span>
                                </div>
                            )}
                        </div>

                        {/* Store Info */}
                        <section className="mt-2 pt-2 border-gray-200">
                            <h4 className="text-lg font-semibold">Info Toko</h4>
                            <div className="flex items-center justify-between mt-4">
                                <div className="flex items-center gap-3">
                                    <div className="avatar">
                                        <div className="h-12 w-12 rounded-full overflow-hidden">
                                            <img src={currentStore.logo} alt={currentStore.name} className="h-full w-full object-cover" />
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">{currentStore.name}</p>
                                        <div className="flex items-center gap-1">
                                            <FaStar className="text-yellow-500 inline" />
                                            {currentStore.reviews > 0 ? (
                                                <p className="text-xs opacity-70 mt-0.5">{currentStore.rating} dari {currentStore.reviews} Ulasan</p>
                                            ) : (
                                                <p className="text-xs opacity-70 mt-0.5">Belum ada ulasan</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => {
                                            // Format the contact number: remove + or replace 0 with 62
                                            let formattedContact = currentStore.contact || '';
                                            if (formattedContact.startsWith('+')) {
                                                formattedContact = formattedContact.substring(1); // Remove +
                                            } else if (formattedContact.startsWith('0')) {
                                                formattedContact = '62' + formattedContact.substring(1); // Replace 0 with 62
                                            }

                                            // Create WhatsApp message with product info
                                            const productName = encodeURIComponent(currentProduct.name);
                                            const productPrice = currentProduct.price.toLocaleString("id-ID");
                                            const message = encodeURIComponent(`Halo, saya tertarik dengan produk ${productName} (Rp. ${productPrice}). Bisa dibantu?`);

                                            // Open WhatsApp chat
                                            window.open(`https://wa.me/${formattedContact}?text=${message}`, '_blank');
                                        }}
                                        className="btn btn-sm bg-green-500 border-none hover:bg-green-600 shadow-none text-sm text-white"
                                    >
                                        <FaWhatsapp className="w-4 h-4 mr-1"></FaWhatsapp>
                                        Chat Toko
                                    </button>
                                    <Link
                                        href={{
                                            pathname: `/pages/store/${currentStore.id}`,
                                            query: {},
                                        }}
                                        className="btn btn-sm bg-[#ED775A] border-none hover:bg-[#eb6b4b] shadow-none text-sm"
                                        scroll={false}
                                        // Pass store info in state for the store page
                                        as={`/pages/store/${currentStore.id}`}
                                        onClick={() => {
                                            if (typeof window !== 'undefined') {
                                                window.sessionStorage.setItem('storeInfo', JSON.stringify(currentStore));
                                            }
                                        }}
                                    >
                                        Kunjungi Toko
                                    </Link>
                                </div>
                            </div>
                        </section>

                        {/* shipping / guarantees */}
                        <div className="grid gap-3 sm:grid-cols-2">
                            <div className="rounded-box border border-gray-300 p-3">
                                <p className="text-sm font-medium">Pengiriman</p>
                                <p className="text-sm opacity-70">Dikirim dari <span className="font-semibold">Depok</span></p>
                                <p className="text-sm opacity-70">Ongkir mulai dari <span className="font-semibold">Rp. 12.000</span></p>
                            </div>
                            <div className="rounded-box border border-gray-300 p-3">
                                <p className="text-sm font-medium">Garansi</p>
                                <p className="text-sm opacity-70">Retur <span className="font-semibold">7 hari</span> sejak barang diterima</p>
                            </div>
                        </div>
                    </section>

                    {/* Quantity + Summary Card */}
                    <aside className="lg:sticky lg:top-4 text-black">
                        <div className="card border border-gray-200 ">
                            <div className="card-body gap-4">
                                <h3 className="card-title text-base">Atur Jumlah</h3>

                                <div className="flex items-center gap-2">
                                    <div className="avatar">
                                        <div className="h-12 w-12 rounded">
                                            <img
                                                src={Array.isArray(currentProduct?.images) && currentProduct.images.length > 0 ? currentProduct.images[0] : "/images/default.png"}
                                                alt="Selected product variant"
                                                className="h-full w-full object-cover rounded"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">Varian Terpilih</p>
                                        <p className="text-xs opacity-70">
                                            {currentProduct?.variants && currentProduct.variants.length > 0
                                                ? (selectedVariant ? selectedVariant.variant : 'Tidak ada varian yang dipilih')
                                                : 'Tidak ada varian'}
                                        </p>
                                    </div>
                                </div>

                                <div className="join">
                                    <button
                                        className="btn join-item bg-gray-50 border-gray-300 shadow-none text-black"
                                        aria-label="kurangi"
                                        onClick={() => setQty((q) => Math.max(1, q - 1))}
                                        disabled={qty <= 1}
                                    >
                                        <FiMinus />
                                    </button>
                                    <input
                                        className="input join-item border-gray-300 w-16 text-center border  bg-gray-50 text-black"
                                        value={qty}
                                        onChange={(e) => {
                                            const value = Math.max(1, Number(e.target.value) || 1);
                                            // Only apply stock limit if there's a selected variant with stock
                                            if (selectedVariant && selectedVariant.stock && value > selectedVariant.stock) {
                                                setQty(selectedVariant.stock);
                                            } else {
                                                setQty(value);
                                            }
                                        }}
                                        max={selectedVariant && selectedVariant.stock ? selectedVariant.stock : undefined}
                                    />
                                    <button
                                        className="btn join-item border-gray-300 border shadow-none bg-gray-50 text-black"
                                        aria-label="tambah"
                                        onClick={() => {
                                            // Only increment if there's a selected variant with sufficient stock
                                            if (selectedVariant && selectedVariant.stock && qty < selectedVariant.stock) {
                                                setQty((q) => q + 1);
                                            } else if (!selectedVariant || !selectedVariant.stock) {
                                                // If no variant or no stock limit, just increment
                                                setQty((q) => q + 1);
                                            }
                                        }}
                                        disabled={selectedVariant && selectedVariant.stock ? qty >= selectedVariant.stock : false}
                                    >
                                        <FiPlus />
                                    </button>
                                </div>

                                <div className="rounded-box text-sm">
                                    <div className="flex items-center justify-between">
                                        <span>Subtotal</span>
                                        <span className="font-semibold">
                                            Rp {(qty * (currentProduct?.price || 0)).toLocaleString("id-ID")}
                                        </span>
                                    </div>
                                    {selectedVariant && selectedVariant.stock !== undefined && selectedVariant.stock < qty && (
                                        <div className="text-xs text-red-500 mt-1">
                                            Stok tersedia: {selectedVariant.stock}
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-row w-full gap-2">
                                    <button
                                        className="btn w-3/4 bg-[#ED775A] border-none hover:bg-[#eb6b4b] shadow-none text-sm"
                                        onClick={() => {
                                            // Open checkout page in a new tab with product ID and quantity
                                            // If product has variants, include the selected variant ID
                                            let url = `/pages/checkout/?productId=${currentProduct.id}&qty=${qty}`;
                                            if (currentProduct.variants && currentProduct.variants.length > 0 && selectedVariant) {
                                                url += `&variantId=${selectedVariant.id}`;
                                            }
                                            window.open(url, '_blank');
                                        }}
                                        disabled={currentProduct.variants && currentProduct.variants.length > 0 && !selectedVariant}
                                    >
                                        Checkout
                                    </button>
                                    <button className="btn bg-white w-1/4 shadow-none text-[#ED775A] border hover:bg-gray-100 border-[#ED775A] hover:border-[#eb6b4b] hover:text-[#ED775A]"
                                        onClick={async () => {
                                            // If product has variants, ensure a variant is selected
                                            if (currentProduct.variants && currentProduct.variants.length > 0 && !selectedVariant) {
                                                await Swal.fire({
                                                    icon: 'warning',
                                                    title: 'Varian Belum Dipilih',
                                                    text: 'Silakan pilih varian produk terlebih dahulu.',
                                                });
                                                return;
                                            }

                                            try {
                                                // Fetch current cart from backend to ensure we have the latest state
                                                const currentCartResponse = await fetchCart();
                                                const currentCart = currentCartResponse.cart || {};

                                                // Calculate the new cart state based on current backend state
                                                let cartItemKey;
                                                let cartItemText;

                                                // Use a combination of productId and variantId as the key if variants exist
                                                if (currentProduct.variants && currentProduct.variants.length > 0 && selectedVariant) {
                                                    cartItemKey = `${currentProduct.id}_${selectedVariant.id}`;
                                                    cartItemText = `${currentProduct.name} (${qty} pcs) - ${selectedVariant.variant}`;
                                                } else {
                                                    // Use just the product ID if no variants exist
                                                    cartItemKey = `${currentProduct.id}`;
                                                    cartItemText = `${currentProduct.name} (${qty} pcs)`;
                                                }

                                                const currentCartItemQty = currentCart[cartItemKey] || 0;
                                                const newCartItemQty = currentCartItemQty + qty;

                                                // Prepare the updated cart to send to backend
                                                const updatedCart = {
                                                    ...currentCart,
                                                    [cartItemKey]: newCartItemQty
                                                };

                                                // Send updated cart to backend
                                                await addToCartAPI({ cart: updatedCart });

                                                // Then update Redux state to match
                                                if (currentCartItemQty > 0) {
                                                    // Item exists, increase quantity by qty amount
                                                    dispatch(increaseQuantity({
                                                        productId: cartItemKey,
                                                        quantity: qty
                                                    }));
                                                } else {
                                                    // Item doesn't exist, add new item
                                                    const cartItemData = {
                                                        productId: cartItemKey,
                                                        quantity: qty,
                                                        product: currentProduct
                                                    };

                                                    // Include variant info only if variants exist
                                                    if (currentProduct.variants && currentProduct.variants.length > 0 && selectedVariant) {
                                                        cartItemData.variant = selectedVariant;
                                                    }

                                                    dispatch(addToCart(cartItemData));
                                                }

                                                await Swal.fire({
                                                    icon: 'success',
                                                    title: 'Berhasil',
                                                    text: `${cartItemText} berhasil ditambahkan ke keranjang!`,
                                                    timer: 2000,
                                                    showConfirmButton: false
                                                });
                                            } catch (error) {
                                                await Swal.fire({
                                                    icon: 'error',
                                                    title: 'Gagal',
                                                    text: error?.response?.data?.error || 'Gagal menambahkan ke keranjang.',
                                                });
                                            }
                                        }}
                                        disabled={currentProduct.variants && currentProduct.variants.length > 0 && !selectedVariant}
                                    >
                                        <FiShoppingCart className="w-5" />
                                    </button>
                                </div>

                                <div className="flex flex-row justify-evenly text-sm opacity-70">
                                    <div
                                        onClick={async () => {
                                            if (!user) {
                                                router.push('/sign-in');
                                                return;
                                            }

                                            try {
                                                // Show loading indicator
                                                Swal.fire({
                                                    title: 'Memproses...',
                                                    text: isWishlisted ? 'Menghapus dari wishlist...' : 'Menambahkan ke wishlist...',
                                                    allowOutsideClick: false,
                                                    allowEscapeKey: false,
                                                    showConfirmButton: false,
                                                    didOpen: () => {
                                                        Swal.showLoading();
                                                    }
                                                });

                                                let success = false;
                                                if (isWishlisted) {
                                                    success = await removeFromWishlistContext(currentProduct.id);
                                                    if (success) {
                                                        setIsWishlisted(false);
                                                    }
                                                } else {
                                                    success = await addToWishlistContext(currentProduct.id);
                                                    if (success) {
                                                        setIsWishlisted(true);
                                                    }
                                                }

                                                Swal.close();
                                                if (success) {
                                                    await Swal.fire({
                                                        icon: 'success',
                                                        title: isWishlisted ? 'Berhasil Dihapus' : 'Berhasil Ditambahkan',
                                                        text: isWishlisted
                                                            ? 'Produk berhasil dihapus dari wishlist!'
                                                            : 'Produk berhasil ditambahkan ke wishlist!',
                                                        timer: 2000,
                                                        showConfirmButton: false
                                                    });
                                                } else {
                                                    throw new Error('Operasi wishlist gagal');
                                                }
                                            } catch (error) {
                                                console.error('Error updating wishlist:', error);
                                                Swal.close();
                                                await Swal.fire({
                                                    icon: 'error',
                                                    title: 'Gagal',
                                                    text: error?.message || 'Gagal memperbarui wishlist.',
                                                });
                                            }
                                        }}
                                        className={`rounded-box p-2 text-center flex flex-row items-center gap-1 hover:text-gray-500 cursor-pointer transition-colors ${isWishlisted ? "text-red-500" : "text-gray-800"
                                            }`}
                                    >
                                        {isWishlisted ? (
                                            <FaStar className="text-red-500" />
                                        ) : (
                                            <FiStar className="text-gray-800 " />
                                        )}
                                        <span>Wishlist</span>
                                    </div>
                                    <span className="flex my-2 w-0.5 rounded-2xl bg-gray-800"></span>
                                    <div className="rounded-box p-2 text-center flex flex-row items-center gap-1 cursor-pointer hover:text-gray-500">
                                        <FiShare className="" />
                                        <span>Share</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </aside>
                </div>

                {/* Tabs */}
                <section className="mt-10">
                    <div role="tablist" className="tabs tabs-border text-black">
                        {["Detail", "Spesifikasi", "Ulasan"].map((tab) => (
                            <a
                                key={tab}
                                role="tab"
                                className={`tab hover:bg-gray-100 hover:text-black text-black ${activeTab === tab ? "tab-active text-black" : "text-black"}`}
                                onClick={() => setActiveTab(tab)}
                                tabIndex={0}
                                style={{ cursor: "pointer" }}
                            >
                                {tab}
                            </a>
                        ))}
                    </div>
                    {/* Tab content */}
                    <div>{tabContents[activeTab]}</div>
                </section>

                {/* More products grid */}
                {currentStore && currentProduct ? (
                    <section className="mt-10">
                        <h3 className="mb-4 text-base font-semibold text-black">Produk Lainnya dari Toko ini</h3>
                        <div className="relative">
                            {(cachedProducts || []).filter((product) => product.store?.id === currentStore.id && product.id !== currentProduct.id).length === 0 ? (
                                <div className="text-gray-500 text-center py-8">This store has no more product.</div>
                            ) : (
                                <>
                                    <div className="flex scrollbar-hide gap-6 pb-4 scroll-container overflow-x-hidden">
                                        {(cachedProducts || [])
                                            .filter((product) => product.store?.id === currentStore?.id && product.id !== currentProduct?.id)
                                            .slice(0, 10)
                                            .map((product) => (
                                                <div key={product.id} className="max-w-[240px] flex-shrink-0 mt-2">
                                                    <ProductCard product={product} />
                                                </div>
                                            ))}
                                    </div>
                                    <button
                                        className="absolute top-1/2 left-0 transform -translate-y-1/2 bg-[#ED775A] text-white p-2 rounded-full shadow hover:bg-[#e76b4c] ml-2"
                                        onClick={() => {
                                            const container = document.querySelector('.scroll-container');
                                            if (container) {
                                                container.scrollBy({ left: -300, behavior: 'smooth' });
                                            }
                                        }}
                                        aria-label="Scroll left"
                                    >
                                        <FaChevronLeft aria-hidden="true" />
                                    </button>
                                    <button
                                        className="absolute top-1/2 right-0 transform -translate-y-1/2 bg-[#ED775A] text-white p-2 rounded-full shadow hover:bg-[#e76b4c] mr-2"
                                        onClick={() => {
                                            const container = document.querySelector('.scroll-container');
                                            if (container) {
                                                container.scrollBy({ left: 300, behavior: 'smooth' });
                                            }
                                        }}
                                        aria-label="Scroll right"
                                    >
                                        <FaChevronRight aria-hidden="true" />
                                    </button>
                                </>
                            )}
                        </div>
                    </section>
                ) : null}

                {/* CTA banner */}
                <CTA />

                {/* back to top */}
                <div className="mt-8 flex items-center justify-end gap-1 text-sm">
                    <span>Ke atas</span>
                    <FiChevronUp aria-hidden />
                </div>
            </main>

            <Footer />
        </div>
    )
}