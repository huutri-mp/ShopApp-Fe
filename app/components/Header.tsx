"use client";

import { Search, ShoppingCart, User, LogOut } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link, useRouter, usePathname } from "@/i18n/routing";
import { useAuth } from "@/hooks/data/useAuth";
import { Button } from "@/components/ui/button";
import useAppStore from "@/hooks/useAppStore";
import LanguageSwitcher from "./LanguageSwitcher";

export default function Header() {
  const t = useTranslations();
  const router = useRouter();
  const pathname = usePathname();
  const { logout } = useAuth();
  const { isAuthenticated, isAdmin } = useAppStore();

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      {/* Top bar */}
      <div className="border-b border-gray-100">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 bg-red-600 rounded-md flex items-center justify-center">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <span className="text-xl font-bold text-gray-900">
              {t("header.shops")}
            </span>
          </Link>
          {/* Search bar */}
          <div className="flex-1 max-w-md mx-8">
            <div className="relative">
              <input
                type="text"
                placeholder={t("common.searchProducts")}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-red-600 text-sm"
              />
              <Search
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
            </div>
          </div>

          {/* Right icons */}
          <div className="flex items-center gap-4">
            {/* Language Switcher */}
            <LanguageSwitcher />
            {/* Cart */}
            {/* <Link href="/cart" className="relative text-gray-600 hover:text-red-600 transition-colors">
              <ShoppingCart size={24} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </Link> */}

            {/* User menu */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                onClick={() => {
                  if (isAuthenticated) {
                    router.push("/profile");
                  } else {
                    router.push("/auth/login");
                  }
                }}
                className="text-gray-900 hover:text-red-200 transition-colors"
              >
                <User size={24} />
              </Button>
              {isAuthenticated && (
                <Button
                  onClick={logout}
                  className="text-gray-900 hover:text-red-200 transition-colors p-1"
                  title="Logout"
                  variant="ghost"
                >
                  <LogOut size={20} />
                </Button>
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
            {t("header.home")}
          </Link>
          <a
            href="#"
            className="py-4 px-1 text-gray-700 hover:text-gray-900 font-medium border-b-2 border-transparent hover:border-gray-300 transition-all"
          >
            {t("products.categories")}
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
            {t("footer.contact")}
          </a>
          {isAdmin && (
            <Link
              href="/dashboard"
              className={`py-4 px-1 font-medium border-b-2 transition-all ${
                pathname.startsWith("/dashboard")
                  ? "text-red-600 border-red-600"
                  : "text-gray-700 hover:text-gray-900 border-transparent hover:border-gray-300"
              }`}
            >
              {t("header.dashboard")}
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
