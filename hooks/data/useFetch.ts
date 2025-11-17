"use client"

import { useState, useEffect } from "react"

interface UseFetchOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE"
  body?: any
}

interface UseFetchReturn<T> {
  data: T | null
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useFetch<T>(url: string, options?: UseFetchOptions): UseFetchReturn<T> {
  const [data, setData] = useState<T | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(url, {
        method: options?.method || "GET",
        headers: {
          "Content-Type": "application/json",
        },
        body: options?.body ? JSON.stringify(options.body) : undefined,
      })

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`)
      }

      const result = await response.json()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [url])

  return { data, isLoading, error, refetch: fetchData }
}
