"use client";

import { Suspense } from "react";
import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useAuth } from "@/hooks/data/useAuth";
import { Spinner } from "@/components/ui/spinner";
import { Alert } from "@/components/ui/alert";

function AuthenticateContent() {
  const t = useTranslations();
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasProcessed = useRef(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { handleOAuthCallback } = useAuth();

  useEffect(() => {
    if (hasProcessed.current) {
      return;
    }
    const processCallback = async () => {
      try {
        const code = searchParams.get("code");
        const provider = searchParams.get("state");
        const errorParam = searchParams.get("error");
        const errorDescription = searchParams.get("error_description");

        if (errorParam) {
          throw new Error(errorDescription || `OAuth error: ${errorParam}`);
        }

        if (!code) {
          throw new Error("No authorization code received");
        }

        if (!provider || !["google", "facebook"].includes(provider)) {
          throw new Error("Invalid or missing provider");
        }

        hasProcessed.current = true;
        const profile = await handleOAuthCallback(
          code,
          provider as "google" | "facebook"
        );
        if (profile?.success && profile.user?.needsPasswordCreation) {
          router.push("/auth/create-password");
        } else if (profile?.success) {
          router.push("/");
        } else {
          throw new Error(profile?.message || "Authentication failed");
        }
      } catch (err: any) {
        console.error("OAuth callback error:", err);
        setError(err?.message || t("auth.login.loginError"));
        setIsProcessing(false);
        setTimeout(() => {
          router.push("/auth/login");
        }, 3000);
      }
    };

    processCallback();
  }, [searchParams, handleOAuthCallback, router, t]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-4">
          <Alert variant="destructive">
            <p className="font-medium">{t("errors.somethingWentWrong")}</p>
            <p className="text-sm mt-1">{error}</p>
          </Alert>
          <p className="text-center text-sm text-muted-foreground">
            Redirecting to login...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <Spinner className="w-12 h-12 mb-4" />
      <p className="text-lg font-medium">{t("common.loading")}</p>
      <p className="text-sm text-muted-foreground mt-2">
        Processing authentication...
      </p>
    </div>
  );
}

export default function AuthenticatePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Spinner className="w-12 h-12" />
        </div>
      }
    >
      <AuthenticateContent />
    </Suspense>
  );
}
