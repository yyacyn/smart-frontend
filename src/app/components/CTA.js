"use client";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { fetchStores } from "../api";

export default function CTA() {
    const { user } = useUser();
    const [userStore, setUserStore] = useState(null);

    // Check if user has a store
    useEffect(() => {
        async function checkUserStore() {
            if (user?.id) {
                try {
                    const storeResponse = await fetchStores();
                    if (storeResponse?.stores) {
                        const currentUserStore = storeResponse.stores.find(store => store.userId === user.id);
                        setUserStore(currentUserStore || null);
                    }
                } catch (error) {
                    console.error('Error fetching stores:', error);
                    // Check if it's an authentication error
                    if (error.response?.status === 401) {
                        console.warn('Authentication failed when fetching stores. User may need to re-authenticate.');
                    }
                    setUserStore(null);
                }
            } else {
                // User is not logged in, reset store data
                setUserStore(null);
            }
        };
        checkUserStore();
    }, [user?.id]);

    return (
        <section className="mt-14 rounded-box border p-6 text-black">
            <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                <div>
                    <h3 className="text-pretty text-lg font-semibold">
                        Punya Bisnis? Yuk Buka Lapak di SMART, Pasar Online Sukmajaya!
                    </h3>
                    <p className="mt-1 text-sm opacity-70">
                        Mulai berjualan gratis. Jangkau lebih banyak pelanggan sekarang.
                    </p>
                </div>
                {user ? (
                    <Link
                        href={userStore ? `/pages/store/${userStore.id}` : "/pages/addstore"}
                        className="btn btn-primary"
                    >
                        {userStore ? "Lihat Toko Saya" : "Buka Toko GRATIS"}
                    </Link>
                ) : (
                    <Link href="/pages/addstore" className="btn btn-primary">Buka Toko GRATIS</Link>
                )}
            </div>
        </section>
    );
}
