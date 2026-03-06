"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { PaymentMethod } from "@/lib/enums";
import { formatPriceText } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { OrderResponse } from "@/hooks/data/useOrder";

type Props = {
  orders: OrderResponse[];
  ordersQuery: { isLoading: boolean; isError: boolean };
  cancelOrder: { isPending: boolean };
  cancelingOrderId: number | null;
  canCancelOrder: (status?: any) => boolean;
  onCancelOrder: (orderId: number) => void;
};

export default function OrdersTab({
  orders,
  ordersQuery,
  cancelOrder,
  cancelingOrderId,
  canCancelOrder,
  onCancelOrder,
}: Props) {
  const t = useTranslations();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <h2 className="text-lg font-semibold mb-6">{t("profile.myOrders")}</h2>

      {ordersQuery.isLoading ? (
        <div className="py-10 flex justify-center">
          <Spinner className="size-6 text-foreground" />
        </div>
      ) : ordersQuery.isError ? (
        <p className="text-sm text-red-600">{t("common.error")}</p>
      ) : orders.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t("profile.noData")}</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const orderItems = (order.orderItems ?? []) as Array<{
              productId: number;
              productName?: string;
              quantity?: number;
              price?: number;
              imageUrl?: string;
            }>;

            return (
              <div key={order.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-700">
                    {order.status ?? "-"}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                  <p>
                    {t("cart.paymentMethod")}:{" "}
                    {order.paymentMethod === PaymentMethod.VNPAY
                      ? t("cart.vnPay")
                      : t("cart.cash")}
                  </p>
                  <p className="font-medium text-red-600">
                    {t("cart.subtotal")}: {formatPriceText(order.totalAmount)}
                  </p>
                </div>

                {order.address && (
                  <div className="text-sm border-t pt-3 space-y-1">
                    <p className="font-medium">{t("cart.shippingAddress")}</p>
                    <p className="text-gray-700">
                      {order.address.contactName || "-"} •{" "}
                      {order.address.contactPhone || "-"}
                    </p>
                    <p className="text-muted-foreground">
                      {order.address.addressLine || "-"}
                      {order.address.wards ? `, ${order.address.wards}` : ""}
                      {order.address.province
                        ? `, ${order.address.province}`
                        : ""}
                    </p>
                  </div>
                )}

                {orderItems.length > 0 && (
                  <div className="text-sm space-y-2 border-t pt-3">
                    {orderItems.map((item, idx) => (
                      <div
                        key={`${order.id}-${item.productId}-${idx}`}
                        className="flex items-start gap-3"
                      >
                        <Link href={`/products/${item.productId}`}>
                          {item.imageUrl && (
                            <img
                              src={item.imageUrl}
                              alt={item.productName}
                              className="w-16 h-16 object-cover rounded-md hover:opacity-90"
                            />
                          )}
                        </Link>
                        <div className="flex items-start justify-between gap-3 flex-1">
                          <div className="min-w-0">
                            <Link
                              href={`/products/${item.productId}`}
                              className="text-gray-800 truncate block hover:text-red-600"
                            >
                              {item.productName || t("cart.item")}
                            </Link>
                            <p className="text-xs text-muted-foreground">
                              {item.quantity ?? 0} x{" "}
                              {formatPriceText(item.price)}
                            </p>
                          </div>
                          <p className="font-medium text-gray-900 whitespace-nowrap">
                            {formatPriceText(
                              (item.price ?? 0) * (item.quantity ?? 0),
                            )}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {canCancelOrder(order.status) && (
                  <div className="pt-2">
                    <Button
                      variant="outline"
                      className="text-red-600 border-red-200 hover:text-red-700"
                      disabled={
                        cancelOrder.isPending && cancelingOrderId === order.id
                      }
                      onClick={() => {
                        setSelectedOrderId(order.id);
                        setConfirmOpen(true);
                      }}
                    >
                      {cancelOrder.isPending && cancelingOrderId === order.id
                        ? t("common.loading")
                        : t("common.cancel")}
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("common.confirmDelete")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("common.confirmDelete")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (selectedOrderId !== null) {
                  onCancelOrder(selectedOrderId);
                }
                setConfirmOpen(false);
                setSelectedOrderId(null);
              }}
            >
              {t("common.confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
