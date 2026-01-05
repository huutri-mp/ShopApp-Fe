"use client";

import type React from "react";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/routing";
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
import { OAuthButtons } from "@/app/components/OAuthButtons";

export default function LoginPage() {
  const t = useTranslations();
  const [formData, setFormData] = useState({
    userName: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const { login, loginWithGoogle, loginWithFacebook, isLoading } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.userName || !formData.password) {
      setError(t("auth.login.fillAllFields"));
      return;
    }
    try {
      const response = await login({
        userName: formData.userName,
        password: formData.password,
      });
      if (response.status === 200) {
        router.push("/");
      } else {
        setError(response?.data.message || t("auth.login.loginFailed"));
      }
    } catch (err: any) {
      setError(err.response?.data?.message || t("auth.login.loginError"));
    }
  };

  const handleGoogleLogin = () => {
    loginWithGoogle();
  };

  const handleFacebookLogin = () => {
    loginWithFacebook();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">{t("auth.login.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="userName" className="text-sm font-medium">
                {t("auth.login.userName")}
              </label>
              <Input
                id="userName"
                name="userName"
                placeholder="John Doe"
                value={formData.userName}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                {t("auth.login.password")}
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
                <Button
                  variant="ghost"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                  title={
                    showPassword
                      ? t("auth.login.hidePassword")
                      : t("auth.login.showPassword")
                  }
                ></Button>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? <Spinner className="mr-2" /> : null}
              {isLoading ? t("common.loading") : t("auth.login.loginButton")}
            </Button>
          </form>

          <div className="mt-6">
            <OAuthButtons
              onGoogleLogin={handleGoogleLogin}
              onFacebookLogin={handleFacebookLogin}
              isLoading={isLoading}
            />
          </div>

          <div className="mt-6 text-center text-sm">
            {t("auth.login.noAccount")}{" "}
            <Link
              href="/auth/register"
              className="text-primary hover:underline font-semibold"
            >
              {t("auth.login.registerLink")}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
