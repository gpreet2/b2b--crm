'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { AuthUser, UserRole } from './auth-types'

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  signIn: (email: string) => Promise<{ error?: string; authMethod?: string; authorizationUrl?: string; magicLink?: string }>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<{ full_name: string; role: UserRole }>) => Promise<{ error?: string }>
  refreshUser: () => Promise<void>
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check session on mount
    checkSession()
  }, [])

  const checkSession = async () => {
    try {
      const response = await fetch('/api/auth/session')
      const data = await response.json()
      
      if (data.user) {
        setUser(data.user)
      }
    } catch (error) {
      console.error('Error checking session:', error)
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string) => {
    try {
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        return { error: data.error || 'Failed to sign in' }
      }

      // If SSO, redirect to authorization URL
      if (data.authMethod === 'sso' && data.authorizationUrl) {
        window.location.href = data.authorizationUrl
        return { authMethod: 'sso', authorizationUrl: data.authorizationUrl }
      }

      // Magic link sent
      return { authMethod: 'magic_link', magicLink: data.magicLink }
    } catch (error) {
      console.error('Sign in error:', error)
      return { error: 'An unexpected error occurred' }
    }
  }

  const signOut = async () => {
    try {
      await fetch('/api/auth/signout', {
        method: 'POST',
      })
      
      setUser(null)
      router.push('/signin')
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  const updateProfile = async (updates: Partial<{ full_name: string; role: UserRole }>) => {
    // This will be implemented when we add profile update functionality
    console.warn('Profile update not yet implemented')
    return {}
  }

  const refreshUser = async () => {
    await checkSession()
  }

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signOut,
    updateProfile,
    refreshUser,
    isAuthenticated: !!user,
  }

  return (
    <AuthContext.Provider value={value}>
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

// Additional convenience hooks
export function useUser() {
  const { user } = useAuth()
  return user
}

export function useIsAuthenticated() {
  const { isAuthenticated } = useAuth()
  return isAuthenticated
}

export function useAuthLoading() {
  const { loading } = useAuth()
  return loading
}