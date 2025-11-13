"use client"

import { useState } from "react"
import { Search } from "lucide-react"
import Header from "../components/Header"
import Footer from "../components/Footer"
import ProductCard from "../components/ProductCard"
import FilterSidebar, { type Filters } from "../components/FilterSidebar"

const dummyProducts = [
  {
    id: 1,
    name: "Premium Wireless Headphones",
    price: 89.99,
    originalPrice: 129.99,
    rating: 4,
    reviews: 24,
    image: "/wireless-headphones.png",
    badge: "Sale",
    discount: 30,
  },
  {
    id: 2,
    name: "Smart Watch Pro",
    price: 199.99,
    originalPrice: 299.99,
    rating: 5,
    reviews: 12,
    image: "/smartwatch-lifestyle.png",
    badge: "Hot",
    discount: 33,
  },
  {
    id: 3,
    name: "USB-C Fast Charger",
    price: 34.99,
    originalPrice: 54.99,
    rating: 5,
    reviews: 456,
    image: "/usb-charger.jpg",
    badge: "Sale",
    discount: 37,
  },
  {
    id: 4,
    name: "Phone Case Premium",
    price: 29.99,
    originalPrice: 49.99,
    rating: 5,
    reviews: 234,
    image: "/colorful-phone-case-display.png",
    discount: 40,
  },
  {
    id: 5,
    name: "Portable Power Bank",
    price: 39.99,
    originalPrice: 59.99,
    rating: 5,
    reviews: 678,
    image: "/portable-power-bank.png",
    badge: "Sale",
    discount: 33,
  },
  {
    id: 6,
    name: "Wireless Charging Pad",
    price: 24.99,
    originalPrice: 39.99,
    rating: 4,
    reviews: 289,
    image: "/wireless-charger.png",
    discount: 37,
  },
  {
    id: 7,
    name: "Bluetooth Speaker Mini",
    price: 44.99,
    originalPrice: 74.99,
    rating: 4,
    reviews: 412,
    image: "/bluetooth-speaker.jpg",
    discount: 40,
  },
  {
    id: 8,
    name: "Phone Screen Protector",
    price: 12.99,
    originalPrice: 19.99,
    rating: 5,
    reviews: 1023,
    image: "/screen-protector.png",
    discount: 35,
  },
]

export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFilters, setSelectedFilters] = useState<Filters>({
    priceRange: [0, 500],
    rating: 0,
    category: "all",
  })

  const filteredProducts = dummyProducts.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">

      {/* Main content */}
      <main className="flex-1 container mx-auto py-12 px-4 lg:px-8">
        {/* Banner section */}
        <div className="mb-16 rounded-3xl overflow-hidden shadow-lg bg-gradient-to-r from-rose-200 via-pink-100 to-slate-300 relative">
          <div className="p-12 flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="flex-1">
              <h1 className="text-5xl lg:text-6xl font-black text-gray-900 mb-4">Winter Sale</h1>
              <p className="text-xl text-gray-800 mb-8">
                Up to <span className="text-red-600 font-bold text-2xl">50% off</span>
              </p>
              <button className="bg-white hover:bg-gray-100 text-gray-900 font-semibold px-8 py-3 rounded-xl transition-colors">
                Shop now →
              </button>
            </div>
            <img
              src="/wireless-headphones.png"
              alt="Winter Sale Promo"
              className="w-64 lg:w-96 h-64 lg:h-96 object-contain drop-shadow-2xl"
            />
          </div>
        </div>

        {/* Search bar section */}
        <div className="mb-12">
          <div className="flex gap-4 items-center bg-white border border-gray-200 rounded-2xl p-3 shadow-sm">
            <Search className="text-gray-400" size={24} />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-2 py-2 text-base border-none focus:ring-0 text-gray-900 placeholder:text-gray-500 outline-none"
            />
          </div>
        </div>

        {/* Content grid */}
        <div className="flex gap-12">
          {/* Sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-8">
              <FilterSidebar selectedFilters={selectedFilters} setSelectedFilters={setSelectedFilters} />
            </div>
          </aside>

          {/* Products section */}
          <div className="flex-1">
            {/* Section header */}
            <div className="mb-12 pb-6 border-b border-gray-200">
              <h2 className="text-3xl font-bold text-gray-900">
                All Products
                <span className="text-gray-500 font-normal text-xl ml-3">({filteredProducts.length} results)</span>
              </h2>
            </div>

            {/* Product grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6 gap-y-12">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Empty state */}
            {filteredProducts.length === 0 && (
              <div className="text-center py-24 bg-white rounded-2xl border border-dashed border-gray-300 mt-12">
                <p className="text-gray-700 text-2xl font-bold mb-2">Oops! No products found.</p>
                <p className="text-gray-500">Please try adjusting your filters or search terms.</p>
              </div>
            )}
          </div>
        </div>
      </main>

    </div>
  )
}
