"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Link, useRouter } from "@/i18n/routing";
import { useCart } from "@/hooks/data/useCart";
import { Spinner } from "@/components/ui/spinner";
import { formatPriceText } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import useAppStore from "@/hooks/useAppStore";
import useAddress, { type Address } from "@/hooks/data/useAddress";
import { PaymentMethod } from "@/lib/enums";
import useOrder from "@/hooks/data/useOrder";
import { useToast } from "@/hooks/use-toast";
import AddressDialog from "../profile/components/AddressDialog";
import { Banknote, CreditCard } from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { useEffect, useMemo, useState } from "react";

export default function CartPage() {
  const t = useTranslations();
  const router = useRouter();
  const { items, cartQuery, removeItem, clearCart, addToCart } = useCart();
  const { createOrder } = useOrder();
  const { toast } = useToast();
  const keyOf = (i: { productId: number; skuCode?: string }) =>
    `${i.productId}-${i.skuCode ?? ""}`;
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [confirmItem, setConfirmItem] = useState<{
    id?: number;
    name?: string;
    quantity?: number;
  } | null>(null);
  const [isConfirmOpen, setConfirmOpen] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  // Address & payment state
  const { user } = useAppStore();
  const addresses: Address[] = user?.addresses || [];
  const [selectedAddressId, setSelectedAddressId] = useState<
    number | undefined
  >(undefined);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    PaymentMethod.CASH,
  );
  const [isAddressDialogOpen, setAddressDialogOpen] = useState(false);
  const { createAddress } = useAddress();

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    const next: Record<string, boolean> = {};
    items.forEach((i) => (next[keyOf(i)] = true));
    setSelected(next);
  }, [items]);

  useEffect(() => {
    if (!addresses || addresses.length === 0) {
      setSelectedAddressId(undefined);
      return;
    }
    const def = addresses.find((a) => a.isDefault) || addresses[0];
    setSelectedAddressId((prev) => (prev !== undefined ? prev : def.id));
  }, [addresses]);

  const selectedItems = useMemo(
    () => items.filter((i) => selected[keyOf(i)]),
    [items, selected],
  );
  const selectedQuantity = useMemo(
    () => selectedItems.reduce((sum, i) => sum + i.quantity, 0),
    [selectedItems],
  );
  const subtotal = useMemo(
    () =>
      selectedItems.reduce((sum, i) => sum + (i.price ?? 0) * i.quantity, 0),
    [selectedItems],
  );
  const allSelected = items.length > 0 && selectedItems.length === items.length;
  const selectedAddress = useMemo(
    () => addresses.find((addr) => addr.id === selectedAddressId),
    [addresses, selectedAddressId],
  );

  const truncateText = (value: string, maxLength = 72) =>
    value.length > maxLength ? `${value.slice(0, maxLength)}...` : value;

  if (!hasMounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner className="size-8 text-foreground" />
      </div>
    );
  }

  if (cartQuery.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner className="size-8 text-foreground" />
      </div>
    );
  }

  if (cartQuery.isError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">{t("common.error")}</h1>
          <Link href="/" className="text-red-600 hover:text-red-700">
            {t("common.back")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">{t("cart.title")}</h1>

        {items.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-xl text-muted-foreground mb-6">
              {t("cart.emptyCart")}
            </p>
            <Link href="/">
              <Button>{t("cart.continueShopping")}</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Items */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center gap-2 bg-white rounded-lg p-3 border">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={(v) => {
                    const checked = Boolean(v);
                    const next: Record<string, boolean> = {};
                    items.forEach((i) => (next[keyOf(i)] = checked));
                    setSelected(next);
                  }}
                />
                <span className="text-sm text-gray-700 font-medium">
                  {t("cart.selectAll")}
                </span>
              </div>
              {items.map((item) => (
                <div
                  key={`${item.productId}-${item.skuCode ?? ""}`}
                  className="bg-white rounded-lg p-4 flex gap-4 items-center border"
                >
                  <Checkbox
                    checked={Boolean(selected[keyOf(item)])}
                    onCheckedChange={(v) =>
                      setSelected((prev) => ({
                        ...prev,
                        [keyOf(item)]: Boolean(v),
                      }))
                    }
                  />
                  <Link href={`/products/${item.productId}`}>
                    <img
                      src={item.imageUrl || "/placeholder.svg"}
                      alt={item.name ?? "Product"}
                      className="w-20 h-20 object-cover rounded hover:opacity-90"
                    />
                  </Link>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <div>
                        <Link
                          href={`/products/${item.productId}`}
                          className="font-semibold text-gray-900 hover:text-red-600"
                        >
                          {item.name ?? t("cart.item")}
                        </Link>
                        {item.skuCode && (
                          <p className="text-sm text-gray-500">
                            SKU: {item.skuCode}
                          </p>
                        )}
                      </div>
                      <p className="font-semibold text-red-600">
                        {formatPriceText(item.price)}
                      </p>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center border rounded-lg">
                        <Button
                          onClick={() => {
                            if (item.quantity <= 1) {
                              setConfirmItem({
                                id: item.id,
                                name: item.name,
                                quantity: item.quantity,
                              });
                              setConfirmOpen(true);
                            } else {
                              removeItem({
                                cartItemId: item.id as number,
                                quantity: 1,
                              });
                            }
                          }}
                          className="px-3 py-1"
                          variant="ghost"
                          size="sm"
                        >
                          -
                        </Button>
                        <span className="px-4 font-medium">
                          {item.quantity}
                        </span>
                        <Button
                          onClick={() =>
                            addToCart({
                              productId: item.productId,
                              skuCode: item.skuCode,
                              quantity: 1,
                            })
                          }
                          className="px-3 py-1"
                          variant="ghost"
                          size="sm"
                        >
                          +
                        </Button>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setConfirmItem({
                            id: item.id as number,
                            name: item.name,
                            quantity: item.quantity,
                          });
                          setConfirmOpen(true);
                        }}
                      >
                        {t("cart.removeItem")}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="bg-white rounded-lg p-4 h-fit space-y-4">
              <h2 className="text-xl font-bold mb-4">{t("cart.summary")}</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">{t("cart.items")}</span>
                  <span className="font-medium">{selectedQuantity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t("cart.subtotal")}</span>
                  <span className="font-semibold text-red-600">
                    {formatPriceText(subtotal)}
                  </span>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    {t("cart.shippingAddress")}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAddressDialogOpen(true)}
                  >
                    {t("cart.addAddress")}
                  </Button>
                </div>
                {addresses.length === 0 ? (
                  <div className="text-sm text-muted-foreground">
                    {t("cart.noAddress")}
                  </div>
                ) : (
                  <Select
                    value={selectedAddressId ? String(selectedAddressId) : ""}
                    onValueChange={(v) => setSelectedAddressId(Number(v))}
                  >
                    <SelectTrigger className="w-full max-w-full">
                      <SelectValue placeholder={t("cart.selectAddress")}>
                        {selectedAddress
                          ? truncateText(
                              `${selectedAddress.contactName} • ${selectedAddress.contactPhone} • ${selectedAddress.province}`,
                            )
                          : undefined}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="max-w-[calc(100vw-2rem)] sm:max-w-xl">
                      {addresses.map((addr) => (
                        <SelectItem
                          key={addr.id}
                          value={String(addr.id)}
                          className="items-start"
                        >
                          <div className="min-w-0">
                            <p className="truncate font-medium">
                              {addr.contactName} • {addr.contactPhone}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {truncateText(
                                `${addr.addressLine}${
                                  addr.wards ? `, ${addr.wards}` : ""
                                }, ${addr.province}${
                                  addr.isDefault
                                    ? ` • ${t("profile.defaultAddress")}`
                                    : ""
                                }`,
                              )}
                            </p>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {/* Payment Method */}
              <div className="space-y-2">
                <span className="text-sm font-medium text-gray-700">
                  {t("cart.paymentMethod")}
                </span>
                <RadioGroup
                  value={paymentMethod}
                  onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}
                  className="grid grid-cols-2 gap-3"
                >
                  <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer">
                    <RadioGroupItem value={PaymentMethod.CASH} />
                    <Banknote className="size-4 text-muted-foreground" />
                    <span className="text-sm">{t("cart.cash")}</span>
                  </label>
                  <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer">
                    <RadioGroupItem value={PaymentMethod.VNPAY} />
                    <CreditCard className="size-4 text-muted-foreground" />
                    <span className="text-sm">{t("cart.vnPay")}</span>
                  </label>
                </RadioGroup>
              </div>

              <div className="mt-4 flex gap-2">
                <Button variant="outline" onClick={() => clearCart()}>
                  {t("cart.clear")}
                </Button>
                <Button
                  className="flex-1"
                  disabled={createOrder.isPending}
                  onClick={async () => {
                    if (addresses.length === 0 || !selectedAddressId) {
                      setAddressDialogOpen(true);
                      return;
                    }
                    const orderItems = selectedItems.map((i) => ({
                      productId: i.productId,
                      quantity: i.quantity,
                      skuCode: i.skuCode,
                    }));
                    try {
                      const order = await createOrder.mutateAsync({
                        shippingAddress: selectedAddressId,
                        items: orderItems,
                        paymentMethod,
                      });
                      if (
                        paymentMethod === PaymentMethod.VNPAY &&
                        order?.paymentUrl
                      ) {
                        window.location.href = order.paymentUrl as string;
                        return;
                      }

                      router.push("/profile?tab=orders");
                    } catch (e) {
                      const message =
                        // @ts-ignore
                        e?.response?.data?.message ||
                        (e as any)?.message ||
                        t("errors.somethingWentWrong");
                      toast({
                        variant: "destructive",
                        title: t("common.error"),
                        description: message,
                      });
                    }
                  }}
                >
                  {createOrder.isPending
                    ? t("common.loading")
                    : t("cart.checkout")}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Address Creation Dialog */}
      <AddressDialog
        open={isAddressDialogOpen}
        onOpenChange={setAddressDialogOpen}
        onSave={async (addr) => {
          await createAddress({
            contactName: addr.contactName || "",
            contactPhone: addr.contactPhone || "",
            addressLine: addr.addressLine || "",
            province: addr.province || "",
            wards: addr.wards || "",
            isDefault: Boolean(addr.isDefault),
          });
        }}
        title={t("cart.addAddress")}
      />

      <AlertDialog open={isConfirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("cart.removeConfirm.title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("cart.removeConfirm.message")}{" "}
              {confirmItem?.name ? `(${confirmItem.name})` : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setConfirmOpen(false)}>
              {t("common.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (confirmItem?.id !== undefined) {
                  removeItem({
                    cartItemId: confirmItem.id,
                    quantity: confirmItem.quantity ?? 1,
                  });
                }
                setConfirmOpen(false);
                setConfirmItem(null);
              }}
            >
              {t("cart.remove")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
