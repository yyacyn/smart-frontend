export default function ProductCard({ product }) {
    return (
        <div
            className="card bg-white outline-1 hover:cursor-pointer outline-gray-200 hover:-translate-y-1 transition-transform duration-400"
        >
            <figure className="relative">
                <img
                    src={`https://backend-go-gin-production.up.railway.app/uploads/products/${product.ID}/1.jpg`}
                    alt={product.nama_produk}
                    className="w-full h-50 object-cover"
                />
                <div className="badge badge-primary absolute top-2 right-2">
                    {product.kategori}
                </div>
            </figure>
            <div className="card-body px-3">
                <h2 className="card-title text-sm md:text-base">
                    {product.nama_produk}
                </h2>

                {/* Rating + reviews */}
                <div className="flex items-center gap-2">
                    <div className="rating rating-sm">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <input
                                key={i}
                                type="radio"
                                name={`rating-${product.ID}`}
                                className="mask mask-star-2 bg-orange-400"
                                defaultChecked={i < product.rating}
                            />
                        ))}
                    </div>
                    <span className="text-xs text-gray-500">
                        ({product.reviews} reviews)
                    </span>
                </div>

                <p className="text-gray-600">
                    Rp {product.harga.toLocaleString()}
                </p>
            </div>
        </div>
    );
}