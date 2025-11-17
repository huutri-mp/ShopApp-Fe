"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/data/useAuth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert } from "@/components/ui/alert"
import { Spinner } from "@/components/ui/spinner"

export default function CreatePasswordPage() {
  const { createPassword, isLoading, isAuthenticated, needsPasswordCreation, user } = useAuth()
  const router = useRouter()
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  })
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Redirect if not authenticated or doesn't need password creation
  if (!isAuthenticated && !isLoading) {
    router.replace("/auth/login")
    return null
  }

  if (isAuthenticated && !needsPasswordCreation() && !isLoading) {
    router.replace("/")
    return null
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear errors when user starts typing
    if (error) setError(null)
    if (success) setSuccess(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    // Validation
    if (!formData.password || !formData.confirmPassword) {
      setError("All fields are required")
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long")
      return
    }

    const result = await createPassword({
      password: formData.password,
      confirmPassword: formData.confirmPassword,
    })

    if (result.success) {
      setSuccess(result.message || "Password created successfully")
      // Redirect to home after a short delay
      setTimeout(() => {
        router.push("/")
      }, 2000)
    } else {
      setError(result.message || "Failed to create password")
    }
  }

  const handleSkip = () => {
    router.push("/")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create Password</CardTitle>
          <CardDescription>
            You signed in with {user?.provider === 'google' ? 'Google' : 'Facebook'}. 
            Create a password to secure your account and enable direct login.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <p>{error}</p>
              </Alert>
            )}
            {success && (
              <Alert>
                <p>{success}</p>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                disabled={isLoading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                disabled={isLoading}
              />
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col gap-3">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? <Spinner className="mr-2" /> : null}
              Create Password
            </Button>
            
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleSkip}
              disabled={isLoading}
            >
              Skip for now
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}