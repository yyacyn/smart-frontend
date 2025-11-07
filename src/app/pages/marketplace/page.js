"use client"

import { useState, useEffect, Suspense } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import Navbar from "../../components/navbar/Navbar"
import Footer from "../../components/footer/Footer"
import ProductCard from "../../components/product/Card"
import { FiFilter } from "react-icons/fi";
import { AiOutlineFrown } from "react-icons/ai";
import { flashSales, recommendedProducts } from "../../data/products";
import { fetchProducts } from "../../api";

function MarketplaceContent() {
    const searchParams = useSearchParams();
    const initialCategory = searchParams.get('category') || 'all';
    const [products, setProducts] = useState([])
    const [filteredProducts, setFilteredProducts] = useState([])
    const [filters, setFilters] = useState({
        search: '',
        category: initialCategory,
        minPrice: 0,
        maxPrice: 1000000,
        rating: 0,
        sortBy: 'name',
        cod: false,
        discount: false,
        gratisOngkir: false
    })
    const [isFilterOpen, setIsFilterOpen] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)
    const [productsPerPage] = useState(12)


    useEffect(() => {
        async function getProducts() {
            try {
                const data = await fetchProducts();
                if (data && data.products) {
                    setProducts(data.products);
                    setFilteredProducts(data.products);
                } else {
                    setProducts([]);
                    setFilteredProducts([]);
                }
            } catch (error) {
                setProducts([]);
                setFilteredProducts([]);
            }
        }
        getProducts();
    }, []);

    // Sync category and discount filter with query param whenever it changes
    useEffect(() => {
        const categoryFromQuery = searchParams.get('category');
        const discountFromQuery = searchParams.get('discount');
        let updates = {};
        if (categoryFromQuery && categoryFromQuery !== filters.category) {
            updates.category = categoryFromQuery;
        }
        if (typeof discountFromQuery === 'string') {
            updates.discount = discountFromQuery === 'true';
        }
        if (Object.keys(updates).length > 0) {
            setFilters(prev => ({ ...prev, ...updates }));
        }
    }, [searchParams])

    useEffect(() => {
        let filtered = products.filter(product => {
            // Match API attributes
            const name = product.name || "";
            const price = typeof product.price === "number" ? product.price : 0;
            const mrp = typeof product.mrp === "number" ? product.mrp : price;
            const category = product.category || "";
            const rating = Array.isArray(product.rating) ? (
                product.rating.length > 0 ? Math.round(product.rating.reduce((acc, curr) => acc + (typeof curr === 'number' ? curr : 0), 0) / product.rating.length) : 0
            ) : 0;
            // Category mapping for filtering
            let categoryMatch = true;
            if (filters.category !== 'all') {
                switch (filters.category) {
                    case 'Makanan & Minuman':
                        categoryMatch = category === 'Makanan';
                        break;
                    case 'Kesehatan & Kecantikan':
                        categoryMatch = category === 'Obat-obatan' || category === 'Kecantikan';
                        break;
                    case 'Kerajinan Lokal':
                        categoryMatch = category === 'Produk Lokal';
                        break;
                    default:
                        categoryMatch = category === filters.category;
                }
            }
            let match = name.toLowerCase().includes(filters.search.toLowerCase()) &&
                categoryMatch &&
                price >= filters.minPrice &&
                price <= filters.maxPrice &&
                rating >= filters.rating;
            // Penawaran filters
            if (filters.cod) {
                match = match && product.cod === true;
            }
            if (filters.discount) {
                match = match && product.discount != null && product.discount > 0;
            }
            if (filters.gratisOngkir) {
                match = match && product.gratisOngkir === true;
            }
            return match;
        })

        // Apply sorting
        filtered.sort((a, b) => {
            switch (filters.sortBy) {
                case 'price-low':
                    return (a.price || 0) - (b.price || 0);
                case 'price-high':
                    return (b.price || 0) - (a.price || 0);
                case 'rating': {
                    const aRating = Array.isArray(a.rating) ? (a.rating.length > 0 ? Math.round(a.rating.reduce((acc, curr) => acc + (typeof curr === 'number' ? curr : 0), 0) / a.rating.length) : 0) : 0;
                    const bRating = Array.isArray(b.rating) ? (b.rating.length > 0 ? Math.round(b.rating.reduce((acc, curr) => acc + (typeof curr === 'number' ? curr : 0), 0) / b.rating.length) : 0) : 0;
                    return bRating - aRating;
                }
                case 'reviews':
                    return (Array.isArray(b.rating) ? b.rating.length : 0) - (Array.isArray(a.rating) ? a.rating.length : 0);
                default:
                    return (a.name || "").localeCompare(b.name || "");
            }
        })

        setFilteredProducts(filtered)
    }, [filters, products])

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({
            ...prev,
            [key]: value
        }))
    }

    const resetFilters = () => {
        setFilters({
            search: '',
            category: 'all',
            minPrice: 0,
            maxPrice: 1000000,
            rating: 0,
            sortBy: 'name',
            cod: false,
            discount: false,
            gratisOngkir: false
        })
    }

    const handlePageChange = (page) => {
        setCurrentPage(page)
    }

    const categories = [
        { value: 'all', label: 'Semua Kategori' },
        { value: 'Makanan & Minuman', label: 'Makanan & Minuman' },
        { value: 'Pakaian', label: 'Pakaian' },
        { value: 'Kesehatan & Kecantikan', label: 'Kesehatan & Kecantikan' },
        { value: 'Kebutuhan Harian', label: 'Kebutuhan Harian' },
        { value: 'Kerajinan Lokal', label: 'Kerajinan Lokal' }
    ]

    // Pagination logic
    const indexOfLastProduct = currentPage * productsPerPage
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage
    const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct)
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage)

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="container mx-auto px-4 py-8 mt-18 mb-20">
                {/* Header */}

                <div className="flex flex-col lg:flex-row gap-6 ">
                    {/* Filter Sidebar */}
                    <div className="lg:w-1/4">
                        {/* Mobile Filter Toggle */}
                        <button
                            className="lg:hidden w-full mb-4 btn btn-outline"
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                        >
                            <FiFilter className="w-5 h-5 mr-2" />
                            Filter & Urutkan
                        </button>

                        {/* Filter Panel */}
                        <div className={`bg-white rounded-lg shadow-sm p-6 ${isFilterOpen ? 'block' : 'hidden lg:block'}`}>
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-semibold text-gray-800">Filter</h2>
                                <button
                                    onClick={resetFilters}
                                    className="text-sm text-blue-600 hover:text-blue-800"
                                >
                                    Reset
                                </button>
                            </div>


                            {/* Search */}
                            <div className="mb-6">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Cari produk</label>
                                <input
                                    type="text"
                                    placeholder="Cari disini"
                                    id="search"
                                    className="input input-bordered bg-white focus:outline-none border-gray-400 rounded-md"
                                    value={filters.search}
                                    onChange={e => handleFilterChange('search', e.target.value)} />
                            </div>

                            {/* Category */}
                            <div className="mb-6">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Kategori
                                </label>
                                <select
                                    className="select select-bordered w-full bg-white text-gray-700 border-gray-400 rounded-md focus:outline-none "
                                    value={filters.category}
                                    onChange={(e) => handleFilterChange('category', e.target.value)}
                                >
                                    {categories.map(cat => (
                                        <option key={cat.value} value={cat.value}>
                                            {cat.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Price Range */}
                            <div className="mb-6">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Rentang Harga
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    <input
                                        type="number"
                                        placeholder="Min"
                                        className="input input-bordered input-sm
                                        focus:outline-none bg-white border-gray-400"
                                        value={filters.minPrice}
                                        onChange={(e) => handleFilterChange('minPrice', Math.max(0, parseInt(e.target.value) || 0))}
                                    />
                                    <input
                                        type="number"
                                        placeholder="Max"
                                        className="input input-bordered input-sm bg-white border-gray-400 focus:outline-none"
                                        value={filters.maxPrice}
                                        onChange={(e) => handleFilterChange('maxPrice', Math.max(0, parseInt(e.target.value) || 0))}
                                    />
                                </div>
                            </div>

                            {/* Rating Filter */}
                            <div className="mb-6">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Rating Minimum
                                </label>
                                <div className="rating">
                                    {[1, 2, 3, 4, 5].map(rating => (
                                        <input
                                            key={rating}
                                            type="radio"
                                            name="rating"
                                            className="mask mask-star-2 bg-orange-400"
                                            aria-label={`${rating} star`}
                                            checked={filters.rating === rating}
                                            onChange={() => handleFilterChange('rating', rating)}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Penawaran Filter */}
                            <div className="">
                                <label className="block text-sm text-gray-700 mb-2 font-semibold">
                                    Penawaran
                                </label>
                                <div className="checkbox-group flex flex-col gap-2">
                                    <label className="cursor-pointer flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            className="checkbox checkbox-sm border-gray-400 text-black"
                                            checked={filters.cod}
                                            onChange={e => handleFilterChange('cod', e.target.checked)}
                                        />
                                        <span className="text-sm">COD</span>
                                    </label>
                                    <label className="cursor-pointer flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            className="checkbox checkbox-sm border-gray-400 text-black"
                                            checked={filters.discount}
                                            onChange={e => handleFilterChange('discount', e.target.checked)}
                                        />
                                        <span className="text-sm">Diskon</span>
                                    </label>
                                    <label className="cursor-pointer flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            className="checkbox checkbox-sm border-gray-400 text-black"
                                            checked={filters.gratisOngkir}
                                            onChange={e => handleFilterChange('gratisOngkir', e.target.checked)}
                                        />
                                        <span className="text-sm">Gratis Ongkir</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Products Grid */}
                    <div className="lg:w-3/4">
                        <div className="flex justify-between mb-4">
                            {/* Results Header */}
                            <div className="flex justify-between items-center w-2/3">
                                <p className="text-gray-600">
                                    Menampilkan {filteredProducts.length} dari {products.length} produk
                                </p>
                            </div>
                            {/* Sort */}
                            <div className="flex w-1/3 items-center gap-3">
                                <label className="block text-sm font-medium text-gray-700">
                                    Urutkan:
                                </label>
                                <select
                                    className="select select-bordered w-full bg-white border-gray-400 rounded-md focus:outline-none "
                                    value={filters.sortBy}
                                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                                >
                                    <option value="name">Nama A-Z</option>
                                    <option value="price-low">Harga Terendah</option>
                                    <option value="price-high">Harga Tertinggi</option>
                                    <option value="rating">Rating Tertinggi</option>
                                    <option value="reviews">Paling Banyak Review</option>
                                </select>
                            </div>

                        </div>
                        {/* Products Grid */}
                        {filteredProducts.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                                {currentProducts.map((product) => (
                                    <ProductCard key={product.id || product.ID} product={product} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <div className="text-gray-400 mb-4">
                                    <AiOutlineFrown className="w-16 h-16 mx-auto" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada produk ditemukan</h3>
                                <p className="text-gray-500">Coba ubah filter atau kata kunci pencarian Anda</p>
                            </div>
                        )}

                        {/* Pagination
                        <div className="flex justify-center mt-6 ">
                            <div className="join ">
                                {Array.from({ length: totalPages }, (_, i) => (
                                    <button
                                        key={i + 1}
                                        className={`join-item btn bg-[#ED775A] text-white border-none ${currentPage === i + 1 ? 'btn-active' : ''}`}
                                        onClick={() => handlePageChange(i + 1)}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                            </div>
                        </div> */}
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    )
}

export default function MarketplacePage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="loading loading-spinner loading-lg text-[#ED775A]"></div></div>}>
            <MarketplaceContent />
        </Suspense>
    );
}