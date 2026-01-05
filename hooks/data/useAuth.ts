"use client";

import { OAuthConfig } from "@/config/oauth";
import apiClient from "@/lib/api";
import useAppStore from "@/hooks/useAppStore";
import useUser from "./useUser";
import { Address } from "./useAddress";
import { Gender, Role } from "@/lib/enums";

export { Gender };

export interface User {
  userId: number;
  userName?: string;
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  gender?: Gender;
  dateOfBirth?: string;
  addresses?: Address[];
  avatar?: string;
  needsPasswordCreation?: boolean;
  role?: Role;
  enabled?: boolean;
}

export interface LoginCredentials {
  userName: string;
  password: string;
}

export interface RegisterCredentials {
  userName: string;
  password: string;
  email: string;
  fullName?: string;
  dateOfBirth?: string;
  phoneNumber?: string;
  gender?: Gender;
  role?: Role;
}

export interface ChangePasswordData {
  oldPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export interface CreatePasswordData {
  password: string;
  confirmPassword: string;
}

export interface updateAuthUserData {
  role?: Role;
  enabled?: boolean;
}

export function useAuth() {
  const { isLoading, setLoading, clear, setAccessToken } = useAppStore();

  // reuse profile logic from useUser
  const { getProfile } = useUser();
  const login = async (credentials: LoginCredentials) => {
    setLoading(true);
    try {
      const response = await apiClient.post("/auth/login", credentials, {
        withCredentials: true,
      });
      if (response.data.code === 200) {
        setAccessToken(response.data.data);
        await getProfile();
      }

      return response;
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Register new user
  const register = async (
    credentials: RegisterCredentials,
    avatarFile?: File | null
  ) => {
    setLoading(true);
    try {
      const form = new FormData();
      form.append(
        "userData",
        new Blob([JSON.stringify(credentials)], { type: "application/json" })
      );
      if (avatarFile) {
        form.append("avt", avatarFile);
      }
      const response = await apiClient.post("/auth/register", form, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response;
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setLoading(true);
    try {
      await apiClient.post("/auth/logout", null, { withCredentials: true });
    } catch (error) {
      throw error;
    } finally {
      clear();
      setLoading(false);
      if (typeof window !== "undefined")
        window.dispatchEvent(new Event("auth-changed"));
    }
  };

  const loginWithGoogle = () => {
    const callbackUrl = OAuthConfig.google.redirectUri;
    const authUrl = OAuthConfig.google.authUri;
    const googleClientId = OAuthConfig.google.clientId;
    const state = "google";

    const targetUrl = `${authUrl}?redirect_uri=${encodeURIComponent(
      callbackUrl
    )}&response_type=code&client_id=${googleClientId}&scope=openid%20email%20profile&state=${state}`;

    window.location.href = targetUrl;
  };

  const loginWithFacebook = () => {
    const callbackUrl = OAuthConfig.facebook.redirectUri;
    const authUrl = OAuthConfig.facebook.authUri;
    const facebookClientId = OAuthConfig.facebook.clientId;
    const state = "facebook";

    const targetUrl = `${authUrl}?client_id=${facebookClientId}&redirect_uri=${encodeURIComponent(
      callbackUrl
    )}&response_type=code&scope=email,public_profile&state=${state}`;

    window.location.href = targetUrl;
  };

  const handleOAuthCallback = async (
    code: string,
    provider: "google" | "facebook"
  ) => {
    try {
      const response = await apiClient.post(
        `/auth/outbound/authentication?code=${code}&provider=${provider}`,
        null,
        { withCredentials: true }
      );
      setAccessToken(response.data.data);
      const profile = await getProfile();
      return profile;
    } catch (error: any) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (passwordData: ChangePasswordData) => {
    setLoading(true);
    try {
      const response = await apiClient.put("/auth/change-password", {
        ...passwordData,
      });
      return response;
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createPassword = async (passwordData: CreatePasswordData) => {
    setLoading(true);
    try {
      const response = await apiClient.post("/auth/create-password", {
        ...passwordData,
      });
      return response;
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateAuthUser = async (userId: number, data: updateAuthUserData) => {
    setLoading(true);
    try {
      const response = await apiClient.put(
        `/auth/update-auth-user/${userId}`,
        data
      );
      return response.data?.data ?? response.data;
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    isLoading,

    login,
    register,
    logout,
    loginWithGoogle,
    loginWithFacebook,
    handleOAuthCallback,
    changePassword,
    createPassword,
    updateAuthUser,
  };
}
