"use client";

import Link from "next/link";
import { FiSearch, FiShoppingCart, FiUser, FiHeart, FiBell } from "react-icons/fi";
import { useState } from "react";
import { FcGoogle } from "react-icons/fc";

export default function Navbar() {
    const [searchQuery, setSearchQuery] = useState("");
    const [isActive, setIsActive] = useState(false);

    return (
        <header className="bg-white border-1 border-gray-200 fixed top-0 left-0 w-full z-50">
            <div className="navbar max-w-7xl mx-auto px-4 py-2 sm:px-6 lg:px-8">
                <div className="navbar-start">
                    <Link href="/" className="items-center">
                        <h1 className="text-2xl font-bold text-[#ED775A]">SMART</h1>
                        <span className="text-sm text-gray-600">Sukmajaya Market & Trade</span>
                    </Link>
                </div>

                <div className="navbar-center hidden lg:flex">
                    <div className="form-control">
                        <div className="input-group border-gray-200 border-1 rounded-md text-gray-500 flex">
                            <input
                                type="text"
                                placeholder="Cari disini..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="input w-64 bg-white focus:ring-0 focus:border-transparent focus:outline-none"
                            />
                            <span className=" my-2 w-[1.6px] bg-gray-200"></span>
                            <button className="btn btn-square bg-white focus:outline-none border-none shadow-none">
                                <FiSearch className="text-gray-400" />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="navbar-end space-x-2">
                    <button className="btn btn-ghost btn-circle hover:bg-orange-custom hover:text-white border-none shadow-none hover:bg-[#ED775A] hover:border-none">
                        <FiBell size={20} />
                    </button>
                    <button className="btn btn-ghost btn-circle hover:bg-orange-custom hover:text-white border-none shadow-none hover:bg-[#ED775A] hover:border-none">
                        <FiHeart size={20} />
                    </button>
                    <Link href="/pages/cart" className="btn btn-ghost btn-circle hover:bg-orange-custom hover:text-white shadow-none border-none hover:bg-[#ED775A] hover:border-none">
                        <FiShoppingCart size={20} />
                    </Link>
                    <button className="btn btn-ghost hover:bg-orange-custom hover:text-white px-5 border-none shadow-none rounded-4xl hover:bg-[#ED775A] hover:border-none">
                        <div className="">Login</div>
                    </button>
                </div>
            </div>
        </header>
    );
}