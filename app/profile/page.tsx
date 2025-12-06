"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import useAppStore from "@/hooks/useAppStore";
import useUser from "@/hooks/data/useUser";
import useAddress, { Address } from "@/hooks/data/useAddress";
import type { User } from "@/hooks/data/useAuth";
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
  const user = useAppStore((s) => s.user);
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  const setUser = useAppStore((s) => s.setUser);

  const [activeTab, setActiveTab] = useState("profile");
  // Render profile info directly from store; no local form state
  const [file, setFile] = useState<File | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordLoading, setPasswordLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const { updateProfile } = useUser();
  const { createAddress, updateAddress, deleteAddress } = useAddress();

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
      console.error("Confirmed delete failed", err);
    } finally {
      setProfileLoading(false);
      setConfirmIndex(null);
      setConfirmType(null);
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
    if (f) {
      uploadAvatarImmediate(f);
    } else {
      // No local preview; rely on store avatar
    }
  };

  // Rendering addresses directly from store; no local mutation helper needed.

  const removeAddress = async (index: number) => {
    const addr = (user?.addresses || [])[index];
    if (!addr) return;
    try {
      if (addr.id) {
        await deleteAddress(addr.id);
      }
    } catch (err) {
      console.error("Delete address failed", err);
    }
  };

  const setDefaultOnServer = async (index: number) => {
    const addr = (user?.addresses || [])[index];
    if (!addr || !addr.id) return;
    setProfileLoading(true);
    try {
      await updateAddress(addr.id, { ...addr, isDefault: true });
    } catch (err) {
      console.error("Set default address failed", err);
    } finally {
      setProfileLoading(false);
    }
  };
  const uploadAvatarImmediate = async (f: File) => {
    try {
      const updated = await updateProfile({}, f);
      // Avatar is updated in store by updateProfile; UI reads directly
    } catch (err) {
      throw err;
    }
  };

  const handleSaveProfile = async () => {
    setProfileLoading(true);
    try {
      // Read current values from inputs via the DOM
      const fullName = (
        document.querySelector(
          'input[name="fullName"]'
        ) as HTMLInputElement | null
      )?.value;
      const email = (
        document.querySelector('input[name="email"]') as HTMLInputElement | null
      )?.value;
      const phoneNumber = (
        document.querySelector(
          'input[name="phoneNumber"]'
        ) as HTMLInputElement | null
      )?.value;
      const dateOfBirth = (
        document.querySelector(
          'input[name="dateOfBirth"]'
        ) as HTMLInputElement | null
      )?.value;
      const genderValue = (
        document.querySelector("[data-profile-gender]") as HTMLElement | null
      )?.getAttribute("data-value");
      const payload = {
        fullName: fullName ?? user?.fullName,
        email: email ?? user?.email,
        phoneNumber: phoneNumber ?? user?.phoneNumber,
        gender: genderValue
          ? String(genderValue).toUpperCase()
          : user?.gender
          ? String(user.gender).toUpperCase()
          : undefined,
        dateOfBirth: dateOfBirth ?? user?.dateOfBirth,
      };
      const updated = await updateProfile(payload, file ?? undefined);
      if (updated) setUser(updated);
    } catch (err) {
      console.error("Update profile failed", err);
    } finally {
      setProfileLoading(false);
    }
  };

  const handleSaveAddresses = async () => {
    setConfirmType("save-bulk");
    setConfirmOpen(true);
  };

  const handleSaveAddressesConfirmed = async () => {
    setConfirmOpen(false);
    setProfileLoading(true);
    try {
      for (const a of user?.addresses || []) {
        if (a.id) await updateAddress(a.id, { ...a });
      }
    } catch (err) {
      console.error("Update addresses failed", err);
    } finally {
      setProfileLoading(false);
      setConfirmType(null);
    }
  };

  // Save handler used by AddressDialog (receives converted payload with names)
  const saveAddressFromDialog = async (payload: Partial<Address>) => {
    setProfileLoading(true);
    try {
      if (editingAddressIndex === null) {
        await createAddress(payload as any);
      } else {
        const existing = (user?.addresses || [])[editingAddressIndex];
        if (existing && existing.id) {
          await updateAddress(existing.id, { ...existing, ...payload });
        }
      }
      setEditingAddress({});
      setEditingAddressIndex(null);
    } catch (err) {
      console.error("Save address failed", err);
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    setPasswordLoading(true);
    try {
      console.log("Change password:", passwordData);
      alert("Password changed successfully");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      console.error("Change password failed", err);
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
      <Sidebar user={user!} activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="flex-1">
        <ProfileHeader
          user={user!}
          preview={user?.avatar || null}
          fileInputRef={fileInputRef}
          handleFileChange={handleFileChange}
        />

        <div className="p-8 max-w-full">
          {/* Profile tab */}
          {activeTab === "profile" && (
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h2 className="text-lg font-semibold mb-6">Thông Tin Cá Nhân</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Tên đăng nhập
                  </label>
                  <Input
                    value={user.userName || "-"}
                    disabled
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Tên
                  </label>
                  <Input
                    name="fullName"
                    defaultValue={user?.fullName ?? ""}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <Input
                    name="email"
                    type="email"
                    defaultValue={user?.email ?? ""}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Số điện thoại
                  </label>
                  <Input
                    name="phoneNumber"
                    defaultValue={user?.phoneNumber ?? ""}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Giới tính
                  </label>
                  <Select
                    value={String(user?.gender ?? "").toLowerCase()}
                    onValueChange={(v) => {
                      const el = document.querySelector(
                        "[data-profile-gender]"
                      ) as HTMLElement | null;
                      if (el) el.setAttribute("data-value", v);
                    }}
                  >
                    <SelectTrigger className="mt-1" data-profile-gender>
                      <SelectValue placeholder="Chọn giới tính" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={Gender.Male}>Nam</SelectItem>
                      <SelectItem value={Gender.Female}>Nữ</SelectItem>
                      <SelectItem value={Gender.Other}>Khác</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Ngày sinh
                  </label>
                  <Input
                    name="dateOfBirth"
                    type="date"
                    defaultValue={user?.dateOfBirth ?? ""}
                    className="mt-1"
                  />
                </div>
              </div>
              <Button
                onClick={handleSaveProfile}
                disabled={profileLoading}
                className="mt-6 bg-red-600 hover:bg-red-700 text-white"
              >
                {profileLoading ? "Đang lưu..." : "Lưu"}
              </Button>
            </div>
          )}

          {/* Address tab */}
          {activeTab === "address" && (
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">Địa Chỉ</h2>
                <Button
                  onClick={() => {
                    setEditingAddress(undefined);
                    setAddressDialogOpen(true);
                  }}
                  variant="outline"
                  size="sm"
                >
                  Thêm Địa Chỉ
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
                        Địa chỉ mặc định
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
                          Sửa
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => requestDelete(idx)}
                          className="text-red-600"
                        >
                          Xóa
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mt-3">
                      <div>
                        <div className="text-sm font-medium">Tên liên hệ</div>
                        <div className="mt-1">{addr.contactName || "-"}</div>
                      </div>

                      <div>
                        <div className="text-sm font-medium">Số điện thoại</div>
                        <div className="mt-1">{addr.contactPhone || "-"}</div>
                      </div>

                      <div>
                        <div className="text-sm font-medium">Địa chỉ</div>
                        <div className="mt-1">
                          {addr.addressLine1 || "-"}
                          {addr.addressLine2 ? `, ${addr.addressLine2}` : ""}
                        </div>
                      </div>

                      <div>
                        <div className="text-sm font-medium">Tỉnh / Phường</div>
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
                    ? "Thêm Địa Chỉ"
                    : "Cập Nhật Địa Chỉ"
                }
              />

              <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {confirmType === "delete"
                        ? "Xác nhận xóa"
                        : "Xác nhận lưu"}
                    </DialogTitle>
                    <DialogDescription>
                      {confirmType === "delete"
                        ? "Bạn có chắc muốn xóa địa chỉ này? Hành động không thể hoàn tác."
                        : "Bạn có chắc muốn lưu các thay đổi?"}
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="ghost">Hủy</Button>
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
                      Xác nhận
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          )}

          {activeTab === "password" && (
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h2 className="text-lg font-semibold mb-6">Đổi Mật Khẩu</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Mật khẩu hiện tại
                  </label>
                  <Input
                    name="currentPassword"
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Mật khẩu mới
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
                    Xác nhận mật khẩu
                  </label>
                  <Input
                    name="confirmPassword"
                    type="password"
                    value={passwordData.confirmPassword}
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
                {passwordLoading ? "Đang cập nhật..." : "Cập Nhật Mật Khẩu"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
