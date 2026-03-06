"use client";

import { useTranslations } from "next-intl";
import ProductCard from "./ProductCard";
import type { ProductResponse } from "@/hooks/data/useProducts";

export default function ProductGrid({
  products,
}: {
  products: ProductResponse[];
}) {
  const t = useTranslations();

  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="md:col-span-3">
          <div className="mb-8 border-b border-border pb-4 flex justify-between items-center">
            <h2 className="text-3xl font-bold text-foreground">
              {t("products.allProducts")}
              <span className="text-muted-foreground font-normal text-lg ml-2">
                ({t("common.itemsLabel", { count: products.length })})
              </span>
            </h2>
          </div>

          {products.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">
                {t("products.noProducts")}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
