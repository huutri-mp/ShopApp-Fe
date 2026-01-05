"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Edit } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useTranslations } from "next-intl";

export default function BrandDataTable({
  brands,
  onDeleted,
  onEdit,
  onPageChange,
  page = 1,
  pageSize = 10,
  total = brands.length,
  hasNext = false,
  hasPrev = false,
}: any) {
  const tCommon = useTranslations("common");
  const tDashboard = useTranslations("dashboard");
  const [editOpen, setEditOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");

  useEffect(() => {
    onPageChange?.(page, pageSize);
  }, [page, pageSize]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const pageItems = brands;

  const openEdit = (brand: any) => {
    setEditId(brand.id);
    setEditName(brand.name ?? "");
    setEditOpen(true);
  };

  const submitEdit = () => {
    if (!editId || !editName.trim()) return;
    onEdit?.(editId, { name: editName.trim() });
    setEditOpen(false);
  };

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-muted">
            <tr>
              <th className="text-left py-3 px-4 font-medium">
                {tCommon("name")}
              </th>
              <th className="text-left py-3 px-4 font-medium">
                {tCommon("slug")}
              </th>
              <th className="text-right py-3 px-4 font-medium">
                {tCommon("actions")}
              </th>
            </tr>
          </thead>

          <tbody>
            {pageItems.length === 0 ? (
              <tr>
                <td
                  colSpan={3}
                  className="text-center py-6 text-muted-foreground"
                >
                  {tCommon("noBrands")}
                </td>
              </tr>
            ) : (
              pageItems.map((b: any) => (
                <tr
                  key={b.id}
                  className="border-b border-border hover:bg-muted/50"
                >
                  <td className="py-3 px-4 font-medium">{b.name}</td>
                  <td className="py-3 px-4">{b.slug}</td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEdit(b)}
                      >
                        <Edit size={16} />
                        {tCommon("edit")}
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm">
                            <Trash2 size={16} />
                            {tCommon("delete")}
                          </Button>
                        </AlertDialogTrigger>

                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              {tDashboard("deleteBrand") || "Delete Brand"}
                            </AlertDialogTitle>
                          </AlertDialogHeader>

                          <div className="flex gap-2 justify-end">
                            <AlertDialogCancel>
                              {tCommon("cancel")}
                            </AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-red-600 hover:bg-red-700"
                              onClick={() => onDeleted?.(b.id)}
                            >
                              {tCommon("delete")}
                            </AlertDialogAction>
                          </div>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
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

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{tDashboard("editBrand") || "Edit Brand"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <Input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder={tCommon("brandNamePlaceholder")}
            />

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditOpen(false)}>
                {tCommon("cancel")}
              </Button>
              <Button onClick={submitEdit} disabled={!editName.trim()}>
                {tCommon("save")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
