"use client"

import { useState } from "react"
import { Search } from "lucide-react"
import Hero from "./components/Hero"
import ProductGrid from "./components/ProductGrid"
import FilterSidebar from "./components/FilterSidebar"

interface Filters {
  priceRange: [number, number]
  rating: number
  category: string
}

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState<Filters>({
    priceRange: [0, 500],
    rating: 0,
    category: "all",
  })

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Banner */}
      <Hero />

      {/* Search Section */}
      <div className="bg-white border-b border-border py-6">
        <div className="max-w-7xl mx-auto px-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 pl-12 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <Search className="absolute left-4 top-3.5 w-5 h-5 text-muted-foreground" />
          </div>
        </div>
      </div>

      {/* Products Section with Filters */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <FilterSidebar selectedFilters={filters} setSelectedFilters={setFilters} />
          </div>
          <div className="md:col-span-3">
            <ProductGrid searchQuery={searchQuery} />
          </div>
        </div>
      </div>
    </div>
  )
}
