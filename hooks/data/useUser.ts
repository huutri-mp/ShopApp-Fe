"use client";

import apiClient from "@/lib/api";
import useAppStore from "@/hooks/useAppStore";
import type { User } from "./useAuth";
import { Gender } from "./useAuth";
import { Address } from "./useAddress";

export interface ProfileUpdateRequest {
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  gender?: Gender | string | null;
  dateOfBirth?: string;
  addresses?: Address[];
}

export interface AddressCreationRequest {
  contactName: string;
  contactPhone: string;
  addressLine1: string;
  addressLine2?: string;
  wards: string;
  districts: string;
  city?: string;
  province: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;
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
      const response = await apiClient.get("/user/profile/myInfo");
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
    avatarFile?: File
  ) => {
    const normalized: any = { ...payload };
    const form = new FormData();
    form.append(
      "profileUpdate",
      new Blob([JSON.stringify(normalized)], { type: "application/json" })
    );
    if (avatarFile) form.append("avt", avatarFile);

    const response = await apiClient.put("/user/profile/update", form, {
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

    setUser?.(updatedUser);
    return updatedUser;
  };

  const getAllUsers = async () => {
    const response = await apiClient.get("/user/profile/all");
    return response.data.data;
  };

  const deleteUser = async (userId: number) => {
    const response = await apiClient.delete(`/user/profile/delete/${userId}`);
    return response.data.data;
  };

  // Addresses
  const createAddress = async (request: AddressCreationRequest) => {
    const response = await apiClient.post("/address/create", request);
    return response.data.data || response.data;
  };

  const updateAddress = async (
    addressId: number,
    request: AddressUpdateRequest
  ) => {
    const response = await apiClient.put(
      `/address/update/${addressId}`,
      request
    );
    return response.data.data || response.data;
  };

  const deleteAddress = async (addressId: number) => {
    const response = await apiClient.delete(`/address/delete/${addressId}`);
    return response.data.data || response.data;
  };

  return {
    getProfile,
    updateProfile,
    getAllUsers,
    deleteUser,
    createAddress,
    updateAddress,
    deleteAddress,
  };
}
