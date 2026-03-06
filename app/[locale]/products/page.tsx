"use client";

import type React from "react";
import { useState, useMemo, useEffect } from "react";
import { useTranslations } from "next-intl";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useBrands } from "@/hooks/data/useBrands";
import { useCategories } from "@/hooks/data/useCategories";
import {
  useProductSearch,
  type ProductResponse,
} from "@/hooks/data/useProducts";
import useAppStore from "@/hooks/useAppStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ProductCard from "../../components/ProductCard";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { SortOrder } from "@/lib/enums";
import { Spinner } from "@/components/ui/spinner";
import { Smartphone, Laptop, Headphones, Tablet, Tag } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

export default function ProductsPage() {
  const t = useTranslations();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const initialCategoryIdFromUrl = searchParams.get("categoryId");
  const iconForSlug: Record<string, React.ComponentType<any>> = {
    "dien-thoai": Smartphone,
    laptop: Laptop,
    "phu-kien": Headphones,
    tablet: Tablet,
  };
  const { searchKeyword } = useAppStore();
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>(
    () => {
      const id = initialCategoryIdFromUrl
        ? Number(initialCategoryIdFromUrl)
        : NaN;
      return Number.isFinite(id) ? [id] : [];
    }
  );
  const [selectedBrandIds, setSelectedBrandIds] = useState<number[]>([]);
  const MAX_PRICE_CAP = 100000000;
  const DEFAULT_PRICE_RANGE: [number, number] = [0, MAX_PRICE_CAP];
  const [priceRange, setPriceRange] =
    useState<[number, number]>(DEFAULT_PRICE_RANGE);
  const [priceTouched, setPriceTouched] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedFilters, setExpandedFilters] = useState({
    categories: true,
    brands: false,
    price: true,
  });
  const [minPriceText, setMinPriceText] = useState<string>(
    String(DEFAULT_PRICE_RANGE[0])
  );
  const [maxPriceText, setMaxPriceText] = useState<string>(
    String(DEFAULT_PRICE_RANGE[1])
  );

  const { categories } = useCategories();
  const { brands } = useBrands();
  const categoryItems = categories.data?.items ?? [];
  const brandItems = brands.data?.items ?? [];
  const [sortOrder, setSortOrder] = useState<SortOrder | undefined>(undefined);

  const productsQuery = useProductSearch({
    keyword: (searchKeyword || "").trim() || undefined,
    minPrice: priceTouched ? priceRange[0] : undefined,
    maxPrice: priceTouched ? priceRange[1] : undefined,
    brandIds: selectedBrandIds.length ? selectedBrandIds : undefined,
    categoryIds: selectedCategoryIds.length ? selectedCategoryIds : undefined,
    sort: sortOrder,
    page: Math.max(currentPage - 1, 0),
    size: 8,
  });
  const searchItems = useMemo<ProductResponse[]>(() => {
    const d: any = productsQuery.data;
    if (Array.isArray(d)) return d;
    if (Array.isArray(d?.items)) return d.items;
    return [];
  }, [productsQuery.data]);

  const searchMeta = useMemo(() => {
    const d: any = productsQuery.data;
    const page =
      typeof d?.page === "number" ? d.page : Math.max(currentPage - 1, 0);
    const size = typeof d?.size === "number" ? d.size : searchItems.length || 0;
    const total =
      typeof d?.total === "number" ? d.total : searchItems.length || 0;
    const hasNext = typeof d?.hasNext === "boolean" ? d.hasNext : false;
    const hasPrev =
      typeof d?.hasPrev === "boolean" ? d.hasPrev : currentPage > 1;
    return { page, size, total, hasNext, hasPrev };
  }, [productsQuery.data, currentPage, searchItems.length]);

  const selectedCategoryName = useMemo(() => {
    if (selectedCategoryIds.length !== 1) return null;
    const id = selectedCategoryIds[0];
    return categoryItems.find((c: any) => c.id === id)?.name ?? null;
  }, [selectedCategoryIds, categoryItems]);

  const maxPriceValue = MAX_PRICE_CAP;

  const startItemDisplay =
    searchItems.length === 0 ? 0 : searchMeta.page * searchMeta.size + 1;
  const endItemDisplay = searchMeta.page * searchMeta.size + searchItems.length;

  const sortedItems = useMemo(() => {
    if (!sortOrder) return searchItems;
    const items = [...searchItems];
    items.sort((a, b) => {
      const ap = (a.minPrice ?? a.maxPrice ?? 0) as number;
      const bp = (b.minPrice ?? b.maxPrice ?? 0) as number;
      return sortOrder === SortOrder.ASC ? ap - bp : bp - ap;
    });
    return items;
  }, [searchItems, sortOrder]);

  useEffect(() => {
    setPriceRange((prev) => {
      const next: [number, number] = [
        Math.min(prev[0], maxPriceValue),
        Math.min(prev[1], maxPriceValue),
      ];
      setMinPriceText(String(next[0]));
      setMaxPriceText(String(next[1]));
      return next;
    });
  }, [maxPriceValue]);

  const handleBrandToggle = (brandId: number) => {
    setSelectedBrandIds((prev) =>
      prev.includes(brandId)
        ? prev.filter((id) => id !== brandId)
        : [...prev, brandId]
    );
    setCurrentPage(1);
  };

  const categoryTabValue =
    selectedCategoryIds.length === 1 ? String(selectedCategoryIds[0]) : "all";

  const handleCategoryTabChange = (value: string) => {
    if (value === "all") {
      setSelectedCategoryIds([]);
      const params = new URLSearchParams(searchParams.toString());
      params.delete("categoryId");
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    } else {
      const id = Number(value);
      if (!Number.isNaN(id)) {
        setSelectedCategoryIds([id]);
        const params = new URLSearchParams(searchParams.toString());
        params.set("categoryId", String(id));
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
      }
    }
    setCurrentPage(1);
  };

  const commitPriceRange = (minStr?: string, maxStr?: string) => {
    const minRaw = minStr ?? minPriceText;
    const maxRaw = maxStr ?? maxPriceText;

    const minNum = Math.max(
      0,
      Math.min(Number.parseInt(minRaw || "0", 10) || 0, maxPriceValue)
    );
    const maxNum = Math.max(
      0,
      Math.min(
        Number.parseInt(maxRaw || String(maxPriceValue), 10) || 0,
        maxPriceValue
      )
    );

    const [minFinal, maxFinal] =
      minNum <= maxNum ? [minNum, maxNum] : [maxNum, minNum];

    setPriceRange([minFinal, maxFinal]);
    setMinPriceText(String(minFinal));
    setMaxPriceText(String(maxFinal));
    setPriceTouched(true);
    setCurrentPage(1);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchKeyword]);

  const clearFilters = () => {
    setSelectedCategoryIds([]);
    setSelectedBrandIds([]);
    setPriceRange(DEFAULT_PRICE_RANGE);
    setMinPriceText(String(DEFAULT_PRICE_RANGE[0]));
    setMaxPriceText(String(DEFAULT_PRICE_RANGE[1]));
    setPriceTouched(false);
    setCurrentPage(1);
    const params = new URLSearchParams(searchParams.toString());
    params.delete("categoryId");
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const isLoading =
    (categories.isLoading || brands.isLoading || productsQuery.isLoading) &&
    !searchItems.length;
  const isError =
    Boolean(categories.isError) ||
    Boolean(brands.isError) ||
    Boolean(productsQuery.isError);

  return (
    <main className="min-h-screen bg-background">
      {/* Categories bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={categoryTabValue} onValueChange={handleCategoryTabChange}>
          <TabsList className="flex w-full gap-2 overflow-x-auto rounded-xl bg-muted/30">
            <TabsTrigger
              value="all"
              className="shrink-0 border px-3 py-1.5 text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              {t("filters.allCategories", { defaultValue: "All Categories" })}
            </TabsTrigger>
            {categoryItems.map((cat) => {
              const Icon = iconForSlug[cat.slug] ?? Tag;
              return (
                <TabsTrigger
                  key={cat.id}
                  value={String(cat.id)}
                  className="shrink-0 border px-3 py-1.5 text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <span className="flex items-center gap-2 whitespace-nowrap">
                    <Icon className="w-4 h-4" />
                    <span className="font-medium">{cat.name}</span>
                  </span>
                </TabsTrigger>
              );
            })}
          </TabsList>
        </Tabs>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-arial font-bold text-foreground mb-4">
            {selectedCategoryName ??
              t("products.allProducts", { defaultValue: "All Products" })}
          </h1>
          <p className="text-foreground/60">
            {t("products.subtitle", {
              defaultValue:
                "Browse our complete collection of technology products",
            })}
          </p>
        </div>

        {/* Contact/Promo Banner */}
        <div className="mb-8">
          <div className="relative rounded-xl overflow-hidden border border-border h-40 sm:h-56 lg:h-64 bg-gradient-to-r from-primary to-accent">
            <div className="absolute inset-0 flex items-center px-6 sm:px-8 lg:px-10">
              <div className="text-white">
                <h3 className="text-xl sm:text-2xl font-bold">
                  {t("products.promoTitle", {
                    defaultValue: "Can't find the product you need?",
                  })}
                </h3>
                <p className="mt-1 text-lg sm:text-xl font-semibold">
                  {t("products.promoCall", {
                    defaultValue: "Call now: +84 (123).456-7890",
                  })}
                </p>
                <p className="text-sm sm:text-base">
                  {t("products.promoEmailHelp", {
                    defaultValue:
                      "or email: support@example.com for quick support.",
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 mt-3 mb-3">
          <Carousel className="w-full">
            <CarouselContent className="rounded-xl bg-muted/30 p-2">
              <CarouselItem className="basis-auto">
                <Button
                  variant={
                    selectedBrandIds.length === 0 ? "default" : "outline"
                  }
                  className={
                    selectedBrandIds.length === 0
                      ? "shrink-0 px-3 py-1.5 text-sm bg-primary text-primary-foreground"
                      : "shrink-0 px-3 py-1.5 text-sm bg-transparent border-foreground/20 text-foreground"
                  }
                  onClick={() => {
                    setSelectedBrandIds([]);
                    setCurrentPage(1);
                  }}
                >
                  {t("filters.allBrands", { defaultValue: "All Brands" })}
                </Button>
              </CarouselItem>
              {brandItems.map((brand) => {
                const active = selectedBrandIds.includes(brand.id);
                return (
                  <CarouselItem key={brand.id} className="basis-auto">
                    <Button
                      variant={active ? "default" : "outline"}
                      className={
                        active
                          ? "shrink-0  px-3 py-1.5 text-sm bg-primary text-primary-foreground"
                          : "shrink-0  px-3 py-1.5 text-sm bg-transparent border-foreground/20 text-foreground"
                      }
                      onClick={() => {
                        handleBrandToggle(brand.id);
                      }}
                    >
                      {brand.name}
                    </Button>
                  </CarouselItem>
                );
              })}
            </CarouselContent>
            <CarouselPrevious className="-left-6" />
            <CarouselNext className="-right-6" />
          </Carousel>
        </div>
        <div className="w-full">
          {/* Products Grid */}
          <div className="w-full">
            {/* Results Info */}
            <div className="mb-6 flex items-center justify-between w-full">
              {/* Price range inputs */}
              <div className="flex items-center gap-3">
                <span className="text-sm text-foreground/60">
                  {t("products.priceRange", { defaultValue: "Price Range" })}:
                </span>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={0}
                    max={maxPriceValue}
                    step={10000}
                    value={minPriceText}
                    onChange={(e) => setMinPriceText(e.target.value)}
                    onBlur={() => commitPriceRange()}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") commitPriceRange();
                    }}
                    className="w-32 h-9 tabular-nums"
                    aria-label={t("products.minPrice", {
                      defaultValue: "Min Price",
                    })}
                  />
                  <span className="text-foreground/60">đ</span>
                  <span className="text-foreground/60">–</span>
                  <Input
                    type="number"
                    min={0}
                    max={maxPriceValue}
                    step={10000}
                    value={maxPriceText}
                    onChange={(e) => setMaxPriceText(e.target.value)}
                    onBlur={() => commitPriceRange()}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") commitPriceRange();
                    }}
                    className="w-32 h-9 tabular-nums"
                    aria-label={t("products.maxPrice", {
                      defaultValue: "Max Price",
                    })}
                  />
                  <span className="text-foreground/60">đ</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-44">
                  <Select
                    value={sortOrder ?? undefined}
                    onValueChange={(v) => {
                      const nv = v as SortOrder;
                      setSortOrder(nv);
                      setCurrentPage(1);
                    }}
                  >
                    <SelectTrigger className="bg-transparent h-9">
                      <SelectValue
                        placeholder={t("common.sortBy", {
                          defaultValue: "Sort By",
                        })}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={SortOrder.ASC}>
                        {t("common.priceLowToHigh", {
                          defaultValue: "Price (Low to High)",
                        })}
                      </SelectItem>
                      <SelectItem value={SortOrder.DESC}>
                        {t("common.priceHighToLow", {
                          defaultValue: "Price (High to Low)",
                        })}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  variant="outline"
                  className="h-9"
                  onClick={clearFilters}
                >
                  {t("filters.clearFilters", { defaultValue: "Clear Filters" })}
                </Button>
              </div>
            </div>

            <div className="relative">
              {sortedItems.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 min-h-[240px]">
                    {sortedItems.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>

                  <div className="flex items-center justify-center gap-2 mt-12">
                    <Button
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                      disabled={!searchMeta.hasPrev}
                      variant="outline"
                      className="bg-transparent border-foreground/20 text-foreground disabled:opacity-50"
                    >
                      {t("common.previous", { defaultValue: "Previous" })}
                    </Button>

                    <Button
                      onClick={() => setCurrentPage((prev) => prev + 1)}
                      disabled={!searchMeta.hasNext}
                      variant="outline"
                      className="bg-transparent border-foreground/20 text-foreground  disabled:opacity-50"
                    >
                      {t("common.next", { defaultValue: "Next" })}
                    </Button>
                  </div>
                </>
              ) : isLoading ? (
                <div className="col-span-full flex flex-col items-center justify-center py-16 min-h-[240px]">
                  <Spinner className="size-6 text-foreground mb-3" />
                  <p className="text-foreground/60 text-lg">
                    {t("common.loading", { defaultValue: "Loading..." })}
                  </p>
                </div>
              ) : (
                <div className="col-span-full text-center py-16 min-h-[240px]">
                  <p className="text-foreground/60 text-lg">
                    {t("products.noProducts", {
                      defaultValue: "No products found",
                    })}
                  </p>
                </div>
              )}

              {productsQuery.isFetching && sortedItems.length > 0 && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-sm">
                  <Spinner className="size-6 text-foreground" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
