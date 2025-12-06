"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/data/useAuth";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";

export default function DashboardHeader() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/auth/login");
  };

  return (
    <header className="border-b border-border bg-card">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/dashboard" className="text-2xl font-bold text-primary">
          Dashboard
        </Link>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm">
            <User size={18} />
            <span className="font-medium">{user?.name || user?.email}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="gap-2 bg-transparent"
          >
            <LogOut size={16} />
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
}
