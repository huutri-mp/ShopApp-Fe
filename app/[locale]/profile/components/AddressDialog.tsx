"use client";

import { useEffect, useMemo, useRef } from "react";
import { useForm } from "react-hook-form";
import { useTranslations } from "next-intl";
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
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { useRegion, Province, Ward } from "@/hooks/data/useRegion";
import type { Address } from "@/hooks/data/useAddress";
import { memo } from "react";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: Partial<Address>;
  onSave: (addr: Partial<Address>) => Promise<void>;
  title?: string;
};

function AddressDialog({
  open,
  onOpenChange,
  initial = {},
  onSave,
  title,
}: Props) {
  const t = useTranslations();
  const defaultValues = {
    contactName: "",
    contactPhone: "",
    addressLine: "",
    province: "",
    wards: "",
    isDefault: false,
  };

  const {
    register,
    setValue,
    watch,
    reset,
    handleSubmit,
    getValues,
    formState: { errors, dirtyFields },
  } = useForm<Partial<Address>>({
    defaultValues,
  });
  const provinceName = watch("province");
  const wardName = watch("wards");
  const { provinces } = useRegion(undefined);

  const provinceCode = useMemo(() => {
    const province = provinces?.find((p) => p.name === provinceName);
    return province ? String(province.code) : undefined;
  }, [provinceName, provinces]);

  const { wards = [], isLoadingWards } = useRegion(provinceCode);
  const displayWards = wards;

  useEffect(() => {
    if (!open) return;
    const merged = { ...defaultValues, ...(initial || {}) };
    const current = getValues();
    const differs =
      merged.contactName !== current.contactName ||
      merged.contactPhone !== current.contactPhone ||
      merged.addressLine !== current.addressLine ||
      merged.province !== current.province ||
      merged.wards !== current.wards ||
      Boolean(merged.isDefault) !== Boolean(current.isDefault);
    if (differs) {
      reset(merged);
    }
  }, [open, initial?.id, initial?.province, initial?.wards, reset]);
  const onSubmit = async (data: Partial<Address>) => {
    let changedFields: Partial<Address> = {
      ...(dirtyFields.contactName && { contactName: data.contactName }),
      ...(dirtyFields.contactPhone && { contactPhone: data.contactPhone }),
      ...(dirtyFields.addressLine && { addressLine: data.addressLine }),
      ...((dirtyFields.province || data.province !== initial?.province) && {
        province: data.province,
      }),
      ...((dirtyFields.wards || data.wards !== initial?.wards) && {
        wards: data.wards,
      }),
      ...((dirtyFields.isDefault || data.isDefault !== initial?.isDefault) && {
        isDefault: data.isDefault,
      }),
      ...(initial?.id && { id: initial.id }),
    };

    if (!initial?.id) {
      changedFields = {
        contactName: data.contactName,
        contactPhone: data.contactPhone,
        addressLine: data.addressLine,
        province: data.province,
        wards: data.wards,
        isDefault: data.isDefault,
      };
    }

    await onSave(changedFields);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {title ??
              (initial?.id
                ? t("profile.updateAddress")
                : t("profile.addAddress"))}
          </DialogTitle>
          <DialogDescription>{t("profile.enterAddressInfo")}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 mt-4">
          <div>
            <label className="text-sm">
              {t("profile.contactName")} <span className="text-red-600">*</span>
            </label>
            <Input
              {...register("contactName", {
                required: t("validation.required"),
                minLength: {
                  value: 2,
                  message: t("validation.minLength", { min: 2 }),
                },
              })}
              className={`mt-1 ${errors.contactName ? "border-red-500" : ""}`}
            />
            {errors.contactName && (
              <p className="text-red-600 text-xs mt-1">
                {errors.contactName.message}
              </p>
            )}
          </div>

          <div>
            <label className="text-sm">
              {t("profile.contactPhone")}{" "}
              <span className="text-red-600">*</span>
            </label>
            <Input
              {...register("contactPhone", {
                required: t("validation.required"),
                pattern: {
                  value: /^[0-9]{10,11}$/,
                  message: t("validation.invalidPhoneNumber"),
                },
              })}
              className={`mt-1 ${errors.contactPhone ? "border-red-500" : ""}`}
            />
            {errors.contactPhone && (
              <p className="text-red-600 text-xs mt-1">
                {errors.contactPhone.message}
              </p>
            )}
          </div>

          <div>
            <label className="text-sm">
              {t("profile.addressLine")} <span className="text-red-600">*</span>
            </label>
            <Input
              {...register("addressLine", {
                required: t("validation.required"),
              })}
              className={`mt-1 ${errors.addressLine ? "border-red-500" : ""}`}
            />
            {errors.addressLine && (
              <p className="text-red-600 text-xs mt-1">
                {errors.addressLine.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Province */}
            <div>
              <label className="text-sm">{t("profile.province")}</label>

              <Select
                value={provinceName || ""}
                onValueChange={(v) =>
                  setValue("province", v, { shouldDirty: true })
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder={t("profile.selectProvince")} />
                </SelectTrigger>
                <SelectContent>
                  {provinces?.map((p: Province) => (
                    <SelectItem key={p.code} value={p.name}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Ward */}
            <div>
              <label className="text-sm">{t("profile.ward")}</label>

              <Select
                disabled={!provinceName || isLoadingWards}
                value={wardName || ""}
                onValueChange={(v) =>
                  setValue("wards", v, { shouldDirty: true })
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue
                    placeholder={
                      !provinceName
                        ? t("profile.selectProvinceFirst")
                        : isLoadingWards
                        ? t("common.loading")
                        : t("profile.selectWard")
                    }
                  />
                </SelectTrigger>

                <SelectContent>
                  {isLoadingWards ? (
                    <div className="p-3 text-sm text-muted-foreground">
                      {t("common.loading")}
                    </div>
                  ) : displayWards.length === 0 ? (
                    <div className="p-3 text-sm text-muted-foreground">
                      {t("profile.noData")}
                    </div>
                  ) : (
                    displayWards.map((w: Ward) => (
                      <SelectItem key={w.code} value={w.name}>
                        {w.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isDefaultCheckbox"
              checked={watch("isDefault")}
              onChange={(e) =>
                setValue("isDefault", e.target.checked, { shouldDirty: true })
              }
            />
            <label htmlFor="isDefaultCheckbox" className="text-sm">
              {t("profile.setDefaultAddress")}
            </label>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="ghost">{t("common.cancel")}</Button>
            </DialogClose>
            <Button type="submit" className="bg-red-600 text-white">
              {t("common.save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default memo(AddressDialog);
