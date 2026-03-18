"use client";

import { Search, ShoppingCart, User, LogOut, BarChart3 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link, useRouter, usePathname } from "@/i18n/routing";
import { useAuth } from "@/hooks/data/useAuth";
import { Button } from "@/components/ui/button";
import useAppStore from "@/hooks/useAppStore";
import { useCart } from "@/hooks/data/useCart";
import LanguageSwitcher from "./LanguageSwitcher";
import { useState } from "react";
import LoginRequiredDialog from "./LoginRequiredDialog";

export default function Header() {
  const t = useTranslations();
  const router = useRouter();
  const pathname = usePathname();
  const { logout } = useAuth();
  const { isAuthenticated, isAdmin, searchKeyword, setSearchKeyword } =
    useAppStore();
  const { totalQuantity: cartCount } = useCart();
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);

  const goToProducts = () => {
    router.push("/products");
  };

  const goToLoginWithRedirect = () => {
    const query = typeof window !== "undefined" ? window.location.search : "";
    const currentPath = `${pathname}${query}`;
    router.push(`/auth/login?redirect=${encodeURIComponent(currentPath)}`);
  };

  const handleCartClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (isAuthenticated) return;
    e.preventDefault();
    setLoginDialogOpen(true);
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <LoginRequiredDialog
        open={loginDialogOpen}
        onOpenChange={setLoginDialogOpen}
        onConfirm={goToLoginWithRedirect}
      />
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
                value={searchKeyword || ""}
                onChange={(e) => setSearchKeyword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    goToProducts();
                  }
                }}
                className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:border-red-600 text-sm"
              />
              <button
                type="button"
                onClick={goToProducts}
                aria-label="Search"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-red-600"
              >
                <Search size={20} />
              </button>
            </div>
          </div>

          {/* Right icons */}
          <div className="flex items-center gap-4">
            {/* Language Switcher */}
            <LanguageSwitcher />
            {/* Cart */}
            <Link
              href="/cart"
              onClick={handleCartClick}
              className="relative text-gray-600 hover:text-red-600 transition-colors"
            >
              <ShoppingCart size={24} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </Link>

            {isAdmin && (
              <Link href="/dashboard">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <BarChart3 className="w-4 h-4" />
                  {t("header.dashboard")}
                </Button>
              </Link>
            )}

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
    </header>
  );
}
