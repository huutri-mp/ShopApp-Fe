"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { User } from "@/hooks/data/useAuth";
import { Role } from "@/lib/enums";

interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
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
      isAdmin: false,
      isLoading: false,
      accessToken: null,

      setUser: (user) =>
        set({
          user,
          isAdmin: Boolean(
            user?.role &&
              (Array.isArray(user.role)
                ? user.role.some((r) => String(r).toUpperCase() === Role.ADMIN)
                : String(user.role).toUpperCase() === Role.ADMIN)
          ),
        }),
      setAuthenticated: (v) => set({ isAuthenticated: v }),
      setLoading: (v) => set({ isLoading: v }),
      setAccessToken: (t) => set({ accessToken: t }),
      clear: () =>
        set({
          user: null,
          isAuthenticated: false,
          isAdmin: false,
          accessToken: null,
        }),
    }),
    {
      name: "shop-app-storage",
      storage: createJSONStorage(() => localStorage),

      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        isAdmin: state.isAdmin,
        accessToken: state.accessToken,
      }),
    }
  )
);

export default useAppStore;
