"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  const t = useTranslations("errors");

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-6">
        <h1 className="text-6xl font-bold text-primary">404</h1>
        <h2 className="text-2xl font-semibold">{t("pageNotFound")}</h2>
        <p className="text-muted-foreground">{t("somethingWentWrong")}</p>
        <Link href="/">
          <Button>{t("tryAgain")}</Button>
        </Link>
      </div>
    </div>
  );
}
