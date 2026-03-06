"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import AddressDialog from "../AddressDialog";
import type { Address } from "@/hooks/data/useAddress";

type ConfirmType = "delete" | "save-dialog" | "save-bulk" | null;

type Props = {
  addresses: Address[];
  editingAddressIndex: number | null;
  editingAddress: Partial<Address> | undefined;
  addressDialogOpen: boolean;
  confirmOpen: boolean;
  confirmType: ConfirmType;
  setAddressDialogOpen: (open: boolean) => void;
  setConfirmOpen: (open: boolean) => void;
  onOpenAddAddress: () => void;
  onOpenEditAddress: (idx: number, addr: Address) => void;
  onRequestDelete: (idx: number) => void;
  onToggleDefault: (idx: number) => void;
  onSaveAddress: (payload: Partial<Address>) => Promise<void>;
  onConfirmDelete: () => Promise<void>;
  onConfirmSaveBulk: () => Promise<void>;
};

export default function AddressTab({
  addresses,
  editingAddressIndex,
  editingAddress,
  addressDialogOpen,
  confirmOpen,
  confirmType,
  setAddressDialogOpen,
  setConfirmOpen,
  onOpenAddAddress,
  onOpenEditAddress,
  onRequestDelete,
  onToggleDefault,
  onSaveAddress,
  onConfirmDelete,
  onConfirmSaveBulk,
}: Props) {
  const t = useTranslations();

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">{t("profile.addresses")}</h2>
        <Button onClick={onOpenAddAddress} variant="outline" size="sm">
          {t("profile.addAddress")}
        </Button>
      </div>

      <div className="space-y-4">
        {addresses.map((addr, idx) => (
          <div key={addr.id || idx} className="p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={Boolean(addr.isDefault)}
                onChange={() => onToggleDefault(idx)}
              />
              <label className="text-sm font-medium">
                {t("profile.defaultAddress")}
              </label>
              <div className="ml-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onOpenEditAddress(idx, addr)}
                >
                  {t("common.edit")}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRequestDelete(idx)}
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
        onSave={onSaveAddress}
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
                if (confirmType === "delete") await onConfirmDelete();
                else if (confirmType === "save-bulk") await onConfirmSaveBulk();
              }}
              className="bg-red-600 text-white"
            >
              {t("common.confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
