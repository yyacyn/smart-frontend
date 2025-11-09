"use client";

import { useParams } from "next/navigation";
import { getReceiptById } from "../../../data/receipt";
import { sampleProducts, flashSales, recommendedProducts } from "../../../data/products";

export default function ReceiptPage() {
    const params = useParams();
    const { id } = params;
    const transaction = getReceiptById(id);

    if (!transaction) {
        return (
            <main className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="bg-white shadow-lg rounded-lg p-8">
                    <h1 className="text-2xl font-bold mb-4">Receipt Not Found</h1>
                    <p className="text-gray-700">No receipt found for transaction ID: <span className="font-mono">{id}</span></p>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-8">
            <div className="w-full max-w-xl bg-white shadow-lg rounded-lg p-8">
                <h1 className="text-2xl font-bold mb-4">Receipt</h1>
                <div className="mb-2 text-gray-700">Transaction ID: <span className="font-mono">{transaction.id}</span></div>
                <div className="mb-2 text-gray-700">Date: {transaction.date}</div>
                <div className="mb-2 text-gray-700">Store: {transaction.store}</div>
                <div className="mb-2 text-gray-700">Status: <span className="font-semibold text-green-600">{transaction.status}</span></div>
                <div className="mb-2 text-gray-700">Payment: {transaction.payment}</div>
                <hr className="my-4" />
                <h2 className="text-lg font-semibold mb-2">Items</h2>
                <ul className="mb-4">
                    {transaction.items.map((item, idx) => (
                        <li key={idx} className="flex justify-between py-1">
                            <span>{item.name} x{item.qty}</span>
                            <span>Rp{item.price.toLocaleString()}</span>
                        </li>
                    ))}
                </ul>
                <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>Rp{transaction.total.toLocaleString()}</span>
                </div>
            </div>
        </main>
    );
}
