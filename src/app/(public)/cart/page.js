"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "../../components/navbar/Navbar";
import Footer from "../../components/footer/Footer";
import ProductCard from "../../components/product/Card";
import CTA from "../../components/CTA";
import { sampleProducts, cartItems as initialCartItems } from "../../data/products";
import { stores } from "../../data/store";
import { FiTrash2, FiMinus, FiPlus, FiShoppingBag } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { fetchCart, addToCart as addToCartAPI, fetchProducts } from "../../api";
import { addToCart, removeFromCart, deleteItemFromCart, increaseQuantity, decreaseQuantity } from "@/lib/features/cart/cartSlice";


// Helper to get store name by id
function getStoreName(store_id) {
    const store = stores.find(s => s.store_id === store_id);
    return store ? store.name : `Toko #${store_id}`;
}

export default function CartPage() {
    const router = useRouter();
    const dispatch = useDispatch();
    const cartState = useSelector((state) => state.cart);
    const cartItems = cartState.cartItems || cartState.items || {};
    const [selectedItems, setSelectedItems] = useState([]);
    const [selectAll, setSelectAll] = useState(false);
    const [recommendedProducts, setRecommendedProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [flattenedCartItems, setFlattenedCartItems] = useState([]);

    useEffect(() => {
        setRecommendedProducts(sampleProducts.slice(0, 4));

        // Flatten the cart items - being extremely defensive to avoid objects in the result
        const flattened = [];
        if (cartItems && typeof cartItems === 'object') {
            Object.entries(cartItems).forEach(([key, value]) => {
                if (typeof value === 'number') {
                    // Simple structure: {some_unique_key: quantity}
                    flattened.push({
                        id: key,
                        productId: key,
                        quantity: value
                    });
                } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                    // If value is an object (like {variantId: quantity}), flatten it
                    Object.entries(value).forEach(([innerKey, innerValue]) => {
                        if (typeof innerValue === 'number') {
                            // Create a composite key: productId_variantId
                            flattened.push({
                                id: `${key}_${innerKey}`,
                                productId: key,
                                variantId: innerKey,
                                quantity: innerValue
                            });
                        }
                    });
                }
            });
        }
        setFlattenedCartItems(flattened);
    }, [cartItems]);

    const updateQuantity = (id, newQuantity) => {
        if (newQuantity < 1) return;

        // Parse the ID to see if it's in the format productId_variantId
        const parts = id.split('_');
        if (parts.length >= 2) {
            // It's a product with variant: productId_variantId
            const productId = parts[0];
            const variantId = parts.slice(1).join('_'); // In case the variantId itself has underscores
            const combinedId = `${productId}_${variantId}`;

            // Get current quantity from cart state
            const currentProductCart = cartItems[productId];
            let currentQty = 0;

            if (typeof currentProductCart === 'object' && currentProductCart !== null) {
                // Nested structure: {productId: {variantId: quantity}}
                currentQty = currentProductCart[variantId] || 0;
            } else if (typeof currentProductCart === 'number') {
                // Simple structure: {productId: quantity}
                currentQty = currentProductCart;
            } else {
                // Fallback: check if the combined ID exists directly
                currentQty = cartItems[combinedId] || 0;
            }

            const diff = newQuantity - currentQty;

            if (diff > 0) {
                // Increasing quantity
                dispatch(increaseQuantity({
                    productId: combinedId,
                    quantity: diff
                }));
            } else if (diff < 0) {
                // Decreasing quantity
                dispatch(decreaseQuantity({
                    productId: combinedId,
                    quantity: Math.abs(diff)
                }));
            }
        } else {
            // Simple product ID without variant
            const productId = id;
            const currentQty = typeof cartItems[productId] === 'object'
                ? Object.values(cartItems[productId]).reduce((sum, qty) => sum + qty, 0)
                : cartItems[productId] || 0;

            const diff = newQuantity - currentQty;

            if (diff > 0) {
                // Increasing quantity
                dispatch(increaseQuantity({
                    productId: productId,
                    quantity: diff
                }));
            } else if (diff < 0) {
                // Decreasing quantity
                dispatch(decreaseQuantity({
                    productId: productId,
                    quantity: Math.abs(diff)
                }));
            }
        }
    };

    const removeItem = (id) => {
        // Parse the ID to see if it's in the format productId_variantId
        const parts = id.split('_');
        if (parts.length >= 2) {
            // It's a product with variant: productId_variantId
            const productId = parts[0];
            const variantId = parts.slice(1).join('_'); // In case the variantId itself has underscores
            const combinedId = `${productId}_${variantId}`;

            // Dispatch with the combined ID
            dispatch(deleteItemFromCart({
                productId: combinedId
            }));
        } else {
            // Simple product ID without variant
            dispatch(deleteItemFromCart({
                productId: id
            }));
        }

        setSelectedItems(selected => selected.filter(itemId => itemId !== id));
    };

    const toggleItemSelection = (id) => {
        setSelectedItems(selected => {
            const isSelected = selected.includes(id);
            const newSelected = isSelected
                ? selected.filter(itemId => itemId !== id)
                : [...selected, id];

            setSelectAll(newSelected.length === flattenedCartItems.length);
            return newSelected;
        });
    };

    const toggleSelectAll = () => {
        const newSelectAll = !selectAll;
        setSelectAll(newSelectAll);
        setSelectedItems(newSelectAll ? flattenedCartItems.map(item => item.id) : []);
    };

    // This would require fetching product details by ID
    // For now, I'll create a function that will fetch product details
    const [productDetails, setProductDetails] = useState({});

    useEffect(() => {
        // Fetch product details for items in cart
        const uniqueProductIds = [...new Set(flattenedCartItems.map(item => item.productId))];
        if (uniqueProductIds.length > 0) {
            const fetchProductDetails = async () => {
                try {
                    const productsResponse = await fetchProducts();
                    const products = productsResponse.products || productsResponse;

                    const detailsMap = {};
                    products.forEach(product => {
                        detailsMap[product.id] = product;
                    });

                    setProductDetails(detailsMap);
                } catch (error) {
                    console.error("Error fetching product details:", error);
                }
            };

            fetchProductDetails();
        }
    }, [flattenedCartItems.length]); // Only trigger when the number of cart items changes

    const getProductDetail = (productId) => {
        return productDetails[productId] || {};
    };

    const calculatePrice = (item) => {
        const product = getProductDetail(item.productId);
        // Use the product price from the fetched product details
        // Ensure we return a number
        return typeof product.price === 'number' ? product.price : 0;
    };

    // Since we're now using Redux state instead of the sample data, we need to fetch product info
    // This is more complex as we need to map product IDs to actual product data
    // For now, let's create a simplified version that works with the flattened structure

    // In a real implementation, you'd want to fetch product data to match with cart items
    // For now, I'll skip filtering by name since we don't have the actual product names in the cart state
    const filteredCartItems = flattenedCartItems;

    const selectedItemsData = filteredCartItems.filter(item => selectedItems.includes(item.id));
    const totalItems = selectedItemsData.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = selectedItemsData.reduce((sum, item) => sum + (calculatePrice(item) * item.quantity), 0);

    return (
        <div className="min-h-screen ">
            <Navbar />

            <div className="container mx-auto px-4 py-8 mt-15 mb-20 text-black">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <button onClick={() => router.back()} className="btn btn-sm btn-ghost shadow-none border-none text-gray-700 border border-gray-300 hover:bg-gray-100">
                            &larr;
                        </button>
                        <h1 className="text-2xl font-bold text-gray-900">Keranjang Belanja</h1>
                    </div>
                    <div className="w-64">
                        <input
                            type="text"
                            placeholder="Cari produk di keranjang..."
                            className="input input-bordered w-full bg-white  border-gray-200 focus:outline-none "
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {flattenedCartItems.length === 0 ? (
                    <div className="text-center py-16">
                        <FiShoppingBag className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">Keranjang Kosong</h2>
                        <p className="text-gray-500 mb-6">Ayo mulai berbelanja dan tambahkan produk ke keranjang!</p>
                        <Link href="/pages/marketplace" className="btn bg-[#ED775A] border-none hover:bg-[#eb6b4b] text-white">
                            Mulai Belanja
                        </Link>
                    </div>
                ) : (
                    <div className="grid gap-6 lg:grid-cols-[1fr_350px]">
                        {/* Cart Items */}
                        <div className="bg-white rounded-lg border-1 border-gray-200">
                            {/* Select All Header */}
                            <div className="p-4 border-b border-gray-200">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="checkbox checkbox-sm border-gray-400 text-black"
                                        checked={selectAll}
                                        onChange={toggleSelectAll}
                                    />
                                    <span className="font-medium text-gray-900">Pilih Semua ({flattenedCartItems.length} produk)</span>
                                </label>
                            </div>

                            {/* Cart Items List */}
                            <div className="divide-y divide-gray-200">
                                {filteredCartItems.length === 0 ? (
                                    <div className="p-8 text-center text-gray-500">Tidak ada produk dalam keranjang.</div>
                                ) : (
                                    filteredCartItems.map((item) => {
                                        // For simplicity, just split the ID to get the product ID
                                        // If it contains an underscore, take the first part as the product ID
                                        const productId = item.id.includes('_') ? item.id.split('_')[0] : item.id;
                                        const product = getProductDetail(productId);

                                        return (
                                            <div key={item.id} className="p-4">
                                                <div className="flex items-start gap-4">
                                                    {/* Checkbox */}
                                                    <input
                                                        type="checkbox"
                                                        className="checkbox checkbox-sm border-gray-400 mt-4 text-black"
                                                        checked={selectedItems.includes(item.id)}
                                                        onChange={() => toggleItemSelection(item.id)}
                                                    />

                                                    {/* Product Image */}
                                                    <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                                                        <img
                                                            src={Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : "/images/default.png"}
                                                            alt={product.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>

                                                    {/* Product Details */}
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="font-semibold text-gray-900 mb-1 truncate">{typeof product.name === 'string' ? product.name : 'Nama Produk Tidak Tersedia'}</h3>
                                                        <p className="text-xs text-gray-500 mb-1">{product.storeId ? getStoreName(product.storeId) : 'Toko tidak ditemukan'}</p>
                                                        {/* For now, don't show variant information */}
                                                        {/* Price */}
                                                        <div className="flex items-center gap-2 mb-3">
                                                            <span className="font-bold text-[#ED775A] text-lg">
                                                                Rp {calculatePrice(item).toLocaleString("id-ID")}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-row items-center justify-between mt-auto h-full mb-2 gap-3">
                                                        {/* Quantity Controls */}
                                                        <div className="flex items-center bg-gray-50 rounded-full border border-gray-200 overflow-hidden">
                                                            <button
                                                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                                className="px-3 py-1 hover:bg-gray-100 text-gray-600 disabled:opacity-40"
                                                                disabled={item.quantity <= 1}
                                                            >
                                                                <FiMinus className="w-3 h-3" />
                                                            </button>
                                                            <span className="w-10 text-center font-medium text-gray-800 text-sm">{item.quantity}</span>
                                                            <button
                                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                                className="px-3 py-1 hover:bg-gray-100 text-gray-600 disabled:opacity-40"
                                                                disabled={false}
                                                            >
                                                                <FiPlus className="w-3 h-3" />
                                                            </button>
                                                        </div>

                                                        {/* Remove Button */}
                                                        <button
                                                            onClick={() => removeItem(item.id)}
                                                            className="text-red-500 hover:text-red-600 hover:bg-red-50 transition-colors rounded-full p-2"
                                                            title="Hapus produk"
                                                        >
                                                            <FiTrash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>

                        {/* Order Summary */}
                        <div className="bg-white rounded-lg border-1 border-gray-200 p-6 h-fit sticky top-20">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Ringkasan Pesanan</h2>

                            <div className="space-y-3 mb-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Total Barang ({flattenedCartItems.reduce((sum, item) => sum + (typeof item.quantity === 'number' ? item.quantity : 0), 0)})</span>
                                    <span className="font-medium">Rp {flattenedCartItems.reduce((sum, item) => {
                                        const product = getProductDetail(item.productId);
                                        const price = typeof product.price === 'number' ? product.price : 0;
                                        return sum + (price * (typeof item.quantity === 'number' ? item.quantity : 0));
                                    }, 0).toLocaleString("id-ID")}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Ongkos Kirim</span>
                                    <span className="font-medium">Rp {Number(12000).toLocaleString("id-ID")}</span>
                                </div>
                                <div className="border-t border-gray-200 pt-3">
                                    <div className="flex justify-between">
                                        <span className="font-semibold text-gray-900">Total</span>
                                        <span className="font-bold text-xl text-[#ED775A]">
                                            Rp {(flattenedCartItems.reduce((sum, item) => {
                                                const product = getProductDetail(item.productId);
                                                const price = typeof product.price === 'number' ? product.price : 0;
                                                return sum + (price * (typeof item.quantity === 'number' ? item.quantity : 0));
                                            }, 0) + 12000).toLocaleString("id-ID")}
                                        </span>
                                    </div>
                                </div>
                            </div>


                            <button
                                className={`w-full btn mb-3 ${selectedItems.length === 0 ? 'bg-gray-400 text-white border-none cursor-not-allowed' : 'bg-[#ED775A] border-none hover:bg-[#eb6b4b] shadow-none text-white'}`}
                                onClick={() => {
                                    // Create a string of selected item IDs for the checkout URL
                                    const selectedProductIds = selectedItems.join(',');
                                    router.push(`/pages/checkout/?cartItems=${selectedProductIds}`);
                                }}
                            >
                                Checkout ({selectedItems.length})
                            </button>

                            {/* <Link href="/pages/marketplace" className="w-full btn btn-outline">
                                Lanjut Belanja
                            </Link> */}
                        </div>
                    </div>
                )}

                {/* Recommended Products */}
                {cartItems.length > 0 && (
                    <div className="mt-16">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Kamu Mungkin Juga Suka</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {recommendedProducts.map((product) => (
                                <ProductCard key={product.ID} product={product} />
                            ))}
                        </div>
                    </div>
                )}

                {/* CTA Banner */}
                <div className="mt-16">
                    <CTA />
                </div>
            </div>

            <Footer />
        </div>
    );
}

