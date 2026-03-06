"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { OrderStatus } from "@/lib/enums";
import { formatPriceText } from "@/lib/utils";
import type { OrderResponse } from "@/hooks/data/useOrder";

type Props = {
  orders: OrderResponse[];
  page?: number;
  pageSize?: number;
  total?: number;
  hasNext?: boolean;
  hasPrev?: boolean;
  isUpdating?: boolean;
  onPageChange?: (page: number, pageSize: number) => void;
  onUpdateStatus?: (orderId: number, status: OrderStatus) => void;
};

export default function OrderDataTable({
  orders,
  page = 1,
  pageSize = 10,
  total = orders.length,
  hasNext = false,
  hasPrev = false,
  isUpdating = false,
  onPageChange,
  onUpdateStatus,
}: Props) {
  const tCommon = useTranslations("common");
  const [draftStatuses, setDraftStatuses] = useState<
    Record<number, OrderStatus>
  >({});

  useEffect(() => {
    onPageChange?.(page, pageSize);
  }, [page, pageSize, onPageChange]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-muted">
            <tr>
              <th className="text-left py-3 px-4 font-medium">Order</th>
              <th className="text-left py-3 px-4 font-medium">Created At</th>
              <th className="text-left py-3 px-4 font-medium">Payment</th>
              <th className="text-left py-3 px-4 font-medium">Items</th>
              <th className="text-left py-3 px-4 font-medium">Total</th>
              <th className="text-left py-3 px-4 font-medium">Status</th>
              <th className="text-right py-3 px-4 font-medium">
                {tCommon("actions")}
              </th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="text-center py-6 text-muted-foreground"
                >
                  No orders
                </td>
              </tr>
            ) : (
              orders.map((order) => {
                const selectedStatus = draftStatuses[order.id] ?? order.status;
                const orderItems = order.orderItems ?? [];

                return (
                  <tr
                    key={order.id}
                    className="border-b border-border hover:bg-muted/50 align-top"
                  >
                    <td className="py-3 px-4 font-medium">#{order.id}</td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleString("vi-VN", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: false,
                          })
                        : "-"}
                    </td>
                    <td className="py-3 px-4">{order.paymentMethod ?? "-"}</td>
                    <td className="py-3 px-4 min-w-[240px]">
                      <div className="space-y-2">
                        {orderItems.map((item, idx) => (
                          <div
                            key={`${order.id}-${item.productId ?? idx}`}
                            className="flex items-center gap-2"
                          >
                            <img
                              src={item.imageUrl || "/placeholder.svg"}
                              alt={item.productName || "item"}
                              className="w-8 h-8 rounded object-cover shrink-0"
                            />
                            <span className="truncate text-muted-foreground">
                              {item.productName || "Item"} x {item.quantity}
                            </span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {formatPriceText(order.totalAmount)}
                    </td>
                    <td className="py-3 px-4 min-w-[120px]">
                      <Select
                        value={selectedStatus}
                        onValueChange={(value) =>
                          setDraftStatuses((prev) => ({
                            ...prev,
                            [order.id]: value as OrderStatus,
                          }))
                        }
                      >
                        <SelectTrigger className="flex-1 min-w-[150px]">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.values(OrderStatus).map((status) => (
                            <SelectItem key={status} value={status}>
                              {status}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button
                        size="sm"
                        disabled={
                          isUpdating ||
                          !selectedStatus ||
                          selectedStatus === order.status
                        }
                        onClick={() =>
                          selectedStatus &&
                          onUpdateStatus?.(order.id, selectedStatus)
                        }
                      >
                        {isUpdating ? tCommon("loading") : tCommon("save")}
                      </Button>
                    </td>
                  </tr>
                );
              })
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
    </div>
  );
}
