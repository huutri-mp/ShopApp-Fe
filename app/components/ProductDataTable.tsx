"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  ProductImage,
  useProducts,
  type Product,
} from "@/hooks/data/useProducts";
import { Edit, Trash2, ZoomIn } from "lucide-react";
import { useTranslations } from "next-intl";
import ZoomImage from "@/app/components/ZoomImage";

interface ProductDataTableProps {
  products: Product[];
  onDeleted?: (id: string) => void;
  onEdit?: (id: string, product?: Product) => void;
  onPageChange?: (page: number, pageSize: number) => void;
  page?: number;
  pageSize?: number;
  total?: number;
  hasNext?: boolean;
  hasPrev?: boolean;
}

export default function ProductDataTable({
  products,
  onDeleted,
  onEdit,
  onPageChange,
  page = 1,
  pageSize = 10,
  total = products.length,
  hasNext,
  hasPrev,
}: ProductDataTableProps) {
  const { deleteMutation } = useProducts();
  const tProducts = useTranslations("products");
  const tCommon = useTranslations("common");
  const tDashboard = useTranslations("dashboard");

  const handleDelete = async (id: string) => {
    const numId = Number(id);
    if (Number.isNaN(numId)) {
      onDeleted?.(id);
      return;
    }
    await deleteMutation.mutateAsync(numId);
    onDeleted?.(id);
  };

  useEffect(() => {
    onPageChange?.(page, pageSize);
  }, [page, pageSize, onPageChange]);

  const [expanded, setExpanded] = useState<string | null>(null);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  return (
    <div className="space-y-4">
      {products.length === 0 ? (
        <div className="text-center py-6 text-muted-foreground border rounded bg-muted">
          {tProducts("noProducts")}
        </div>
      ) : (
        products.map((product) => {
          const variants = product.variants || [];
          const inventoryValue = variants.reduce(
            (sum: number, v: any) => sum + (v.price ?? 0) * (v.stock ?? 0),
            0
          );
          const avgPrice =
            variants.length > 0
              ? variants.reduce(
                  (sum: number, v: any) => sum + (v.price ?? 0),
                  0
                ) / variants.length
              : product.price ?? 0;
          return (
            <div key={product.id} className="border rounded bg-white shadow-sm">
              <div
                className="flex flex-wrap justify-between items-center px-6 py-4 cursor-pointer"
                onClick={() =>
                  setExpanded(expanded === product.id ? null : product.id)
                }
              >
                <div>
                  {product.images.length > 0 && (
                    <ZoomImage
                      galleryId={`gallery-${product.id}`}
                      images={product.images.map((i: any) => i.url)}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        {product.images.map((img: ProductImage) => (
                          <a
                            key={img.id}
                            href={img.url}
                            data-pswp-width="1200"
                            data-pswp-height="800"
                            className="relative group w-16 h-12 cursor-zoom-in"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <img
                              src={img.url}
                              alt={product.name}
                              className="w-full h-full object-cover rounded border"
                            />
                            <div
                              className="absolute inset-0 bg-black/30 opacity-0 
                       group-hover:opacity-100 
                       flex items-center justify-center
                       transition"
                            >
                              <ZoomIn className="text-white" size={18} />
                            </div>
                          </a>
                        ))}
                      </div>
                    </ZoomImage>
                  )}

                  <div className="text-lg font-semibold">{product.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {product.category.name}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {product.brand.name}
                  </div>

                  {product.description && (
                    <div className="text-xs text-muted-foreground mt-1">
                      {product.description}
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1">
                  <div className="text-xs text-muted-foreground">
                    {variants.length} SKUs
                  </div>

                  <div className="flex gap-2 mt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1 bg-transparent"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit?.(product.id, product);
                      }}
                    >
                      <Edit size={16} />
                      {tCommon("edit")}
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="gap-1"
                        >
                          <Trash2 size={16} />
                          {tCommon("delete")}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            {tDashboard("deleteProduct")}
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            {tProducts("confirmDeleteMessage", {
                              name: product.name,
                            })}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <div className="flex gap-2 justify-end">
                          <AlertDialogCancel>
                            {tCommon("cancel")}
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(product.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            {tCommon("delete")}
                          </AlertDialogAction>
                        </div>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>
              {expanded === product.id && (
                <div className="bg-gray-50 border-t px-6 py-4 animate-fade-in">
                  <div className="flex flex-wrap gap-8 mb-4">
                    <div></div>
                    <div>
                      <div className="text-xs text-muted-foreground">
                        {tProducts("inventoryValue")}
                      </div>
                      <div className="text-xl font-bold">
                        $
                        {inventoryValue.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">
                        {tProducts("avgPrice")}
                      </div>
                      <div className="text-xl font-bold">
                        $
                        {avgPrice.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </div>
                    </div>
                  </div>
                  <div className="font-semibold mb-2">
                    {tProducts("skuDetails")}
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs border">
                      <thead className="bg-muted">
                        <tr>
                          <th className="py-2 px-3 text-left">
                            {tProducts("form.sku")}
                          </th>
                          <th className="py-2 px-3 text-left">
                            {tProducts("form.color")}
                          </th>
                          <th className="py-2 px-3 text-left">
                            {tProducts("form.size")}
                          </th>
                          <th className="py-2 px-3 text-right">
                            {tProducts("form.price")}
                          </th>
                          <th className="py-2 px-3 text-right">
                            {tProducts("form.salePrice")}
                          </th>
                          <th className="py-2 px-3 text-right">
                            {tProducts("form.stock")}
                          </th>
                          <th className="py-2 px-3 text-right">
                            {tProducts("details.storage")}
                          </th>
                          <th className="py-2 px-3 text-right">
                            {tProducts("details.ram")}
                          </th>
                          <th className="py-2 px-3 text-right">
                            {tProducts("details.cpu")}
                          </th>
                          <th className="py-2 px-3 text-right">
                            {tProducts("details.gpu")}
                          </th>
                          <th className="py-2 px-3 text-right">
                            {tProducts("details.screenSize")}
                          </th>
                          <th className="py-2 px-3 text-right">
                            {tProducts("details.screenResolution")}
                          </th>
                          <th className="py-2 px-3 text-right">
                            {tProducts("details.batteryCapacity")}
                          </th>
                          <th className="py-2 px-3 text-right">
                            {tProducts("details.connectivity")}
                          </th>
                          <th className="py-2 px-3 text-right">
                            {tProducts("details.weight")}
                          </th>
                          <th className="py-2 px-3 text-right">
                            {tProducts("details.material")}
                          </th>
                          <th className="py-2 px-3 text-right">
                            {tProducts("details.releaseYear")}
                          </th>
                          <th className="py-2 px-3 text-right">
                            {tProducts("details.warrantyMonths")}
                          </th>
                          <th className="py-2 px-3 text-right">
                            {tProducts("value")}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {variants.map((v: any, idx: number) => (
                          <tr key={v.sku || idx}>
                            <td className="py-2 px-3">{v.sku || "-"}</td>
                            <td className="py-2 px-3">
                              {v.color ? (
                                <span
                                  className="inline-block w-4 h-4 rounded border"
                                  style={{ backgroundColor: v.color }}
                                />
                              ) : (
                                "-"
                              )}
                            </td>
                            <td className="py-2 px-3">{v.size || "-"}</td>
                            <td className="py-2 px-3 text-right">
                              $
                              {(v.price ?? 0).toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </td>
                            <td className="py-2 px-3 text-right">
                              {v.salePrice != null
                                ? `$${v.salePrice.toLocaleString(undefined, {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  })}`
                                : "-"}
                            </td>
                            <td
                              className={
                                "py-2 px-3 text-right " +
                                ((v.stock ?? 0) === 0
                                  ? "text-red-600 font-bold"
                                  : (v.stock ?? 0) < 10
                                  ? "text-orange-600"
                                  : "")
                              }
                            >
                              {v.stock ?? 0}
                            </td>
                            <td className="py-2 px-3 text-right">
                              {v.storage || "-"}
                            </td>
                            <td className="py-2 px-3 text-right">
                              {v.ram || "-"}
                            </td>
                            <td className="py-2 px-3 text-right">
                              {v.cpu || "-"}
                            </td>
                            <td className="py-2 px-3 text-right">
                              {v.gpu || "-"}
                            </td>
                            <td className="py-2 px-3 text-right">
                              {v.screenSize || "-"}
                            </td>
                            <td className="py-2 px-3 text-right">
                              {v.screenResolution || "-"}
                            </td>
                            <td className="py-2 px-3 text-right">
                              {v.batteryCapacity || "-"}
                            </td>
                            <td className="py-2 px-3 text-right">
                              {v.connectivity || "-"}
                            </td>
                            <td className="py-2 px-3 text-right">
                              {v.weight || "-"}
                            </td>
                            <td className="py-2 px-3 text-right">
                              {v.material || "-"}
                            </td>
                            <td className="py-2 px-3 text-right">
                              {v.releaseYear != null ? v.releaseYear : "-"}
                            </td>
                            <td className="py-2 px-3 text-right">
                              {v.warrantyMonths != null
                                ? v.warrantyMonths
                                : "-"}
                            </td>
                            <td className="py-2 px-3 text-right">
                              $
                              {((v.price ?? 0) * (v.stock ?? 0)).toLocaleString(
                                undefined,
                                {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                }
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          );
        })
      )}

      <div className="pt-3 flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {tCommon("itemsLabel", { count: total })}
        </div>
        <div className="flex items-center gap-2">
          {hasPrev && (
            <Button
              variant="outline"
              onClick={() => onPageChange?.(page - 1, pageSize)}
            >
              {tCommon("previous")}
            </Button>
          )}

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Button
              key={p}
              variant={p === page ? "default" : "outline"}
              onClick={() => onPageChange?.(p, pageSize)}
            >
              {p}
            </Button>
          ))}

          {hasNext && (
            <Button
              variant="outline"
              onClick={() => onPageChange?.(page + 1, pageSize)}
            >
              {tCommon("next")}
            </Button>
          )}

          <select
            value={pageSize}
            onChange={(e) => onPageChange?.(1, Number(e.target.value))}
            className="ml-2 p-1 border rounded"
          >
            {[10, 20, 50, 100].map((s) => (
              <option key={s} value={s}>
                {tCommon("perPage", { count: s })}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
