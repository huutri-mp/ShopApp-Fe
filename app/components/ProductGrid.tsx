"use client"

import { useState, useMemo } from "react"
import ProductCard from "./ProductCard"

const PRODUCTS = [
  {
    id: 1,
    name: "Premium Wireless Headphones",
    price: 89.99,
    originalPrice: 179.99,
    rating: 4.5,
    reviews: 24,
    badge: "Sale",
    image: "/wireless-headphones-audio-equipment.jpg",
    category: "Electronics",
  },
  {
    id: 2,
    name: "Smart Watch Pro",
    price: 189.99,
    originalPrice: 299.99,
    rating: 4.8,
    reviews: 12,
    badge: "Hot",
    image: "/smartwatch-wearable-device.jpg",
    category: "Smart Devices",
  },
  {
    id: 3,
    name: "Phone Case Premium",
    price: 29.99,
    originalPrice: 79.99,
    rating: 5,
    reviews: 234,
    badge: "Hot",
    image: "/premium-phone-case-protection.jpg",
    category: "Accessories",
  },
  {
    id: 4,
    name: "Portable Power Bank",
    price: 39.99,
    originalPrice: 64.99,
    rating: 4.6,
    reviews: 678,
    badge: null,
    image: "/portable-power-bank-charger.jpg",
    category: "Accessories",
  },
  {
    id: 5,
    name: "Wireless Charging Pad",
    price: 24.99,
    originalPrice: 39.99,
    rating: 4.7,
    reviews: 289,
    badge: null,
    image: "/wireless-charging-pad-qi-charger.jpg",
    category: "Accessories",
  },
  {
    id: 6,
    name: "USB-C Fast Charger",
    price: 34.99,
    originalPrice: 49.99,
    rating: 4.4,
    reviews: 156,
    badge: null,
    image: "/fast-charging-usb-c-adapter.jpg",
    category: "Electronics",
  },
]

interface Filters {
  priceRange: [number, number]
  rating: number | null
  category: string | null
}

export default function ProductGrid({ searchQuery }: { searchQuery: string }) {
  const [filters, setFilters] = useState<Filters>({
    priceRange: [0, 500],
    rating: null,
    category: null,
  })

  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesPrice = product.price >= filters.priceRange[0] && product.price <= filters.priceRange[1]
      const matchesRating = !filters.rating || product.rating >= filters.rating
      const matchesCategory = !filters.category || product.category === filters.category

      return matchesSearch && matchesPrice && matchesRating && matchesCategory
    })
  }, [searchQuery, filters])

  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

        {/* Products */}
        <div className="md:col-span-3">
          <div className="mb-8 border-b border-border pb-4 flex justify-between items-center">
            <h2 className="text-3xl font-bold text-foreground">
              All Products
              <span className="text-muted-foreground font-normal text-lg ml-2">
                ({filteredProducts.length} results)
              </span>
            </h2>
          </div>

          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">No products found matching your criteria.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
