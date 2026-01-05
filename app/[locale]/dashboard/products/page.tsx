"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";
import ProductDataTable from "@/app/components/ProductDataTable";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import ProductForm from "@/app/components/ProductForm";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDebounce } from "@/hooks/useDebounce";
import { useCategories } from "@/hooks/data/useCategories";
import { useBrands } from "@/hooks/data/useBrands";
import { useProducts } from "@/hooks/data/useProducts";

export default function ProductsManagementPage() {
  const t = useTranslations();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState("");
  const debouncedKeyword = useDebounce(keyword, 500);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [brandFilter, setBrandFilter] = useState("");
  const [sort, setSort] = useState("");

  const isDesc =
    sort === "name_desc" ? true : sort === "name_asc" ? false : undefined;

  const { products, meta, createMutation, updateMutation, getProductById } =
    useProducts(
      page,
      pageSize,
      categoryFilter ? Number(categoryFilter) : undefined,
      brandFilter ? Number(brandFilter) : undefined,
      debouncedKeyword,
      isDesc
    );
  const { categories } = useCategories();
  const { brands } = useBrands();
  const [openAddProduct, setOpenAddProduct] = useState(false);
  const [openEditProduct, setOpenEditProduct] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingInitial, setEditingInitial] = useState<any>(null);
  const addFormRef = useRef<any>(null);
  const editFormRef = useRef<any>(null);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">
            {t("dashboard.manageProducts") || "Products"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t("dashboard.manageProductsDescription") ||
              "View and manage all products"}
          </p>
        </div>
        <Dialog open={openAddProduct} onOpenChange={setOpenAddProduct}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus size={16} /> {t("dashboard.addProduct") || "Add Product"}
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[90vw] max-w-6xl max-h-[92vh] flex flex-col overflow-hidden">
            <DialogHeader>
              <DialogTitle>
                {t("dashboard.addProduct") || "Create Product"}
              </DialogTitle>
            </DialogHeader>
            <ProductForm
              ref={addFormRef}
              mode="create"
              onSubmit={async (data: any, files: File[]) => {
                await createMutation.mutateAsync({ data, files });
                setOpenAddProduct(false);
              }}
              submitLabel={t("common.create") || "Create"}
            />
            <div className="pt-4 border-t flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setOpenAddProduct(false)}>
                {t("common.cancel") || "Cancel"}
              </Button>
              <Button onClick={() => addFormRef.current?.submit()}>
                {t("common.create") || "Create"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-wrap gap-2 mb-4 border-b pb-4 items-center">
        <Input
          placeholder={t("common.searchProduct") || "Search product..."}
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          className="flex-1 min-w-[180px]"
        />
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="min-w-[140px]">
            <SelectValue placeholder={t("common.category") || "Category"} />
          </SelectTrigger>
          <SelectContent>
            {categories.data?.items.map((cat: any) => (
              <SelectItem key={cat.id} value={String(cat.id)}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={brandFilter} onValueChange={setBrandFilter}>
          <SelectTrigger className="min-w-[140px]">
            <SelectValue placeholder={t("common.brand") || "Brand"} />
          </SelectTrigger>
          <SelectContent>
            {brands.data?.items.map((brand: any) => (
              <SelectItem key={brand.id} value={String(brand.id)}>
                {brand.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger className="min-w-[140px]">
            <SelectValue placeholder={t("common.sortBy") || "Sort by"} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name_asc">
              {t("common.productNameASC") || "Name (A → Z)"}
            </SelectItem>
            <SelectItem value="name_desc">
              {t("common.productNameDESC") || "Name (Z → A)"}
            </SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          onClick={() => {
            setKeyword("");
            setCategoryFilter("");
            setBrandFilter("");
            setSort("");
          }}
        >
          {t("common.resetFilter", { defaultValue: "Reset Filter" })}
        </Button>
      </div>

      <Card>
        <CardContent>
          <ProductDataTable
            products={products}
            total={meta?.total ?? products.length}
            page={page + 1}
            pageSize={pageSize}
            hasNext={meta?.hasNext}
            hasPrev={meta?.hasPrev}
            onPageChange={(p, s) => {
              setPage(p - 1);
              setPageSize(s);
            }}
            onDeleted={() => setPage(0)}
            onEdit={(id, product) => {
              const num = Number(id);
              setEditingId(Number.isNaN(num) ? null : num);
              setEditingInitial(product);
              setOpenEditProduct(true);
            }}
          />

          <Dialog open={openEditProduct} onOpenChange={setOpenEditProduct}>
            <DialogContent className="w-[90vw] max-w-6xl max-h-[92vh] flex flex-col overflow-hidden">
              <DialogHeader>
                <DialogTitle>
                  {t("dashboard.editProduct") || "Edit Product"}
                </DialogTitle>
              </DialogHeader>
              {!editingInitial ? (
                <div className="py-8">
                  {t("common.loading") || "Loading..."}
                </div>
              ) : (
                <>
                  <ProductForm
                    ref={editFormRef}
                    mode="edit"
                    initialData={editingInitial}
                    onSubmit={async (data: any, files: File[]) => {
                      if (!editingInitial?.id) return;
                      await updateMutation.mutateAsync({
                        id: editingInitial.id,
                        data,
                        files,
                      });
                      setOpenEditProduct(false);
                      setEditingId(null);
                      setEditingInitial(null);
                    }}
                    submitLabel={t("common.saveChanges") || "Save Changes"}
                  />
                  <div className="pt-4 border-t flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      onClick={() => setOpenEditProduct(false)}
                    >
                      {t("common.cancel") || "Cancel"}
                    </Button>
                    <Button onClick={() => editFormRef.current?.submit()}>
                      {t("common.saveChanges") || "Save Changes"}
                    </Button>
                  </div>
                </>
              )}
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
}
