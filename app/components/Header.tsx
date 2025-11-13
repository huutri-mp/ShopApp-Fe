"use client"

import { Search, ShoppingCart, User, LogOut } from "lucide-react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { useState, useEffect } from "react"

export default function Header() {
  const router = useRouter()
  const pathname = usePathname()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [cartCount, setCartCount] = useState(0)

  useEffect(() => {
    // Check if user is logged in
    const authToken = localStorage.getItem("auth_token")
    setIsLoggedIn(!!authToken)
    // Check cart count
    const cart = JSON.parse(localStorage.getItem("cart") || "[]")
    setCartCount(cart.length)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("auth_token")
    localStorage.removeItem("user_email")
    setIsLoggedIn(false)
    router.push("/")
  }

  const handleUserClick = () => {
    if (isLoggedIn) {
      router.push("/dashboard")
    } else {
      router.push("/auth/login")
    }
  }

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      {/* Top bar */}
      <div className="border-b border-gray-100">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-red-600 rounded-md flex items-center justify-center">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Shops</span>
          </Link>

          {/* Search bar */}
          <div className="flex-1 max-w-md mx-8">
            <div className="relative">
              <input
                type="text"
                placeholder="Search products..."
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-red-600 text-sm"
              />
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            </div>
          </div>

          {/* Right icons */}
          <div className="flex items-center gap-4">
            {/* Cart */}
            <Link href="/cart" className="relative text-gray-600 hover:text-red-600 transition-colors">
              <ShoppingCart size={24} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* User menu */}
            <div className="flex items-center gap-2">
              <button onClick={handleUserClick} className="text-gray-600 hover:text-red-600 transition-colors">
                <User size={24} />
              </button>
              {isLoggedIn && (
                <button
                  onClick={handleLogout}
                  className="text-gray-600 hover:text-red-600 transition-colors p-1"
                  title="Logout"
                >
                  <LogOut size={20} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="container mx-auto px-4 py-0">
        <div className="flex gap-8">
          <Link
            href="/"
            className={`py-4 px-1 font-medium border-b-2 transition-all ${
              pathname === "/"
                ? "text-red-600 border-red-600"
                : "text-gray-700 hover:text-gray-900 border-transparent hover:border-gray-300"
            }`}
          >
            Home
          </Link>
          <a
            href="#"
            className="py-4 px-1 text-gray-700 hover:text-gray-900 font-medium border-b-2 border-transparent hover:border-gray-300 transition-all"
          >
            Categories
          </a>
          <a
            href="#"
            className="py-4 px-1 text-gray-700 hover:text-gray-900 font-medium border-b-2 border-transparent hover:border-gray-300 transition-all"
          >
            Deals
          </a>
          <a
            href="#"
            className="py-4 px-1 text-gray-700 hover:text-gray-900 font-medium border-b-2 border-transparent hover:border-gray-300 transition-all"
          >
            Contact
          </a>
          {isLoggedIn && (
            <Link
              href="/dashboard"
              className={`py-4 px-1 font-medium border-b-2 transition-all ${
                pathname.startsWith("/dashboard")
                  ? "text-red-600 border-red-600"
                  : "text-gray-700 hover:text-gray-900 border-transparent hover:border-gray-300"
              }`}
            >
              Dashboard
            </Link>
          )}
        </div>
      </nav>
    </header>
  )
}
