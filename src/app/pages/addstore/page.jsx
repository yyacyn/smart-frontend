"use client";
import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useStoreRefresh } from "../../hooks/useStoreRefresh";
import { createStore } from "../../api";
import Swal from "sweetalert2";
import Navbar from "../../components/navbar/Navbar";
import Footer from "../../components/footer/Footer";

export default function AddStorePage() {
    const [storeInfo, setStoreInfo] = useState({
        name: "",
        username: "",
        description: "",
        email: "",
        contact: "",
        address: "",
        image: null
    });

    const { getToken } = useAuth();
    const { refreshStore } = useStoreRefresh();

    const onChangeHandler = (e) => {
        const { name, value, type, files } = e.target;
        setStoreInfo((prev) => ({
            ...prev,
            [name]: type === "file" ? files[0] : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        Object.entries(storeInfo).forEach(([key, value]) => {
            if (value) formData.append(key, value);
        });
        // Debug: log form data
        for (let pair of formData.entries()) {
            console.log(pair[0] + ':', pair[1]);
        }
        try {
            // get Clerk token and pass it to the API so backend can identify the user
            const token = await getToken();
            // debug: log formData entries (optional)
            for (let pair of formData.entries()) console.log(pair[0], pair[1]);
            await createStore(formData, token);
            // Refresh store data in navbar after successful creation
            refreshStore();
            Swal.fire({
                icon: "success",
                title: "Store created successfully! Please wait for admin approval.",
                showConfirmButton: false,
                timer: 1800
            });
        } catch (err) {
            Swal.fire({
                icon: "error",
                title: "Failed to create store",
                text: err?.response?.data?.message || err.message,
            });
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="pt-10 pb-12">
                <div className="max-w-2xl mx-auto px-4">
                    <div className="mt-10 flex py-5">
                        {/* ...existing code... */}
                    </div>
                    <div className="bg-white rounded-lg shadow-lg p-8">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Store Logo */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Store Logo
                                </label>
                                <div className="flex items-center justify-center">
                                    <label
                                        htmlFor="logo-upload"
                                        className="w-32 h-32 bg-gray-100 rounded-lg flex flex-col items-center justify-center cursor-pointer border-2 border-dashed border-gray-300 hover:border-[#ED775A] transition-colors"
                                    >
                                        {storeInfo.image ? (
                                            <img
                                                src={URL.createObjectURL(storeInfo.image)}
                                                alt="Store Logo"
                                                className="w-full h-full object-cover rounded-lg"
                                            />
                                        ) : (
                                            <>
                                                {/* ...icon... */}
                                                <span className="text-sm text-gray-500">Upload Logo</span>
                                            </>
                                        )}
                                        <input
                                            id="logo-upload"
                                            name="image"
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={onChangeHandler}
                                        />
                                    </label>
                                </div>
                            </div>
                            {/* Username */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Username
                                </label>
                                <input
                                    name="username"
                                    type="text"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ED775A] focus:border-transparent"
                                    placeholder="Enter your store username"
                                    value={storeInfo.username}
                                    onChange={onChangeHandler}
                                    required
                                />
                            </div>
                            {/* ...repeat for other fields, using name and value from storeInfo... */}
                            {/* Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Name
                                </label>
                                <input
                                    name="name"
                                    type="text"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ED775A] focus:border-transparent"
                                    placeholder="Enter your store name"
                                    value={storeInfo.name}
                                    onChange={onChangeHandler}
                                    required
                                />
                            </div>
                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Description
                                </label>
                                <textarea
                                    name="description"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ED775A] focus:border-transparent resize-none"
                                    rows={4}
                                    placeholder="Enter your store description"
                                    value={storeInfo.description}
                                    onChange={onChangeHandler}
                                    required
                                />
                            </div>
                            {/* Email */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email
                                </label>
                                <input
                                    name="email"
                                    type="email"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ED775A] focus:border-transparent"
                                    placeholder="Enter your store email"
                                    value={storeInfo.email}
                                    onChange={onChangeHandler}
                                    required
                                />
                            </div>
                            {/* Contact Number */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Contact Number
                                </label>
                                <input
                                    name="contact"
                                    type="tel"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ED775A] focus:border-transparent"
                                    placeholder="Enter your store contact number"
                                    value={storeInfo.contact}
                                    onChange={onChangeHandler}
                                    required
                                />
                            </div>
                            {/* Address */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Address
                                </label>
                                <textarea
                                    name="address"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ED775A] focus:border-transparent resize-none"
                                    rows={3}
                                    placeholder="Enter your store address"
                                    value={storeInfo.address}
                                    onChange={onChangeHandler}
                                    required
                                />
                            </div>
                            {/* Submit Button */}
                            <div className="pt-4">
                                <button
                                    type="submit"
                                    className="w-full bg-[#ED775A] text-white font-bold py-4 px-6 rounded-lg hover:bg-[#d86a4a] transition-colors duration-300 text-lg"
                                >
                                    Create Store
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}