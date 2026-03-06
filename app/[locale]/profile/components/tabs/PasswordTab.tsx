"use client";

import type React from "react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type PasswordData = {
  oldPassword: string;
  newPassword: string;
  confirmNewPassword: string;
};

type Props = {
  passwordData: PasswordData;
  passwordLoading: boolean;
  onPasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: () => void;
};

export default function PasswordTab({
  passwordData,
  passwordLoading,
  onPasswordChange,
  onSubmit,
}: Props) {
  const t = useTranslations();

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <h2 className="text-lg font-semibold mb-6">
        {t("profile.changePassword")}
      </h2>
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-700">
            {t("profile.currentPassword")}
          </label>
          <Input
            name="oldPassword"
            type="password"
            value={passwordData.oldPassword}
            onChange={onPasswordChange}
            className="mt-1"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">
            {t("profile.newPassword")}
          </label>
          <Input
            name="newPassword"
            type="password"
            value={passwordData.newPassword}
            onChange={onPasswordChange}
            className="mt-1"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">
            {t("profile.confirmNewPassword")}
          </label>
          <Input
            name="confirmNewPassword"
            type="password"
            value={passwordData.confirmNewPassword}
            onChange={onPasswordChange}
            className="mt-1"
          />
        </div>
      </div>
      <Button
        onClick={onSubmit}
        disabled={passwordLoading}
        className="mt-6 bg-red-600 text-white"
      >
        {passwordLoading ? t("common.updating") : t("profile.updatePassword")}
      </Button>
    </div>
  );
}
