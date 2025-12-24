"use client"

import { useState, useEffect, Suspense } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import Navbar from "../../components/navbar/Navbar"
import Footer from "../../components/footer/Footer"
import ProductCard from "../../components/product/Card"
import StoreCard from "../../components/store/StoreCard"
import { FiFilter } from "react-icons/fi";
import { AiOutlineFrown } from "react-icons/ai";
import { flashSales, recommendedProducts } from "../../data/products";
import { fetchProducts, fetchCategories, fetchStores } from "../../api";
import { useGlobalData } from "../../contexts/GlobalDataContext";

function MarketplaceContent() {
    const searchParams = useSearchParams();
    const initialCategory = searchParams.get('category') || 'all';
    const [products, setProducts] = useState([])
    const [stores, setStores] = useState([])
    const [filteredProducts, setFilteredProducts] = useState([])
    const [filteredStores, setFilteredStores] = useState([])
    const [productsLoading, setProductsLoading] = useState(true)
    const [storesLoading, setStoresLoading] = useState(true)
    const [filters, setFilters] = useState({
        search: '',
        category: initialCategory,
        minPrice: 0,
        maxPrice: 1000000,
        rating: 0,
        sortBy: 'name',
        cod: false,
        discount: false,
        gratisOngkir: false,
        showProducts: true,
        showStores: true
    })
    const [isFilterOpen, setIsFilterOpen] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)
    const [productsPerPage] = useState(12)

    const { cachedProducts, cachedCategories, loading: globalLoading } = useGlobalData();
    const [categories, setCategories] = useState([
        { value: 'all', label: 'Semua Kategori' }
    ]);
    const [categoriesLoading, setCategoriesLoading] = useState(true);

    useEffect(() => {
        if (cachedProducts) {
            // Set initial products from cache
            setProducts(cachedProducts);
            setFilteredProducts(cachedProducts);
            setProductsLoading(false);
        }
    }, [cachedProducts]);

    // Fetch stores
    useEffect(() => {
        async function loadStores() {
            setStoresLoading(true);
            try {
                const storeRes = await fetchStores();
                const storesList = storeRes.stores || [];

                // Calculate rating for each store based on products
                const storesWithRatings = storesList.map(store => {
                    const storeProducts = products.filter(p => p.store?.id === store.id);
                    let totalRatings = 0;
                    let totalReviews = 0;

                    storeProducts.forEach(product => {
                        if (product.rating && Array.isArray(product.rating)) {
                            product.rating.forEach(rating => {
                                totalRatings += rating.rating;
                                totalReviews++;
                            });
                        }
                    });

                    const avgRating = totalReviews > 0 ? totalRatings / totalReviews : 0;

                    return {
                        ...store,
                        rating: parseFloat(avgRating.toFixed(1)),
                        totalReviews: totalReviews
                    };
                });

                setStores(storesWithRatings);
                setFilteredStores(storesWithRatings);
            } catch (error) {
                console.error('Error fetching stores:', error);
                setStores([]);
                setFilteredStores([]);
            } finally {
                setStoresLoading(false);
            }
        }

        if (products.length > 0) {
            loadStores();
        }
    }, [products]);

    useEffect(() => {
        if (cachedCategories !== undefined && cachedCategories !== null) {
            // Use cached categories if available
            if (Array.isArray(cachedCategories)) {
                const apiCategories = cachedCategories.map(cat => ({
                    value: cat.id,
                    label: cat.name
                }));
                setCategories([{ value: 'all', label: 'Semua Kategori' }, ...apiCategories]);
                setCategoriesLoading(false);
            } else {
                fetchCategoriesFromAPI();
            }
        } else {
            fetchCategoriesFromAPI();
        }
    }, [cachedCategories]);

    const fetchCategoriesFromAPI = async () => {
        setCategoriesLoading(true);
        try {
            const data = await fetchCategories();
            if (data && data.success && Array.isArray(data.data)) {
                const apiCategories = data.data.map(cat => ({
                    value: cat.id,
                    label: cat.name
                }));
                setCategories([{ value: 'all', label: 'Semua Kategori' }, ...apiCategories]);
            } else {
                setCategories([{ value: 'all', label: 'Semua Kategori' }]);
            }
        } catch (error) {
            setCategories([{ value: 'all', label: 'Semua Kategori' }]);
        } finally {
            setCategoriesLoading(false);
        }
    };



    // Sync category, discount, and search filter with query param whenever it changes
    useEffect(() => {
        const categoryFromQuery = searchParams.get('category');
        const discountFromQuery = searchParams.get('discount');
        const searchFromQuery = searchParams.get('search');
        let updates = {};
        if (categoryFromQuery && categoryFromQuery !== filters.category) {
            // We need to ensure that initialCategory is set correctly to handle the query param
            // The query param contains the category id, not the name
            updates.category = categoryFromQuery;
        }
        if (typeof discountFromQuery === 'string') {
            updates.discount = discountFromQuery === 'true';
        }
        if (searchFromQuery !== null && searchFromQuery !== filters.search) {
            updates.search = searchFromQuery;
        }
        if (Object.keys(updates).length > 0) {
            setFilters(prev => ({ ...prev, ...updates }));
        }
    }, [searchParams])

    useEffect(() => {
        if (!products || products.length === 0) return;  // Don't filter if no products loaded yet

        let filtered = products.filter(product => {
            // Match API attributes
            const name = product.name || "";
            const price = typeof product.price === "number" ? product.price : 0;
            const mrp = typeof product.mrp === "number" ? product.mrp : price;
            const category = product.category || "";
            const rating = Array.isArray(product.rating) ? (
                product.rating.length > 0 ? Math.round(product.rating.reduce((acc, curr) => acc + (typeof curr === 'object' ? (curr.rating || 0) : typeof curr === 'number' ? curr : 0), 0) / product.rating.length) : 0
            ) : 0;
            // Category mapping for filtering
            let categoryMatch = true;
            if (filters.category !== 'all') {
                // Check if product has a category object with an id
                if (product.category && product.category.id) {
                    categoryMatch = product.category.id === filters.category;
                } else {
                    // Fallback to name comparison if id doesn't match any category
                    categoryMatch = false;
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
                const productMrp = typeof product.mrp === 'number' ? product.mrp : 0;
                const productPrice = typeof product.price === 'number' ? product.price : 0;
                match = match && productMrp > 0 && productPrice > 0 && productMrp > productPrice;
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
                    const aRating = Array.isArray(a.rating) ? (a.rating.length > 0 ? Math.round(a.rating.reduce((acc, curr) => acc + (typeof curr === 'object' ? (curr.rating || 0) : typeof curr === 'number' ? curr : 0), 0) / a.rating.length) : 0) : 0;
                    const bRating = Array.isArray(b.rating) ? (b.rating.length > 0 ? Math.round(b.rating.reduce((acc, curr) => acc + (typeof curr === 'object' ? (curr.rating || 0) : typeof curr === 'number' ? curr : 0), 0) / b.rating.length) : 0) : 0;
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

    // Filter stores
    useEffect(() => {
        if (!stores || stores.length === 0) return;

        let filtered = stores.filter(store => {
            const name = store.name || "";
            const username = store.username || "";
            const description = store.description || "";
            const address = store.address || "";
            const rating = store.rating || 0;

            // Search in name, username, description, or address
            const searchMatch = filters.search === '' ||
                name.toLowerCase().includes(filters.search.toLowerCase()) ||
                username.toLowerCase().includes(filters.search.toLowerCase()) ||
                description.toLowerCase().includes(filters.search.toLowerCase()) ||
                address.toLowerCase().includes(filters.search.toLowerCase());

            const ratingMatch = rating >= filters.rating;

            return searchMatch && ratingMatch;
        });

        // Apply sorting
        filtered.sort((a, b) => {
            switch (filters.sortBy) {
                case 'rating':
                    return (b.rating || 0) - (a.rating || 0);
                case 'reviews':
                    return (b.totalReviews || 0) - (a.totalReviews || 0);
                default:
                    return (a.name || "").localeCompare(b.name || "");
            }
        });

        setFilteredStores(filtered);
    }, [filters, stores]);

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
                        <div className={`bg-white rounded-lg shadow-none border border-gray-200 p-6 ${isFilterOpen ? 'block' : 'hidden lg:block'}`}>
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
                                    {categoriesLoading ? (
                                        <option>Loading...</option>
                                    ) : (
                                        categories.map(cat => (
                                            <option key={cat.value} value={cat.value}>
                                                {cat.label}
                                            </option>
                                        ))
                                    )}
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


                            {/* Display Type Filter */}
                            <div className="mb-6">
                                <label className="block text-sm text-gray-700 mb-2 font-semibold">
                                    Tampilkan
                                </label>
                                <div className="checkbox-group flex flex-col gap-2">
                                    <label className="cursor-pointer flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            className="checkbox checkbox-sm border-gray-400 text-black"
                                            checked={filters.showProducts}
                                            onChange={e => handleFilterChange('showProducts', e.target.checked)}
                                        />
                                        <span className="text-sm">Produk</span>
                                    </label>
                                    <label className="cursor-pointer flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            className="checkbox checkbox-sm border-gray-400 text-black"
                                            checked={filters.showStores}
                                            onChange={e => handleFilterChange('showStores', e.target.checked)}
                                        />
                                        <span className="text-sm">Toko</span>
                                    </label>
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
                                            checked={filters.discount}
                                            onChange={e => handleFilterChange('discount', e.target.checked)}
                                        />
                                        <span className="text-sm">Diskon</span>
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
                                    Menampilkan {
                                        (filters.showProducts ? filteredProducts.length : 0) +
                                        (filters.showStores ? filteredStores.length : 0)
                                    } hasil
                                    {filters.showProducts && filters.showStores && ` (${filteredProducts.length} produk, ${filteredStores.length} toko)`}
                                    {filters.showProducts && !filters.showStores && ` dari ${products.length} produk`}
                                    {!filters.showProducts && filters.showStores && ` dari ${stores.length} toko`}
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
                        {/* Products and Stores Grid */}
                        {(productsLoading || storesLoading) ? (
                            <div className="flex justify-center items-center h-64 w-full">
                                <div className="loading loading-spinner loading-lg text-[#ED775A]"></div>
                            </div>
                        ) : (
                            <>
                                {/* Products Section */}
                                {filters.showProducts && filteredProducts.length > 0 && (
                                    <div className="mb-8">
                                        <h3 className="text-lg font-semibold text-gray-800 mb-4">
                                            Produk ({filteredProducts.length})
                                        </h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                                            {currentProducts.map((product) => (
                                                <ProductCard key={product.id || product.ID} product={product} />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Stores Section */}
                                {filters.showStores && filteredStores.length > 0 && (
                                    <div className="mb-8">
                                        <h3 className="text-lg font-semibold text-gray-800 mb-4">
                                            Toko ({filteredStores.length})
                                        </h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                                            {filteredStores.map((store) => (
                                                <StoreCard key={store.id} store={store} />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* No Results */}
                                {(
                                    (filters.showProducts && filteredProducts.length === 0 && filters.showStores && filteredStores.length === 0) ||
                                    (!filters.showProducts && filters.showStores && filteredStores.length === 0) ||
                                    (filters.showProducts && !filters.showStores && filteredProducts.length === 0) ||
                                    (!filters.showProducts && !filters.showStores)
                                ) && (
                                        <div className="text-center py-12">
                                            <div className="text-gray-400 mb-4">
                                                <AiOutlineFrown className="w-16 h-16 mx-auto" />
                                            </div>
                                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                                {!filters.showProducts && !filters.showStores
                                                    ? "Pilih setidaknya satu jenis tampilan (Produk atau Toko)"
                                                    : "Tidak ada hasil ditemukan"}
                                            </h3>
                                            <p className="text-gray-500">
                                                {filters.showProducts || filters.showStores
                                                    ? "Coba ubah filter atau kata kunci pencarian Anda"
                                                    : "Centang 'Produk' atau 'Toko' untuk melihat hasil"}
                                            </p>
                                        </div>
                                    )}
                            </>
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