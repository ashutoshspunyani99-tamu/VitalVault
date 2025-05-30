'use client'
import React, { createContext, useContext, ReactNode, useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import auth from '@/lib/auth'
import { useLogout, usePrivy } from '@privy-io/react-auth'

interface AuthContextType {
  isAuthenticated: boolean
  isLoading: boolean
  authLogin: (token: string) => Promise<void>
  authLogout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { authenticated } = usePrivy()

  const clearData = async () => {
    console.info('Successfully logged out')
    localStorage.clear()
    console.info('Token cleared')
    await auth.logout()
    console.info('Cookie cleared')
    checkAuth()
    router.push('/')
  }

  const { logout } = useLogout({
    onSuccess: async () => {
      try {
        await clearData()
      } catch (error) {
        console.error('Error during logout process:', error)
      }
    }
  })

  const checkAuth = useCallback(() => {
    const authStatus = auth.isAuthenticated()
    setIsAuthenticated(authStatus)
    setIsLoading(false)
  }, [])

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  const authLogin = useCallback(
    async (token: string) => {
      await auth.saveToken(token)
      checkAuth()
    },
    [checkAuth]
  )

  const authLogout = useCallback(async () => {
    try {
      if (authenticated) {
        await logout()
      }
      await clearData()
    } catch (error) {
      console.error('Error during logout:', error)
    }
  }, [checkAuth, router])

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, authLogin, authLogout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
