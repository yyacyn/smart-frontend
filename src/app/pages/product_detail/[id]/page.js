"use client"

import { useMemo, useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { useUser, useClerk } from "@clerk/nextjs";
import Navbar from "../../../components/navbar/Navbar"
import Footer from "../../../components/footer/Footer"
import { FiMinus, FiPlus, FiStar, FiMessageSquare, FiChevronUp, FiShare, FiShoppingCart, } from "react-icons/fi"
import CTA from "@/app/components/CTA"
import { useRouter } from "next/navigation";
import { FaStar, FaChevronLeft, FaChevronRight } from "react-icons/fa"
// import ProductCard from "../../../components/product/Card"
import ProductCard from "../../../components/product/Card"
import { fetchProducts, addToCart as addToCartAPI, fetchCart, submitReport } from "../../../api";
import { useDispatch, useSelector } from "react-redux";
import { addToCart, increaseQuantity } from "@/lib/features/cart/cartSlice";
import { addToWishlistAPI, removeFromWishlistAPI, fetchWishlist } from "@/lib/features/wishlist/wishlistSlice";
import Swal from 'sweetalert2';
import Link from "next/link";
import ReportModal from "../../../components/ReportModal";

export default function ProductPage() {
    const { user } = useUser();
    const { session } = useClerk();
    const router = useRouter();
    const dispatch = useDispatch();
    const cartItems = useSelector((state) => state.cart.items || state.cart.cartItems);
    const wishlistItems = useSelector((state) => state.wishlist.wishlistItems);
    const params = useParams();
    const productId = params.id;

    const [qty, setQty] = useState(1);
    const [activeTab, setActiveTab] = useState("Detail");
    const [products, setProducts] = useState([]);
    const [currentProduct, setCurrentProduct] = useState(null);
    const [currentStore, setCurrentStore] = useState(null);
    const [selectedRatings, setSelectedRatings] = useState([]);
    const colors = ["Merah", "Kuning", "Hitam", "Putih"];
    const [selectedColor, setSelectedColor] = useState(colors[0]);
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [reviews, setReviews] = useState([]); // Add reviews state
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);

    useEffect(() => {
        async function getProducts() {
            try {
                const data = await fetchProducts();
                if (data && data.products) {
                    setProducts(data.products);
                    const product = data.products.find(p => p.id === productId);
                    setCurrentProduct(product);
                    if (product && product.store) {
                        setCurrentStore(product.store);
                    }
                }
            } catch (error) {
                setProducts([]);
                setCurrentProduct(null);
                setCurrentStore(null);
            }
        }
        getProducts();
    }, [productId]);

    // Check if product is in wishlist when component loads
    useEffect(() => {
        const loadWishlist = async () => {
            if (user && productId && session) {
                try {
                    // Get token from Clerk session
                    const token = await session.getToken();
                    if (token) {
                        await dispatch(fetchWishlist({ token }));
                    }
                } catch (error) {
                    console.error('Error getting token:', error);
                }
            }
        };
        loadWishlist();
    }, [user, session, productId, dispatch]);

    // Update the wishlist status based on Redux state
    useEffect(() => {
        if (productId && wishlistItems) {
            setIsWishlisted(!!wishlistItems[productId]);
        }
    }, [productId, wishlistItems]);

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
                category: reportData.type
            };

            // Submit the report via API
            await submitReport(reportPayload);

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
        "Info Penting": (
            <div className="py-6">
                <h4 className="font-semibold mb-2 text-black">Info Penting</h4>
                <ul className="text-sm opacity-80 list-disc ml-5 text-black">
                    <li>Barang yang sudah dibeli tidak dapat dikembalikan kecuali cacat.</li>
                    <li>Pastikan alamat pengiriman sudah benar.</li>
                    <li>Hubungi customer service untuk pertanyaan lebih lanjut.</li>
                </ul>
            </div>
        ),
        Ulasan: (
            <section className="mt-6 grid gap-6 lg:grid-cols-[280px_1fr] text-black">
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
                        reviews.map((review) => (
                            <article key={review.id} className="rounded-box border border-gray-100 shadow-2xs p-4">
                                <div className="flex items-center gap-3">
                                    <div className="avatar placeholder">
                                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                            <span className="text-xs text-gray-600">{review.user?.name?.[0] || 'U'}</span>
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">{review.user?.name || 'Anonymous User'}</p>
                                        <div className="flex items-center text-warning">
                                            {Array.from({ length: 5 }).map((_, idx) => (
                                                <FaStar
                                                    key={idx}
                                                    className={idx < review.rating ? 'text-yellow-500' : 'text-gray-300'}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    <span className="text-xs opacity-60">{review.createdAt ? new Date(review.createdAt).toLocaleDateString('id-ID') : 'Recently'}</span>
                                </div>
                                <p className="mt-3 text-sm">
                                    {review.comment || 'No comment provided.'}
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
                            <a>Home</a>
                        </li>
                        <li>
                            <a>{typeof currentProduct?.category === 'object' && currentProduct?.category !== null ? currentProduct.category.name : currentProduct?.category}</a>
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
                    className="text-black"
                />
                <div className="grid gap-8 lg:grid-cols-[1.1fr_1.2fr_0.8fr]">
                    {/* Gallery */}
                    <section aria-labelledby="gallery" className="space-y-4">
                        <div className="aspect-[5/4] w-full overflow-hidden rounded-box ">
                            <img
                                alt={currentProduct?.name}
                                className="h-full w-full object-cover"
                                src={Array.isArray(currentProduct?.images) && currentProduct.images.length > 0 ? currentProduct.images[selectedImageIdx] : "/images/default.png"}
                            />
                        </div>
                        <div className="grid grid-cols-4 gap-3">
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

                        <h1 className="text-pretty text-3xl font-semibold leading-tight flex items-center gap-2 justify-between">
                            <div className="flex items-center gap-4">
                                {currentProduct?.name}
                                {discountPercent > 0 && (
                                    <span className="badge badge-accent text-xs font-semibold text-white bg-[#ED775A] border-none">
                                        Diskon {discountPercent}%
                                    </span>
                                )}
                            </div>
                            {currentProduct?.userId !== user?.id && currentStore.userId !== user?.id && (
                                <button
                                    className="ml-3 px-3 py-1 rounded border border-red-500 text-red-500 bg-white hover:bg-red-50 text-xs font-semibold"
                                    onClick={() => setIsReportModalOpen(true)}
                                >
                                    Report
                                </button>
                            )}
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
                            </div>
                        ) : (
                            <p className="text-2xl font-bold tracking-tight">Rp {currentProduct?.price.toLocaleString("id-ID")}</p>
                        )}

                        <div className="space-y-3">
                            <div className="space-y-3">
                                <div className="text-sm">
                                    <span className="font-medium">Pilih warna:</span>{" "}
                                    <span className="opacity-80">{selectedColor}</span>
                                </div>

                                {/* color options */}
                                <div className="tabs tabs-box bg-white rounded-none mb-5 ">
                                    {colors.map((color) => (
                                        <input
                                            key={color}
                                            type="radio"
                                            name="var_tabs"
                                            aria-label={color}
                                            checked={selectedColor === color}
                                            onChange={() => setSelectedColor(color)}
                                            className="tab shadow-none mt-3 [--tab-bg:#F0F0F0]"
                                        />
                                    ))}
                                </div>
                            </div>

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
                                        <p className="text-xs opacity-70">{selectedColor}</p>
                                    </div>
                                </div>

                                <div className="join">
                                    <button
                                        className="btn join-item bg-gray-50 border-gray-300 shadow-none text-black"
                                        aria-label="kurangi"
                                        onClick={() => setQty((q) => Math.max(1, q - 1))}
                                    >
                                        <FiMinus />
                                    </button>
                                    <input
                                        className="input join-item border-gray-300 w-16 text-center border  bg-gray-50 text-black"
                                        value={qty}
                                        onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))}
                                    />
                                    <button className="btn join-item border-gray-300 border shadow-none bg-gray-50 text-black" aria-label="tambah" onClick={() => setQty((q) => q + 1)}>
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
                                </div>

                                <div className="flex flex-row w-full gap-2">
                                    <button
                                        className="btn w-3/4 bg-[#ED775A] border-none hover:bg-[#eb6b4b] shadow-none text-sm"
                                        onClick={() => {
                                            // Open checkout page in a new tab with product ID and quantity
                                            window.open(`/pages/checkout/?productId=${currentProduct.id}&qty=${qty}`, '_blank');
                                        }}
                                    >
                                        Checkout
                                    </button>
                                    <button className="btn bg-white w-1/4 shadow-none text-[#ED775A] border hover:bg-gray-100 border-[#ED775A] hover:border-[#eb6b4b] hover:text-[#ED775A]"
                                        onClick={async () => {
                                            try {
                                                // Fetch current cart from backend to ensure we have the latest state
                                                const currentCartResponse = await fetchCart();
                                                const currentCart = currentCartResponse.cart || {};

                                                // Calculate the new cart state based on current backend state
                                                const currentProductQty = currentCart[currentProduct.id] || 0;
                                                const newProductQty = currentProductQty + qty;

                                                // Prepare the updated cart to send to backend
                                                const updatedCart = {
                                                    ...currentCart,
                                                    [currentProduct.id]: newProductQty
                                                };

                                                // Send updated cart to backend
                                                await addToCartAPI({ cart: updatedCart });

                                                // Then update Redux state to match
                                                if (currentProductQty > 0) {
                                                    // Product exists, increase quantity by qty amount
                                                    for (let i = 0; i < qty; i++) {
                                                        dispatch(increaseQuantity({ productId: currentProduct.id }));
                                                    }
                                                } else {
                                                    // Product doesn't exist, add new item
                                                    dispatch(addToCart({
                                                        productId: currentProduct.id,
                                                        quantity: qty
                                                    }));
                                                }

                                                await Swal.fire({
                                                    icon: 'success',
                                                    title: 'Berhasil',
                                                    text: `${currentProduct.name} (${qty} pcs) berhasil ditambahkan ke keranjang!`,
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
                                    >
                                        <FiShoppingCart className="w-5" />
                                    </button>
                                </div>

                                <div className="flex flex-row justify-between text-sm opacity-70">
                                    <div className="rounded-box p-2 text-center flex flex-row items-center gap-1 cursor-pointer hover:text-gray-500">
                                        <FiMessageSquare className="" />
                                        <span>Chat</span>
                                    </div>
                                    <span className="flex my-2 w-0.5 rounded-2xl bg-gray-800 "></span>
                                    <div
                                        onClick={async () => {
                                            if (!user) {
                                                router.push('/sign-in');
                                                return;
                                            }

                                            try {
                                                if (isWishlisted) {
                                                    // Get token from Clerk session
                                                    let token = null;
                                                    try {
                                                        token = await session.getToken();
                                                    } catch (error) {
                                                        console.error('Error getting Clerk token:', error);
                                                    }
                                                    if (!token) {
                                                        throw new Error('Authentication token not available');
                                                    }
                                                    await dispatch(removeFromWishlistAPI({
                                                        productId: currentProduct.id,
                                                        token
                                                    }));
                                                    await Swal.fire({
                                                        icon: 'success',
                                                        title: 'Berhasil',
                                                        text: 'Produk berhasil dihapus dari wishlist!',
                                                        timer: 2000,
                                                        showConfirmButton: false
                                                    });
                                                } else {
                                                    // Get token from Clerk session
                                                    let token = null;
                                                    try {
                                                        token = await session.getToken();
                                                    } catch (error) {
                                                        console.error('Error getting Clerk token:', error);
                                                    }
                                                    if (!token) {
                                                        throw new Error('Authentication token not available');
                                                    }
                                                    await dispatch(addToWishlistAPI({
                                                        productId: currentProduct.id,
                                                        token
                                                    }));
                                                    await Swal.fire({
                                                        icon: 'success',
                                                        title: 'Berhasil',
                                                        text: 'Produk berhasil ditambahkan ke wishlist!',
                                                        timer: 2000,
                                                        showConfirmButton: false
                                                    });
                                                }
                                            } catch (error) {
                                                console.error('Error updating wishlist:', error);
                                                await Swal.fire({
                                                    icon: 'error',
                                                    title: 'Gagal',
                                                    text: error?.response?.data?.error || 'Gagal memperbarui wishlist.',
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
                        {["Detail", "Spesifikasi", "Info Penting", "Ulasan"].map((tab) => (
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
                <section className="mt-10">
                    <h3 className="mb-4 text-base font-semibold text-black">Produk Lainnya dari Toko ini</h3>
                    <div className="relative">
                        {products.filter((product) => product.store?.id === currentStore.id && product.id !== currentProduct.id).length === 0 ? (
                            <div className="text-gray-500 text-center py-8">This store has no more product.</div>
                        ) : (
                            <>
                                <div className="flex scrollbar-hide gap-6 pb-4 scroll-container overflow-x-hidden">
                                    {products
                                        .filter((product) => product.store?.id === currentStore.id && product.id !== currentProduct.id)
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
                                        container.scrollBy({ left: -300, behavior: 'smooth' });
                                    }}
                                >
                                    <FaChevronLeft aria-hidden="true" />
                                </button>
                                <button
                                    className="absolute top-1/2 right-0 transform -translate-y-1/2 bg-[#ED775A] text-white p-2 rounded-full shadow hover:bg-[#e76b4c] mr-2"
                                    onClick={() => {
                                        const container = document.querySelector('.scroll-container');
                                        container.scrollBy({ left: 300, behavior: 'smooth' });
                                    }}
                                >
                                    <FaChevronRight aria-hidden="true" />
                                </button>
                            </>
                        )}
                    </div>
                </section>

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