"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { OAuthConfig, isOAuthConfigured } from "@/config/oauth"
import apiClient from "@/lib/api"

export interface Address {
  id: number
  contactName: string
  contactPhone: string
  addressLine1: string
  addressLine2?: string
  city: string
  province: string
  postalCode: string
  country: string
  isDefault: boolean
  createdAt: string
  updatedAt: string
}

export interface User {
  userId?: number
  userName?: string
  fullName?: string
  email?: string
  phoneNumber?: string
  gender?: string
  dateOfBirth?: string
  addresses?: Address[]
  avatar?: string
  provider?: 'local' | 'google' | 'facebook'
}

export interface LoginCredentials {
  userName: string
  password: string
}

export interface RegisterCredentials {
  userName: string
  password: string
  email: string
}

export interface ChangePasswordData {
  currentPassword: string
  newPassword: string
}

export interface CreatePasswordData {
  password: string
  confirmPassword: string
}

export interface AuthResponse {
  success: boolean
  data?: {
    user: User
    token: string
  }
  message?: string
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const oauthProcessing = useRef(false) // Prevent double OAuth calls
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("auth_token")
    const userData = localStorage.getItem("user_data")

    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData)
        setUser(parsedUser)
        setIsAuthenticated(true)
      } catch (error) {
        localStorage.removeItem("auth_token")
        localStorage.removeItem("user_data")
      }
    }
    setIsLoading(false)
  }, [])

  // Store auth data in localStorage
  const storeAuthData = (user: User, token: string) => {
    localStorage.setItem("auth_token", token)
    localStorage.setItem("user_data", JSON.stringify(user))
    setUser(user)
    setIsAuthenticated(true)
  }

  // Clear auth data
  const clearAuthData = () => {
    localStorage.removeItem("auth_token")
    localStorage.removeItem("user_data")
    setUser(null)
    setIsAuthenticated(false)
  }

  // Fetch current user profile info
  const getUserProfile = async (): Promise<{ success: boolean; user?: User; message?: string }> => {
    try {
      const token = localStorage.getItem("auth_token")
      if (!token) {
        return { success: false, message: "Not authenticated" }
      }

      const response = await apiClient.get('/user/profile/myInfo')
      const data = response.data

      const userProfile: User = {
        userId: data.userId,
        userName: user?.userName,
        fullName: data.fullName,
        email: data.email,
        phoneNumber: data.phoneNumber,
        gender: data.gender,
        dateOfBirth: data.dateOfBirth,
        addresses: data.addresses,
        provider: user?.provider || 'local'
      }

      // Update stored user data
      storeAuthData(userProfile, token)

      return { success: true, user: userProfile }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to fetch user profile"
      return { success: false, message: errorMessage }
    }
  }

  const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
    setIsLoading(true)
    try {
      const response = await apiClient.post('/auth/login', credentials)
      const data = response.data
      
      if (data.token) {
        // Store token temporarily and fetch user profile
        localStorage.setItem("auth_token", data.token)
        
        // Get full profile info
        const profileResult = await getUserProfile()
        
        router.push("/")
        
        return { 
          success: true, 
          data: { 
            user: profileResult.user!, 
            token: data.token 
          } 
        }
      }

      return { success: false, message: data.message || "Login failed" }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Network error occurred"
      return { success: false, message: errorMessage }
    } finally {
      setIsLoading(false)
    }
  }

  // Register new user
  const register = async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    setIsLoading(true)
    try {
      const response = await apiClient.post('/auth/register', credentials)
      const data = response.data

      if (data.success && data.data) {
        storeAuthData(data.data.user, data.data.token)

        router.push("/")
        
        return { success: true, data: data.data }
      }

      return { success: false, message: data.message || "Registration failed" }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Network error occurred"
      return { success: false, message: errorMessage }
    } finally {
      setIsLoading(false)
    }
  }

 const logout = async (): Promise<void> => {
  setIsLoading(true)
  try {
    const token = localStorage.getItem("auth_token")
    if (token) {
      await apiClient.post(
        '/auth/logout',
        {
         token: token
        }
      )
    }
  } catch (error) {
    // Logout error handled silently
  } finally {
    clearAuthData() 
    setIsLoading(false)
    
    // Redirect to home page after logout
    router.push("/")
  }
}

  const loginWithGoogle = () => {
    if (!isOAuthConfigured.google) {
      return
    }

    const callbackUrl = OAuthConfig.google.redirectUri
    const authUrl = OAuthConfig.google.authUri
    const googleClientId = OAuthConfig.google.clientId
    const state = "google"

    const targetUrl = `${authUrl}?redirect_uri=${encodeURIComponent(callbackUrl)}&response_type=code&client_id=${googleClientId}&scope=openid%20email%20profile&state=${state}`
    
    window.location.href = targetUrl
  }


  const loginWithFacebook = () => {
    if (!isOAuthConfigured.facebook) {
      return
    }

    const callbackUrl = OAuthConfig.facebook.redirectUri
    const authUrl = "https://www.facebook.com/v19.0/dialog/oauth"
    const facebookClientId = OAuthConfig.facebook.clientId
    const state = "facebook"

    const targetUrl = `${authUrl}?client_id=${facebookClientId}&redirect_uri=${encodeURIComponent(callbackUrl)}&response_type=code&scope=email,public_profile&state=${state}`
    
    window.location.href = targetUrl
  }

  const handleOAuthCallback = async (code: string, provider: 'google' | 'facebook'): Promise<AuthResponse> => {
    if (oauthProcessing.current) {
      return { success: false, message: "Already processing" }
    }
    oauthProcessing.current = true
    setIsLoading(true)
    
    try {
      const response = await apiClient.post(`/auth/outbound/authentication?code=${code}&provider=${provider}`)
      const data = response.data

      if (data.token) {
        // Store token temporarily and fetch user profile
        localStorage.setItem("auth_token", data.token)
        
        // Get full profile info
        const profileResult = await getUserProfile()
        
        router.push("/")
        
        return { 
          success: true, 
          data: { 
            user: profileResult.user!, 
            token: data.token 
          } 
        }
      }      return { success: false, message: data.message || "OAuth authentication failed" }
    } catch (error: any) {
      let errorMessage = "OAuth authentication failed"
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error.response?.status === 400) {
        errorMessage = "Invalid OAuth parameters"  
      } else if (error.response?.status === 401) {
        errorMessage = "OAuth authentication rejected"
      } else if (error.message) {
        errorMessage = error.message
      }
      
      return { success: false, message: errorMessage }
    } finally {
      oauthProcessing.current = false
      setIsLoading(false)
    }
  }

  // Change password (for users with existing password)
  const changePassword = async (passwordData: ChangePasswordData): Promise<AuthResponse> => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem("auth_token")
      if (!token) {
        return { success: false, message: "Not authenticated" }
      }

      const response = await apiClient.post('/auth/change-password', passwordData)
      const data = response.data

      if (data.success) {
        return { success: true, message: data.message || "Password changed successfully" }
      }

      return { success: false, message: data.message || "Failed to change password" }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Network error occurred"
      return { success: false, message: errorMessage }
    } finally {
      setIsLoading(false)
    }
  }

  // Create password (for OAuth users who don't have a password)
  const createPassword = async (passwordData: CreatePasswordData): Promise<AuthResponse> => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem("auth_token")
      if (!token) {
        return { success: false, message: "Not authenticated" }
      }

      if (passwordData.password !== passwordData.confirmPassword) {
        return { success: false, message: "Passwords do not match" }
      }

      const response = await apiClient.post('/auth/create-password', {
        password: passwordData.password,
      })

      const data = response.data

      if (data.success) {
        // Update user data to reflect that they now have a password
        if (user) {
          const updatedUser = { ...user, provider: 'local' as const }
          storeAuthData(updatedUser, token)
        }
        return { success: true, message: data.message || "Password created successfully" }
      }

      return { success: false, message: data.message || "Failed to create password" }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Network error occurred"
      return { success: false, message: errorMessage }
    } finally {
      setIsLoading(false)
    }
  }

  // Get auth token for API calls
  const getAuthToken = (): string | null => {
    return localStorage.getItem("auth_token")
  }

  // Check if user needs to create password (OAuth users without password)
  const needsPasswordCreation = (): boolean => {
    return user?.provider === 'google' || user?.provider === 'facebook'
  }

  return {
    // State
    user,
    isAuthenticated,
    isLoading,
    
    // Actions
    login,
    register,
    logout,
    loginWithGoogle,
    loginWithFacebook,
    handleOAuthCallback,
    changePassword,
    createPassword,
    
    // Utilities
    getAuthToken,
    needsPasswordCreation,
    getUserProfile,
  }
}
