import { Link } from "@/i18n/routing";
import type { ProductResponse } from "@/hooks/data/useProducts";
import { Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatPriceText } from "@/lib/utils";

export default function ProductCard({ product }: { product: ProductResponse }) {
  const priceText = formatPriceText(product.minPrice, product.maxPrice);

  const rating = (product as any).rating as number | undefined;
  const brandName = product.brandName ?? undefined;
  const categoryName = product.categoryName ?? undefined;

  return (
    <Link href={`/products/${product.id}`}>
      <div className="rounded-2xl overflow-hidden border border-border bg-card hover:shadow-lg transition-shadow duration-300 group cursor-pointer h-full flex flex-col">
        {/* Image container */}
        <div className="relative bg-muted/40 aspect-[4/3] overflow-hidden">
          <img
            src={
              product.image ||
              "/placeholder.svg?height=300&width=400&query=product"
            }
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />

          {/* Installment badge */}
          <div className="absolute top-3 left-3">
            <Badge
              variant="secondary"
              className="rounded-full px-3 py-1 text-[11px]"
            >
              Trả góp 0%
            </Badge>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 flex-1 flex flex-col">
          {categoryName ? (
            <p className="text-[11px] tracking-wide uppercase text-muted-foreground mb-1">
              {categoryName}
            </p>
          ) : null}

          <h3 className="text-base md:text-lg font-semibold text-foreground line-clamp-2">
            {product.name}
          </h3>

          {brandName ? (
            <p className="text-sm text-muted-foreground mt-1">{brandName}</p>
          ) : null}

          <div className="mt-auto pt-3 flex items-center justify-between">
            <span className="text-xl md:text-base font-bold text-red-600">
              {priceText}
            </span>
            {typeof rating === "number" ? (
              <span className="flex items-center gap-1 text-sm text-muted-foreground">
                <Star className="h-4 w-4 fill-current text-muted-foreground" />
                {rating.toFixed(1)}
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </Link>
  );
}
