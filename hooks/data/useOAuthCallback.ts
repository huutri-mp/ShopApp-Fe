"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "./useAuth"

export function useOAuthCallback() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { handleOAuthCallback } = useAuth()

  useEffect(() => {
    const processCallback = async () => {
      const code = searchParams.get("code")
      const state = searchParams.get("state")
      const errorParam = searchParams.get("error")
      const errorDescription = searchParams.get("error_description")

      if (errorParam) {
        const errorMsg = errorDescription || `OAuth error: ${errorParam}`
        setError(errorMsg)
        return
      }

      if (!code || !state) {
        return
      }

      if (state !== "google" && state !== "facebook") {
        setError(`Invalid OAuth state: ${state}`)
        return
      }

      setIsProcessing(true)
      setError(null)

      try {
        const result = await handleOAuthCallback(code, state as 'google' | 'facebook')
        
        if (!result.success) {
          setError(result.message || "OAuth authentication failed")
        }
      } catch (err) {
        setError("An unexpected error occurred during OAuth processing")
      } finally {
        setIsProcessing(false)
      }
    }

    processCallback()
  }, [searchParams, handleOAuthCallback, router])

  return {
    isProcessing,
    error,
  }
}