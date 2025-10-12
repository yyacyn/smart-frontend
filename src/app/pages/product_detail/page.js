"use client"

import { useMemo, useState } from "react"
import Navbar from "../../components/navbar/Navbar"
import Footer from "../../components/footer/Footer"
import { FiMinus, FiPlus, FiStar, FiMessageSquare, FiChevronUp, FiShare, Fa } from "react-icons/fi"
import { FaStar } from "react-icons/fa"
import ProductCard from "../../components/product/Card"

export default function ProductPage() {
    const [qty, setQty] = useState(2)
    const [activeTab, setActiveTab] = useState("Detail")
    // const subtotal = useMemo(() => qty * (products[0].harga + 200000), [qty]) // matches wireframe Rp 400.000 at qty 2

    const [selectedRatings, setSelectedRatings] = useState([]);
    const colors = ["Merah", "Kuning", "Hitam", "Putih"];
    const [selectedColor, setSelectedColor] = useState(colors[0]);
    const [isWishlisted, setIsWishlisted] = useState(false);

    const handleRatingChange = (r) => {
        setSelectedRatings((prev) =>
            prev.includes(r)
                ? prev.filter((rating) => rating !== r)
                : [...prev, r]
        );
    };

    const products = [
        {
            ID: 0,
            nama_produk: "Dummy Product",
            harga: 10000,
            discount: 20,
            rating: 4,
            reviews: 34,
            kategori: "Dummy",
            image:
                "https://soccerwearhouse.com/cdn/shop/files/Portugal_2025_Home_Jersey_by_PUMA_-_Cristiano_Ronaldo.jpg?v=1736466474",
        },
    ]



    // Tab content
    const tabContents = {
        Detail: (
            <div className="py-6">
                <h4 className="font-semibold mb-2">Deskripsi Produk</h4>
                <p className="text-sm opacity-80">
                    Ini adalah produk dummy untuk keperluan demo. Deskripsi produk akan tampil di sini. Tambahkan detail produk, fitur, dan keunggulan produk Anda.
                </p>
            </div>
        ),
        Spesifikasi: (
            <div className="py-6">
                <h4 className="font-semibold mb-2">Spesifikasi</h4>
                <ul className="text-sm opacity-80 list-disc ml-5">
                    <li>Bahan: Katun Premium</li>
                    <li>Ukuran: Tersedia S, M, L, XL</li>
                    <li>Warna: Merah, Kuning, Hitam, Putih</li>
                    <li>Berat: 500 gram</li>
                </ul>
            </div>
        ),
        "Info Penting": (
            <div className="py-6">
                <h4 className="font-semibold mb-2">Info Penting</h4>
                <ul className="text-sm opacity-80 list-disc ml-5">
                    <li>Barang yang sudah dibeli tidak dapat dikembalikan kecuali cacat.</li>
                    <li>Pastikan alamat pengiriman sudah benar.</li>
                    <li>Hubungi customer service untuk pertanyaan lebih lanjut.</li>
                </ul>
            </div>
        ),
        Ulasan: (
            <section className="mt-6 grid gap-6 lg:grid-cols-[280px_1fr]">
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
                <div className="space-y-4">
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
        <div className="min-h-dvh btext-base-content mt-16 pt-10">
            <Navbar />
            {/* Breadcrumbs */}
            <div className="flex mx-auto max-w-7xl px-4">
                <div className="breadcrumbs py-4 text-sm">
                    <ul>
                        <li>
                            <a>Home</a>
                        </li>
                        <li>
                            <a>{products[0].kategori}</a>
                        </li>
                        <li className="font-medium">{products[0].nama_produk}</li>
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
                                src={products[0].image}
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
                                        src={products[0].image}
                                    />
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* Product info */}
                    <section className="space-y-4">
                        <h1 className="text-pretty text-xl font-semibold leading-tight">
                            {products[0].nama_produk}
                        </h1>

                        <div className="flex gap-2 text-sm text-base-content/70">
                            <span className="badge bg-[#ED775A] border-none">Official</span>
                            <span className="badge bg-[#ED775A] border-none">Terlaris</span>
                            <span className="badge bg-[#ED775A] border-none">Gratis Ongkir</span>
                        </div>

                        <div className="divider my-2" />

                        <p className="text-2xl font-bold tracking-tight">Rp {products[0].harga.toLocaleString("id-ID")}</p>

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
                    <aside className="lg:sticky lg:top-4">
                        <div className="card border border-gray-300 bshadow-sm">
                            <div className="card-body gap-4">
                                <h3 className="card-title text-base">Atur Jumlah</h3>

                                <div className="flex items-center gap-2">
                                    <div className="avatar">
                                        <div className="h-12 w-12 rounded">
                                            <img
                                                src={products[0].image}
                                                alt="Selected product variant"
                                                className="h-full w-full object-cover rounded"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">Varian Terpilih</p>
                                        <p className="text-xs opacity-70">Merah • 42</p>
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
                                        <span className="font-semibold">Rp {(qty * products[0].harga).toLocaleString("id-ID")}</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    <button className="btn bg-[#ED775A] border-none hover:bg-[#eb6b4b] shadow">Checkout</button>
                                    <button className="btn bg-white shadow-none text-[#ED775A] border border-[#ED775A] hover:border-[#eb6b4b] hover:text-[#ED775A]">Simpan</button>
                                </div>

                                <div className="flex flex-row justify-between text-sm opacity-70">
                                    <div className="rounded-box p-2 text-center flex flex-row items-center gap-1 cursor-pointer">
                                        <FiMessageSquare className="" />
                                        <span>Chat</span>
                                    </div>
                                    <span className="flex my-2 w-0.5 rounded-2xl bg-gray-800"></span>
                                    <div
                                        onClick={() => setIsWishlisted(!isWishlisted)}
                                        className={`rounded-box p-2 text-center flex flex-row items-center gap-1 cursor-pointer transition-colors ${isWishlisted ? "" : "text-gray-800"
                                            }`}
                                    >
                                        {isWishlisted ? (
                                            <FaStar className="text-red-500" />
                                        ) : (
                                            <FiStar className="text-gray-800" />
                                        )}
                                        <span>Wishlist</span>
                                    </div>;
                                    <span class="flex my-2 w-0.5 rounded-2xl bg-gray-800"></span>
                                    <div className="rounded-box p-2 text-center flex flex-row items-center gap-1 cursor-pointer">
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
                        {['Detail', 'Spesifikasi', 'Info Penting', 'Ulasan'].map((tab) => (
                            <a
                                key={tab}
                                role="tab"
                                className={`tab hover:bg-gray-100 hover:text-black text-black ${activeTab === tab ? 'tab-active text-black' : 'text-black'}`}
                                onClick={() => setActiveTab(tab)}
                                tabIndex={0}
                                style={{ cursor: 'pointer' }}
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
                    <h3 className="mb-4 text-base font-semibold">Produk Lainnya dari Toko ini</h3>
                    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <ProductCard key={i} />
                        ))}
                    </div>
                </section>

                {/* CTA banner */}
                <section className="mt-14 rounded-box border /60 p-6">
                    <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                        <div>
                            <h3 className="text-pretty text-lg font-semibold">
                                Punya Bisnis? Yuk Buka Lapak di SMART, Pasar Online Sukmajaya!
                            </h3>
                            <p className="mt-1 text-sm opacity-70">
                                Mulai berjualan gratis. Jangkau lebih banyak pelanggan sekarang.
                            </p>
                        </div>
                        <button className="btn btn-primary">Buka Toko GRATIS</button>
                    </div>
                </section>

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
