"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  UserIcon,
  MapPin,
  Lock,
  ShoppingBag,
  Bell,
  LogOut,
} from "lucide-react";
import type { User } from "@/hooks/data/useAuth";

type Props = {
  user: User;
  activeTab: string;
  setActiveTab: (s: string) => void;
};

export default function Sidebar({ user, activeTab, setActiveTab }: Props) {
  const sidebarItems = [
    { id: "profile", label: "Hồ Sơ", icon: UserIcon, section: "account" },
    { id: "address", label: "Địa Chỉ", icon: MapPin, section: "account" },
    { id: "password", label: "Mật Khẩu", icon: Lock, section: "account" },
    { id: "orders", label: "Đơn Mua", icon: ShoppingBag, section: "orders" },
    {
      id: "notifications",
      label: "Thông Báo",
      icon: Bell,
      section: "settings",
    },
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 p-6">
      <div className="mb-8">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">
          Tài Khoản Của Tôi
        </h2>

        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg mb-6">
          <Avatar className="w-12 h-12">
            <AvatarImage
              src={user?.avatar || "avatar-placeholder.png"}
              alt="avatar"
            />
            <AvatarFallback>
              {(user?.fullName || user?.userName || "?")[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium text-gray-900">
              {user?.userName}
            </p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          </div>
        </div>
      </div>

      {["account", "orders", "settings"].map((section) => (
        <div key={section} className="mb-6">
          {section === "account" && (
            <>
              <p className="text-xs font-semibold text-gray-500 uppercase mb-3">
                Quản Lý Tài Khoản
              </p>
              <div className="space-y-2">
                {sidebarItems
                  .filter((item) => item.section === "account")
                  .map((item) => (
                    <Button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      variant="ghost"
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                        activeTab === item.id
                          ? "bg-red-50 text-red-600 font-medium"
                          : "text-gray-700 hover:bg-gray-100 hover:text-gray-700"
                      }`}
                    >
                      <item.icon className="w-4 h-4" />
                      {item.label}
                    </Button>
                  ))}
              </div>
            </>
          )}
          {section === "orders" && (
            <>
              <p className="text-xs font-semibold text-gray-500 uppercase mb-3">
                Mua Hàng
              </p>
              <div className="space-y-2">
                {sidebarItems
                  .filter((item) => item.section === "orders")
                  .map((item) => (
                    <Button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      variant="ghost"
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                        activeTab === item.id
                          ? "bg-red-50 text-red-600 font-medium"
                          : "text-gray-700 hover:bg-gray-100 hover:text-gray-700"
                      }`}
                    >
                      <item.icon className="w-4 h-4" />
                      {item.label}
                    </Button>
                  ))}
              </div>
            </>
          )}
          {section === "settings" && (
            <>
              <p className="text-xs font-semibold text-gray-500 uppercase mb-3">
                Cài Đặt
              </p>
              <div className="space-y-2">
                {sidebarItems
                  .filter((item) => item.section === "settings")
                  .map((item) => (
                    <Button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      variant="ghost"
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                        activeTab === item.id
                          ? "bg-red-50 text-red-600 font-medium"
                          : "text-gray-700 hover:bg-gray-100 hover:text-gray-700"
                      }`}
                    >
                      <item.icon className="w-4 h-4" />
                      {item.label}
                    </Button>
                  ))}
              </div>
            </>
          )}
        </div>
      ))}

      <div className="mt-8 pt-6 border-t border-gray-200">
        <Button
          variant="ghost"
          className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-100 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Đăng Xuất
        </Button>
      </div>
    </div>
  );
}
