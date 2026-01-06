"use client";

import type React from "react";
import { useLayoutEffect } from "react";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { Separator } from "@/components/ui/separator";
import { Link } from "@/i18n/routing";
import { Users, Package, Tags, Grid2X2 } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import useAppStore from "@/hooks/useAppStore";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading, user, isAdmin } = useAppStore();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations();

  return (
    isAuthenticated &&
    isAdmin && (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="flex flex-1">
          <aside className="w-64 border-r">
            <div className="p-4 flex items-center justify-between gap-2">
              <div className="font-bold text-lg">
                {t("dashboard.title") || "Dashboard"}
              </div>
            </div>
            <Separator />
            <nav className="p-2 space-y-1">
              <Link
                href="/dashboard/users"
                className={`flex items-center gap-2 p-2 rounded hover:bg-muted ${
                  pathname?.includes("/dashboard/users")
                    ? "bg-muted font-medium"
                    : ""
                }`}
              >
                <Users size={18} /> {t("dashboard.users", { default: "Users" })}
              </Link>
              <Link
                href="/dashboard/products"
                className={`flex items-center gap-2 p-2 rounded hover:bg-muted ${
                  pathname?.includes("/dashboard/products")
                    ? "bg-muted font-medium"
                    : ""
                }`}
              >
                <Package size={18} />{" "}
                {t("products.title", { default: "Products" })}
              </Link>
              <Link
                href="/dashboard/brands"
                className={`flex items-center gap-2 p-2 rounded hover:bg-muted ${
                  pathname?.includes("/dashboard/brands")
                    ? "bg-muted font-medium"
                    : ""
                }`}
              >
                <Tags size={18} />{" "}
                {t("dashboard.brands", { default: "Brands" })}
              </Link>
              <Link
                href="/dashboard/categories"
                className={`flex items-center gap-2 p-2 rounded hover:bg-muted ${
                  pathname?.includes("/dashboard/categories")
                    ? "bg-muted font-medium"
                    : ""
                }`}
              >
                <Grid2X2 size={18} />{" "}
                {t("dashboard.categories", { default: "Categories" })}
              </Link>
            </nav>
          </aside>
          <main className="flex-1 p-6">{children}</main>
        </div>
      </div>
    )
  );
}
