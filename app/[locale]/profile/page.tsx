"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useToast } from "@/hooks/use-toast";
import useAppStore from "@/hooks/useAppStore";
import useUser from "@/hooks/data/useUser";
import useAddress, { Address } from "@/hooks/data/useAddress";
import { useAuth } from "@/hooks/data/useAuth";
import { Gender } from "@/hooks/data/useAuth";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

import Sidebar from "./components/Sidebar";
import ProfileHeader from "./components/ProfileHeader";
import AddressDialog from "./components/AddressDialog";

export default function ProfilePage() {
  const t = useTranslations();
  const { toast } = useToast();
  const user = useAppStore((s) => s.user);
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  const setUser = useAppStore((s) => s.setUser);
  const [activeTab, setActiveTab] = useState("profile");
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
  const [orders, setOrders] = useState<any[]>([]);
  const { updateProfile } = useUser();
  const { changePassword } = useAuth();
  const { createAddress, updateAddress, deleteAddress } = useAddress();

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

  const [editingAddressIndex, setEditingAddressIndex] = useState<number | null>(
    null
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
        : a
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
        user?.userId
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
          {/* Profile tab */}
          {activeTab === "profile" && (
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h2 className="text-lg font-semibold mb-6">
                {t("profile.personalInfo")}
              </h2>
              <div className="space-y-4">
                <div></div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    {t("profile.fullName")}
                  </label>
                  <Input
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    {t("profile.email")}
                  </label>
                  <Input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    {t("profile.phoneNumber")}
                  </label>
                  <Input
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    {t("profile.gender")}
                  </label>
                  <Select
                    value={formData.gender}
                    onValueChange={(v) =>
                      setFormData((prev) => ({ ...prev, gender: v }))
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder={t("profile.selectGender")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={Gender.Male}>
                        {t("common.gender.male")}
                      </SelectItem>
                      <SelectItem value={Gender.Female}>
                        {t("common.gender.female")}
                      </SelectItem>
                      <SelectItem value={Gender.Other}>
                        {t("common.gender.other")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    {t("profile.dateOfBirth")}
                  </label>
                  <Input
                    name="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    className="mt-1"
                  />
                </div>
              </div>
              <Button
                onClick={handleSaveProfile}
                disabled={profileLoading}
                className="mt-6 bg-red-600 hover:bg-red-700 text-white"
              >
                {profileLoading ? t("common.saving") : t("common.save")}
              </Button>
            </div>
          )}

          {/* Address tab */}
          {activeTab === "address" && (
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">
                  {t("profile.addresses")}
                </h2>
                <Button
                  onClick={() => {
                    setEditingAddress(undefined);
                    setAddressDialogOpen(true);
                  }}
                  variant="outline"
                  size="sm"
                >
                  {t("profile.addAddress")}
                </Button>
              </div>

              <div className="space-y-4">
                {(user?.addresses || []).map((addr, idx) => (
                  <div key={addr.id || idx} className="p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={addr.isDefault}
                        onChange={() => setDefaultOnServer(idx)}
                      />
                      <label className="text-sm font-medium">
                        {t("profile.defaultAddress")}
                      </label>
                      <div className="ml-auto">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingAddressIndex(idx);
                            setEditingAddress(addr);
                            setAddressDialogOpen(true);
                          }}
                        >
                          {t("common.edit")}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => requestDelete(idx)}
                          className="text-red-600"
                        >
                          {t("common.delete")}
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mt-3">
                      <div>
                        <div className="text-sm font-medium">
                          {t("profile.contactName")}
                        </div>
                        <div className="mt-1">{addr.contactName || "-"}</div>
                      </div>

                      <div>
                        <div className="text-sm font-medium">
                          {t("profile.contactPhone")}
                        </div>
                        <div className="mt-1">{addr.contactPhone || "-"}</div>
                      </div>

                      <div>
                        <div className="text-sm font-medium">
                          {t("profile.addressLine")}
                        </div>
                        <div className="mt-1">{addr.addressLine || "-"}</div>
                      </div>

                      <div>
                        <div className="text-sm font-medium">
                          {t("profile.provinceWard")}
                        </div>
                        <div className="mt-1">
                          {addr.province || "-"}
                          {addr.wards ? ` - ${addr.wards}` : ""}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <AddressDialog
                open={addressDialogOpen}
                onOpenChange={setAddressDialogOpen}
                initial={editingAddress}
                onSave={saveAddressFromDialog}
                title={
                  editingAddressIndex === null
                    ? t("profile.addAddress")
                    : t("profile.updateAddress")
                }
              />

              <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {confirmType === "delete"
                        ? t("common.confirmDelete")
                        : t("common.confirmSave")}
                    </DialogTitle>
                    <DialogDescription>
                      {confirmType === "delete"
                        ? t("profile.confirmDeleteAddress")
                        : t("profile.confirmSaveChanges")}
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="ghost">{t("common.cancel")}</Button>
                    </DialogClose>
                    <Button
                      onClick={async () => {
                        if (confirmType === "delete")
                          await performDeleteConfirmed();
                        else if (confirmType === "save-bulk")
                          await handleSaveAddressesConfirmed();
                      }}
                      className="bg-red-600 text-white"
                    >
                      {t("common.confirm")}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          )}

          {activeTab === "password" && (
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h2 className="text-lg font-semibold mb-6">
                {t("profile.changePassword")}
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    {t("profile.currentPassword")}
                  </label>
                  <Input
                    name="oldPassword"
                    type="password"
                    value={passwordData.oldPassword}
                    onChange={handlePasswordChange}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    {t("profile.newPassword")}
                  </label>
                  <Input
                    name="newPassword"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    {t("profile.confirmNewPassword")}
                  </label>
                  <Input
                    name="confirmNewPassword"
                    type="password"
                    value={passwordData.confirmNewPassword}
                    onChange={handlePasswordChange}
                    className="mt-1"
                  />
                </div>
              </div>
              <Button
                onClick={handleChangePassword}
                disabled={passwordLoading}
                className="mt-6 bg-red-600 text-white"
              >
                {passwordLoading
                  ? t("common.updating")
                  : t("profile.updatePassword")}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
