"use client";

import React, { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import useAppStore from "@/hooks/useAppStore";
import useUser from "@/hooks/data/useUser";
import { getCookie } from "@/lib/utils";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = React.useState(() => new QueryClient());
  const { getProfile } = useUser();
  const triedHydrateRef = React.useRef(false);
  const accessToken = useAppStore((s) => s.accessToken);
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);

  useEffect(() => {
    const xsrf = getCookie("XSRF-TOKEN");
    const canHydrate = Boolean(xsrf || accessToken);
    if (triedHydrateRef.current || !canHydrate || isAuthenticated) return;
    triedHydrateRef.current = true;
    (async () => {
      try {
        await getProfile();
      } catch {}
    })();
  }, [getProfile, accessToken, isAuthenticated]);

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
