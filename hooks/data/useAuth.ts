"use client";

import { OAuthConfig } from "@/config/oauth";
import apiClient from "@/lib/api";
import useAppStore from "@/hooks/useAppStore";
import useUser from "./useUser";
import { Address } from "./useAddress";
import { Gender } from "@/lib/enums";

export { Gender };

export interface User {
  userId?: number;
  userName?: string;
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  gender?: Gender;
  dateOfBirth?: string;
  addresses?: Address[];
  avatar?: string;
  needsPasswordCreation?: boolean;
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
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export interface CreatePasswordData {
  password: string;
  confirmPassword: string;
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
  const register = async (credentials: RegisterCredentials) => {
    setLoading(true);
    const response = await apiClient.post("/auth/register", credentials);
    setLoading(false);
    return response;
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
    const response = await apiClient.post(
      "/auth/change-password",
      passwordData
    );
    setLoading(false);
    return response;
  };

  const createPassword = async (passwordData: CreatePasswordData) => {
    setLoading(true);
    const response = await apiClient.post("/auth/create-password", {
      password: passwordData.password,
    });
    setLoading(false);
    return response;
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
  };
}
