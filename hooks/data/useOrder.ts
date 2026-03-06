"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api";
import { PaymentMethod, OrderStatus } from "@/lib/enums";
import type { Paging } from "./paging";
import { Address } from "./useAddress";

export interface OrderItemRequest {
  productId: number;
  quantity: number;
  skuCode?: string;
}

export interface OrderRequest {
  shippingAddress: number;
  items: OrderItemRequest[];
  paymentMethod: PaymentMethod;
}

export interface OrderItem {
  productId?: number;
  productName?: string;
  quantity: number;
  price: number;
  imageUrl?: string;
}

export interface OrderResponse {
  id: number;
  orderItems?: OrderItem[];
  status?: OrderStatus;
  totalAmount?: number;
  paymentMethod?: PaymentMethod;
  paymentUrl?: string;
  address?: Address;
  createdAt?: string;
}

export interface AdminOrderQueryParams {
  createdAtFrom?: string;
  createdAtTo?: string;
  paymentMethod?: PaymentMethod;
  orderStatus?: OrderStatus;
  page?: number;
  size?: number;
}

export interface UpdateOrderStatusRequest {
  orderId: number;
  orderStatus: OrderStatus;
}

export interface UseOrderOptions {
  enableAdminOrdersQuery?: boolean;
  adminOrderQueryParams?: AdminOrderQueryParams;
}

export interface OrderSummary {
  id: number;
  code?: string;
  status?: string;
  totalAmount?: number;
  createdAt?: string;
  paymentUrl?: string;
}

export default function useOrder(options?: UseOrderOptions) {
  const qc = useQueryClient();
  const ordersQuery = useQuery<OrderResponse[]>({
    queryKey: ["orders"],
    queryFn: async (): Promise<OrderResponse[]> => {
      const res = await apiClient.get("/order");
      return res.data?.data ?? [];
    },
  });

  const adminParams = options?.adminOrderQueryParams;
  const adminOrdersQuery = useQuery<Paging<OrderResponse>>({
    queryKey: [
      "admin-orders",
      adminParams?.createdAtFrom ?? "",
      adminParams?.createdAtTo ?? "",
      adminParams?.paymentMethod ?? "",
      adminParams?.orderStatus ?? "",
      adminParams?.page ?? 0,
      adminParams?.size ?? 10,
    ],
    queryFn: async (): Promise<Paging<OrderResponse>> => {
      const res = await apiClient.get("/order/admin", {
        params: {
          ...(adminParams?.createdAtFrom
            ? { createdAtFrom: adminParams.createdAtFrom }
            : {}),
          ...(adminParams?.createdAtTo
            ? { createdAtTo: adminParams.createdAtTo }
            : {}),
          ...(adminParams?.paymentMethod
            ? { paymentMethod: adminParams.paymentMethod }
            : {}),
          ...(adminParams?.orderStatus
            ? { orderStatus: adminParams.orderStatus }
            : {}),
          ...(adminParams?.page !== undefined
            ? { page: adminParams.page }
            : {}),
          ...(adminParams?.size !== undefined
            ? { size: adminParams.size }
            : {}),
        },
      });
      const payload = res.data?.data ?? res.data;
      if (Array.isArray(payload)) {
        return {
          items: payload,
          total: payload.length,
          page: adminParams?.page ?? 0,
          size: adminParams?.size ?? 10,
          hasNext: false,
          hasPrev: (adminParams?.page ?? 0) > 0,
        };
      }
      return payload as Paging<OrderResponse>;
    },
    enabled: Boolean(options?.enableAdminOrdersQuery),
  });

  const createOrder = useMutation({
    mutationFn: async (req: OrderRequest) => {
      const payload = {
        shippingAddress: req.shippingAddress,
        items: req.items,
        paymentMethod: req.paymentMethod,
      };
      const res = await apiClient.post("/order", payload);
      return res.data?.data ?? res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["orders"] });
    },
  });

  const cancelOrder = useMutation({
    mutationFn: async (orderId: number) => {
      const res = await apiClient.delete(`/order/${orderId}`);
      return res.data?.message ?? res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["orders"] });
    },
  });

  const updateOrderStatus = useMutation({
    mutationFn: async (req: UpdateOrderStatusRequest) => {
      const res = await apiClient.put(`/order/${req.orderId}`, null, {
        params: {
          orderStatus: req.orderStatus,
        },
      });
      return res.data?.data ?? res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-orders"] });
    },
  });

  const canCancelOrder = (status?: OrderStatus): boolean => {
    if (!status) return false;
    return [
      OrderStatus.PENDING,
      OrderStatus.PAID,
      OrderStatus.DELIVERING,
    ].includes(status);
  };

  return {
    ordersQuery,
    adminOrdersQuery,
    orders: ordersQuery.data ?? [],
    adminOrders: adminOrdersQuery.data?.items ?? [],
    adminMeta: {
      total: adminOrdersQuery.data?.total ?? 0,
      page: adminOrdersQuery.data?.page ?? adminParams?.page ?? 0,
      size: adminOrdersQuery.data?.size ?? adminParams?.size ?? 10,
      hasNext: adminOrdersQuery.data?.hasNext ?? false,
      hasPrev: adminOrdersQuery.data?.hasPrev ?? false,
    },
    createOrder,
    cancelOrder,
    updateOrderStatus,
    canCancelOrder,
  };
}
