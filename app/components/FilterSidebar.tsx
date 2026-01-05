"use client";

import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

export interface Filters {
  priceRange: [number, number];
  rating: number | null;
  category: string | null;
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

  const categories = [
    { value: "all", label: t("filters.allCategories") },
    { value: "electronics", label: "Electronics" },
    { value: "accessories", label: "Accessories" },
    { value: "audio", label: "Audio" },
    { value: "power", label: "Smart Devices" },
  ];
  const ratings = [5, 4, 3, 2, 1];

  const handlePriceChange = (type: "min" | "max", value: number) => {
    const [min, max] = filters.priceRange;
    if (type === "min") {
      setFilters({
        ...filters,
        priceRange: [value, max],
      });
    } else {
      setFilters({
        ...filters,
        priceRange: [min, value],
      });
    }
  };

  const handleRatingChange = (rating: number) => {
    setFilters({
      ...filters,
      rating: filters.rating === rating ? null : rating,
    });
  };

  const handleCategoryChange = (category: string) => {
    setFilters({
      ...filters,
      category,
    });
  };

  return (
    <div className="space-y-8">
      {/* Price Range Filter */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-5">
          {t("filters.priceRange")}
        </h3>
        <div className="space-y-4">
          {/* <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm text-gray-600 font-medium">${filters.priceRange[0]}</label>
              <label className="text-sm text-gray-600 font-medium">${filters.priceRange[1]}</label>
            </div>
            <input
              type="range"
              min="0"
              max="500"
              value={filters.priceRange[0]}
              onChange={(e) => handlePriceChange("min", Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-600"
            />
          </div> */}
          {/* <div>
            <input
              type="range"
              min="0"
              max="500"
              value={filters.priceRange[1]}
              onChange={(e) => handlePriceChange("max", Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-600"
            />
          </div> */}
        </div>
      </div>

      {/* Rating Filter */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-5">
          {t("filters.rating")}
        </h3>
        <div className="space-y-3">
          <label className="flex items-center cursor-pointer">
            {/* <input
              type="checkbox"
              checked={filters.rating === null}
              onChange={() => setFilters({ ...filters, rating: null })}
              className="w-5 h-5 rounded border-gray-300 text-red-600 accent-red-600"
            /> */}
            <span className="ml-3 text-sm text-gray-700">All ratings</span>
          </label>
          {ratings.map((rating) => (
            <label key={rating} className="flex items-center cursor-pointer">
              {/* <input
                type="checkbox"
                checked={filters.rating === rating}
                onChange={() => handleRatingChange(rating)}
                className="w-5 h-5 rounded border-gray-300 text-red-600 accent-red-600"
              /> */}
              <span className="ml-3 text-sm text-gray-700">
                {rating} stars & up
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Category Filter */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-5">
          {t("filters.category")}
        </h3>
        <div className="space-y-3">
          {categories.map((cat) => (
            <label key={cat.value} className="flex items-center cursor-pointer">
              {/* <input
                type="radio"
                name="category"
                value={cat.value}
                checked={filters.category === (cat.value === "all" ? null : cat.value)}
                // onChange={() => handleCategoryChange(cat.value === "all" ? null : cat.value)}
                className="w-5 h-5 text-red-600 accent-red-600"
              /> */}
              <span className="ml-3 text-sm text-gray-700">{cat.label}</span>
            </label>
          ))}
        </div>
      </div>

      <Button
        onClick={() =>
          setFilters({ priceRange: [0, 500], rating: null, category: null })
        }
        className="w-full text-red-600 font-semibold text-sm hover:text-red-700 transition-colors"
      >
        {t("filters.clearFilters")}
      </Button>
    </div>
  );
}
