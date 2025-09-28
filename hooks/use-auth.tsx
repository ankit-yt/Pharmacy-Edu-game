"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { apiClient } from "@/lib/api"

interface User {
  id: string
  name: string
  email: string
  role: "student" | "admin"
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (token: string, user: User) => void
  logout: () => void
  updateUser: (user: User) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in on app start
    const token = localStorage.getItem("token")
    if (token) {
      apiClient.setToken(token)
      // Verify token and get user profile
      apiClient
        .getProfile()
        .then((response) => {
          setUser(response.user)
        })
        .catch(() => {
          // Token is invalid, clear it
          localStorage.removeItem("token")
          apiClient.clearToken()
        })
        .finally(() => {
          setIsLoading(false)
        })
    } else {
      setIsLoading(false)
    }
  }, [])

  const login = (token: string, userData: User) => {
    localStorage.setItem("token", token)
    apiClient.setToken(token)
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem("token")
    apiClient.clearToken()
    setUser(null)
  }

  const updateUser = (userData: User) => {
    setUser(userData)
  }

  return <AuthContext.Provider value={{ user, isLoading, login, logout, updateUser }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
