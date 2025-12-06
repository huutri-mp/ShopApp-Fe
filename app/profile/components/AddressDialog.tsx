"use client";

import { useEffect, useMemo, useRef } from "react";
import { useForm } from "react-hook-form";
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
  const defaultValues = {
    contactName: "",
    contactPhone: "",
    addressLine1: "",
    province: "",
    wards: "",
    isDefault: false,
  };

  const { register, setValue, watch, reset, handleSubmit, getValues } = useForm<
    Partial<Address>
  >({
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
      merged.addressLine1 !== current.addressLine1 ||
      merged.province !== current.province ||
      merged.wards !== current.wards ||
      Boolean(merged.isDefault) !== Boolean(current.isDefault);
    if (differs) reset(merged);
  }, [open, initial?.id, initial?.province, initial?.wards, reset]);

  const onSubmit = async (data: Partial<Address>) => {
    await onSave(data);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {title ?? (initial?.id ? "Cập nhật Địa Chỉ" : "Thêm Địa Chỉ")}
          </DialogTitle>
          <DialogDescription>Nhập thông tin địa chỉ</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 mt-4">
          <div>
            <label className="text-sm">Tên liên hệ</label>
            <Input {...register("contactName")} className="mt-1" />
          </div>

          <div>
            <label className="text-sm">Số điện thoại</label>
            <Input {...register("contactPhone")} className="mt-1" />
          </div>

          <div>
            <label className="text-sm">Địa chỉ 1</label>
            <Input {...register("addressLine1")} className="mt-1" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Province */}
            <div>
              <label className="text-sm">Tỉnh/Thành phố</label>

              <Select
                value={provinceName || ""}
                onValueChange={(v) => setValue("province", v)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Chọn Tỉnh/TP" />
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
              <label className="text-sm">Phường/Xã</label>

              <Select
                disabled={!provinceName || isLoadingWards}
                value={wardName || ""}
                onValueChange={(v) => setValue("wards", v)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue
                    placeholder={
                      !provinceName
                        ? "Chọn Tỉnh trước"
                        : isLoadingWards
                        ? "Đang tải..."
                        : "Chọn Phường/Xã"
                    }
                  />
                </SelectTrigger>

                <SelectContent>
                  {isLoadingWards ? (
                    <div className="p-3 text-sm text-muted-foreground">
                      Đang tải...
                    </div>
                  ) : displayWards.length === 0 ? (
                    <div className="p-3 text-sm text-muted-foreground">
                      Không có dữ liệu
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
              onChange={(e) => setValue("isDefault", e.target.checked)}
            />
            <label htmlFor="isDefaultCheckbox" className="text-sm">
              Đặt làm mặc định
            </label>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="ghost">Hủy</Button>
            </DialogClose>
            <Button type="submit" className="bg-red-600 text-white">
              Lưu
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default memo(AddressDialog);
