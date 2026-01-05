"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api";
import type { Paging } from "./paging";
import { Category } from "./useCategories";
import { Brand } from "./useBrands";
export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  slug: string;
  category: Category;
  brand: Brand;
  stock: number;
  rating: number;
  reviews: number;
  images: ProductImage[];
  discount?: number;
  variants?: ProductVariant[];
}

export interface ProductImage {
  id: number;
  url: string;
}
export interface ProductVariant {
  id?: number;
  sku?: string;
  color?: string;
  size?: string;
  price?: number;
  salePrice?: number | null;
  stock?: number;
  storage?: string;
  ram?: string;
  cpu?: string;
  gpu?: string;
  screenSize?: string;
  screenResolution?: string;
  batteryCapacity?: string;
  connectivity?: string;
  warrantyMonths?: number;
  weight?: string;
  material?: string;
  releaseYear?: number;
}
export interface ProductCreationRequest {
  name: string;
  description?: string;
  active?: boolean;
  categoryId: number;
  brandId: number;
  variants?: ProductVariant[];
}
export interface ProductUpdateRequest {
  name?: string;
  description?: string;
  categoryId?: number;
  brandId?: number;
  variants?: ProductVariant[];
  removedImageIds?: number[];
}

function toFormData(
  data: ProductCreationRequest | ProductUpdateRequest,
  imageFiles?: File[],
  partName: string = "product"
) {
  const form = new FormData();
  form.append(
    partName,
    new Blob([JSON.stringify(data)], { type: "application/json" })
  );
  if (imageFiles?.length)
    imageFiles.forEach((f) => form.append("imageFiles", f));
  return form;
}

export function useProducts(
  page: number = 0,
  size: number = 10,
  categoryId?: number,
  brandId?: number,
  keyword?: string,
  isDesc?: boolean
) {
  const qc = useQueryClient();

  const productsQuery = useQuery<Paging<Product>>({
    queryKey: ["products", page, size, categoryId, brandId, keyword, isDesc],
    queryFn: async (): Promise<Paging<Product>> => {
      const res = await apiClient.get("/products", {
        params: { page, size, categoryId, brandId, keyword, isDesc },
      });
      const payload = (res.data?.data ?? res.data) as Paging<any>;
      return payload;
    },
  });

  const createMutation = useMutation({
    mutationFn: async ({
      data,
      files,
    }: {
      data: ProductCreationRequest;
      files?: File[];
    }) => {
      const form = toFormData(data, files);
      const res = await apiClient.post("/products", form);
      return res.data?.data ?? res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      data,
      files,
    }: {
      id: number;
      data: ProductUpdateRequest;
      files?: File[];
    }) => {
      const form = toFormData(data, files, "productUpdate");
      const res = await apiClient.put(`/products/${id}`, form);
      return res.data?.data ?? res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/products/${id}`);
      return id;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] }),
  });

  const products: any[] = productsQuery.data?.items ?? [];
  const meta = {
    total: productsQuery.data?.total ?? products.length,
    page: productsQuery.data?.page ?? page,
    size: productsQuery.data?.size ?? size,
    hasNext: productsQuery.data?.hasNext ?? false,
    hasPrev: productsQuery.data?.hasPrev ?? false,
  };

  const getProductById = (id: string) => products.find((p) => p.id === id);

  return {
    products,
    meta,
    productsQuery,
    getProductById,
    createMutation,
    updateMutation,
    deleteMutation,
  };
}
