"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Edit, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

interface CategoryDataTableProps {
  categories: any[];
  onDeleted?: (id: number) => void;
  onEdit?: (id: number, payload?: { name?: string }) => void;
  onPageChange?: (page: number, pageSize: number) => void;
  page?: number;
  pageSize?: number;
  total?: number;
  hasNext?: boolean;
  hasPrev?: boolean;
}

export default function CategoryDataTable({
  categories,
  onDeleted,
  onEdit,
  onPageChange,
  page = 1,
  pageSize = 10,
  total = categories.length,
  hasNext = false,
  hasPrev = false,
}: CategoryDataTableProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const pageItems = categories;
  const tCommon = useTranslations("common");
  const [editOpen, setEditOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editId, setEditId] = useState<number | null>(null);

  const handleEditOpen = (category: any) => {
    setEditId(category.id);
    setEditName(category.name);
    setEditOpen(true);
  };

  const submitEdit = () => {
    if (onEdit && editId !== null && editName.trim()) {
      onEdit(editId, { name: editName.trim() });
      setEditOpen(false);
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="border-b border-border bg-muted">
          <tr>
            <th className="text-left py-3 px-4 font-medium">
              {tCommon("categoryName")}
            </th>
            <th className="text-left py-3 px-4 font-medium">
              {tCommon("productsCount")}
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
                {tCommon("noCategories")}
              </td>
            </tr>
          ) : (
            pageItems.map((category) => (
              <tr
                key={category.id}
                className="border-b border-border hover:bg-muted/50"
              >
                <td className="py-3 px-4 font-medium">{category.name}</td>
                <td className="py-3 px-4">{category.productCount}</td>
                <td className="py-3 px-4 text-right flex justify-end gap-2">
                  <Dialog
                    open={editOpen && editId === category.id}
                    onOpenChange={setEditOpen}
                  >
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1 bg-transparent"
                        onClick={() => handleEditOpen(category)}
                      >
                        <Edit size={16} />
                        {tCommon("edit")}
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{tCommon("editCategory")}</DialogTitle>
                        <DialogDescription>
                          {tCommon("updateCategoryInfo")}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full px-3 py-2 border rounded-lg"
                        />
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            onClick={() => setEditOpen(false)}
                          >
                            {tCommon("cancel")}
                          </Button>
                          <Button
                            onClick={submitEdit}
                            disabled={!editName.trim()}
                          >
                            {tCommon("save")}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm" className="gap-1">
                        <Trash2 size={16} />
                        {tCommon("delete")}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          {tCommon("deleteCategory")}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          {tCommon("confirmDeleteCategory", {
                            name: category.name,
                          })}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <div className="flex gap-2 justify-end">
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => onDeleted?.(category.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Delete
                        </AlertDialogAction>
                      </div>
                    </AlertDialogContent>
                  </AlertDialog>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
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
