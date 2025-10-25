"use client"

import { useMemo, useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Navbar from "../../../components/navbar/Navbar"
import Footer from "../../../components/footer/Footer"
import { FiMinus, FiPlus, FiStar, FiMessageSquare, FiChevronUp, FiShare, FiShoppingCart,  } from "react-icons/fi"
import CTA from '../../components/CTA';
import { FaStar, FaChevronLeft, FaChevronRight } from "react-icons/fa"
import ProductCard from "../../../components/product/Card"
import { sampleProducts, flashSales, recommendedProducts } from "../../../data/products";
import { stores } from "../../../data/store";

export default function ProductPage() {
    const params = useParams();
    const productId = parseInt(params.id);
    
    const [qty, setQty] = useState(2)
    const [activeTab, setActiveTab] = useState("Detail")
    const [products, setProducts] = useState([]); // Declare products state
    const [currentProduct, setCurrentProduct] = useState(null);
    const [currentStore, setCurrentStore] = useState(null);
    const [selectedRatings, setSelectedRatings] = useState([]);
    const colors = ["Merah", "Kuning", "Hitam", "Putih"];
    const [selectedColor, setSelectedColor] = useState(colors[0]);
    const [isWishlisted, setIsWishlisted] = useState(false);

    useEffect(() => {
        setProducts(sampleProducts); // Initialize products with sampleProducts
        
        // Find the current product based on the ID from the URL
        const product = sampleProducts.find(p => p.ID === productId);
        setCurrentProduct(product);
        
        // Find the store for this product
        if (product) {
            const store = stores.find(s => s.store_id === product.store_id);
            setCurrentStore(store);
        }
    }, [productId]);

    const handleRatingChange = (r) => {
        setSelectedRatings((prev) =>
            prev.includes(r)
                ? prev.filter((rating) => rating !== r)
                : [...prev, r]
        );
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
                    Ini adalah produk dummy untuk keperluan demo. Deskripsi produk akan tampil di sini. Tambahkan detail produk, fitur, dan keunggulan produk Anda.
                </p>
            </div>
        ),
        Spesifikasi: (
            <div className="py-6">
                <h4 className="font-semibold mb-2 text-black">Spesifikasi</h4>
                <ul className="text-sm opacity-80 list-disc ml-5 text-black">
                    <li>Bahan: Katun Premium</li>
                    <li>Ukuran: Tersedia S, M, L, XL</li>
                    <li>Warna: Merah, Kuning, Hitam, Putih</li>
                    <li>Berat: 500 gram</li>
                </ul>
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
                                            <FiStar
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
                    {[1, 2, 3].map((i) => (
                        <article key={i} className="rounded-box border border-gray-100 shadow-2xs p-4">
                            <div className="flex items-center gap-3">
                                <div className="avatar placeholder">
                                    <div className="h-10 w-10 rounded-full " />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium">Pengguna {i}</p>
                                    <div className="flex items-center text-warning">
                                        {Array.from({ length: 5 }).map((_, idx) => (
                                            <FiStar key={idx} />
                                        ))}
                                    </div>
                                </div>
                                <span className="text-xs opacity-60">2 hari lalu</span>
                            </div>
                            <p className="mt-3 text-sm">
                                Kualitas bagus, nyaman dipakai lari. Pengiriman cepat dan packing aman. Recommended!
                            </p>
                        </article>
                    ))}
                </div>
            </section>
        ),
    }

    return (
        <div className="min-h-dvh mt-16 pt-10 text-black">
            <Navbar />
            {/* Breadcrumbs */}
            <div className="flex mx-auto max-w-7xl px-4 text-black">
                <div className="breadcrumbs py-4 text-sm">
                    <ul>
                        <li>
                            <a>Home</a>
                        </li>
                        <li>
                            <a>{currentProduct?.kategori}</a>
                        </li>
                        <li className="font-medium">{currentProduct?.nama_produk}</li>
                    </ul>
                </div>
            </div>

            {/* Top Section: Gallery + Info + Quantity Card */}
            <main className="mx-auto max-w-7xl px-4 pb-12">
                <div className="grid gap-8 lg:grid-cols-[1.1fr_1.2fr_0.8fr]">
                    {/* Gallery */}
                    <section aria-labelledby="gallery" className="space-y-4">
                        <div className="aspect-[4/3] w-full overflow-hidden rounded-box ">
                            <img
                                alt="Foto produk"
                                className="h-full w-full object-cover"
                                src={currentProduct?.image}
                            />
                        </div>
                        <div className="grid grid-cols-4 gap-3">
                            {[1, 2, 3, 4].map((i) => (
                                <button
                                    key={i}
                                    className="aspect-square overflow-hidden rounded-box hover:ring-1 hover:ring-[#ED775A] hover:ring-offset-2"
                                >
                                    <img
                                        alt={"Thumbnail " + i}
                                        className="h-full w-full object-cover"
                                        src={currentProduct?.image}
                                    />
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* Product info */}
                    <section className="space-y-4 text-black">

                        <h1 className="text-pretty text-xl font-semibold leading-tight flex items-center gap-2">
                            {currentProduct?.nama_produk}
                            {currentProduct?.discount > 0 && (
                                <span className="badge badge-accent text-xs font-semibold text-white bg-[#ED775A] border-none">
                                    -{currentProduct.discount}%
                                </span>
                            )}
                        </h1>

                        <div className="flex gap-2 text-sm text-base-content/70">
                            <span className="badge bg-[#ED775A] border-none">Official</span>
                            <span className="badge bg-[#ED775A] border-none">Terlaris</span>
                            <span className="badge bg-[#ED775A] border-none">Gratis Ongkir</span>
                        </div>


                        <div className="divider my-2" />

                        {/* Price display with discount */}
                        {currentProduct?.discount > 0 ? (
                            <div className="flex items-center gap-2">
                                <span className="text-2xl font-bold tracking-tight text-[#ED775A]">
                                    Rp {(currentProduct.harga * (1 - currentProduct.discount / 100)).toLocaleString("id-ID")}
                                </span>
                                <span className="text-base line-through opacity-60">
                                    Rp {currentProduct.harga.toLocaleString("id-ID")}
                                </span>
                            </div>
                        ) : (
                            <p className="text-2xl font-bold tracking-tight">Rp {currentProduct?.harga.toLocaleString("id-ID")}</p>
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
                                            <img src={currentStore.image} alt={currentStore.name} className="h-full w-full object-cover" />
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">{currentStore.name}</p>
                                        <div className="flex items-center gap-1">
                                            <FaStar className="text-yellow-500 inline" />
                                            <p className="text-xs opacity-70 mt-0.5">{currentStore.rating} dari {currentStore.reviews} Ulasan</p>
                                        </div>
                                    </div>
                                </div>
                                <button className="btn btn-sm bg-[#ED775A] border-none hover:bg-[#eb6b4b] shadow">Kunjungi Toko</button>
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
                        <div className="card border border-gray-300 ">
                            <div className="card-body gap-4">
                                <h3 className="card-title text-base">Atur Jumlah</h3>

                                <div className="flex items-center gap-2">
                                    <div className="avatar">
                                        <div className="h-12 w-12 rounded">
                                            <img
                                                src={currentProduct?.image}
                                                alt="Selected product variant"
                                                className="h-full w-full object-cover rounded"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">Varian Terpilih</p>
                                        <p className="text-xs opacity-70">Merah • {currentProduct?.stok}</p>
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

                                <div className="rounded-box  p-3 text-sm">
                                    <div className="flex items-center justify-between">
                                        <span>Subtotal</span>
                                        <span className="font-semibold">
                                            Rp {(
                                                qty * (currentProduct?.discount > 0
                                                    ? currentProduct.harga * (1 - currentProduct.discount / 100)
                                                    : currentProduct.harga)
                                            ).toLocaleString("id-ID")}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex flex-row w-full gap-2">
                                    <button className="btn w-3/4 bg-[#ED775A] border-none hover:bg-[#eb6b4b] shadow">Checkout</button>
                                    <button className="btn bg-white w-1/4 shadow-none text-[#ED775A] border hover:bg-gray-100 border-[#ED775A] hover:border-[#eb6b4b] hover:text-[#ED775A]">
                                        <FiShoppingCart className="w-5"/></button>
                                </div>

                                <div className="flex flex-row justify-between text-sm opacity-70">
                                    <div className="rounded-box p-2 text-center flex flex-row items-center gap-1 cursor-pointer hover:text-gray-500">
                                        <FiMessageSquare className="" />
                                        <span>Chat</span>
                                    </div>
                                    <span className="flex my-2 w-0.5 rounded-2xl bg-gray-800 "></span>
                                    <div
                                        onClick={() => setIsWishlisted(!isWishlisted)}
                                        className={`rounded-box p-2 text-center flex flex-row items-center gap-1 hover:text-gray-500 cursor-pointer transition-colors ${isWishlisted ? "" : "text-gray-800"
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
                        <div className="flex scrollbar-hide gap-6 pb-4 scroll-container overflow-x-hidden">
                            {products
                                .filter((product) => product.store_id === currentStore.store_id && product.ID !== currentProduct.ID) // Filter products by the same store, exclude current product
                                .slice(0, 10)
                                .map((product) => (
                                    <div key={product.ID} className="max-w-[240px] flex-shrink-0 mt-2">
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