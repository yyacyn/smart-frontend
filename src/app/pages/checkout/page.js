"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "../../components/navbar/Navbar";
import Footer from "../../components/footer/Footer";
import { fetchProducts } from "../../api";
import { FiMapPin, FiCreditCard, FiTruck, FiCheck, FiEdit3 } from "react-icons/fi";

// Helper to get store name by id
function getStoreName(storeId, products) {
    const product = products.find(p => p.store?.id === storeId);
    return product && product.store ? product.store.name : `Toko #${storeId}`;
}

export default function CheckoutPage() {
    const router = useRouter();
    const [selectedItems, setSelectedItems] = useState([]);
    const [products, setProducts] = useState([]);
    const [shippingAddress, setShippingAddress] = useState({
        name: "",
        phone: "",
        address: "",
        city: "",
        postalCode: "",
        notes: ""
    });
    const [paymentMethod, setPaymentMethod] = useState("transfer");
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        async function getProductsForCheckout() {
            try {
                const data = await fetchProducts();
                const productsData = data && data.products ? data.products : [];
                setProducts(productsData);

                // Get parameters from query params
                const searchParams = new URLSearchParams(window.location.search);
                const productId = searchParams.get('productId');
                const qty = parseInt(searchParams.get('qty')) || 1;
                const cartItems = searchParams.get('cartItems');

                // Handle single product checkout (from product detail page)
                if (productId) {
                    const item = productsData.find(p => p.id == productId);
                    if (item) {
                        const normalizedItem = {
                            id: item.id,
                            name: item.name,
                            image: Array.isArray(item.images) && item.images.length > 0 ? item.images[0] : "/images/default.png",
                            price: item.price,
                            store_id: item.store?.id,
                            quantity: qty
                        };
                        setSelectedItems([normalizedItem]);
                        return;
                    }
                }

                // Handle multiple items checkout (from cart page)
                if (cartItems) {
                    const itemIds = cartItems.split(',').map(id => id);
                    const selectedCartItems = productsData.filter(item => itemIds.includes(item.id));
                    if (selectedCartItems.length > 0) {
                        setSelectedItems(selectedCartItems.map(item => ({
                            id: item.id,
                            name: item.name,
                            image: Array.isArray(item.images) && item.images.length > 0 ? item.images[0] : "/images/default.png",
                            price: item.price,
                            store_id: item.store?.id,
                            quantity: 1
                        })));
                        return;
                    }
                }

                // Fallback: use first 2 items from products
                setSelectedItems(productsData.slice(0, 2).map(item => ({
                    id: item.id,
                    name: item.name,
                    image: Array.isArray(item.images) && item.images.length > 0 ? item.images[0] : "/images/default.png",
                    price: item.price,
                    store_id: item.store?.id,
                    quantity: 1
                })));
            } catch (error) {
                setProducts([]);
                setSelectedItems([]);
            }
        }
        getProductsForCheckout();
    }, []);

    const calculatePrice = (item) => {
        return item.price || 0;
    };

    const totalItems = selectedItems.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = selectedItems.reduce((sum, item) => sum + (calculatePrice(item) * item.quantity), 0);
    const shippingCost = 0; // Free shipping
    const total = subtotal + shippingCost;

    const handleInputChange = (field, value) => {
        setShippingAddress(prev => ({ ...prev, [field]: value }));
    };

    const handlePlaceOrder = async () => {
        setIsProcessing(true);
        
        // Simulate API call
        setTimeout(() => {
            setIsProcessing(false);
            alert("Pesanan berhasil dibuat! Anda akan dialihkan ke halaman marketplace.");
            router.push('/pages/marketplace');
        }, 2000);
    };

    const isFormValid = shippingAddress.name && shippingAddress.phone && shippingAddress.address && shippingAddress.city && shippingAddress.postalCode;

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            
            <div className="container mx-auto px-4 py-8 mt-15 mb-20">
                {/* Header */}
                <div className="flex items-center gap-2 mb-6">
                    <button onClick={() => router.back()} className="btn btn-sm btn-ghost text-gray-700 border-none shadow-none hover:bg-gray-100">
                        &larr;
                    </button>
                    <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
                </div>

                <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
                    {/* Main Content */}
                    <div className="space-y-6">
                        {/* Shipping Address */}
                        <div className="bg-white rounded-lg border-1 border-gray-200 p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <FiMapPin className="w-5 h-5 text-[#ED775A]" />
                                <h2 className="text-lg font-semibold text-gray-900">Alamat Pengiriman</h2>
                            </div>
                            
                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap *</label>
                                    <input
                                        type="text"
                                        className="input input-bordered w-full bg-white focus:outline-none border-gray-200"
                                        value={shippingAddress.name}
                                        onChange={(e) => handleInputChange('name', e.target.value)}
                                        placeholder="Masukkan nama lengkap"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1 ">Nomor Telepon *</label>
                                    <input
                                        type="number"
                                        className="input input-bordered w-full bg-white focus:outline-none border-gray-200"
                                        value={shippingAddress.phone}
                                        onChange={(e) => handleInputChange('phone', e.target.value)}
                                        placeholder="08xxxxxxxxxx"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Alamat Lengkap *</label>
                                    <textarea
                                        className="textarea textarea-bordered w-full bg-white focus:outline-none border-gray-200"
                                        rows={3}
                                        value={shippingAddress.address}
                                        onChange={(e) => handleInputChange('address', e.target.value)}
                                        placeholder="Nama jalan, nomor rumah, RT/RW"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Kota *</label>
                                    <input
                                        type="text"
                                        className="input input-bordered w-full bg-white focus:outline-none border-gray-200"
                                        value={shippingAddress.city}
                                        onChange={(e) => handleInputChange('city', e.target.value)}
                                        placeholder="Nama kota"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Kode Pos *</label>
                                    <input
                                        type="text"
                                        className="input input-bordered w-full bg-white focus:outline-none border-gray-200"
                                        value={shippingAddress.postalCode}
                                        onChange={(e) => handleInputChange('postalCode', e.target.value)}
                                        placeholder="12345"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Catatan untuk Kurir</label>
                                    <input
                                        type="text"
                                        className="input input-bordered w-full bg-white focus:outline-none border-gray-200"
                                        value={shippingAddress.notes}
                                        onChange={(e) => handleInputChange('notes', e.target.value)}
                                        placeholder="Contoh: Rumah cat hijau, sebelah warung"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Shipping Method */}
                        {/* <div className="bg-white rounded-lg border-1 border-gray-200 p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <FiTruck className="w-5 h-5 text-[#ED775A]" />
                                <h2 className="text-lg font-semibold text-gray-900">Metode Pengiriman</h2>
                            </div>
                            
                            <div className="space-y-3">
                                <div className="border border-green-200 rounded-lg p-4 bg-green-50">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="radio"
                                                name="shipping"
                                                className="radio hidden radio-sm bg-white"
                                                checked={true}
                                                readOnly
                                            />
                                            <div>
                                                <p className="font-medium text-gray-900">Pengiriman Gratis</p>
                                                <p className="text-sm text-gray-600">Estimasi 2-3 hari kerja</p>
                                            </div>
                                        </div>
                                        <span className="font-bold text-green-600">GRATIS</span>
                                    </div>
                                </div>
                            </div>
                        </div> */}

                        {/* Payment Method */}
                        <div className="bg-white rounded-lg border-1 border-gray-200 p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <FiCreditCard className="w-5 h-5 text-[#ED775A]" />
                                <h2 className="text-lg font-semibold text-gray-900">Metode Pembayaran</h2>
                            </div>
                            
                            <div className="space-y-3">
                                <div className={`border rounded-lg p-4 ${paymentMethod === 'transfer' ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}>
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="payment"
                                            className="radio radio-sm hidden"
                                            checked={paymentMethod === 'transfer'}
                                            onChange={() => setPaymentMethod('transfer')}
                                        />
                                        <div>
                                            <p className={`font-medium ${paymentMethod === 'transfer' ? 'text-green-800' : 'text-gray-900'}`}>Transfer Bank</p>
                                            <p className={`text-sm ${paymentMethod === 'transfer' ? 'text-green-600' : 'text-gray-600'}`}>BCA, Mandiri, BNI, BRI</p>
                                        </div>
                                    </label>
                                </div>
                                <div className={`border rounded-lg p-4 ${paymentMethod === 'ewallet' ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}>
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="payment"
                                            className="radio radio-sm hidden"
                                            checked={paymentMethod === 'ewallet'}
                                            onChange={() => setPaymentMethod('ewallet')}
                                        />
                                        <div>
                                            <p className={`font-medium ${paymentMethod === 'ewallet' ? 'text-green-800' : 'text-gray-900'}`}>E-Wallet</p>
                                            <p className={`text-sm ${paymentMethod === 'ewallet' ? 'text-green-600' : 'text-gray-600'}`}>GoPay, OVO, DANA, ShopeePay</p>
                                        </div>
                                    </label>
                                </div>
                                <div className={`border rounded-lg p-4 ${paymentMethod === 'cod' ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}>
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="payment"
                                            className="radio radio-sm hidden"
                                            checked={paymentMethod === 'cod'}
                                            onChange={() => setPaymentMethod('cod')}
                                        />
                                        <div>
                                            <p className={`font-medium ${paymentMethod === 'cod' ? 'text-green-800' : 'text-gray-900'}`}>Bayar di Tempat (COD)</p>
                                            <p className={`text-sm ${paymentMethod === 'cod' ? 'text-green-600' : 'text-gray-600'}`}>Bayar saat barang sampai</p>
                                        </div>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="bg-white rounded-lg border-1 border-gray-200 p-6 h-fit sticky top-20">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Ringkasan Pesanan</h2>
                        
                        {/* Order Items */}
                        <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                            {selectedItems.map((item) => (
                                <div key={item.id} className="flex items-center gap-3 p-2 border border-gray-100 rounded">
                                    <div className="w-12 h-12 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-sm text-gray-900 truncate">{item.name}</p>
                                        <p className="text-xs text-gray-500">{getStoreName(item.store_id, products)}</p>
                                        <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium text-sm text-[#ED775A]">
                                            Rp {(calculatePrice(item) * item.quantity).toLocaleString("id-ID")}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        {/* Price Breakdown */}
                        <div className="space-y-2 mb-4 border-t border-gray-200 pt-4">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Subtotal ({totalItems} item)</span>
                                <span className="font-medium">Rp {subtotal.toLocaleString("id-ID")}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Ongkos Kirim</span>
                                <span className="font-medium text-green-600">GRATIS</span>
                            </div>
                            <div className="border-t border-gray-200 pt-2">
                                <div className="flex justify-between">
                                    <span className="font-semibold text-gray-900">Total</span>
                                    <span className="font-bold text-xl text-[#ED775A]">
                                        Rp {total.toLocaleString("id-ID")}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Place Order Button */}
                        <button
                            onClick={handlePlaceOrder}
                            disabled={!isFormValid || isProcessing}
                            className={`w-full btn ${
                                !isFormValid || isProcessing 
                                    ? 'bg-gray-400 text-gray-400 border-gray-400 cursor-not-allowed' 
                                    : 'bg-[#ED775A] border-none hover:bg-[#eb6b4b] text-white shadow-none'
                            }`}
                        >
                            {isProcessing ? (
                                <>
                                    <span className="loading loading-spinner loading-sm"></span>
                                    Memproses...
                                </>
                            ) : (
                                <>
                                    <FiCheck className="w-4 h-4" />
                                    Buat Pesanan
                                </>
                            )}
                        </button>
                        
                        <p className="text-xs text-gray-500 text-center mt-3">
                            Dengan melakukan pemesanan, Anda menyetujui syarat dan ketentuan yang berlaku.
                        </p>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}