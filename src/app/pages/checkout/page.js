"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import Navbar from "../../components/navbar/Navbar";
import Footer from "../../components/footer/Footer";
import { fetchProducts, orderPost, fetchAddresses, addAddress } from "../../api";
import { FiMapPin, FiCreditCard, FiTruck, FiCheck, FiEdit3, FiPlus, FiChevronDown } from "react-icons/fi";
import Swal from 'sweetalert2';

// Helper to get store name by id
function getStoreName(storeId, products) {
    const product = products.find(p => p.store?.id === storeId);
    return product && product.store ? product.store.name : `Toko #${storeId}`;
}

export default function CheckoutPage() {
    const router = useRouter();
    const { user } = useUser();
    const [selectedItems, setSelectedItems] = useState([]);
    const [products, setProducts] = useState([]);
    const [addresses, setAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState("");
    const [showNewAddressForm, setShowNewAddressForm] = useState(false);
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
    const [phoneError, setPhoneError] = useState("");
    const [postalError, setPostalError] = useState("");

    useEffect(() => {
        async function getProductsForCheckout() {
            try {
                const data = await fetchProducts();
                const productsData = data && data.products ? data.products : [];
                setProducts(productsData);

                // Fetch user addresses only if user is logged in
                if (user?.id) {
                    const addressData = await fetchAddresses();
                    const allAddresses = addressData && addressData.addresses ? addressData.addresses : [];
                    console.log("All addresses:", allAddresses);
                    console.log("Current user ID:", user.id);
                    // Filter addresses to only show current user's addresses
                    // Try both 'userId' and 'user_id' as property names
                    const userAddresses = allAddresses.filter(address => {
                        return (address && address.userId === user.id) || (address && address.user_id === user.id);
                    });
                    console.log("Filtered user addresses:", userAddresses);
                    setAddresses(userAddresses);
                }

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
    }, [user]);

    const calculatePrice = (item) => {
        return item.price || 0;
    };

    const totalItems = selectedItems.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = selectedItems.reduce((sum, item) => sum + (calculatePrice(item) * item.quantity), 0);
    const shippingCost = 0; // Free shipping
    const total = subtotal + shippingCost;

    const handleAddressSelect = (addressId) => {
        setSelectedAddressId(addressId);
        if (addressId === "new") {
            setShowNewAddressForm(true);
            setShippingAddress({
                name: "",
                phone: "",
                address: "",
                city: "",
                postalCode: "",
                notes: ""
            });
        } else {
            setShowNewAddressForm(false);
            const selectedAddress = addresses.find(addr => addr && addr.id === addressId);
            if (selectedAddress) {
                setShippingAddress({
                    name: selectedAddress.name || "",
                    phone: selectedAddress.phone || "",
                    address: selectedAddress.street || "",
                    city: selectedAddress.city || "",
                    postalCode: selectedAddress.zip || "",
                    notes: selectedAddress.country || ""
                });
            }
        }
    };

    const handleSaveNewAddress = async () => {
        try {
            if (!user?.id) {
                await Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Anda harus login terlebih dahulu untuk menyimpan alamat.',
                });
                return;
            }

            const newAddressData = {
                userId: user.id,
                name: shippingAddress.name,
                phone: shippingAddress.phone,
                street: shippingAddress.address,
                city: shippingAddress.city,
                state: "Indonesia", // Default state
                zip: shippingAddress.postalCode,
                country: shippingAddress.notes || "Indonesia",
                email: user.primaryEmailAddress?.emailAddress || "user@example.com"
            };
            
            const response = await addAddress(newAddressData);
            const savedAddress = response.address || response;
            
            // Ensure the saved address has the userId to avoid undefined errors
            const addressWithUserId = {
                ...savedAddress,
                userId: savedAddress.userId || savedAddress.user_id || user.id
            };
            
            // Update addresses list
            setAddresses(prev => {
                const newAddresses = [...prev, addressWithUserId];
                console.log("Updated addresses list:", newAddresses);
                return newAddresses;
            });
            setSelectedAddressId(addressWithUserId.id);
            setShowNewAddressForm(false);
            
            await Swal.fire({
                icon: 'success',
                title: 'Berhasil!',
                text: 'Alamat baru berhasil disimpan.',
                timer: 2000,
                showConfirmButton: false
            });
        } catch (error) {
            console.error("Error saving address:", error);
            let errorMessage = 'Gagal menyimpan alamat. Silakan coba lagi.';
            
            // Handle specific error cases
            if (error.response?.data?.error) {
                errorMessage = error.response.data.error;
            } else if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            await Swal.fire({
                icon: 'error',
                title: 'Gagal Menyimpan Alamat',
                text: errorMessage,
                confirmButtonText: 'OK',
                confirmButtonColor: '#ED775A'
            });
        }
    };

    const handleInputChange = (field, value) => {
        if (field === "phone") {
            // Only allow numbers, max 12 digits
            const cleaned = value.replace(/\D/g, "").slice(0, 12);
            setShippingAddress(prev => ({ ...prev, phone: cleaned }));
            if (cleaned.length > 0 && (cleaned.length < 10 || cleaned.length > 12)) {
                setPhoneError("Nomor telepon harus 10-12 digit.");
            } else {
                setPhoneError("");
            }
            return;
        }
        if (field === "postalCode") {
            // Only allow numbers, max 5 digits
            const cleaned = value.replace(/\D/g, "").slice(0, 5);
            setShippingAddress(prev => ({ ...prev, postalCode: cleaned }));
            if (cleaned.length > 0 && cleaned.length !== 5) {
                setPostalError("Kode pos harus 5 digit.");
            } else {
                setPostalError("");
            }
            return;
        }
        setShippingAddress(prev => ({ ...prev, [field]: value }));
    };

    const handlePlaceOrder = async () => {
        setIsProcessing(true);
        try {
            // Validate address selection
            if (!selectedAddressId || selectedAddressId === "new") {
                await Swal.fire({
                    icon: 'warning',
                    title: 'Alamat Diperlukan',
                    text: 'Silakan pilih alamat pengiriman atau simpan alamat baru terlebih dahulu.',
                });
                setIsProcessing(false);
                return;
            }

            // Map payment method to match backend enum
            const paymentMethodMap = {
                'transfer': 'BANK_TRANSFER',
                'cod': 'COD'
            };

            // Prepare order data
            const orderData = {
                addressId: selectedAddressId,
                items: selectedItems.map(item => ({
                    id: item.id,
                    quantity: item.quantity
                })),
                couponCode: null, // Add coupon code if you have one
                paymentMethod: paymentMethodMap[paymentMethod] || 'BANK_TRANSFER' // Use BANK_TRANSFER as fallback instead of STRIPE
            };
            // TODO: Replace null with actual token if needed
            const response = await orderPost(orderData, null);
            // Expecting response to contain orderIds or orderId
            let orderId = null;
            if (response && response.orderIds && Array.isArray(response.orderIds) && response.orderIds.length > 0) {
                orderId = response.orderIds[0];
            } else if (response && response.orderId) {
                orderId = response.orderId;
            }
            if (orderId) {
                await Swal.fire({
                    icon: 'success',
                    title: 'Pesanan Berhasil!',
                    text: 'Pesanan berhasil dibuat! Anda akan dialihkan ke halaman status pesanan.',
                    timer: 2000,
                    showConfirmButton: false
                });
                router.push(`/pages/status/${orderId}`);
            } else {
                await Swal.fire({
                    icon: 'warning',
                    title: 'Pesanan Berhasil',
                    text: 'Pesanan berhasil dibuat, tapi tidak dapat menemukan ID pesanan.',
                    timer: 2000,
                    showConfirmButton: false
                });
                router.push('/pages/status');
            }
        } catch (error) {
            await Swal.fire({
                icon: 'error',
                title: 'Gagal',
                text: error?.response?.data?.error || 'Gagal membuat pesanan.',
            });
        } finally {
            setIsProcessing(false);
        }
    };

    const isFormValid = selectedAddressId && selectedAddressId !== "new" ? 
        true : // If existing address selected, form is valid
        (shippingAddress.name &&
        shippingAddress.phone.length >= 10 &&
        shippingAddress.phone.length <= 12 &&
        shippingAddress.address &&
        shippingAddress.city &&
        shippingAddress.postalCode.length === 5 &&
        !phoneError &&
        !postalError);

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

                            {/* Address Selection Dropdown */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Pilih Alamat *</label>
                                <div className="relative">
                                    <select
                                        className="select select-bordered w-full bg-white focus:outline-none border-gray-200"
                                        value={selectedAddressId}
                                        onChange={(e) => handleAddressSelect(e.target.value)}
                                    >
                                        <option value="">Pilih alamat pengiriman</option>
                                        {addresses.filter(address => {
                                            console.log("Checking address:", address, "User ID:", user?.id);
                                            return (address && address.userId === user.id) || (address && address.user_id === user.id);
                                        }).map((address) => (
                                            <option key={address.id} value={address.id}>
                                                {address.name} - {address.city}
                                            </option>
                                        ))}
                                        <option value="new">+ Tambah Alamat Baru</option>
                                    </select>
                                </div>
                            </div>

                            {/* Selected Address Display */}
                            {selectedAddressId && selectedAddressId !== "new" && !showNewAddressForm && (
                                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                                    <div className="text-sm">
                                        <p className="font-semibold text-gray-900">{shippingAddress.name}</p>
                                        <p className="text-gray-600">{shippingAddress.phone}</p>
                                        <p className="text-gray-600">{shippingAddress.address}</p>
                                        <p className="text-gray-600">{shippingAddress.city} {shippingAddress.postalCode}</p>
                                        {shippingAddress.notes && <p className="text-gray-500 text-xs mt-1">Negara: {shippingAddress.notes}</p>}
                                    </div>
                                </div>
                            )}

                            {/* New Address Form */}
                            {showNewAddressForm && (
                                <div className="border-t border-gray-200 pt-4">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="font-medium text-gray-900">Alamat Baru</h3>
                                        <button
                                            type="button"
                                            onClick={handleSaveNewAddress}
                                            disabled={!shippingAddress.name || !shippingAddress.phone || !shippingAddress.address || !shippingAddress.city || !shippingAddress.postalCode || phoneError || postalError}
                                            className="btn btn-sm bg-[#ED775A] text-white hover:bg-[#d86a4a] shadow-none border-none"
                                        >
                                            <FiCheck className="w-4 h-4" />
                                            Simpan
                                        </button>
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
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Nomor Telepon *</label>
                                            <input
                                                type="text"
                                                inputMode="numeric"
                                                pattern="[0-9]*"
                                                className={`input input-bordered w-full bg-white focus:outline-none border-gray-200 ${phoneError ? 'border-red-400' : ''}`}
                                                value={shippingAddress.phone}
                                                onChange={(e) => handleInputChange('phone', e.target.value)}
                                                placeholder="08xxxxxxxxxx"
                                            />
                                            {phoneError && <p className="text-xs text-red-500 mt-1">{phoneError}</p>}
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Alamat Lengkap *</label>
                                            <textarea
                                                className="textarea textarea-bordered w-full bg-white focus:outline-none focus:bg-white border-gray-200"
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
                                                inputMode="numeric"
                                                pattern="[0-9]*"
                                                className={`input input-bordered w-full bg-white focus:outline-none border-gray-200 ${postalError ? 'border-red-400' : ''}`}
                                                value={shippingAddress.postalCode}
                                                onChange={(e) => handleInputChange('postalCode', e.target.value)}
                                                placeholder="12345"
                                            />
                                            {postalError && <p className="text-xs text-red-500 mt-1">{postalError}</p>}
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Negara</label>
                                            <input
                                                type="text"
                                                className="input input-bordered w-full bg-white focus:outline-none border-gray-200"
                                                value={shippingAddress.notes}
                                                onChange={(e) => handleInputChange('notes', e.target.value)}
                                                placeholder="Indonesia"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
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
                            className={`w-full btn ${!isFormValid || isProcessing
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