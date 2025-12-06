import { Star } from "lucide-react";
import Link from "next/link";

interface Product {
  id: string;
  name: string;
  price: number;
  rating: number;
  reviews: number;
  image: string;
  category: string;
  stock: number;
  discount?: number;
}

export default function ProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/products/${product.id}`}>
      <div className="bg-white rounded-2xl overflow-hidden hover:shadow-xl transition-shadow duration-300 group cursor-pointer">
        {/* Image container */}
        <div className="relative bg-gradient-to-br from-gray-100 to-gray-200 aspect-square overflow-hidden">
          <img
            src={
              product.image ||
              "/placeholder.svg?height=300&width=300&query=product"
            }
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
          {/* Stock status */}
          {product.stock === 0 && (
            <div className="absolute top-4 left-4 bg-gray-500 text-white px-3 py-1.5 rounded-full text-xs font-semibold">
              Out of Stock
            </div>
          )}
          {/* Discount badge */}
          {product.discount && (
            <div className="absolute top-4 right-4 bg-red-600 text-white px-2.5 py-1 rounded-lg text-xs font-bold">
              {product.discount}%
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5">
          <h3 className="text-base font-semibold text-gray-900 line-clamp-2 mb-3">
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={16}
                  className={
                    i < Math.round(product.rating)
                      ? "fill-amber-400 text-amber-400"
                      : "text-gray-300"
                  }
                />
              ))}
            </div>
            <span className="text-xs text-gray-600 font-medium">
              {product.reviews}
            </span>
          </div>

          {/* Price */}
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xl font-bold text-red-600">
              ${product.price}
            </span>
            {product.discount && (
              <span className="text-sm text-green-600 font-semibold">
                -{product.discount}%
              </span>
            )}
          </div>

          {/* Add to cart button */}
          <button className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-xl transition-colors duration-200 text-sm">
            Add to Cart
          </button>
        </div>
      </div>
    </Link>
  );
}
