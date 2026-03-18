"use client";

import { useState, use, useEffect, useCallback, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/routing";
import { usePathname } from "@/i18n/routing";
import {
  Star,
  ShoppingCart,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Truck,
  Shield,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  useProducts,
  type Product,
  type ProductVariant,
} from "@/hooks/data/useProducts";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn, formatPriceText } from "@/lib/utils";
import { useCart } from "@/hooks/data/useCart";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import LoginRequiredDialog from "@/app/components/LoginRequiredDialog";
import useAppStore from "@/hooks/useAppStore";

export default function ProductDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const t = useTranslations();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isBuyingNow, setIsBuyingNow] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    null,
  );
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [expandedSpecs, setExpandedSpecs] = useState<string[]>(["config"]);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);

  const { id } = use(params);
  const router = useRouter();
  const pathname = usePathname();
  const { fetchProductById } = useProducts();
  const { addToCart } = useCart();
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);

  const goToLoginWithRedirect = () => {
    const query = typeof window !== "undefined" ? window.location.search : "";
    const currentPath = `${pathname}${query}`;
    router.push(`/auth/login?redirect=${encodeURIComponent(currentPath)}`);
  };

  const loadProduct = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const data = await fetchProductById(id);
      setProduct(data);
      if (data?.variants?.length) {
        setSelectedVariant(data.variants[0]);
      }
      if (data?.images?.length) {
        setSelectedImage(data.images[0].url);
      }
    } catch {
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  }, [id, fetchProductById]);

  useEffect(() => {
    loadProduct();
  }, [loadProduct]);

  const storageOptions = useMemo(() => {
    if (!product?.variants) return [];
    const options = new Set<string>();
    product.variants.forEach((v) => {
      if (v.attributes?.storage) options.add(v.attributes.storage);
    });
    return Array.from(options);
  }, [product?.variants]);

  const colorOptions = useMemo(() => {
    if (!product?.variants) return [];
    const options = new Map<string, string>();
    product.variants.forEach((v) => {
      if (v.attributes?.color) {
        options.set(v.attributes.color, v.attributes.color);
      }
    });
    return Array.from(options.entries());
  }, [product?.variants]);

  const selectedStorage = selectedVariant?.attributes?.storage;
  const selectedColor = selectedVariant?.attributes?.color;

  const handleStorageSelect = (storage: string) => {
    const variant = product?.variants?.find(
      (v) =>
        v.attributes?.storage === storage &&
        (!selectedColor || v.attributes?.color === selectedColor),
    );
    if (variant) setSelectedVariant(variant);
    else {
      const fallback = product?.variants?.find(
        (v) => v.attributes?.storage === storage,
      );
      if (fallback) setSelectedVariant(fallback);
    }
  };

  const handleColorSelect = (color: string) => {
    const variant = product?.variants?.find(
      (v) =>
        v.attributes?.color === color &&
        (!selectedStorage || v.attributes?.storage === selectedStorage),
    );
    if (variant) setSelectedVariant(variant);
    else {
      const fallback = product?.variants?.find(
        (v) => v.attributes?.color === color,
      );
      if (fallback) setSelectedVariant(fallback);
    }
  };

  const currentPrice = selectedVariant?.salePrice ?? selectedVariant?.price;
  const originalPrice = selectedVariant?.salePrice
    ? selectedVariant?.price
    : null;
  const discountPercent =
    originalPrice && currentPrice
      ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
      : 0;
  const totalStock = selectedVariant?.stock ?? 0;

  const toggleSpec = (key: string) => {
    setExpandedSpecs((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  };

  const handleAddToCart = async () => {
    if (!product || !selectedVariant) return;

    if (!isAuthenticated) {
      setLoginDialogOpen(true);
      return;
    }

    setIsAddingToCart(true);
    try {
      await addToCart({
        productId: Number(product.id),
        quantity,
        skuCode: selectedVariant.skuCode,
      });
      setSuccessDialogOpen(true);
    } catch {
      toast({ variant: "destructive", title: t("common.error") });
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    if (!product || !selectedVariant) return;

    if (!isAuthenticated) {
      setLoginDialogOpen(true);
      return;
    }

    setIsBuyingNow(true);
    try {
      await addToCart({
        productId: Number(product.id),
        quantity,
        skuCode: selectedVariant.skuCode,
      });
      router.push("/cart");
    } catch {
      toast({ variant: "destructive", title: t("common.error") });
    } finally {
      setIsBuyingNow(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner className="size-8 text-foreground" />
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">
            {t("products.noProducts")}
          </h1>
          <Link href="/" className="text-red-600 hover:text-red-700">
            {t("common.back")}
          </Link>
        </div>
      </div>
    );
  }

  const specSections = [
    {
      key: "config",
      title: t("products.specs.configMemory"),
      items: [
        {
          label: t("products.form.cpu"),
          value: selectedVariant?.attributes?.cpu,
        },
        {
          label: t("products.form.gpu"),
          value: selectedVariant?.attributes?.gpu,
        },
        {
          label: t("products.form.ram"),
          value: selectedVariant?.attributes?.ram,
        },
        {
          label: t("products.form.storage"),
          value: selectedVariant?.attributes?.storage,
        },
      ].filter((i) => i.value),
    },
    {
      key: "screen",
      title: t("products.specs.screen"),
      items: [
        {
          label: t("products.form.screenSize"),
          value: selectedVariant?.attributes?.screenSize,
        },
        {
          label: t("products.form.screenResolution"),
          value: selectedVariant?.attributes?.screenResolution,
        },
      ].filter((i) => i.value),
    },
    {
      key: "battery",
      title: t("products.specs.battery"),
      items: [
        {
          label: t("products.form.batteryCapacity"),
          value: selectedVariant?.attributes?.batteryCapacity,
        },
      ].filter((i) => i.value),
    },
    {
      key: "connectivity",
      title: t("products.specs.connectivity"),
      items: [
        {
          label: t("products.form.connectivity"),
          value: selectedVariant?.attributes?.connectivity,
        },
      ].filter((i) => i.value),
    },
    {
      key: "design",
      title: t("products.specs.design"),
      items: [
        {
          label: t("products.form.weight"),
          value: selectedVariant?.attributes?.weight,
        },
        {
          label: t("products.form.material"),
          value: selectedVariant?.attributes?.material,
        },
        {
          label: t("products.form.color"),
          value: selectedVariant?.attributes?.color,
        },
      ].filter((i) => i.value),
    },
    {
      key: "other",
      title: t("products.specs.other"),
      items: [
        {
          label: t("products.form.warrantyMonths"),
          value: selectedVariant?.attributes?.warrantyMonths
            ? `${selectedVariant.attributes.warrantyMonths} tháng`
            : undefined,
        },
        {
          label: t("products.form.releaseYear"),
          value: selectedVariant?.attributes?.releaseYear,
        },
      ].filter((i) => i.value),
    },
  ].filter((s) => s.items.length > 0);

  return (
    <div className="max-w-7xl mx-auto px-4 py-4">
      <LoginRequiredDialog
        open={loginDialogOpen}
        onOpenChange={setLoginDialogOpen}
        onConfirm={goToLoginWithRedirect}
      />
      <Dialog open={successDialogOpen} onOpenChange={setSuccessDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("products.addToCart")}</DialogTitle>
            <DialogDescription>
              {t("products.addToCart") + "!"}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSuccessDialogOpen(false)}
            >
              {t("common.close")}
            </Button>
            <Link href="/cart">
              <Button>{t("cart.viewCart")}</Button>
            </Link>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <div className="mt-4 mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">
          {product.name}
          {selectedVariant?.attributes?.ram &&
            selectedVariant?.attributes?.storage && (
              <span className="text-gray-600 font-normal">
                {" "}
                {selectedVariant.attributes.ram}/
                {selectedVariant.attributes.storage}
              </span>
            )}
        </h1>
        <div className="flex items-center gap-4 mt-2 text-sm">
          {product.rating && (
            <div className="flex items-center gap-1">
              <Star className="size-4 fill-yellow-400 text-yellow-400" />
              <span className="font-medium">{product.rating}</span>
            </div>
          )}
          {product.reviews && (
            <span className="text-gray-500">
              {product.reviews} {t("products.reviews")}
            </span>
          )}
        </div>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7">
            <div className="bg-white rounded-lg p-4 sticky top-4">
              <div className="relative w-full h-[420px] overflow-hidden rounded-lg mb-2">
                <img
                  src={
                    selectedImage ||
                    product.images?.[0]?.url ||
                    "/placeholder.svg"
                  }
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {product.images && product.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {product.images.map((img, idx) => (
                    <button
                      key={img.id ?? idx}
                      onClick={() => setSelectedImage(img.url)}
                      className={cn(
                        "flex-shrink-0 w-16 h-16 rounded-lg border-2 overflow-hidden",
                        selectedImage === img.url
                          ? "border-red-600"
                          : "border-gray-200 hover:border-gray-400",
                      )}
                    >
                      <img
                        src={img.url}
                        alt={`${product.name} ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
              <div className="mt-6 space-y-3 text-sm">
                <div className="flex items-center gap-3 text-gray-700">
                  <RotateCcw className="size-5 text-blue-600" />
                  <span>{t("products.commitment.return")}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                  <Shield className="size-5 text-blue-600" />
                  <span>
                    {selectedVariant?.attributes?.warrantyMonths
                      ? `${t("products.commitment.warranty")} ${
                          selectedVariant.attributes.warrantyMonths
                        } ${t("common.months")}`
                      : t("products.commitment.warranty")}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                  <Truck className="size-5 text-blue-600" />
                  <span>{t("products.commitment.delivery")}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-lg p-4">
              {storageOptions.length > 0 && (
                <div className="mb-4">
                  <div className="flex flex-wrap gap-2">
                    {storageOptions.map((storage) => (
                      <button
                        key={storage}
                        onClick={() => handleStorageSelect(storage)}
                        className={cn(
                          "px-4 py-2 rounded-lg border-2 text-sm font-medium transition-colors",
                          selectedStorage === storage
                            ? "border-red-600 bg-red-50 text-red-600"
                            : "border-gray-300 hover:border-gray-400",
                        )}
                      >
                        {storage}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-gradient-to-r from-red-600 to-red-500 rounded-lg p-4 text-white">
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-bold">
                    {formatPriceText(currentPrice)}
                  </span>
                  {originalPrice && (
                    <>
                      <span className="text-lg line-through opacity-75">
                        {formatPriceText(originalPrice)}
                      </span>
                      <span className="bg-yellow-400 text-red-600 px-2 py-1 rounded text-sm font-bold">
                        -{discountPercent}%
                      </span>
                    </>
                  )}
                </div>
              </div>
              {colorOptions.length > 0 && (
                <div className="mb-4 mt-2">
                  <div className="flex flex-wrap gap-3">
                    {colorOptions.map(([colorValue]) => (
                      <button
                        key={colorValue}
                        onClick={() => handleColorSelect(colorValue)}
                        className={cn(
                          "flex items-center gap-2 px-3 py-2 rounded-lg border-2 text-sm transition-colors",
                          selectedColor === colorValue
                            ? "border-red-600 bg-red-50"
                            : "border-gray-300 hover:border-gray-400",
                        )}
                      >
                        <span
                          className="w-5 h-5 rounded-full border"
                          style={{ backgroundColor: colorValue }}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div className="mt-3 text-sm">
                <span
                  className={cn(
                    "font-medium",
                    totalStock > 0 ? "text-green-600" : "text-red-600",
                  )}
                >
                  {totalStock > 0
                    ? `${t("products.inStock")} (${totalStock})`
                    : t("products.outOfStock")}
                </span>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4">
              <div className="flex items-center gap-4 mb-4">
                <span className="text-sm text-gray-600">
                  {t("products.quantity")}:
                </span>
                <div className="flex items-center border rounded-lg">
                  <Button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-1"
                    variant="ghost"
                    size="sm"
                  >
                    -
                  </Button>
                  <span className="px-4 font-medium">{quantity}</span>
                  <Button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-1"
                    variant="ghost"
                    size="sm"
                  >
                    +
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={handleAddToCart}
                  disabled={isAddingToCart || isBuyingNow || totalStock === 0}
                  variant="outline"
                  className="py-6 text-lg"
                >
                  <ShoppingCart className="mr-2" size={20} />
                  {t("products.addToCart")}
                </Button>
                <Button
                  onClick={handleBuyNow}
                  disabled={isAddingToCart || isBuyingNow || totalStock === 0}
                  className="py-6 text-lg "
                >
                  {t("products.buyNow")}
                </Button>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4">
              <h3 className="font-bold text-gray-900 mb-3">
                {t("products.shippingInfo")}
              </h3>
              <div className="flex items-start gap-3 text-sm">
                <Truck className="size-5 text-green-600 mt-0.5" />
                <div>
                  <p className="text-green-600 font-medium">
                    {t("products.freeShipping")}
                  </p>
                  <p className="text-gray-500">{t("products.deliveryTime")}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <Tabs defaultValue="specs" className="bg-white rounded-lg">
            <TabsList className="w-full justify-start border-b rounded-t-lg h-auto p-0 bg-gray-50">
              <TabsTrigger
                value="specs"
                className="rounded-t-lg border-b-2 border-transparent data-[state=active]:border-red-600 data-[state=active]:text-red-600 data-[state=active]:bg-white px-6 py-3"
              >
                {t("products.technicalSpecs")}
              </TabsTrigger>
              <TabsTrigger
                value="description"
                className="rounded-t-lg border-b-2 border-transparent data-[state=active]:border-red-600 data-[state=active]:text-red-600 data-[state=active]:bg-white px-6 py-3"
              >
                {t("products.productInfo")}
              </TabsTrigger>
            </TabsList>
            <TabsContent value="specs" className="p-4">
              <div className="divide-y">
                {specSections.map((section) => (
                  <div key={section.key}>
                    <button
                      onClick={() => toggleSpec(section.key)}
                      className="w-full flex items-center justify-between py-4 text-left"
                    >
                      <span className="font-semibold text-gray-900">
                        {section.title}
                      </span>
                      {expandedSpecs.includes(section.key) ? (
                        <ChevronUp className="size-5 text-gray-500" />
                      ) : (
                        <ChevronDown className="size-5 text-gray-500" />
                      )}
                    </button>
                    {expandedSpecs.includes(section.key) && (
                      <div className="pb-4 space-y-3">
                        {section.items.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex text-sm py-2 border-b border-gray-100 last:border-0"
                          >
                            <span className="w-1/3 text-gray-500">
                              {item.label}
                            </span>
                            <span className="w-2/3 text-gray-900">
                              {item.label === t("products.form.color") ? (
                                <span
                                  className="inline-block w-5 h-5 rounded-full border border-gray-300"
                                  style={{ backgroundColor: item.value }}
                                  title={item.value}
                                />
                              ) : (
                                item.value
                              )}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="description" className="p-6">
              {product.description ? (
                <div className="prose max-w-none">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {product.description}
                  </p>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  {t("products.noDescription")}
                </p>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {product.variants && product.variants.length > 1 && (
          <div className="mt-6 bg-white rounded-lg p-4">
            <h3 className="font-bold text-gray-900 mb-4">
              {t("products.allVariants")}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {product.variants.map((variant, idx) => (
                <button
                  key={variant.id ?? idx}
                  onClick={() => setSelectedVariant(variant)}
                  className={cn(
                    "p-3 rounded-lg border-2 text-left transition-colors",
                    selectedVariant?.id === variant.id
                      ? "border-red-600 bg-red-50"
                      : "border-gray-200 hover:border-gray-400",
                  )}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {variant.attributes?.color && (
                      <span
                        className="w-4 h-4 rounded-full border"
                        style={{ backgroundColor: variant.attributes.color }}
                      />
                    )}
                    <span className="font-medium text-sm">
                      {variant.skuCode ?? `Variant ${idx + 1}`}
                    </span>
                  </div>
                  <div className="text-red-600 font-bold">
                    {formatPriceText(variant.price)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {t("products.stock")}: {variant.stock ?? 0}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
