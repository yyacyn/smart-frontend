import { Link } from "lucide-react";

export default function CTA() {
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
                <Link href="/pages/addstore" className="btn btn-primary">Buka Toko GRATIS</Link>
            </div>
        </section>
    );
}
