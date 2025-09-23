"use client";

import Link from "next/link";

export default function Footer() {
    return (
        <footer className="bg-gray-800 text-white py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div>
                        <h3 className="text-xl font-bold mb-4">SMART</h3>
                        <p className="text-gray-300">Sukmajaya Market & Trade</p>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-4">Bantuan</h4>
                        <ul className="space-y-2 text-gray-300">
                            <li><Link href="#" className="hover:text-white">Pusat Bantuan</Link></li>
                            <li><Link href="#" className="hover:text-white">Cara Berbelanja</Link></li>
                            <li><Link href="#" className="hover:text-white">Kebijakan Privasi</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-4">Tentang SMART</h4>
                        <ul className="space-y-2 text-gray-300">
                            <li><Link href="#" className="hover:text-white">Tentang Kami</Link></li>
                            <li><Link href="#" className="hover:text-white">Karir</Link></li>
                            <li><Link href="#" className="hover:text-white">Blog</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-4">Ikuti Kami</h4>
                        <div className="flex space-x-4">
                            <a href="#" className="text-gray-300 hover:text-white">Facebook</a>
                            <a href="#" className="text-gray-300 hover:text-white">Instagram</a>
                            <a href="#" className="text-gray-300 hover:text-white">Twitter</a>
                        </div>
                    </div>
                </div>
                <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
                    <p>&copy; 2025 SMART. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}