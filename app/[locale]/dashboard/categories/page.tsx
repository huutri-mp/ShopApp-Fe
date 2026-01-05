"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Trash2, Plus } from "lucide-react";
import { useCategories } from "@/hooks/data/useCategories";
import { useDebounce } from "@/hooks/useDebounce";
import CategoryDataTable from "@/app/components/CategoryDataTable";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function CategoriesManagementPage() {
  const t = useTranslations();
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [keyword, setKeyword] = React.useState("");
  const debouncedKeyword = useDebounce(keyword, 400);
  const [sort, setSort] = React.useState("");

  const isDesc =
    sort === "name_desc" ? true : sort === "name_asc" ? false : undefined;

  const { categories, createMutation, deleteMutation, editMutation } =
    useCategories(page - 1, pageSize, debouncedKeyword, isDesc);
  const [newCategory, setNewCategory] = React.useState("");
  const [newCategoryParent, setNewCategoryParent] = React.useState<string>("");
  const [errors, setErrors] = React.useState<{ [k: string]: string }>({});
  const [openAddCategory, setOpenAddCategory] = React.useState(false);

  const handleSave = async () => {
    const nextErrors: { [k: string]: string } = {};
    if (!newCategory.trim()) nextErrors.name = "Category name is required";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    await createMutation.mutateAsync({
      name: newCategory.trim(),
      parentId: newCategoryParent ? Number(newCategoryParent) : undefined,
    });
    setNewCategory("");
    setNewCategoryParent("");
    setErrors({});
    setOpenAddCategory(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">
            {t("dashboard.categories") || "Categories"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t("dashboard.manageCategoriesSubtitle") || "Manage categories"}
          </p>
        </div>
        <Dialog open={openAddCategory} onOpenChange={setOpenAddCategory}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus size={16} /> {t("dashboard.addCategory") || "Add Category"}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>
                {t("dashboard.addCategory") || "Add Category"}
              </DialogTitle>
              <p className="text-sm text-muted-foreground">
                {t("dashboard.addCategoryDescription") ||
                  "Create a new category and optionally assign a parent."}
              </p>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-medium">
                  {t("common.categoryNameLabel") || "Category name"}{" "}
                  <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder={
                    t("common.categoryNamePlaceholder") || "e.g. Shoes"
                  }
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                />
                {errors.name && (
                  <p className="text-xs text-destructive">{errors.name}</p>
                )}

                <div className="space-y-1">
                  <label className="text-sm font-medium">
                    {t("common.parentOptional") || "Parent (optional)"}
                  </label>
                  <Select
                    value={
                      newCategoryParent ? String(newCategoryParent) : "none"
                    }
                    onValueChange={(v) =>
                      setNewCategoryParent(v === "none" ? "" : String(v))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          t("common.selectParent") || "Select parent"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">
                        {t("common.none") || "None"}
                      </SelectItem>
                      {categories.data?.items.map((c: any) => (
                        <SelectItem key={c.id} value={String(c.id)}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setOpenAddCategory(false);
                    }}
                  >
                    {t("common.cancel") || "Cancel"}
                  </Button>
                  <Button onClick={handleSave}>
                    {t("common.save") || "Save"}
                  </Button>
                </div>
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
              {t("common.categoryNameASC") || "Name (A → Z)"}
            </SelectItem>
            <SelectItem value="name_desc">
              {t("common.categoryNameDESC") || "Name (Z → A)"}
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
          <CategoryDataTable
            categories={categories.data?.items ?? []}
            total={categories.data?.total ?? 0}
            hasNext={categories.data?.hasNext ?? false}
            hasPrev={categories.data?.hasPrev ?? false}
            page={page}
            pageSize={pageSize}
            onDeleted={async (id: number) =>
              await deleteMutation.mutateAsync(id)
            }
            onPageChange={(p: number, s: number) => {
              setPage(p);
              setPageSize(s);
            }}
            onEdit={async (id: number, payload: any) => {
              await editMutation.mutateAsync({
                id,
                payload,
              });
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
