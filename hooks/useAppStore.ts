"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { User } from "@/hooks/data/useAuth";

interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  accessToken?: string | null;
  setUser: (user: User | null) => void;
  setAuthenticated: (v: boolean) => void;
  setLoading: (v: boolean) => void;
  setAccessToken: (t: string | null) => void;
  clear: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      accessToken: null,

      setUser: (user) => set({ user }),
      setAuthenticated: (v) => set({ isAuthenticated: v }),
      setLoading: (v) => set({ isLoading: v }),
      setAccessToken: (t) => set({ accessToken: t }),
      clear: () =>
        set({ user: null, isAuthenticated: false, accessToken: null }),
    }),
    {
      name: "shop-app-storage",
      storage: createJSONStorage(() => localStorage),

      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAppStore;
