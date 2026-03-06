"use client";

import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { useCategories } from "@/hooks/data/useCategories";
import { useBrands } from "@/hooks/data/useBrands";

export interface Filters {
  priceRange: [number, number];
  category: string | null;
  brand: string | null;
}

interface FilterSidebarProps {
  filters: Filters;
  setFilters: (filters: Filters) => void;
}

export default function FilterSidebar({
  filters,
  setFilters,
}: FilterSidebarProps) {
  const t = useTranslations();
  const { categories } = useCategories();
  const { brands } = useBrands();

  const categoryOptions = [
    { id: "all", name: t("filters.allCategories") },
    ...(categories.data?.items ?? []).map((c: any) => ({
      id: String(c.id),
      name: c.name,
    })),
  ];

  const brandOptions = (brands.data?.items ?? []).map((b: any) => ({
    id: String(b.id),
    name: b.name,
  }));

  const handleCategoryChange = (category: string | null) => {
    setFilters({
      ...filters,
      category,
    });
  };

  const handleBrandChange = (brand: string | null) => {
    setFilters({
      ...filters,
      brand,
    });
  };

  return (
    <div className="space-y-8">
      {/* Category Filter */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-5">
          {t("filters.category")}
        </h3>
        <div className="space-y-3">
          {categoryOptions.map((cat: any) => (
            <label key={cat.id} className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="category"
                value={cat.id}
                checked={
                  filters.category === (cat.id === "all" ? null : cat.id)
                }
                onChange={() =>
                  handleCategoryChange(cat.id === "all" ? null : cat.id)
                }
                className="w-4 h-4 text-red-600 accent-red-600"
              />
              <span className="ml-3 text-sm text-gray-700">{cat.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Brand Filter */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-5">
          {t("filters.brand")}
        </h3>
        <div className="space-y-3">
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              name="brand"
              value="all"
              checked={filters.brand === null}
              onChange={() => handleBrandChange(null)}
              className="w-4 h-4 text-red-600 accent-red-600"
            />
            <span className="ml-3 text-sm text-gray-700">
              {t("filters.allBrands")}
            </span>
          </label>
          {brandOptions.map((b: any) => (
            <label key={b.id} className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="brand"
                value={b.id}
                checked={filters.brand === b.id}
                onChange={() => handleBrandChange(b.id)}
                className="w-4 h-4 text-red-600 accent-red-600"
              />
              <span className="ml-3 text-sm text-gray-700">{b.name}</span>
            </label>
          ))}
        </div>
      </div>

      <Button
        onClick={() =>
          setFilters({ priceRange: [0, 500], category: null, brand: null })
        }
        className="w-full font-semibold text-sm hover:text-red-700 transition-colors"
      >
        {t("filters.clearFilters")}
      </Button>
    </div>
  );
}
