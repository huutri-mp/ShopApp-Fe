"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Camera } from "lucide-react";
import type { User } from "@/hooks/data/useAuth";

type Props = {
  user: User;
  preview?: string | null;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export default function ProfileHeader({
  user,
  preview,
  fileInputRef,
  handleFileChange,
}: Props) {
  const t = useTranslations();
  return (
    <div className="bg-white border-b border-gray-200 p-8">
      <div className="flex items-center gap-6">
        <div className="relative group w-28 h-28">
          <Avatar className="w-full h-full cursor-pointer">
            <AvatarImage
              src={preview || "avatar-placeholder.png"}
              alt="avatar"
            />
            <AvatarFallback>
              {(user.fullName || user.userName || "?")[0]}
            </AvatarFallback>
          </Avatar>
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              variant="ghost"
              className="text-white"
            >
              <Camera className="w-5 h-5" />
            </Button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        <div className="flex-1">
          <h1 className="text-2xl font-semibold text-gray-900">
            {user.fullName || user.userName}
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            {t("profile.manageProfileSecurity")}
          </p>
        </div>
      </div>
    </div>
  );
}
