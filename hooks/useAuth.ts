"use client"

import { useState, useEffect } from "react"

export interface User {
  email: string
  name?: string
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem("auth_token")
    const email = localStorage.getItem("user_email")
    const name = localStorage.getItem("user_name")

    if (token && email) {
      setUser({ email, name: name || undefined })
      setIsAuthenticated(true)
    }
    setIsLoading(false)
  }, [])

  const logout = () => {
    localStorage.removeItem("auth_token")
    localStorage.removeItem("user_email")
    localStorage.removeItem("user_name")
    setUser(null)
    setIsAuthenticated(false)
  }

  return { user, isAuthenticated, isLoading, logout }
}
