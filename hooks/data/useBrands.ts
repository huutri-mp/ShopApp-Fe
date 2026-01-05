"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api";
import type { Paging } from "./paging";

export interface BrandRequest {
  name: string;
}

export interface Brand {
  id: number;
  name: string;
  slug: string;
}

export function useBrands(
  page?: number,
  size?: number,
  keyword?: string,
  isDesc?: boolean
) {
  const qc = useQueryClient();
  const brands = useQuery<Paging<Brand>>({
    queryKey: [
      "brands",
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
      const url = query ? `/brands?${query}` : "/brands";

      const res = await apiClient.get(url);
      const payload = (res.data?.data ?? res.data) as Paging<Brand>;
      return payload;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (payload: BrandRequest) => {
      const res = await apiClient.post("/brands", payload);
      return res.data?.data ?? res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["brands"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/brands/${id}`);
      return id;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["brands"] }),
  });

  const editMutation = useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: number;
      payload: BrandRequest;
    }) => {
      const res = await apiClient.put(`/brands/${id}`, payload);
      return res.data?.data ?? res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["brands"] }),
  });

  return { brands, createMutation, deleteMutation, editMutation };
}
