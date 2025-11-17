"use client"

import { Suspense } from "react"
import { useEffect, useState, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/hooks/data/useAuth"
import { Spinner } from "@/components/ui/spinner"
import { Alert } from "@/components/ui/alert"

function AuthenticateContent() {
  const [isProcessing, setIsProcessing] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const hasProcessed = useRef(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { handleOAuthCallback } = useAuth()

  useEffect(() => {
    // Prevent multiple calls
    if (hasProcessed.current) {
      console.log('Authentication already processed, skipping')
      return
    }
    
    console.log('Starting authentication process')
    const processCallback = async () => {
      try {
        const code = searchParams.get("code")
        const provider = searchParams.get("state")
        const errorParam = searchParams.get("error")
        const errorDescription = searchParams.get("error_description")

        if (errorParam) {
          throw new Error(errorDescription || `OAuth error: ${errorParam}`)
        }

        if (!code) {
          throw new Error("No authorization code received")
        }

        if (!provider || !["google", "facebook"].includes(provider)) {
          throw new Error("Invalid or missing provider")
        }

        // Mark as processed to prevent multiple calls
        hasProcessed.current = true
        
        // Use hook instead of direct fetch
        const result = await handleOAuthCallback(code, provider as "google" | "facebook")
        
        if (result.success) {
          // Redirect to home on success
          router.push("/")
        } else {
          throw new Error(result.message || "OAuth callback failed")
        }
      } catch (err: any) {
        setError(err.message || "An unexpected error occurred")
      } finally {
        setIsProcessing(false)
      }
    }

    processCallback()
  }, []) // Empty dependency array - chỉ chạy 1 lần khi mount

  if (isProcessing) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-8">
        <Spinner className="w-8 h-8" />
        <p className="text-muted-foreground">Authenticating...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md w-full">
          <Alert variant="destructive">
            <h2 className="text-lg font-semibold mb-2">Authentication Error</h2>
            <p>{error}</p>
          </Alert>
          <div className="mt-4 text-center">
            <a href="/auth/login" className="text-blue-600 hover:underline">
              Return to login
            </a>
          </div>
        </div>
      </div>
    )
  }

  return null
}

export default function AuthenticatePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Spinner className="w-8 h-8 mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <AuthenticateContent />
    </Suspense>
  )
}