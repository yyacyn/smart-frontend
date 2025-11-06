"use client";

import { useState } from "react";
import { FiUpload } from "react-icons/fi";
import Navbar from "../../components/navbar/Navbar";
import Footer from "../../components/footer/Footer";

export default function AddStorePage() {
    const [logo, setLogo] = useState(null);
    const [username, setUsername] = useState("");
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [email, setEmail] = useState("");
    const [contact, setContact] = useState("");
    const [address, setAddress] = useState("");

    const handleLogoChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setLogo(URL.createObjectURL(e.target.files[0]));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Handle form submission
        console.log({
            logo,
            username,
            name,
            description,
            email,
            contact,
            address
        });
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="pt-10 pb-12">
                <div className="max-w-2xl mx-auto px-4">
                    <div className="mt-10 flex py-5">
                        <button onClick={() => router.back()} className="btn btn-sm btn-ghost shadow-none border-none text-gray-700 border border-gray-300 hover:bg-gray-100">
                            &larr;
                        </button>
                        <h1 className="text-2xl font-bold text-gray-900">Keranjang Belanja</h1>
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
                                        {logo ? (
                                            <img
                                                src={logo}
                                                alt="Store Logo"
                                                className="w-full h-full object-cover rounded-lg"
                                            />
                                        ) : (
                                            <>
                                                <FiUpload className="w-8 h-8 text-gray-400 mb-2" />
                                                <span className="text-sm text-gray-500">Upload Logo</span>
                                            </>
                                        )}
                                        <input
                                            id="logo-upload"
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleLogoChange}
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
                                    type="text"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ED775A] focus:border-transparent"
                                    placeholder="Enter your store username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                />
                            </div>

                            {/* Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Name
                                </label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ED775A] focus:border-transparent"
                                    placeholder="Enter your store name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Description
                                </label>
                                <textarea
                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ED775A] focus:border-transparent resize-none"
                                    rows={4}
                                    placeholder="Enter your store description"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    required
                                />
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ED775A] focus:border-transparent"
                                    placeholder="Enter your store email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>

                            {/* Contact Number */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Contact Number
                                </label>
                                <input
                                    type="tel"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ED775A] focus:border-transparent"
                                    placeholder="Enter your store contact number"
                                    value={contact}
                                    onChange={(e) => setContact(e.target.value)}
                                    required
                                />
                            </div>

                            {/* Address */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Address
                                </label>
                                <textarea
                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ED775A] focus:border-transparent resize-none"
                                    rows={3}
                                    placeholder="Enter your store address"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
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