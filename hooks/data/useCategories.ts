"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api";
import type { Paging } from "./paging";

export interface CategoryRequest {
  name: string;
  parentId?: number | null;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  parentId?: number | null;
}

export function useCategories(
  page?: number,
  size?: number,
  keyword?: string,
  isDesc?: boolean
) {
  const qc = useQueryClient();
  const categories = useQuery<Paging<Category>>({
    queryKey: [
      "categories",
      page ?? null,
      size ?? null,
      keyword ?? null,
      typeof isDesc === "boolean" ? isDesc : null,
    ],
    queryFn: async () => {
      const params = new URLSearchParams();

      if (page !== undefined) params.append("page", page.toString());
      if (size !== undefined) params.append("size", size.toString());
      if (keyword) params.append("keyword", keyword);
      if (typeof isDesc === "boolean") params.append("isDesc", String(isDesc));

      const query = params.toString();
      const url = query ? `/categories?${query}` : "/categories";

      const res = await apiClient.get(url);
      return (res.data?.data ?? res.data) as Paging<Category>;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (payload: CategoryRequest) => {
      const res = await apiClient.post("/categories", payload);
      return res.data?.data ?? res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/categories/${id}`);
      return id;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
  });

  const editMutation = useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: number;
      payload: CategoryRequest;
    }) => {
      const res = await apiClient.put(`/categories/${id}`, payload);
      return res.data?.data ?? res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
  });

  return { categories, createMutation, deleteMutation, editMutation };
}
