"use client";

import { useTranslations } from "next-intl";
import { Spinner } from "@/components/ui/spinner";

export default function Loading() {
  const t = useTranslations("common");

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <Spinner className="w-12 h-12" />
        <p className="text-muted-foreground">{t("loading")}</p>
      </div>
    </div>
  );
}
