"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import apiClient from "@/lib/api";
import useAppStore from "@/hooks/useAppStore";

export interface AddCartItemRequest {
  productId: number;
  quantity: number;
  skuCode?: string;
}

export interface UpdateCartItemRequest {
  productId: number;
  quantity: number;
  skuCode?: string;
}

export interface RemoveCartItemRequest {
  cartItemId: number;
  quantity: number;
}

export interface CartItem {
  id?: number;
  productId: number;
  skuCode?: string;
  name?: string;
  price?: number;
  quantity: number;
  imageUrl?: string;
}

export interface Cart {
  id: number;
  cartItems: CartItem[];
  totalQuantity?: number;
  totalPrice?: number;
}

export function useCart() {
  const qc = useQueryClient();
  const { isAuthenticated } = useAppStore();

  const cartQuery = useQuery<Cart>({
    queryKey: ["cart"],
    queryFn: async (): Promise<Cart> => {
      const res = await apiClient.get("/cart");
      return res.data?.data;
    },
    enabled: isAuthenticated,
  });

  const addMutation = useMutation({
    mutationFn: async (req: AddCartItemRequest) => {
      const res = await apiClient.post("/cart/addToCart", req);
      return res.data?.data ?? res.data;
    },
    onMutate: async (req) => {
      await qc.cancelQueries({ queryKey: ["cart"] });
      const previousCart = qc.getQueryData<Cart>(["cart"]);

      if (previousCart) {
        const existingIndex = previousCart.cartItems.findIndex(
          (item) =>
            item.productId === req.productId &&
            (item.skuCode ?? "") === (req.skuCode ?? ""),
        );

        const nextItems = [...previousCart.cartItems];
        if (existingIndex >= 0) {
          nextItems[existingIndex] = {
            ...nextItems[existingIndex],
            quantity: (nextItems[existingIndex].quantity ?? 0) + req.quantity,
          };
        } else {
          nextItems.push({
            productId: req.productId,
            skuCode: req.skuCode,
            quantity: req.quantity,
          });
        }

        qc.setQueryData<Cart>(["cart"], {
          ...previousCart,
          cartItems: nextItems,
          totalQuantity:
            (previousCart.totalQuantity ?? 0) + Math.max(0, req.quantity),
        });
      }

      return { previousCart };
    },
    onError: (_error, _req, context) => {
      if (context?.previousCart) {
        qc.setQueryData(["cart"], context.previousCart);
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cart"] }),
  });

  const removeMutation = useMutation({
    mutationFn: async (req: RemoveCartItemRequest) => {
      console.log("Removing item from cart:", req);
      const res = await apiClient.delete("/cart/removeItem", {
        data: req,
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cart"] }),
  });

  const clearMutation = useMutation({
    mutationFn: async () => {
      const res = await apiClient.delete("/cart/clear");
      return res.data?.data ?? res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cart"] }),
  });

  const addToCart = async (req: AddCartItemRequest) =>
    addMutation.mutateAsync(req);
  const removeItem = async (req: RemoveCartItemRequest) =>
    removeMutation.mutateAsync(req);
  const clearCart = async () => clearMutation.mutateAsync();

  const items = useMemo(
    () => cartQuery.data?.cartItems ?? [],
    [cartQuery.data?.cartItems],
  );
  const totalQuantity = useMemo(() => {
    if (!isAuthenticated) return 0;
    if (typeof cartQuery.data?.totalQuantity === "number") {
      return cartQuery.data.totalQuantity;
    }
    return items.reduce((sum, item) => sum + (item.quantity ?? 0), 0);
  }, [cartQuery.data?.totalQuantity, isAuthenticated, items]);

  return {
    items,
    totalQuantity,
    cartQuery,
    addMutation,
    addToCart,
    removeItem,
    clearCart,
  };
}
