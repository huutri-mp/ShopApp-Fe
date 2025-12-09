"use client";

import apiClient from "@/lib/api";
import useUser from "./useUser";

export interface Address {
  id: number;
  contactName: string;
  contactPhone: string;
  addressLine: string;
  wards?: string;
  province: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AddressCreationRequest {
  contactName: string;
  contactPhone: string;
  addressLine: string;
  wards: string;
  province: string;
  isDefault?: boolean;
}

export interface AddressUpdateRequest {
  contactName?: string;
  contactPhone?: string;
  addressLine?: string;
  wards?: string;
  province?: string;
  isDefault?: boolean;
}

export default function useAddress() {
  const { getProfile } = useUser();

  const createAddress = async (request: AddressCreationRequest) => {
    const response = await apiClient.post("user/address/create", request);
    try {
      await getProfile();
    } catch (e) {}
    return response.data.data || response.data;
  };

  const updateAddress = async (
    addressId: number,
    request: AddressUpdateRequest
  ) => {
    const response = await apiClient.put(
      `user/address/update/${addressId}`,
      request
    );
    try {
      await getProfile();
    } catch (e) {}
    return response.data.data || response.data;
  };

  const deleteAddress = async (addressId: number) => {
    const response = await apiClient.delete(`user/address/delete/${addressId}`);
    try {
      await getProfile();
    } catch (e) {}
    return response.data.data || response.data;
  };

  return {
    createAddress,
    updateAddress,
    deleteAddress,
  };
}
