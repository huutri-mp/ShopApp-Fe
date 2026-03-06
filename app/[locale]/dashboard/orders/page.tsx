"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import OrderDataTable from "@/app/components/OrderDataTable";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PaymentMethod, OrderStatus } from "@/lib/enums";
import useOrder from "@/hooks/data/useOrder";

export default function OrdersManagementPage() {
  const t = useTranslations();
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [createdAtFrom, setCreatedAtFrom] = useState("");
  const [createdAtTo, setCreatedAtTo] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<string>("all");
  const [orderStatus, setOrderStatus] = useState<string>("all");

  const normalizeLocalDateTime = (value: string) =>
    value ? `${value.length === 16 ? `${value}:00` : value}` : undefined;

  const { updateOrderStatus, adminOrdersQuery, adminOrders, adminMeta } =
    useOrder({
      enableAdminOrdersQuery: true,
      adminOrderQueryParams: {
        createdAtFrom: createdAtTo
          ? normalizeLocalDateTime(createdAtFrom)
          : undefined,
        createdAtTo: normalizeLocalDateTime(createdAtTo),
        paymentMethod:
          paymentMethod === "all"
            ? undefined
            : (paymentMethod as PaymentMethod),
        orderStatus:
          orderStatus === "all" ? undefined : (orderStatus as OrderStatus),
        page: page - 1,
        size,
      },
    });

  const orders = adminOrders;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t("dashboard.manageOrders")}</h1>
        <p className="text-muted-foreground mt-1">
          {t("dashboard.recentOrders")}
        </p>
      </div>

      <div className="flex flex-wrap gap-3 mb-4 border-b pb-4 items-center w-full">
        <p className="text-sm text-muted-foreground">To</p>
        <input
          type="datetime-local"
          value={createdAtTo}
          onChange={(e) => {
            setCreatedAtTo(e.target.value);
            setPage(1);
          }}
          className="flex-1 h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs"
          aria-label="Created to"
        />

        <p className="text-sm text-muted-foreground">From</p>
        <input
          type="datetime-local"
          value={createdAtFrom}
          onChange={(e) => {
            setCreatedAtFrom(e.target.value);
            setPage(1);
          }}
          disabled={!createdAtTo}
          className="flex-1 h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs
             disabled:bg-gray-100 
             disabled:text-gray-400 
             disabled:cursor-not-allowed 
             disabled:opacity-100"
          aria-label="Created from"
        />
        <Select value={orderStatus} onValueChange={setOrderStatus}>
          <SelectTrigger className="flex-1 min-w-[180px]">
            <SelectValue placeholder="Order status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All status</SelectItem>
            {Object.values(OrderStatus).map((status) => (
              <SelectItem key={status} value={status}>
                {status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={paymentMethod} onValueChange={setPaymentMethod}>
          <SelectTrigger className="flex-1 min-w-[180px]">
            <SelectValue placeholder="Payment method" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All methods</SelectItem>
            <SelectItem value={PaymentMethod.CASH}>
              {PaymentMethod.CASH}
            </SelectItem>
            <SelectItem value={PaymentMethod.VNPAY}>
              {PaymentMethod.VNPAY}
            </SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          onClick={() => {
            setPage(1);
            setCreatedAtFrom("");
            setCreatedAtTo("");
            setPaymentMethod("all");
            setOrderStatus("all");
          }}
        >
          {t("common.resetFilter")}
        </Button>
      </div>

      <Card>
        <CardContent className="space-y-3">
          {adminOrdersQuery.isLoading ? (
            <p className="text-sm text-muted-foreground">
              {t("common.loading")}
            </p>
          ) : adminOrdersQuery.isError ? (
            <p className="text-sm text-red-600">{t("common.error")}</p>
          ) : orders.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {t("profile.noData")}
            </p>
          ) : (
            <OrderDataTable
              orders={orders}
              total={adminMeta.total}
              page={page}
              pageSize={size}
              hasNext={adminMeta.hasNext}
              hasPrev={adminMeta.hasPrev}
              isUpdating={updateOrderStatus.isPending}
              onUpdateStatus={(orderId, status) =>
                updateOrderStatus.mutate({
                  orderId,
                  orderStatus: status,
                })
              }
              onPageChange={(p, s) => {
                setPage(p);
                setSize(s);
              }}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
