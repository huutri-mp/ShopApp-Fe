"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/routing";
import { useAuth, Gender } from "@/hooks/data/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Eye, EyeOff, Camera, User } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function RegisterPage() {
  const t = useTranslations();
  const [formData, setFormData] = useState({
    userName: "",
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    dateOfBirth: "",
    phoneNumber: "",
    gender: "" as string,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const { register, isLoading } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError(t("auth.register.avatarTooLarge"));
        return;
      }
      if (!file.type.startsWith("image/")) {
        setError(t("auth.register.invalidImageType"));
        return;
      }
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (
      !formData.userName ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      setError(t("auth.register.fillRequired"));
      return;
    }

    if (!formData.fullName || !formData.dateOfBirth || !formData.phoneNumber) {
      setError(t("auth.register.fillRequired"));
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError(t("auth.register.passwordMismatch"));
      return;
    }

    if (formData.password.length < 6) {
      setError(t("validation.passwordTooShort"));
      return;
    }

    try {
      const response = await register(
        {
          email: formData.email,
          userName: formData.userName,
          password: formData.password,
          fullName: formData.fullName,
          dateOfBirth: formData.dateOfBirth,
          phoneNumber: formData.phoneNumber,
          gender: formData.gender as Gender,
        },
        avatarFile
      );

      if (response?.status === 200) {
        const data = response.data;
        if (data && data.success === false) {
          setError(data.message || t("auth.register.registerError"));
          return;
        }

        setSuccessMessage(data?.message || t("auth.register.registerSuccess"));
        setDialogOpen(true);
      } else {
        setError(response?.data?.message || t("auth.register.registerError"));
      }
    } catch (err: any) {
      setError(err?.message || t("auth.register.registerError"));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">{t("auth.register.title")}</CardTitle>
          <CardDescription>{t("auth.register.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            {error && (
              <div className="p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Avatar Upload */}
            <div className="flex flex-col items-center space-y-2">
              <label className="text-sm font-medium">
                {t("auth.register.avatar")}
              </label>
              <div className="relative group">
                <Avatar className="h-24 w-24 border-2 border-muted">
                  {avatarPreview ? (
                    <AvatarImage src={avatarPreview} alt="Avatar preview" />
                  ) : (
                    <AvatarFallback className="bg-muted">
                      <User className="h-10 w-10 text-muted-foreground" />
                    </AvatarFallback>
                  )}
                </Avatar>
                <label
                  htmlFor="avatar-upload"
                  className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity"
                >
                  <Camera className="h-6 w-6 text-white" />
                </label>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                  disabled={isLoading}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {t("auth.register.avatarHint")}
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="userName" className="text-sm font-medium">
                {t("auth.register.userName")}
              </label>
              <Input
                id="userName"
                name="userName"
                type="text"
                placeholder="John Doe"
                value={formData.userName}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                {t("auth.register.email")}
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="fullName" className="text-sm font-medium">
                {t("auth.register.fullName")}
              </label>
              <Input
                id="fullName"
                name="fullName"
                type="text"
                placeholder="John Doe"
                value={formData.fullName}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="dateOfBirth" className="text-sm font-medium">
                {t("auth.register.dateOfBirth")}
              </label>
              <Input
                id="dateOfBirth"
                name="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="phoneNumber" className="text-sm font-medium">
                {t("auth.register.phoneNumber")}
              </label>
              <Input
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                placeholder="+84 912 345 678"
                value={formData.phoneNumber}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="gender" className="text-sm font-medium">
                {t("common.gender.label")}
              </label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, gender: e.target.value }))
                }
                disabled={isLoading}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-red-600 text-sm bg-white"
              >
                <option value={Gender.Male}>{t("common.gender.male")}</option>
                <option value={Gender.Female}>
                  {t("common.gender.female")}
                </option>
                <option value={Gender.Other}>{t("common.gender.other")}</option>
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                {t("auth.register.password")}
              </label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="confirm-password" className="text-sm font-medium">
                {t("auth.register.confirmPassword")}
              </label>
              <Input
                id="confirm-password"
                name="confirmPassword"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? <Spinner className="mr-2" /> : null}
              {isLoading
                ? t("common.loading")
                : t("auth.register.registerButton")}
            </Button>
          </form>

          {/* Success confirmation dialog */}
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t("auth.register.registerSuccess")}</DialogTitle>
                <DialogDescription>{successMessage}</DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  onClick={() => {
                    setDialogOpen(false);
                    router.push("/auth/login");
                  }}
                >
                  {t("common.confirm")}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <div className="mt-6 text-center text-sm">
            {t("auth.register.hasAccount")}{" "}
            <Link
              href="/auth/login"
              className="text-primary hover:underline font-semibold"
            >
              {t("auth.register.loginLink")}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
