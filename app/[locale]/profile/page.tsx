"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useToast } from "@/hooks/use-toast";
import useAppStore from "@/hooks/useAppStore";
import useUser from "@/hooks/data/useUser";
import useAddress, { Address } from "@/hooks/data/useAddress";
import useOrder from "@/hooks/data/useOrder";
import { useAuth } from "@/hooks/data/useAuth";
import Link from "next/link";
import { Button } from "@/components/ui/button";

import Sidebar from "./components/Sidebar";
import ProfileHeader from "./components/ProfileHeader";
import ProfileInfoTab from "./components/tabs/ProfileInfoTab";
import AddressTab from "./components/tabs/AddressTab";
import PasswordTab from "./components/tabs/PasswordTab";
import OrdersTab from "./components/tabs/OrdersTab";

export default function ProfilePage() {
  const t = useTranslations();
  const { toast } = useToast();
  const user = useAppStore((s) => s.user);
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  const setUser = useAppStore((s) => s.setUser);
  const [activeTab, setActiveTab] = useState("profile");
  const searchParams = useSearchParams();
  const [file, setFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    gender: "",
    dateOfBirth: "",
  });
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [passwordLoading, setPasswordLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [cancelingOrderId, setCancelingOrderId] = useState<number | null>(null);
  const { updateProfile } = useUser();
  const { changePassword } = useAuth();
  const { createAddress, updateAddress, deleteAddress } = useAddress();
  const { orders, ordersQuery, cancelOrder, canCancelOrder } = useOrder();

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || "",
        email: user.email || "",
        phoneNumber: user.phoneNumber || "",
        gender: user.gender ? String(user.gender).toLowerCase() : "",
        dateOfBirth: user.dateOfBirth || "",
      });
    }
  }, [user]);

  // Initialize active tab from query string, e.g., ?tab=orders
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab) setActiveTab(tab);
  }, [searchParams]);

  const [editingAddressIndex, setEditingAddressIndex] = useState<number | null>(
    null,
  );
  const [editingAddress, setEditingAddress] = useState<
    Partial<Address> | undefined
  >(undefined);
  const [addressDialogOpen, setAddressDialogOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmType, setConfirmType] = useState<
    "delete" | "save-dialog" | "save-bulk" | null
  >(null);
  const [confirmIndex, setConfirmIndex] = useState<number | null>(null);

  const requestDelete = (index: number) => {
    setConfirmIndex(index);
    setConfirmType("delete");
    setConfirmOpen(true);
  };

  const performDeleteConfirmed = async () => {
    const index = confirmIndex;
    setConfirmOpen(false);
    if (index === null) return;
    const addr = (user?.addresses || [])[index];
    if (!addr || !addr.id) return;
    setProfileLoading(true);
    try {
      await deleteAddress(addr.id);
    } catch (err) {
      throw err;
    } finally {
      setProfileLoading(false);
      setConfirmIndex(null);
      setConfirmType(null);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
    if (f) {
      const previewUrl = URL.createObjectURL(f);
      setAvatarPreview(previewUrl);
      uploadAvatarImmediate(f);
    } else {
      setAvatarPreview(null);
    }
  };

  const removeAddress = async (index: number) => {
    const addr = (user?.addresses || [])[index];
    if (!addr) return;
    try {
      if (addr.id) {
        await deleteAddress(addr.id);
      }
    } catch (err) {
      throw err;
    }
  };
  const setDefaultOnServer = async (index: number) => {
    const addr = (user?.addresses || [])[index];
    if (!addr || !addr.id) return;

    const newDefaultValue = !addr.isDefault;

    const updatedAddresses = user?.addresses?.map((a, i) =>
      i === index
        ? { ...a, isDefault: newDefaultValue }
        : newDefaultValue
          ? { ...a, isDefault: false }
          : a,
    );

    if (user && updatedAddresses) {
      setUser({ ...user, addresses: updatedAddresses });
    }

    try {
      await updateAddress(addr.id, { isDefault: newDefaultValue });
    } catch (err) {
      if (user) {
        setUser({ ...user, addresses: user.addresses });
      }
    }
  };
  const uploadAvatarImmediate = async (f: File) => {
    try {
      const updated = await updateProfile({}, f, user?.userId);
      if (updated) {
        setUser(updated);
        toast({
          title: t("common.success"),
          description: t("profile.avatarUpdateSuccess"),
        });
      }
      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview);
        setAvatarPreview(null);
      }
    } catch (err: any) {
      setAvatarPreview(null);
      toast({
        variant: "destructive",
        title: t("common.error"),
        description:
          err.response?.data?.message ||
          err.message ||
          t("errors.somethingWentWrong"),
      });
    }
  };

  const handleSaveProfile = async () => {
    setProfileLoading(true);
    try {
      if (
        formData.email &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
      ) {
        toast({
          variant: "destructive",
          title: t("common.error"),
          description: t("validation.invalidEmail"),
        });
        setProfileLoading(false);
        return;
      }

      if (
        formData.phoneNumber &&
        !/^\+?[0-9]{10,15}$/.test(formData.phoneNumber)
      ) {
        toast({
          variant: "destructive",
          title: t("common.error"),
          description: t("validation.invalidPhoneNumber"),
        });
        setProfileLoading(false);
        return;
      }

      const payload = {
        fullName: formData.fullName || undefined,
        email: formData.email || undefined,
        phoneNumber: formData.phoneNumber || undefined,
        gender: formData.gender ? formData.gender.toUpperCase() : undefined,
        dateOfBirth: formData.dateOfBirth || undefined,
      };

      const updated = await updateProfile(
        payload,
        file ?? undefined,
        user?.userId,
      );

      if (updated) {
        setUser(updated);
        toast({
          title: t("common.success"),
          description: t("profile.updateSuccess"),
        });
      }
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: t("common.error"),
        description:
          err.response?.data?.message ||
          err.message ||
          t("errors.somethingWentWrong"),
      });
    } finally {
      setProfileLoading(false);
    }
  };

  const handleSaveAddressesConfirmed = async () => {
    setConfirmOpen(false);
    setProfileLoading(true);
    try {
      for (const a of user?.addresses || []) {
        if (a.id) await updateAddress(a.id, { ...a });
      }
    } catch (err) {
      throw err;
    } finally {
      setProfileLoading(false);
      setConfirmType(null);
    }
  };

  const saveAddressFromDialog = async (payload: Partial<Address>) => {
    setProfileLoading(true);
    try {
      if (editingAddressIndex === null) {
        await createAddress(payload as any);
      } else {
        const addressId = payload.id;
        if (addressId) {
          const { id, ...updatePayload } = payload;

          await updateAddress(addressId, updatePayload);
        }
      }
      setEditingAddress({});
      setEditingAddressIndex(null);
      setAddressDialogOpen(false);
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: t("common.error"),
        description:
          err.response?.data?.message ||
          err.message ||
          t("errors.somethingWentWrong"),
      });
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!passwordData.oldPassword) {
      toast({
        variant: "destructive",
        title: t("common.error"),
        description: t("validation.required"),
      });
      return;
    }
    if (!passwordData.newPassword) {
      toast({
        variant: "destructive",
        title: t("common.error"),
        description: t("validation.required"),
      });
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast({
        variant: "destructive",
        title: t("common.error"),
        description: t("validation.passwordTooShort"),
      });
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      toast({
        variant: "destructive",
        title: t("common.error"),
        description: t("validation.passwordMismatch"),
      });
      return;
    }
    setPasswordLoading(true);
    try {
      const response = await changePassword({
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword,
        confirmNewPassword: passwordData.confirmNewPassword,
      });

      if (response.status === 200) {
        toast({
          title: t("common.success"),
          description: t("auth.changePassword.success"),
        });
        setPasswordData({
          oldPassword: "",
          newPassword: "",
          confirmNewPassword: "",
        });
      } else {
        toast({
          variant: "destructive",
          title: t("common.error"),
          description:
            response?.data?.message || t("auth.changePassword.error"),
        });
      }
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: t("common.error"),
        description:
          err.response?.data?.message ||
          err.message ||
          t("auth.changePassword.error"),
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleCancelOrder = async (orderId: number) => {
    setCancelingOrderId(orderId);
    try {
      await cancelOrder.mutateAsync(orderId);
      toast({
        title: t("common.success"),
        description: t("common.success"),
      });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: t("common.error"),
        description:
          err.response?.data?.message ||
          err.message ||
          t("errors.somethingWentWrong"),
      });
    } finally {
      setCancelingOrderId(null);
    }
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-semibold mb-4">Profile</h1>
        <p className="mb-4">You are not signed in.</p>
        <Link
          href="/auth/login"
          className="inline-block rounded bg-blue-600 text-white px-4 py-2"
        >
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar
        user={user!}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        avatarPreview={avatarPreview}
      />
      <div className="flex-1">
        <ProfileHeader
          user={user!}
          preview={avatarPreview || user?.avatar || null}
          fileInputRef={fileInputRef}
          handleFileChange={handleFileChange}
        />

        <div className="p-8 max-w-full">
          {activeTab === "profile" && (
            <ProfileInfoTab
              formData={formData}
              profileLoading={profileLoading}
              onInputChange={handleInputChange}
              onGenderChange={(value) =>
                setFormData((prev) => ({ ...prev, gender: value }))
              }
              onSave={handleSaveProfile}
            />
          )}

          {activeTab === "address" && (
            <AddressTab
              addresses={user?.addresses || []}
              editingAddressIndex={editingAddressIndex}
              editingAddress={editingAddress}
              addressDialogOpen={addressDialogOpen}
              confirmOpen={confirmOpen}
              confirmType={confirmType}
              setAddressDialogOpen={setAddressDialogOpen}
              setConfirmOpen={setConfirmOpen}
              onOpenAddAddress={() => {
                setEditingAddressIndex(null);
                setEditingAddress(undefined);
                setAddressDialogOpen(true);
              }}
              onOpenEditAddress={(idx, addr) => {
                setEditingAddressIndex(idx);
                setEditingAddress(addr);
                setAddressDialogOpen(true);
              }}
              onRequestDelete={requestDelete}
              onToggleDefault={setDefaultOnServer}
              onSaveAddress={saveAddressFromDialog}
              onConfirmDelete={performDeleteConfirmed}
              onConfirmSaveBulk={handleSaveAddressesConfirmed}
            />
          )}

          {activeTab === "password" && (
            <PasswordTab
              passwordData={passwordData}
              passwordLoading={passwordLoading}
              onPasswordChange={handlePasswordChange}
              onSubmit={handleChangePassword}
            />
          )}

          {activeTab === "orders" && (
            <OrdersTab
              orders={orders}
              ordersQuery={ordersQuery}
              cancelOrder={cancelOrder}
              cancelingOrderId={cancelingOrderId}
              canCancelOrder={canCancelOrder}
              onCancelOrder={handleCancelOrder}
            />
          )}
        </div>
      </div>
    </div>
  );
}
