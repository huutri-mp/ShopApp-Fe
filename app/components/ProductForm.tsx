"use client";

import {
  useState,
  forwardRef,
  useImperativeHandle,
  useCallback,
  useEffect,
} from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useTranslations } from "next-intl";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2, ChevronDown, ChevronUp } from "lucide-react";
import {
  type ProductCreationRequest,
  type ProductUpdateRequest,
  type ProductVariant,
  type ProductImage,
} from "@/hooks/data/useProducts";
import { useBrands } from "@/hooks/data/useBrands";
import { useCategories } from "@/hooks/data/useCategories";

interface ProductFormProps {
  mode: "create" | "edit";
  initialData?: ProductUpdateRequest & { id?: number };
  onSubmit: (
    data: ProductCreationRequest | ProductUpdateRequest,
    files: File[],
    removedImageIds?: number[]
  ) => Promise<void> | void;
  submitLabel?: string;
}

const ProductForm = forwardRef(function ProductForm(
  { mode, initialData, onSubmit, submitLabel }: ProductFormProps,
  ref
) {
  const isEdit = mode === "edit";
  const tProducts = useTranslations("products");
  const tDashboard = useTranslations("dashboard");
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});

  const buildInitialForm = (data?: ProductUpdateRequest & { id?: number }) => ({
    name: data?.name || "",
    description: data?.description || "",
    brandId: data?.brandId ?? (data as any)?.brand?.id ?? undefined,
    categoryId: data?.categoryId ?? (data as any)?.category?.id ?? undefined,
    variants: data?.variants || [],
  });

  const [form, setForm] = useState<ProductUpdateRequest>(() =>
    buildInitialForm(initialData)
  );
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [removedImageIds, setRemovedImageIds] = useState<number[]>([]);
  const [existingImages, setExistingImages] = useState<ProductImage[]>([]);

  const { brands: brandsQuery } = useBrands();
  const { categories: categoriesQuery } = useCategories();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target as any;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelect = (name: keyof ProductUpdateRequest, value: string) => {
    const num = value ? Number(value) : undefined;
    setForm((prev) => ({ ...prev, [name]: num }));
  };

  const addVariant = () => {
    setForm((prev) => ({
      ...prev,
      variants: [...(prev.variants || []), {} as ProductVariant],
    }));
  };

  const updateVariant = (idx: number, patch: Partial<ProductVariant>) => {
    setForm((prev) => {
      const next = [...(prev.variants || [])];
      next[idx] = { ...next[idx], ...patch };
      return { ...prev, variants: next };
    });
  };

  const removeVariant = (idx: number) => {
    setForm((prev) => {
      const next = [...(prev.variants || [])];
      next.splice(idx, 1);
      return { ...prev, variants: next };
    });
  };

  const onFilesChange = (files: FileList | null) => {
    if (!files) return;
    setImageFiles((prev) => [...prev, ...Array.from(files)]);
  };

  const submitForm = useCallback(async () => {
    if (isEdit) {
      const payload = {
        ...(form as ProductUpdateRequest),
      } as ProductUpdateRequest;
      if (removedImageIds?.length) payload.removedImageIds = removedImageIds;
      await onSubmit(payload, imageFiles, removedImageIds);
    } else {
      const payload = form as ProductCreationRequest;
      await onSubmit(payload, imageFiles);
    }
  }, [isEdit, form, imageFiles, removedImageIds, onSubmit]);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitForm();
  };

  useImperativeHandle(ref, () => ({ submit: submitForm }), [submitForm]);

  useEffect(() => {
    setForm(buildInitialForm(initialData));
    setExistingImages(((initialData as any)?.images as ProductImage[]) || []);
  }, [initialData]);

  const colorSwatches = [
    "#000000",
    "#FFFFFF",
    "#FF0000",
    "#00FF00",
    "#0000FF",
    "#FFFF00",
    "#FFA500",
    "#800080",
    "#808080",
    "#00FFFF",
  ];

  const years = (() => {
    const current = new Date().getFullYear();
    const start = 1980;
    const arr: number[] = [];
    for (let y = current; y >= start; y--) arr.push(y);
    return arr;
  })();

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 max-h-[85vh] overflow-y-auto pr-2"
    >
      <Card className="border overflow-visible w-full">
        <CardContent className="space-y-6 pt-6 pb-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">{tProducts("form.name")}</Label>
              <Input
                id="name"
                name="name"
                value={form.name || ""}
                onChange={handleChange}
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{tProducts("form.category")}</Label>
                <Select
                  value={form.categoryId ? String(form.categoryId) : ""}
                  onValueChange={(v) => handleSelect("categoryId", v)}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={tProducts("form.selectCategory")}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {(categoriesQuery.data?.items ?? []).map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{tProducts("form.brand")}</Label>
                <Select
                  value={form.brandId ? String(form.brandId) : ""}
                  onValueChange={(v) => handleSelect("brandId", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={tProducts("form.selectBrand")} />
                  </SelectTrigger>
                  <SelectContent>
                    {(brandsQuery.data?.items ?? []).map((b) => (
                      <SelectItem key={b.id} value={String(b.id)}>
                        {b.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="description">
                {tProducts("form.description")}
              </Label>
              <Textarea
                id="description"
                name="description"
                value={form.description || ""}
                onChange={handleChange}
                rows={4}
              />
            </div>
          </div>

          <Separator />
          <div className="space-y-4">
            <h3 className="text-base font-semibold">
              {tDashboard("productImage") || "Images"}
            </h3>
            <div className="border-2 border-dashed rounded-lg p-4 space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    const input = document.getElementById(
                      "file-upload-input"
                    ) as HTMLInputElement;
                    input?.click();
                  }}
                >
                  Choose Files
                </Button>
                <Input
                  id="file-upload-input"
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => onFilesChange(e.target.files)}
                />
              </div>

              {existingImages.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">
                    Existing Images: ({existingImages.length})
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {existingImages.map((img) => (
                      <div key={img.id} className="relative group">
                        <img
                          src={img.url}
                          alt={img.url}
                          className="w-full h-24 object-cover rounded border"
                        />
                        <Button
                          type="button"
                          size="icon-sm"
                          variant="destructive"
                          className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => {
                            setRemovedImageIds((prev) => [...prev, img.id]);
                            setExistingImages((prev) =>
                              prev.filter((i) => i.id !== img.id)
                            );
                          }}
                        >
                          <Trash2 className="size-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {imageFiles.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">
                    Selected Files: ({imageFiles.length})
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {imageFiles.map((file, idx) => (
                      <div key={idx} className="relative group">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={file.name}
                          className="w-full h-24 object-cover rounded border"
                        />
                        <Button
                          type="button"
                          size="icon-sm"
                          variant="destructive"
                          className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => {
                            setImageFiles((prev) =>
                              prev.filter((_, i) => i !== idx)
                            );
                          }}
                        >
                          <Trash2 className="size-3" />
                        </Button>
                        <p className="text-xs truncate mt-1">{file.name}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Inventory & Variants */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold">
                {tDashboard("productVariant") || "Variants"}
              </h3>
              <Button type="button" variant="outline" onClick={addVariant}>
                {tProducts("form.addVariant")}
              </Button>
            </div>

            <div className="max-h-[400px] overflow-y-auto pr-2">
              <div className="space-y-4">
                {(form.variants || []).map((v, idx) => (
                  <Card key={idx} className="border overflow-visible w-full">
                    <CardContent className="pt-4 pb-4 space-y-4">
                      {/* Header */}
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium">
                          {tProducts("form.variant")} #{idx + 1}
                        </div>
                        <div className="flex gap-1">
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              setExpanded((prev) => ({
                                ...prev,
                                [idx]: !prev[idx],
                              }))
                            }
                          >
                            {expanded[idx] ? <ChevronUp /> : <ChevronDown />}
                            {expanded[idx]
                              ? tProducts("details.less")
                              : tProducts("details.more")}
                          </Button>

                          <Button
                            type="button"
                            size="icon-sm"
                            variant="ghost"
                            className="text-red-600"
                            onClick={() => removeVariant(idx)}
                          >
                            <Trash2 />
                          </Button>
                        </div>
                      </div>

                      {/* Main fields */}
                      <div className="space-y-3">
                        <div className="min-w-0 space-y-3">
                          <Label>SKU</Label>
                          <Input
                            className="w-full"
                            value={v.sku || ""}
                            onChange={(e) =>
                              updateVariant(idx, { sku: e.target.value })
                            }
                          />
                        </div>

                        <div className="min-w-0 space-y-3">
                          <Label>{tProducts("form.color")}</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                type="button"
                                variant="outline"
                                className="w-full text-sm min-w-0 justify-start gap-2"
                              >
                                <span
                                  className="inline-block w-4 h-4 rounded"
                                  style={{
                                    backgroundColor: v.color || "#808080",
                                  }}
                                />
                                <span className="truncate">
                                  {v.color || tProducts("form.color")}
                                </span>
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[220px]">
                              <div className="grid grid-cols-5 gap-2">
                                {colorSwatches.map((c) => (
                                  <Button
                                    key={c}
                                    variant="ghost"
                                    className="size-8 rounded border"
                                    style={{ backgroundColor: c }}
                                    onClick={() =>
                                      updateVariant(idx, { color: c })
                                    }
                                  />
                                ))}
                              </div>
                            </PopoverContent>
                          </Popover>
                        </div>

                        <div className="min-w-0 space-y-3">
                          <Label>{tProducts("form.size")}</Label>
                          <Input
                            className="w-full"
                            value={v.size || ""}
                            onChange={(e) =>
                              updateVariant(idx, { size: e.target.value })
                            }
                          />
                        </div>

                        <div className="min-w-0 space-y-3">
                          <Label>{tProducts("form.price")}</Label>
                          <Input
                            className="w-full"
                            type="text"
                            value={v.price ?? ""}
                            onChange={(e) =>
                              updateVariant(idx, {
                                price:
                                  e.target.value === ""
                                    ? undefined
                                    : Number(e.target.value),
                              })
                            }
                          />
                        </div>

                        <div className="min-w-0 space-y-3">
                          <Label>{tProducts("form.salePrice")}</Label>
                          <Input
                            className="w-full"
                            type="text"
                            value={v.salePrice ?? ""}
                            onChange={(e) =>
                              updateVariant(idx, {
                                salePrice:
                                  e.target.value === ""
                                    ? null
                                    : Number(e.target.value),
                              })
                            }
                          />
                        </div>
                      </div>

                      {expanded[idx] && (
                        <div className="pt-2 border-t grid grid-cols-1 md:grid-cols-2 gap-3 ">
                          <div className="space-y-3">
                            <Label>{tProducts("form.stock")}</Label>
                            <Input
                              type="number"
                              value={v.stock ?? ""}
                              onChange={(e) =>
                                updateVariant(idx, {
                                  stock: Number(e.target.value),
                                })
                              }
                            />
                          </div>

                          <div className="space-y-3">
                            <Label>{tProducts("details.ram")}</Label>
                            <Input
                              value={v.ram || ""}
                              onChange={(e) =>
                                updateVariant(idx, { ram: e.target.value })
                              }
                            />
                          </div>

                          <div className="space-y-3">
                            <Label>{tProducts("details.storage")}</Label>
                            <Input
                              value={v.storage || ""}
                              onChange={(e) =>
                                updateVariant(idx, { storage: e.target.value })
                              }
                            />
                          </div>

                          <div className="space-y-3">
                            <Label>{tProducts("details.cpu")}</Label>
                            <Input
                              value={v.cpu || ""}
                              onChange={(e) =>
                                updateVariant(idx, { cpu: e.target.value })
                              }
                            />
                          </div>

                          <div className="space-y-3">
                            <Label>{tProducts("details.gpu")}</Label>
                            <Input
                              value={v.gpu || ""}
                              onChange={(e) =>
                                updateVariant(idx, { gpu: e.target.value })
                              }
                            />
                          </div>

                          <div className="space-y-3">
                            <Label>{tProducts("details.screenSize")}</Label>
                            <Input
                              value={v.screenSize || ""}
                              onChange={(e) =>
                                updateVariant(idx, {
                                  screenSize: e.target.value,
                                })
                              }
                            />
                          </div>

                          <div className="space-y-3">
                            <Label>
                              {tProducts("details.screenResolution")}
                            </Label>
                            <Input
                              value={v.screenResolution || ""}
                              onChange={(e) =>
                                updateVariant(idx, {
                                  screenResolution: e.target.value,
                                })
                              }
                            />
                          </div>

                          <div className="space-y-3">
                            <Label>
                              {tProducts("details.batteryCapacity")}
                            </Label>
                            <Input
                              value={v.batteryCapacity || ""}
                              onChange={(e) =>
                                updateVariant(idx, {
                                  batteryCapacity: e.target.value,
                                })
                              }
                            />
                          </div>

                          <div className="space-y-3">
                            <Label>{tProducts("details.connectivity")}</Label>
                            <Input
                              value={v.connectivity || ""}
                              onChange={(e) =>
                                updateVariant(idx, {
                                  connectivity: e.target.value,
                                })
                              }
                            />
                          </div>

                          <div className="space-y-3">
                            <Label>{tProducts("details.warrantyMonths")}</Label>
                            <Input
                              type="number"
                              value={v.warrantyMonths ?? ""}
                              onChange={(e) =>
                                updateVariant(idx, {
                                  warrantyMonths: Number(e.target.value),
                                })
                              }
                            />
                          </div>

                          <div className="space-y-3">
                            <Label>{tProducts("details.weight")}</Label>
                            <Input
                              value={v.weight || ""}
                              onChange={(e) =>
                                updateVariant(idx, { weight: e.target.value })
                              }
                            />
                          </div>

                          <div className="space-y-3">
                            <Label>{tProducts("details.material")}</Label>
                            <Input
                              value={v.material || ""}
                              onChange={(e) =>
                                updateVariant(idx, { material: e.target.value })
                              }
                            />
                          </div>

                          <div className="space-y-3">
                            <Label>{tProducts("details.releaseYear")}</Label>
                            <Select
                              value={v.releaseYear ? String(v.releaseYear) : ""}
                              onValueChange={(val) =>
                                updateVariant(idx, {
                                  releaseYear: val ? Number(val) : undefined,
                                })
                              }
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue
                                  placeholder={
                                    tProducts("details.selectYear") ||
                                    "Select year"
                                  }
                                />
                              </SelectTrigger>
                              <SelectContent>
                                {years.map((y) => (
                                  <SelectItem key={y} value={String(y)}>
                                    {y}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </form>
  );
});

export default ProductForm;
