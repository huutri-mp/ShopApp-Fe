"use client";

import type React from "react";
import { useTranslations } from "next-intl";
import { Gender } from "@/hooks/data/useAuth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

type ProfileFormData = {
  fullName: string;
  email: string;
  phoneNumber: string;
  gender: string;
  dateOfBirth: string;
};

type Props = {
  formData: ProfileFormData;
  profileLoading: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onGenderChange: (value: string) => void;
  onSave: () => void;
};

export default function ProfileInfoTab({
  formData,
  profileLoading,
  onInputChange,
  onGenderChange,
  onSave,
}: Props) {
  const t = useTranslations();

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <h2 className="text-lg font-semibold mb-6">
        {t("profile.personalInfo")}
      </h2>
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-700">
            {t("profile.fullName")}
          </label>
          <Input
            name="fullName"
            value={formData.fullName}
            onChange={onInputChange}
            className="mt-1"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">
            {t("profile.email")}
          </label>
          <Input
            name="email"
            type="email"
            value={formData.email}
            onChange={onInputChange}
            className="mt-1"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">
            {t("profile.phoneNumber")}
          </label>
          <Input
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={onInputChange}
            className="mt-1"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">
            {t("profile.gender")}
          </label>
          <Select value={formData.gender} onValueChange={onGenderChange}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder={t("profile.selectGender")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={Gender.Male}>
                {t("common.gender.male")}
              </SelectItem>
              <SelectItem value={Gender.Female}>
                {t("common.gender.female")}
              </SelectItem>
              <SelectItem value={Gender.Other}>
                {t("common.gender.other")}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">
            {t("profile.dateOfBirth")}
          </label>
          <Input
            name="dateOfBirth"
            type="date"
            value={formData.dateOfBirth}
            onChange={onInputChange}
            className="mt-1"
          />
        </div>
      </div>
      <Button
        onClick={onSave}
        disabled={profileLoading}
        className="mt-6 bg-red-600 hover:bg-red-700 text-white"
      >
        {profileLoading ? t("common.saving") : t("common.save")}
      </Button>
    </div>
  );
}
