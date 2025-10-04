"use client"

import { useMemo, useState } from "react"
import Navbar from "../../components/navbar/Navbar"
import Footer from "../../components/footer/Footer"
import { FiMinus, FiPlus, FiStar, FiChevronRight } from "react-icons/fi"
import ProductCard from "../../components/product/Card"

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

export default function ProductPage() {
    const [qty, setQty] = useState(2)
    const subtotal = useMemo(() => qty * (products[0].harga + 200000), [qty]) // matches wireframe Rp 400.000 at qty 2

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
                            <span className="badge badge-ghost">Official</span>
                            <span className="badge badge-ghost">Terlaris</span>
                            <span className="badge badge-ghost">Gratis Ongkir</span>
                        </div>

                        <div className="divider my-2" />

                        <p className="text-2xl font-bold tracking-tight">Rp {products[0].harga.toLocaleString("id-ID")}</p>

                        <div className="space-y-3">
                            <div className="text-sm">
                                <span className="font-medium">Pilih warna:</span> <span className="opacity-80">Merah Kuning</span>
                            </div>

                            {/* color options */}
                            <div className="flex flex-wrap gap-2">
                                {["Merah", "Kuning", "Hitam", "Putih"].map((c, idx) => (
                                    <button key={c} className={`btn btn-sm ${idx === 1 ? "btn-primary" : "btn-ghost"} rounded-full`}>
                                        {c}
                                    </button>
                                ))}
                            </div>

                            {/* action buttons */}
                            <div className="grid grid-cols-2 gap-3">
                                <button className="btn btn-primary">Tambah ke Keranjang</button>
                                <button className="btn btn-outline">Beli Langsung</button>
                            </div>
                        </div>

                        {/* shipping / guarantees */}
                        <div className="grid gap-3 sm:grid-cols-3">
                            <div className="rounded-box border p-3">
                                <p className="text-sm font-medium">Pengiriman</p>
                                <p className="text-sm opacity-70">Cek ongkir di halaman checkout</p>
                            </div>
                            <div className="rounded-box border p-3">
                                <p className="text-sm font-medium">Garansi</p>
                                <p className="text-sm opacity-70">Retur 7 hari sejak barang diterima</p>
                            </div>
                            <div className="rounded-box border p-3">
                                <p className="text-sm font-medium">Kualitas</p>
                                <p className="text-sm opacity-70">Original 100% — uang kembali</p>
                            </div>
                        </div>
                    </section>

                    {/* Quantity + Summary Card */}
                    <aside className="lg:sticky lg:top-4">
                        <div className="card border bshadow-sm">
                            <div className="card-body gap-4">
                                <h3 className="card-title text-base">Atur Jumlah</h3>

                                <div className="flex items-center gap-2">
                                    <div className="avatar placeholder">
                                        <div className="h-12 w-12 rounded " />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">Varian Terpilih</p>
                                        <p className="text-xs opacity-70">Merah • 42</p>
                                    </div>
                                </div>

                                <div className="join">
                                    <button
                                        className="btn join-item bg-gray-50 shadow-none text-black"
                                        aria-label="kurangi"
                                        onClick={() => setQty((q) => Math.max(1, q - 1))}
                                    >
                                        <FiMinus />
                                    </button>
                                    <input
                                        className="input join-item w-16 text-center border border-base-200 bg-gray-50 text-black"
                                        value={qty}
                                        onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))}
                                    />
                                    <button className="btn join-item border shadow-none bg-gray-50 text-black" aria-label="tambah" onClick={() => setQty((q) => q + 1)}>
                                        <FiPlus />
                                    </button>
                                </div>

                                <div className="rounded-box  p-3 text-sm">
                                    <div className="flex items-center justify-between">
                                        <span>Subtotal</span>
                                        <span className="font-semibold">Rp {subtotal.toLocaleString("id-ID")}</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    <button className="btn btn-primary">Checkout</button>
                                    <button className="btn btn-outline">Simpan</button>
                                </div>

                                <div className="grid grid-cols-3 gap-2 text-xs opacity-70">
                                    <div className="rounded-box  p-2 text-center">Voucher</div>
                                    <div className="rounded-box  p-2 text-center">Kurir</div>
                                    <div className="rounded-box  p-2 text-center">Asuransi</div>
                                </div>
                            </div>
                        </div>
                    </aside>
                </div>

                {/* Tabs */}
                <section className="mt-10">
                    <div role="tablist" className="tabs tabs-bordered">
                        <a role="tab" className="tab text-black hover:text-[#ED775A] focus:text-[#ED775A]">
                            Detail
                        </a>
                        <a role="tab" className="tab text-black hover:text-[#ED775A] focus:text-[#ED775A]">
                            Spesifikasi
                        </a>
                        <a role="tab" className="tab text-black hover:text-[#ED775A] focus:text-[#ED775A]">
                            Info Penting
                        </a>
                        <a role="tab" className="tab tab-active text-black hover:text-[#ED775A] focus:text-[#ED775A]">
                            Ulasan
                        </a>
                    </div>
                </section>

                {/* Reviews + Filter */}
                <section className="mt-6 grid gap-6 lg:grid-cols-[280px_1fr]">
                    {/* Filter */}
                    <aside className="rounded-box border p-4">
                        <h4 className="mb-4 text-sm font-semibold">Filter Ulasan</h4>
                        <div className="form-control">
                            <label className="label cursor-pointer justify-start gap-3">
                                <input type="checkbox" className="checkbox checkbox-m text-black border-black rounded-4xl" />
                                <span className="label-text">Dengan Foto</span>
                            </label>
                            <label className="label cursor-pointer justify-start gap-3">
                                <input type="checkbox" className="checkbox checkbox-m text-black border-black rounded-4xl" />
                                <span className="label-text">Pembelian Terverifikasi</span>
                            </label>
                        </div>

                        <div className="mt-4">
                            <p className="mb-2 text-sm font-medium">Rating</p>
                            {[5, 4, 3, 2, 1].map((r) => (
                                <button key={r} className="btn btn-ghost btn-sm justify-start">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <FiStar key={i} className={i < r ? "text-warning" : "opacity-30"} aria-hidden />
                                    ))}
                                    <span className="ml-2 text-xs">{r} bintang</span>
                                </button>
                            ))}
                        </div>
                    </aside>

                    {/* Reviews List */}
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <article key={i} className="rounded-box border p-4">
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
                    <FiChevronRight aria-hidden />
                </div>
            </main>

            <Footer />
        </div>
    )
}
