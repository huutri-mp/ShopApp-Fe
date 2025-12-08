"use client";

import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/routing";
import { useAuth } from "@/hooks/data/useAuth";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";
import useAppStore from "@/hooks/useAppStore";
import LanguageSwitcher from "./LanguageSwitcher";

export default function DashboardHeader() {
  const t = useTranslations();
  const { logout } = useAuth();
  const { user } = useAppStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/auth/login");
  };

  return (
    <header className="border-b border-border bg-card">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/dashboard" className="text-2xl font-bold text-primary">
          {t("dashboard.title")}
        </Link>

        <div className="flex items-center gap-4">
          <LanguageSwitcher />
          <div className="flex items-center gap-2 text-sm">
            <User size={18} />
            <span className="font-medium">{user?.fullName || user?.email}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="gap-2 bg-transparent"
          >
            <LogOut size={16} />
            {t("header.logout")}
          </Button>
        </div>
      </div>
    </header>
  );
}
