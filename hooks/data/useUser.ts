"use client";

import apiClient from "@/lib/api";
import useAppStore from "@/hooks/useAppStore";
import type { User, RegisterCredentials } from "./useAuth";
import { Gender } from "./useAuth";
import { Address } from "./useAddress";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Paging } from "./paging";
import { Role } from "@/lib/enums";

export interface ProfileUpdateRequest {
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  gender?: Gender | string | null;
  dateOfBirth?: string;
  addresses?: Address[];
  roles?: Role;
  enabled?: boolean;
}

export interface AddressUpdateRequest extends Partial<Address> {}

export default function useUser() {
  const { setUser, setAuthenticated, setLoading } = useAppStore();

  const getProfile = async (): Promise<{
    success: boolean;
    user?: User;
    message?: string;
  }> => {
    try {
      setLoading?.(true);
      const response = await apiClient.get("/profile/myInfo");
      const data = response.data.data;
      const userProfile: User = {
        userId: data.userId,
        userName: data.userName || data.username || data.preferred_username,
        fullName: data.fullName,
        email: data.email,
        phoneNumber: data.phoneNumber,
        gender: data.gender,
        dateOfBirth: data.dateOfBirth,
        addresses: data.addresses,
        avatar: data.avatar,
        needsPasswordCreation:
          data.needsPasswordCreation || data.needs_password_creation,
        role: data.role,
      };

      setUser?.(userProfile);
      setAuthenticated?.(true);
      if (typeof window !== "undefined")
        window.dispatchEvent(new Event("auth-changed"));

      return { success: true, user: userProfile };
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch user profile";
      return { success: false, message: errorMessage };
    } finally {
      setLoading?.(false);
    }
  };

  const updateProfile = async (
    payload: ProfileUpdateRequest,
    avatarFile?: File,
    id?: number
  ) => {
    const normalized: any = { ...payload };
    const form = new FormData();
    form.append(
      "profileUpdate",
      new Blob([JSON.stringify(normalized)], { type: "application/json" })
    );
    if (avatarFile) form.append("avt", avatarFile);

    const url = `/profile/update/${id}`;

    const response = await apiClient.put(url, form, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    const updated = response.data.data;
    const updatedUser: User = {
      userId: updated.userId,
      userName: updated.userName || updated.username,
      fullName: updated.fullName,
      email: updated.email,
      phoneNumber: updated.phoneNumber,
      gender: updated.gender,
      dateOfBirth: updated.dateOfBirth,
      addresses: updated.addresses,
      avatar: updated.avatar,
    };

    // Only update global user when updating the current user's profile
    const currentUser = useAppStore.getState().user;
    if (!id || currentUser?.userId === updatedUser.userId) {
      setUser?.(updatedUser);
    }

    return updatedUser;
  };

  return {
    getProfile,
    updateProfile,
  };
}

export function useUsersQuery(
  page: number = 0,
  size: number = 10,
  keyword?: string,
  role?: string,
  sort?: string,
  enabled?: boolean
) {
  return useQuery<Paging<User>>({
    queryKey: ["users", page, size, keyword, role, sort, enabled],
    queryFn: async (): Promise<Paging<User>> => {
      const params = new URLSearchParams();
      params.append("page", String(page));
      params.append("size", String(size));
      if (keyword) params.append("keyword", keyword);
      if (role) params.append("role", role);
      if (sort) params.append("sort", sort);
      if (typeof enabled === "boolean")
        params.append("enabled", String(enabled));
      const res = await apiClient.get(`/users?${params.toString()}`);
      const payload = (res.data?.data ?? res.data) as Paging<User>;
      return payload;
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useDeleteUserMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (userId: number) => {
      await apiClient.delete(`/profile/delete/${userId}`);
      return userId;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["users"] });
    },
  });
}
