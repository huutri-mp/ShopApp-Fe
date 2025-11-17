"use client"

import { useOAuthCallback } from "@/hooks/data/useOAuthCallback"
import { Spinner } from "@/components/ui/spinner"
import { Alert } from "@/components/ui/alert"

export default function GoogleCallbackPage() {
  const { isProcessing, error } = useOAuthCallback()

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

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Spinner className="mx-auto mb-4" />
        <h2 className="text-lg font-semibold mb-2">Processing Google Authentication</h2>
        <p className="text-gray-600">Please wait while we complete your login...</p>
      </div>
    </div>
  )
}