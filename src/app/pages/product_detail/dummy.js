'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from "../../components/navbar/Navbar";
import Footer from "../../components/footer/Footer";
import { fetchProducts } from "../../api";
import ProductCard from "../../components/product/Card";

const BASE_URL = 'https://backend-go-gin-production.up.railway.app';

const fetchProductById = async (id) => {
    const response = await fetch(`${BASE_URL}/products/${id}`);
    if (!response.ok) {
        throw new Error('Failed to fetch product details');
    }
    return response.json();
};

export default function ProductDetailPage({ params }) {
    const { id } = params;
    const router = useRouter();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedImage, setSelectedImage] = useState(1);
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        const loadProduct = async () => {
            try {
                setLoading(true);
                const productData = await fetchProductById(id);
                setProduct(productData);
            } catch (err) {
                setError(err.message);
                // Fallback dummy product for demo purposes
                setProduct({
                    ID: id,
                    nama_produk: "Sample Product",
                    deskripsi: "This is a sample product description. The actual product details couldn't be loaded from the server.",
                    harga: 150000,
                    kategori: "Electronics",
                    rating: 4,
                    reviews: 120,
                    stok: 25,
                    images: ["https://via.placeholder.com/400x400?text=Product+Image"]
                });
            } finally {
                setLoading(false);
            }
        };

        loadProduct();
    }, [id]);

    const handleAddToCart = () => {
        // Add to cart functionality
        alert(`Added ${quantity} item(s) to cart!`);
    };

    const handleBuyNow = () => {
        // Buy now functionality
        alert(`Proceeding to checkout with ${quantity} item(s)!`);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="loading loading-spinner loading-lg text-primary"></div>
                    <p className="mt-4 text-gray-600">Loading product details...</p>
                </div>
            </div>
        );
    }

    if (error && !product) {
        return (

            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Navbar/>
                <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
                    <div className="text-red-500 text-6xl mb-4">⚠️</div>
                    <h1 className="text-2xl font-bold text-gray-800 mb-4">Product Not Found</h1>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <button 
                        onClick={() => router.back()}
                        className="btn btn-primary"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar/>
            <div className="container mx-auto px-4">
                {/* Breadcrumb */}
                <div className="breadcrumbs text-sm mb-6 mt-6 mx-4">
                    <ul>
                        <li><a onClick={() => router.push('/')} className="cursor-pointer hover:text-primary">Home</a></li>
                        <li><a onClick={() => router.push('/')} className="cursor-pointer hover:text-primary">Products</a></li>
                        <li className="text-gray-500">{product?.nama_produk}</li>
                    </ul>
                </div>

                <div className="bg-white rounded-lg shadow-lg overflow-hidden mx-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
                        {/* Product Images */}
                        <div className="space-y-4">
                            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                                <img
                                    src={product?.images?.[selectedImage - 1] || `${BASE_URL}/uploads/products/${product?.ID}/${selectedImage}.jpg`}
                                    alt={product?.nama_produk}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.target.src = "https://via.placeholder.com/400x400?text=No+Image";
                                    }}
                                />
                            </div>
                            
                            {/* Image Thumbnails */}
                            <div className="flex gap-2 overflow-x-auto">
                                {[1, 2, 3, 4].map((imageNum) => (
                                    <button
                                        key={imageNum}
                                        onClick={() => setSelectedImage(imageNum)}
                                        className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                                            selectedImage === imageNum ? 'border-primary' : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                    >
                                        <img
                                            src={product?.images?.[imageNum - 1] || `${BASE_URL}/uploads/products/${product?.ID}/${imageNum}.jpg`}
                                            alt={`${product?.nama_produk} ${imageNum}`}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.target.src = "https://via.placeholder.com/64x64?text=No+Image";
                                            }}
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Product Info */}
                        <div className="space-y-6">
                            <div>
                                <div className="badge badge-primary mb-2">{product?.kategori}</div>
                                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                                    {product?.nama_produk}
                                </h1>
                                
                                {/* Rating */}
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="rating rating-sm">
                                        {Array.from({ length: 5 }).map((_, i) => (
                                            <input
                                                key={i}
                                                type="radio"
                                                name="rating-display"
                                                className="mask mask-star-2 bg-orange-400"
                                                defaultChecked={i < (product?.rating || 0)}
                                                disabled
                                            />
                                        ))}
                                    </div>
                                    <span className="text-sm text-gray-600">
                                        {product?.rating}/5 ({product?.reviews} reviews)
                                    </span>
                                </div>
                            </div>

                            {/* Price */}
                            <div className="text-3xl font-bold text-primary">
                                Rp {product?.harga?.toLocaleString()}
                            </div>

                            {/* Stock */}
                            <div className="flex items-center gap-2">
                                <span className="text-gray-600">Stock:</span>
                                <span className={`font-semibold ${product?.stok > 10 ? 'text-green-600' : product?.stok > 0 ? 'text-yellow-600' : 'text-red-600'}`}>
                                    {product?.stok > 0 ? `${product.stok} available` : 'Out of stock'}
                                </span>
                            </div>

                            {/* Description */}
                            <div>
                                <h3 className="text-lg font-semibold mb-2">Description</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    {product?.deskripsi || "No description available for this product."}
                                </p>
                            </div>

                            {/* Quantity Selector */}
                            <div className="flex items-center gap-4">
                                <span className="text-gray-600">Quantity:</span>
                                <div className="flex items-center">
                                    <button
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="btn btn-sm btn-outline"
                                        disabled={quantity <= 1}
                                    >
                                        -
                                    </button>
                                    <input
                                        type="number"
                                        value={quantity}
                                        onChange={(e) => setQuantity(Math.max(1, Math.min(product?.stok || 1, parseInt(e.target.value) || 1)))}
                                        className="input input-sm input-bordered w-20 text-center mx-2"
                                        min="1"
                                        max={product?.stok || 1}
                                    />
                                    <button
                                        onClick={() => setQuantity(Math.min(product?.stok || 1, quantity + 1))}
                                        className="btn btn-sm btn-outline"
                                        disabled={quantity >= (product?.stok || 1)}
                                    >
                                        +
                                    </button>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-4 pt-4">
                                <button
                                    onClick={handleAddToCart}
                                    className="btn btn-outline btn-primary flex-1"
                                    disabled={!product?.stok || product.stok === 0}
                                >
                                    Add to Cart
                                </button>
                                <button
                                    onClick={handleBuyNow}
                                    className="btn btn-primary flex-1"
                                    disabled={!product?.stok || product.stok === 0}
                                >
                                    Buy Now
                                </button>
                            </div>

                            {/* Additional Info */}
                            <div className="border-t pt-4 space-y-2 text-sm text-gray-600">
                                <div className="flex justify-between">
                                    <span>Product ID:</span>
                                    <span className="font-mono">{product?.ID}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Category:</span>
                                    <span>{product?.kategori}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Related Products Section (placeholder) */}
                <div className="mt-12 mx-4">
                    <h2 className="text-2xl font-bold mb-6">Related Products</h2>
                    <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
                        <p>Related products will be displayed here...</p>
                    </div>
                </div>
            </div>
        </div>
    );
}