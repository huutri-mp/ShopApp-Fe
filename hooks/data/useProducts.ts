"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import apiClient from "@/lib/api";
import type { Paging } from "./paging";
import { Category } from "./useCategories";
import { Brand } from "./useBrands";
import { SortOrder } from "@/lib/enums";
export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  slug: string;
  category: Category;
  isFeatured?: boolean;
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

export interface ProductVariantAttributes {
  color?: string;
  size?: string;
  storage?: string;
  ram?: string;
  cpu?: string;
  gpu?: string;
  screenSize?: string;
  screenResolution?: string;
  batteryCapacity?: string;
  connectivity?: string;
  warrantyMonths?: string;
  weight?: string;
  material?: string;
  releaseYear?: string;
}

export interface ProductVariant {
  id?: number;
  skuCode?: string;
  price?: number;
  salePrice?: number | null;
  stock?: number | null;
  attributes?: ProductVariantAttributes;
}
export interface ProductCreationRequest {
  name: string;
  isFeatured?: boolean;
  description?: string;
  categoryId: number;
  brandId: number;
  variants?: ProductVariant[];
}
export interface ProductUpdateRequest {
  name?: string;
  isFeatured?: boolean | null;
  description?: string;
  categoryId?: number;
  brandId?: number;
  variants?: ProductVariant[];
  removedImageIds?: number[];
}

export interface ProductResponse {
  id: number;
  name: string;
  categoryId?: number | null;
  categoryName?: string | null;
  brandId?: number | null;
  brandName?: string | null;
  image?: string | null;
  minPrice?: number | null;
  maxPrice?: number | null;
  isFeatured?: boolean;
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
  isDesc?: boolean,
  enableListQuery: boolean = true,
) {
  const qc = useQueryClient();

  const productsQuery = useQuery<Paging<Product>>({
    queryKey: ["products", page, size, categoryId, brandId, keyword, isDesc],
    enabled: enableListQuery,
    queryFn: async (): Promise<Paging<Product>> => {
      const res = await apiClient.get("/products", {
        params: { page, size, categoryId, brandId, keyword, isDesc },
      });
      const payload = (res.data?.data ?? res.data) as Paging<Product>;
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

  const fetchProductById = useCallback(
    async (id: number | string): Promise<Product | null> => {
      if (!id) return null;
      const res = await apiClient.get(`/products/${id}`);
      return (res.data?.data ?? res.data) as Product;
    },
    []
  );

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
    fetchProductById,
    createMutation,
    updateMutation,
    deleteMutation,
  };
}

export function useProductSearch({
  keyword,
  minPrice,
  maxPrice,
  brandIds,
  sort,
  isFeatured,
  categoryIds,
  page = 0,
  size = 10,
}: {
  keyword?: string;
  minPrice?: number;
  maxPrice?: number;
  brandIds?: number[] | string[];
  sort?: SortOrder;
  isFeatured?: boolean;
  categoryIds?: number[] | string[];
  page?: number;
  size?: number;
}) {
  return useQuery<Paging<ProductResponse>>({
    queryKey: [
      "productSearch",
      keyword,
      minPrice,
      maxPrice,
      brandIds,
      sort,
      isFeatured,
      categoryIds,
      page,
      size,
    ],
    queryFn: async (): Promise<Paging<ProductResponse>> => {
      const params: any = { page, size };
      if (keyword) params.keyword = keyword;
      if (minPrice !== undefined) params.minPrice = minPrice;
      if (maxPrice !== undefined) params.maxPrice = maxPrice;
      if (brandIds) params.brandIds = brandIds;
      if (categoryIds) params.categoryIds = categoryIds;
      if (sort !== undefined) params.isDesc = sort === SortOrder.DESC;
      if (isFeatured !== undefined) params.isFeatured = isFeatured;

      const res = await apiClient.get("/search", { params });
      const payload = (res.data?.data ?? res.data) as Paging<ProductResponse>;
      return payload;
    },
  });
}
