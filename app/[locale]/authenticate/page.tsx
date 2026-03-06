"use client";

import { Suspense } from "react";
import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@/i18n/routing";
import { useAuth } from "@/hooks/data/useAuth";

function AuthenticateContent() {
  const hasProcessed = useRef(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { handleOAuthCallback } = useAuth();

  useEffect(() => {
    if (hasProcessed.current) return;
    const processCallback = async () => {
      const fail = () => {
        hasProcessed.current = true;
        router.replace("/auth/login");
      };

      const code = searchParams.get("code");
      const provider = searchParams.get("state");
      const errorParam = searchParams.get("error");

      if (errorParam) return fail();
      if (!code) return fail();
      if (!provider || !["google", "facebook"].includes(provider))
        return fail();

      hasProcessed.current = true;
      try {
        const profile = await handleOAuthCallback(
          code,
          provider as "google" | "facebook",
        );
        if (profile?.success && profile.user?.needsPasswordCreation) {
          router.replace("/auth/create-password");
        } else if (profile?.success) {
          router.replace("/");
        } else {
          fail();
        }
      } catch (err) {
        console.error("OAuth callback error:", err);
        fail();
      }
    };
    processCallback();
  }, [searchParams, handleOAuthCallback, router]);

  return null;
}

export default function AuthenticatePage() {
  return (
    <Suspense fallback={null}>
      <AuthenticateContent />
    </Suspense>
  );
}
