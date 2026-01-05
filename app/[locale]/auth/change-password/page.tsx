"use client";

import type React from "react";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { useAuth } from "@/hooks/data/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Eye, EyeOff } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";

export default function ChangePasswordPage() {
  const t = useTranslations();
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const { changePassword, isLoading } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
    if (success) setSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (
      !formData.currentPassword ||
      !formData.newPassword ||
      !formData.confirmPassword
    ) {
      setError(t("auth.changePassword.fillAllFields"));
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError(t("auth.changePassword.passwordMismatch"));
      return;
    }

    try {
      const response = await changePassword({
        oldPassword: formData.currentPassword,
        newPassword: formData.newPassword,
        confirmNewPassword: formData.confirmPassword,
      });

      if (response.status === 200) {
        setSuccess(true);
        setFormData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        setError(response?.data?.message || t("auth.changePassword.error"));
      }
    } catch (err: any) {
      setError(err.response?.data?.message || t("auth.changePassword.error"));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">
            {t("auth.changePassword.title")}
          </CardTitle>
          <CardDescription>
            {t("auth.changePassword.description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="p-3 bg-green-50 text-green-600 rounded-lg text-sm">
                {t("auth.changePassword.success")}
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="currentPassword" className="text-sm font-medium">
                {t("auth.changePassword.currentPassword")}
              </label>
              <Input
                id="currentPassword"
                name="currentPassword"
                type="password"
                value={formData.currentPassword}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="newPassword" className="text-sm font-medium">
                {t("auth.changePassword.newPassword")}
              </label>
              <div className="relative">
                <Input
                  id="newPassword"
                  name="newPassword"
                  type={showPassword ? "text" : "password"}
                  value={formData.newPassword}
                  onChange={handleChange}
                  disabled={isLoading}
                />
                <Button
                  variant="ghost"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium">
                {t("auth.changePassword.confirmPassword")}
              </label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? <Spinner className="mr-2" /> : null}
              {isLoading
                ? t("common.loading")
                : t("auth.changePassword.changeButton")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
