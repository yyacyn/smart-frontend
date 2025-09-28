"use client";

import Link from "next/link";
import { FaFacebookF, FaInstagram, FaTwitter } from 'react-icons/fa';

export default function Footer() {
    return (
        <footer className="relative overflow-hidden" style={{
            background: `linear-gradient(135deg, #ED775A 0%, #F49A84 100%)`,
            color: 'white'
        }}>
            {/* Main content */}
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
                    {/* Brand section */}
                    <div className="col-span-1 md:col-span-1">
                        <div className="mb-6">
                            <h3 className="text-3xl font-bold mb-3" style={{ color: '#FFE797' }}>
                                SMART
                            </h3>
                            <p className="text-lg opacity-90 font-medium">
                                Sukmajaya Market & Trade
                            </p>
                            <p className="mt-3 text-sm opacity-75 leading-relaxed">
                                Membangun komunitas perdagangan yang lebih smart dan berkelanjutan
                            </p>
                        </div>
                    </div>

                    {/* Help section */}
                    <div>
                        <h4 className="font-bold text-lg mb-6 pb-2 border-b-2 border-opacity-30"
                            style={{ borderColor: '#FFE797', color: '#FFE797' }}>
                            Bantuan
                        </h4>
                        <ul className="space-y-3">
                            <li>
                                <Link href="#" className="text-white opacity-85 hover:opacity-100 transition-all duration-300 flex items-center group">
                                    <span className="w-2 h-2 rounded-full mr-3 group-hover:w-3 transition-all duration-300"
                                        style={{ backgroundColor: '#FFE797' }}></span>
                                    Pusat Bantuan
                                </Link>
                            </li>
                            <li>
                                <Link href="#" className="text-white opacity-85 hover:opacity-100  transition-all duration-300 flex items-center group">
                                    <span className="w-2 h-2 rounded-full mr-3 group-hover:w-3 transition-all duration-300"
                                        style={{ backgroundColor: '#FFE797' }}></span>
                                    Cara Berbelanja
                                </Link>
                            </li>
                            <li>
                                <Link href="#" className="text-white opacity-85 hover:opacity-100  transition-all duration-300 flex items-center group">
                                    <span className="w-2 h-2 rounded-full mr-3 group-hover:w-3 transition-all duration-300"
                                        style={{ backgroundColor: '#FFE797' }}></span>
                                    Kebijakan Privasi
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* About section */}
                    <div>
                        <h4 className="font-bold text-lg mb-6 pb-2 border-b-2 border-opacity-30"
                            style={{ borderColor: '#FFE797', color: '#FFE797' }}>
                            Tentang SMART
                        </h4>
                        <ul className="space-y-3">
                            <li>
                                <Link href="#" className="text-white opacity-85 hover:opacity-100 transition-all duration-300 flex items-center group">
                                    <span className="w-2 h-2 rounded-full mr-3 group-hover:w-3 transition-all duration-300"
                                        style={{ backgroundColor: '#FFE797' }}></span>
                                    Tentang Kami
                                </Link>
                            </li>
                            <li>
                                <Link href="#" className="text-white opacity-85 hover:opacity-100  transition-all duration-300 flex items-center group">
                                    <span className="w-2 h-2 rounded-full mr-3 group-hover:w-3 transition-all duration-300"
                                        style={{ backgroundColor: '#FFE797' }}></span>
                                    Karir
                                </Link>
                            </li>
                            <li>
                                <Link href="#" className="text-white opacity-85 hover:opacity-100 transition-all duration-300 flex items-center group">
                                    <span className="w-2 h-2 rounded-full mr-3 group-hover:w-3 transition-all duration-300"
                                        style={{ backgroundColor: '#FFE797' }}></span>
                                    Blog
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Social section */}
                    <div>
                        <h4 className="font-bold text-lg mb-6 pb-2 border-b-2 border-opacity-30"
                            style={{ borderColor: '#FFE797', color: '#FFE797' }}>
                            Ikuti Kami
                        </h4>
                        <div className="space-y-4">
                            <a href="#" className="flex items-center text-white opacity-85 hover:opacity-100 transition-all duration-300 group">
                                <FaFacebookF className="text-lg mr-3 group-hover:scale-110 transition-transform duration-300"  />
                                Facebook
                            </a>
                            <a href="#" className="flex items-center text-white opacity-85 hover:opacity-100  transition-all duration-300 group">
                                <FaInstagram className="text-lg mr-3 group-hover:scale-110 transition-transform duration-300"  />
                                Instagram
                            </a>
                            <a href="#" className="flex items-center text-white opacity-85 hover:opacity-100  transition-all duration-300 group">
                                <FaTwitter className="text-lg mr-3 group-hover:scale-110 transition-transform duration-300"/>
                                Twitter
                            </a>
                        </div>
                    </div>
                </div>

                {/* Bottom section */}
                <div className="border-t border-white border-opacity-20 pt-8">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <p className="text-white opacity-75 text-sm mb-4 md:mb-0">
                            &copy; 2025 SMART - Sukmajaya Market & Trade. All rights reserved.
                        </p>
                        <div className="flex space-x-6 text-sm">
                            <Link href="#" className="text-white opacity-75 hover:opacity-100 hover:text-yellow-200 transition-colors duration-300">
                                Terms of Service
                            </Link>
                            <Link href="#" className="text-white opacity-75 hover:opacity-100 hover:text-yellow-200 transition-colors duration-300">
                                Privacy Policy
                            </Link>
                            <Link href="#" className="text-white opacity-75 hover:opacity-100 hover:text-yellow-200 transition-colors duration-300">
                                Contact Us
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}