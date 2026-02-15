"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { mockOfficers, type Officer } from "@/lib/mock-data"

interface AuthContextType {
  user: Officer | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (id: string, password: string) => { success: boolean; message: string }
  logout: () => void
  updateUser: (updates: Partial<Pick<Officer, "name" | "id" | "email" | "password">>) => { success: boolean; message: string }
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: () => ({ success: false, message: "" }),
  logout: () => {},
  updateUser: () => ({ success: false, message: "" }),
})

const AUTH_STORAGE_KEY = "policia_rp_auth"

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Officer | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(AUTH_STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        // Try to find from mock, but also check if we have stored updated data
        const storedUser = parsed.userData as Officer | undefined
        if (storedUser) {
          setUser(storedUser)
        } else {
          const officer = mockOfficers.find((o) => o.id === parsed.id)
          if (officer) {
            setUser(officer)
          }
        }
      }
    } catch {
      // ignore
    }
    setIsLoading(false)
  }, [])

  const login = (id: string, password: string) => {
    const officer = mockOfficers.find((o) => o.id === id)
    if (!officer) {
      return { success: false, message: "ID policial nao encontrado." }
    }
    if (officer.role === "pending") {
      return { success: false, message: "Cadastro ainda pendente de aprovacao." }
    }
    if (officer.password !== password) {
      return { success: false, message: "Senha incorreta." }
    }
    setUser(officer)
    sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ id: officer.id, userData: officer }))
    return { success: true, message: `Bem-vindo, ${officer.rank} ${officer.name}!` }
  }

  const logout = () => {
    setUser(null)
    sessionStorage.removeItem(AUTH_STORAGE_KEY)
  }

  const updateUser = (updates: Partial<Pick<Officer, "name" | "id" | "email" | "password">>) => {
    if (!user) return { success: false, message: "Nao autenticado." }

    // Check if new ID conflicts with another officer
    if (updates.id && updates.id !== user.id) {
      const existing = mockOfficers.find((o) => o.id === updates.id && o.id !== user.id)
      if (existing) {
        return { success: false, message: "Este ID ja esta em uso por outro policial." }
      }
    }

    const updatedUser = { ...user, ...updates }
    setUser(updatedUser)
    sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ id: updatedUser.id, userData: updatedUser }))
    return { success: true, message: "Dados atualizados com sucesso!" }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
