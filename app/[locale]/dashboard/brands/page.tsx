"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useDebounce } from "@/hooks/useDebounce";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Trash2, Plus } from "lucide-react";
import { useBrands } from "@/hooks/data/useBrands";
import BrandDataTable from "@/app/components/BrandDataTable";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function BrandsManagementPage() {
  const t = useTranslations();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState("");
  const debouncedKeyword = useDebounce(keyword, 400);
  const [sort, setSort] = useState("");

  const isDesc =
    sort === "name_desc" ? true : sort === "name_asc" ? false : undefined;

  const { brands, createMutation, deleteMutation, editMutation } = useBrands(
    page - 1,
    pageSize,
    debouncedKeyword,
    isDesc
  );
  const [newBrand, setNewBrand] = useState("");
  const [openAddBrand, setOpenAddBrand] = useState(false);

  const handleSaveBrand = async () => {
    if (!newBrand.trim()) return;
    await createMutation.mutateAsync({ name: newBrand.trim() });
    setNewBrand("");
    setOpenAddBrand(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">{t("dashboard.brands")}</h1>
          <p className="text-muted-foreground mt-1">
            {t("dashboard.manageBrandsDescription")}
          </p>
        </div>
        <Dialog open={openAddBrand} onOpenChange={setOpenAddBrand}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus size={16} /> {t("dashboard.addBrand")}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("dashboard.addBrand")}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-sm font-medium">
                  {t("common.brandNameLabel")}{" "}
                  <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder={t("common.brandNamePlaceholder")}
                  value={newBrand}
                  onChange={(e) => setNewBrand(e.target.value)}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setOpenAddBrand(false);
                  }}
                >
                  {t("common.cancel")}
                </Button>
                <Button onClick={handleSaveBrand}>{t("common.save")}</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div className="flex flex-wrap gap-2 mb-4 border-b pb-4 items-center">
        <Input
          placeholder={t("common.search") || "Search..."}
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          className="flex-1 min-w-[180px]"
        />
        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger className="min-w-[160px]">
            <SelectValue placeholder={t("common.sortBy") || "Sort by"} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name_asc">
              {t("common.brandNameASC") || "Name (A → Z)"}
            </SelectItem>
            <SelectItem value="name_desc">
              {t("common.brandNameDESC") || "Name (Z → A)"}
            </SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          onClick={() => {
            setKeyword("");
            setSort("");
          }}
        >
          {t("common.resetFilter") || "Reset"}
        </Button>
      </div>

      <Card>
        <CardContent>
          <BrandDataTable
            brands={brands.data?.items ?? []}
            page={page}
            pageSize={pageSize}
            total={brands.data?.total ?? 0}
            hasNext={brands.data?.hasNext ?? false}
            hasPrev={brands.data?.hasPrev ?? false}
            onDeleted={async (id: number) =>
              await deleteMutation.mutateAsync(id)
            }
            onPageChange={(p: number, s: number) => {
              setPage(p);
              setPageSize(s);
            }}
            onEdit={async (id: number, payload: any) => {
              await editMutation.mutateAsync({ id, payload });
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
