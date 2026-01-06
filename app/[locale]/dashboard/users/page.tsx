"use client";

import { useEffect, useState, ChangeEvent } from "react";
import { useTranslations } from "next-intl";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/data/useAuth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus } from "lucide-react";
import { useUsersQuery, useDeleteUserMutation } from "@/hooks/data/useUser";
import useUser from "@/hooks/data/useUser";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import UserDataTable from "@/app/components/UserDataTable";
import { Role } from "@/lib/enums";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDebounce } from "@/hooks/useDebounce";

export default function UsersManagementPage() {
  const t = useTranslations();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const deleteUserMutation = useDeleteUserMutation();
  const { updateProfile } = useUser();
  const { updateAuthUser, register } = useAuth();
  const { toast } = useToast();
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [editUser, setEditUser] = useState<any | null>(null);
  const [editAvatarPreview, setEditAvatarPreview] = useState<string | null>(
    null
  );
  const [editOriginal, setEditOriginal] = useState<any | null>(null);
  const [form, setForm] = useState({
    userName: "",
    email: "",
    password: "",
    fullName: "",
    phoneNumber: "",
    role: "",
    enabled: true,
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ [k: string]: string }>({});
  const [keyword, setKeyword] = useState("");
  const debouncedKeyword = useDebounce(keyword, 400);
  const [roleFilter, setRoleFilter] = useState("");
  const [sort, setSort] = useState("");
  const [enabledFilter, setEnabledFilter] = useState<string>("");

  const usersQuery = useUsersQuery(
    page,
    pageSize,
    debouncedKeyword,
    roleFilter,
    sort,
    enabledFilter === "" ? undefined : enabledFilter === "true"
  );
  const users = usersQuery.data?.items || [];

  useEffect(() => {
    if (!avatarFile) {
      setAvatarPreview(null);
      return;
    }
    const url = URL.createObjectURL(avatarFile);
    setAvatarPreview(url);
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [avatarFile]);

  useEffect(() => {
    if (!openAdd) {
      setAvatarFile(null);
      setAvatarPreview(null);
    }
  }, [openAdd]);

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCancel = () => {
    setOpenAdd(false);
  };

  const handleSave = async () => {
    const newErrors: any = {};
    if (!form.userName) newErrors.userName = t("validation.required");
    if (!form.email) newErrors.email = t("validation.required");
    if (!form.password) newErrors.password = t("validation.required");
    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return;
    }

    await register(
      {
        userName: form.userName,
        email: form.email,
        password: form.password,
        fullName: form.fullName || undefined,
        phoneNumber: form.phoneNumber || undefined,
        role: form.role ? (form.role as Role) : undefined,
      },
      avatarFile
    );

    if (usersQuery?.refetch) await usersQuery.refetch();

    setForm({
      userName: "",
      email: "",
      password: "",
      fullName: "",
      phoneNumber: "",
      role: "",
      enabled: true,
    });
    setErrors({});
    setAvatarFile(null);
    setOpenAdd(false);
  };

  const openEditDialog = (id: number) => {
    const u = users.find((x: any) => x.userId === id || x.id === id) ?? null;
    setEditUser(
      u ?? {
        userId: id,
        fullName: "",
        email: "",
        role: "",
        phoneNumber: "",
      }
    );
    setEditAvatarPreview(u?.avatar ?? null);
    setEditOriginal(u ? { ...u } : null);
    setOpenEdit(true);
  };

  const handleEditSave = async () => {
    if (!editUser) return;
    const { userId, id: uid, fullName, email } = editUser;
    const targetId = userId ?? uid;
    try {
      const profilePayload: any = {};
      const orig = editOriginal;
      if ((fullName || "") !== (orig?.fullName || "")) {
        profilePayload.fullName = fullName || undefined;
      }
      if ((email || "") !== (orig?.email || "")) {
        profilePayload.email = email || undefined;
      }
      if (((editUser as any).phoneNumber || "") !== (orig?.phoneNumber || "")) {
        profilePayload.phoneNumber = (editUser as any).phoneNumber || undefined;
      }

      const hasAvatarChange = Object.prototype.hasOwnProperty.call(
        editUser,
        "avatarFile"
      );

      let updated: any = null;
      if (Object.keys(profilePayload).length > 0 || hasAvatarChange) {
        const avatarFileVal = (editUser as any).avatarFile ?? undefined;
        if (hasAvatarChange && avatarFileVal === null) {
          profilePayload.avatar = null;
        }
        updated = await updateProfile(
          profilePayload,
          avatarFileVal,
          Number(targetId)
        );
      }

      const authPayload: any = {};
      if (((editUser as any).role ?? "") !== (orig?.role ?? "")) {
        const newRole = (editUser as any).role;
        if (Array.isArray(newRole)) {
          if (newRole.length) authPayload.role = String(newRole[0]);
        } else if (newRole) {
          authPayload.role = String(newRole);
        }
      }
      if (
        typeof (editUser as any).enabled !== "undefined" &&
        Boolean((editUser as any).enabled) !== Boolean(orig?.enabled)
      ) {
        authPayload.enabled = Boolean((editUser as any).enabled);
      }

      if (Object.keys(authPayload).length) {
        try {
          await updateAuthUser(Number(targetId), authPayload);
        } catch (err: any) {
          console.error(
            "updateAuthUser error",
            err?.response?.data ?? err?.message ?? err
          );
          throw err;
        }
      }

      if (usersQuery?.refetch) await usersQuery.refetch();
      toast({
        title: t("common.success"),
        description: t("profile.updateSuccess"),
      });
      setOpenEdit(false);
      setEditUser(null);
      if (editAvatarPreview && (editUser as any).avatarFile)
        URL.revokeObjectURL(editAvatarPreview);
      setEditAvatarPreview(null);
      return updated;
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: t("common.error"),
        description:
          err.response?.data?.message ||
          err.message ||
          t("errors.somethingWentWrong"),
      });
      throw err;
    }
  };

  useEffect(() => {
    if (!openEdit) {
      if (editAvatarPreview) {
        try {
          URL.revokeObjectURL(editAvatarPreview);
        } catch (e) {}
      }
      setEditAvatarPreview(null);
      setEditUser(null);
    }
  }, [openEdit]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">{t("dashboard.users")}</h1>
          <p className="text-muted-foreground mt-1">
            {t("dashboard.manageUsersDescription")}
          </p>
        </div>
        <Dialog open={openAdd} onOpenChange={setOpenAdd}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus size={16} /> {t("common.addUser")}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] flex flex-col">
            <DialogHeader>
              <DialogTitle>{t("common.addUser")}</DialogTitle>
            </DialogHeader>
            <div className="flex-1 space-y-3 overflow-y-auto pr-2">
              <div className="space-y-1">
                <label className="text-sm font-medium">
                  {t("common.username")} <span className="text-red-500">*</span>
                </label>
                <Input
                  name="userName"
                  placeholder={t("common.usernamePlaceholder")}
                  value={form.userName}
                  onChange={onChange}
                />
                {errors.userName && (
                  <p className="text-xs text-destructive">{errors.userName}</p>
                )}
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">
                  {t("common.fullName")}
                </label>
                <Input
                  name="fullName"
                  placeholder={t("common.fullNamePlaceholder")}
                  value={form.fullName}
                  onChange={onChange}
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">
                  {t("common.phone")}
                </label>
                <Input
                  name="phoneNumber"
                  placeholder={t("common.phonePlaceholder")}
                  value={form.phoneNumber}
                  onChange={onChange}
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">
                  {t("common.email")} <span className="text-red-500">*</span>
                </label>
                <Input
                  name="email"
                  type="email"
                  placeholder={t("common.emailPlaceholder")}
                  value={form.email}
                  onChange={onChange}
                />
                {errors.email && (
                  <p className="text-xs text-destructive">{errors.email}</p>
                )}
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">
                  {t("common.password")} <span className="text-red-500">*</span>
                </label>
                <Input
                  name="password"
                  type="password"
                  placeholder={t("common.passwordPlaceholder")}
                  value={form.password}
                  onChange={onChange}
                />
                {errors.password && (
                  <p className="text-xs text-destructive">{errors.password}</p>
                )}
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">
                  {t("common.role")}
                </label>
                <Select
                  value={form.role ? String(form.role) : "none"}
                  onValueChange={(v) =>
                    setForm((prev) => ({
                      ...prev,
                      role: v === "none" ? "" : (v as Role),
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={t("common.roleOptionalPlaceholder")}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">
                      <span className="text-muted-foreground">
                        {t("common.none")}
                      </span>
                    </SelectItem>
                    <SelectItem value={Role.ADMIN}>
                      {t("roles.admin")}
                    </SelectItem>
                    {/* <SelectItem value={Role.STAFF}>
                      {t("roles.staff")}
                    </SelectItem> */}
                    <SelectItem value={Role.USER}>{t("roles.user")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">
                  {t("common.avatarOptional")}
                </label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setAvatarFile(
                      e.target.files?.[0] ? e.target.files[0] : null
                    )
                  }
                />
                {avatarPreview && (
                  <div className="mt-2 flex items-center gap-3">
                    <img
                      src={avatarPreview}
                      alt="avatar preview"
                      className="w-16 h-16 rounded object-cover border"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setAvatarFile(null);
                        setAvatarPreview(null);
                      }}
                    >
                      {t("common.remove")}
                    </Button>
                  </div>
                )}
              </div>
            </div>
            <div className="pt-4 border-t flex justify-end gap-2">
              <Button variant="outline" onClick={handleCancel}>
                {t("common.cancel")}
              </Button>
              <Button onClick={handleSave}>{t("common.save")}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div className="flex justify-center gap-2 mb-4 border-b pb-4">
        <Input
          placeholder={t("common.searchUser")}
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          className="flex-1"
        />
        <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v)}>
          <SelectTrigger>
            <SelectValue placeholder={t("common.roleOptionalPlaceholder")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={Role.ADMIN}>{t("roles.admin")}</SelectItem>
            {/* <SelectItem value={Role.STAFF}>{t("roles.staff")}</SelectItem> */}
            <SelectItem value={Role.USER}>{t("roles.user")}</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={enabledFilter}
          onValueChange={(v) => setEnabledFilter(v)}
        >
          <SelectTrigger>
            <SelectValue placeholder={t("common.enabledStatus")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="true">{t("common.enabled")}</SelectItem>
            <SelectItem value="false">{t("common.disabled")}</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sort} onValueChange={(v) => setSort(v)}>
          <SelectTrigger>
            <SelectValue placeholder={t("common.sortBy")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="asc">{t("common.userName")} (A → Z)</SelectItem>
            <SelectItem value="desc">{t("common.userName")} (Z → A)</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          onClick={() => {
            setKeyword("");
            setRoleFilter("");
            setEnabledFilter("");
            setSort("");
          }}
        >
          {t("common.resetFilter", { defaultValue: "Reset Filter" })}
        </Button>
      </div>

      <Card>
        <CardContent>
          <UserDataTable
            users={users}
            total={usersQuery.data?.total ?? users.length}
            page={page + 1}
            pageSize={pageSize}
            onDeleted={async (id: number) =>
              await deleteUserMutation.mutateAsync(id)
            }
            onEdit={(id: number) => {
              openEditDialog(id);
            }}
            onPageChange={(p: number, s: number) => {
              setPage(p - 1);
              setPageSize(s);
            }}
          />
          <Dialog open={openEdit} onOpenChange={setOpenEdit}>
            <DialogContent className="max-w-lg max-h-[90vh] flex flex-col">
              <DialogHeader>
                <DialogTitle>Edit User</DialogTitle>
              </DialogHeader>
              <div className="flex-1 space-y-3 overflow-y-auto pr-2">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Full name</label>
                  <Input
                    value={editUser?.fullName ?? ""}
                    onChange={(e) =>
                      setEditUser((prev: any) => ({
                        ...prev,
                        fullName: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Email</label>
                  <Input
                    value={editUser?.email ?? ""}
                    onChange={(e) =>
                      setEditUser((prev: any) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Phone</label>
                  <Input
                    value={editUser?.phoneNumber ?? ""}
                    onChange={(e) =>
                      setEditUser((prev: any) => ({
                        ...prev,
                        phoneNumber: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Role</label>
                  <Select
                    value={editUser?.role ? String(editUser.role) : "none"}
                    onValueChange={(v) =>
                      setEditUser((prev: any) => ({
                        ...prev,
                        role: v === "none" ? "" : v,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Role (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value={Role.ADMIN}>
                        {t("roles.admin")}
                      </SelectItem>
                      {/* <SelectItem value={Role.STAFF}>{t("roles.staff")}</SelectItem> */}
                      <SelectItem value={Role.USER}>
                        {t("roles.user")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Enabled</label>
                  <Select
                    value={editUser?.enabled ? "yes" : "no"}
                    onValueChange={(v) =>
                      setEditUser((prev: any) => ({
                        ...prev,
                        enabled: v === "yes" ? true : false,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Enabled" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Yes</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Avatar</label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const f = e.target.files?.[0] ?? null;
                      setEditUser((prev: any) => ({
                        ...prev,
                        avatarFile: f,
                      }));
                      if (f) {
                        const url = URL.createObjectURL(f);
                        setEditAvatarPreview(url);
                      } else {
                        setEditAvatarPreview(editUser?.avatar ?? null);
                      }
                    }}
                  />
                  {editAvatarPreview && (
                    <div className="mt-2 flex items-center gap-3">
                      <img
                        src={editAvatarPreview}
                        alt="avatar preview"
                        className="w-16 h-16 rounded object-cover border"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditUser((prev: any) => ({
                            ...prev,
                            avatarFile: null,
                          }));
                          if (editUser?.avatar)
                            setEditAvatarPreview(editUser.avatar);
                          else setEditAvatarPreview(null);
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  )}
                </div>
              </div>
              <div className="pt-4 border-t flex justify-end gap-2">
                <Button variant="outline" onClick={() => setOpenEdit(false)}>
                  Cancel
                </Button>
                <Button onClick={handleEditSave}>Save</Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
}
