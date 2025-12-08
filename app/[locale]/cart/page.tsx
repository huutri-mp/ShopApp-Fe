"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";

export default function CartPage() {
  const t = useTranslations();

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">{t("cart.title")}</h1>

        {/* Empty cart state */}
        <div className="text-center py-16">
          <p className="text-xl text-muted-foreground mb-6">
            {t("cart.emptyCart")}
          </p>
          <Link href="/">
            <Button>{t("cart.continueShopping")}</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
