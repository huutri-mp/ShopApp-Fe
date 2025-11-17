"use client"

import { useState, use } from "react"
import Link from "next/link"
import { Star, ShoppingCart, ChevronLeft, Heart, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useProducts } from "@/hooks/data/useProducts"

export default function ProductDetail({ params }: { params: Promise<{ id: string }> }) {
  const [quantity, setQuantity] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const { products } = useProducts()
  
  // Unwrap params Promise using React.use()
  const { id } = use(params)
  const product = products.find((p) => p.id === id)

  const handleAddToCart = () => {
    setIsLoading(true)
    
    try {
      const existingCart = JSON.parse(localStorage.getItem("cart") || "[]")
      const existingItem = existingCart.find((item: any) => item.id === product?.id)
      
      if (existingItem) {
        existingItem.quantity += quantity
      } else {
        existingCart.push({
          id: product?.id,
          name: product?.name,
          price: product?.price,
          image: product?.image,
          quantity: quantity
        })
      }
      
      localStorage.setItem("cart", JSON.stringify(existingCart))
      
      // Trigger a storage event to update header cart count
      window.dispatchEvent(new Event('storage'))
      
      // Show success feedback (you could add a toast here)
      alert("Product added to cart!")
    } catch (error) {
      // Error adding to cart handled silently
      alert("Failed to add product to cart")
    } finally {
      setIsLoading(false)
    }
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Product not found</h1>
          <Link href="/" className="text-red-600 hover:text-red-700">
            Back to products
          </Link>
        </div>
      </div>
    )
  }

  const relatedProducts = products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link href="/" className="flex items-center gap-2 text-red-600 hover:text-red-700 font-medium">
            <ChevronLeft size={20} />
            Back to products
          </Link>
        </div>
      </div>

      {/* Product Detail */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
          {/* Image */}
          <div className="bg-white rounded-2xl p-8 flex items-center justify-center">
            <img
              src={product.image || "/placeholder.svg?height=500&width=500&query=product"}
              alt={product.name}
              className="w-full h-auto max-h-96 object-contain"
            />
          </div>

          {/* Details */}
          <div className="bg-white rounded-2xl p-8">
            {product.discount && (
              <span className="inline-block bg-red-500 text-white px-4 py-1.5 rounded-full text-sm font-semibold mb-4">
                Sale {product.discount}% OFF
              </span>
            )}

            <h1 className="text-4xl font-bold text-gray-900 mb-4">{product.name}</h1>

            {/* Rating */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={20}
                    className={i < Math.round(product.rating) ? "fill-amber-400 text-amber-400" : "text-gray-300"}
                  />
                ))}
              </div>
              <span className="text-gray-600 font-medium">
                {product.rating} ({product.reviews} reviews)
              </span>
            </div>

            {/* Price */}
            <div className="flex items-center gap-4 mb-8 pb-8 border-b border-gray-200">
              <span className="text-4xl font-bold text-red-600">${product.price}</span>
              {product.discount && (
                <span className="bg-red-100 text-red-600 px-3 py-1 rounded-lg font-bold text-lg">
                  Save {product.discount}%
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-gray-600 mb-8 leading-relaxed">{product.description}</p>

            {/* Quantity and Add to Cart */}
            <div className="flex items-center gap-4 mb-8">
              <div className="flex items-center border border-gray-300 rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100"
                >
                  -
                </button>
                <span className="px-6 py-2 font-semibold">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="px-4 py-2 text-gray-600 hover:bg-gray-100">
                  +
                </button>
              </div>
              <Button 
                onClick={handleAddToCart}
                disabled={isLoading || product.stock === 0}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white py-6 text-lg flex items-center justify-center gap-2"
              >
                <ShoppingCart size={20} />
                {isLoading ? "Adding..." : product.stock === 0 ? "Out of Stock" : "Add to Cart"}
              </Button>
            </div>

            {/* Product Info */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Product Information</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-gray-600">
                  <span className="font-medium">Category:</span>
                  <span>{product.category}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span className="font-medium">Stock:</span>
                  <span className={product.stock > 0 ? "text-green-600" : "text-red-600"}>
                    {product.stock > 0 ? `${product.stock} available` : "Out of stock"}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span className="font-medium">Rating:</span>
                  <span>{product.rating}/5 ({product.reviews} reviews)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Related Products</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <Link key={relatedProduct.id} href={`/products/${relatedProduct.id}`}>
                  <div className="bg-white rounded-2xl overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="relative bg-gray-100 aspect-square overflow-hidden">
                      <img
                        src={relatedProduct.image || "/placeholder.svg?height=300&width=300&query=product"}
                        alt={relatedProduct.name}
                        className="w-full h-full object-cover hover:scale-110 transition-transform"
                      />
                      {relatedProduct.discount && (
                        <div className="absolute top-3 right-3 bg-red-600 text-white px-2 py-1 rounded-lg text-xs font-bold">
                          {relatedProduct.discount}%
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2">{relatedProduct.name}</h3>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={14}
                              className={
                                i < Math.round(relatedProduct.rating)
                                  ? "fill-amber-400 text-amber-400"
                                  : "text-gray-300"
                              }
                            />
                          ))}
                        </div>
                        <span className="text-xs text-gray-600">({relatedProduct.reviews})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-red-600">${relatedProduct.price}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
