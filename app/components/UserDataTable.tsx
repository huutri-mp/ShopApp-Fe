"use client";

import { useEffect } from "react";
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
import { useTranslations } from "next-intl";
import { User } from "@/hooks/data/useAuth";

interface UserDataTableProps {
  users: User[];
  onDeleted?: (id: number) => void;
  onEdit?: (id: number) => void;
  onPageChange?: (page: number, pageSize: number) => void;
  page?: number;
  pageSize?: number;
  total?: number;
}

export default function UserDataTable({
  users,
  onDeleted,
  onEdit,
  onPageChange,
  page = 1,
  pageSize = 10,
  total = users.length,
}: UserDataTableProps) {
  const tCommon = useTranslations("common");
  const tDashboard = useTranslations("dashboard");

  useEffect(() => {
    onPageChange?.(page, pageSize);
  }, [page, pageSize, onPageChange]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const pageItems = users;

  const handleDelete = async (id: number) => {
    onDeleted?.(id);
  };

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-muted">
            <tr>
              <th className="text-left py-3 px-4 font-medium">
                {tCommon("avatar")}
              </th>
              <th className="text-left py-3 px-4 font-medium">
                {tCommon("userName")}
              </th>
              <th className="text-left py-3 px-4 font-medium">
                {tCommon("fullName")}
              </th>
              <th className="text-left py-3 px-4 font-medium">
                {tCommon("enabled")}
              </th>
              <th className="text-left py-3 px-4 font-medium">
                {tCommon("phone")}
              </th>
              <th className="text-left py-3 px-4 font-medium">
                {tCommon("email")}
              </th>
              <th className="text-left py-3 px-4 font-medium">
                {tCommon("address")}
              </th>
              <th className="text-left py-3 px-4 font-medium">
                {tCommon("roles")}
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
                  colSpan={8}
                  className="text-center py-6 text-muted-foreground"
                >
                  {tCommon("noUsersFound")}
                </td>
              </tr>
            ) : (
              pageItems.map((u, idx) => (
                <tr
                  key={u.userId}
                  className="border-b border-border hover:bg-muted/50"
                >
                  <td className="py-3 px-4">
                    {u.avatar ? (
                      <img
                        src={u.avatar}
                        alt={u.fullName || "avatar"}
                        className="w-8 h-8 rounded object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded bg-muted flex items-center justify-center text-sm font-medium text-white">
                        {(
                          (u.fullName || u.userName || "").trim().charAt(0) ||
                          "?"
                        ).toUpperCase()}
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4">{u.userName}</td>
                  <td className="py-3 px-4 font-medium">{u.fullName}</td>
                  <td className="py-3 px-4">
                    {u.enabled === false ? (
                      <span className="text-sm text-destructive">
                        {tCommon("no")}
                      </span>
                    ) : (
                      <span className="text-sm text-success">
                        {tCommon("yes")}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4">{u.phoneNumber ?? "-"}</td>
                  <td className="py-3 px-4">{u.email}</td>
                  <td className="py-3 px-4">
                    {u.addresses && u.addresses.length > 0
                      ? (u.addresses as any[])
                          .map((a) => a.addressLine || a.contactPhone || "-")
                          .join("; ")
                      : "-"}
                  </td>
                  <td className="py-3 px-4">{u.role}</td>
                  <td className="py-3 px-4 text-right flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1 bg-transparent"
                      onClick={() => onEdit?.(u.userId)}
                    >
                      <Edit size={16} /> {tCommon("edit")}
                    </Button>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="gap-1"
                        >
                          <Trash2 size={16} /> {tCommon("delete")}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            {tDashboard("deleteUser") || "Delete User"}
                          </AlertDialogTitle>
                        </AlertDialogHeader>
                        <div className="flex gap-2 justify-end">
                          <AlertDialogCancel>
                            {tCommon("cancel")}
                          </AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-red-600 hover:bg-red-700"
                            onClick={() => handleDelete(u.userId)}
                          >
                            {tCommon("delete")}
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
      </div>

      <div className="pt-3 flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {tCommon("itemsLabel", { count: total })}
        </div>
        <div className="flex items-center gap-2">
          <Button
            className="px-2 py-1 rounded border"
            onClick={() => onPageChange?.(Math.max(1, page - 1), pageSize)}
            disabled={page <= 1}
          >
            {tCommon("previous")}
          </Button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Button
              key={p}
              className={`px-2 py-1 rounded ${
                p === page ? "bg-muted text-foreground" : "border"
              }`}
              onClick={() => onPageChange?.(p, pageSize)}
            >
              {p}
            </Button>
          ))}
          <Button
            className="px-2 py-1 rounded border"
            onClick={() =>
              onPageChange?.(Math.min(totalPages, page + 1), pageSize)
            }
            disabled={page >= totalPages}
          >
            {tCommon("next")}
          </Button>
          <select
            value={String(pageSize)}
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
