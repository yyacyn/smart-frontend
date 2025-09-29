export default function ProductDetailPage({ params }) {
    const { id } = params;

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-lg max-w-3xl w-full">
                <h1 className="text-3xl font-bold mb-6">Detail Produk</h1>
                <p className="text-lg">Menampilkan detail untuk produk dengan ID: <span className="font-mono">{id}</span></p>
                {/* Here you would typically fetch and display product details based on the ID */}
            </div>
        </div>
    );
}