'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { createClient } from '@/utils/supabase/client'
import { AuthUser, UserRole } from './auth'
import { User } from '@supabase/supabase-js'

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error?: string }>
  signUp: (email: string, password: string, metadata?: { full_name?: string; gym_id?: string }) => Promise<{ error?: string }>
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
  const [isClient, setIsClient] = useState(false)
  const supabase = createClient()

  // Prevent hydration mismatch by ensuring client-only rendering
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Fetch user profile data from database
  const fetchUserProfile = async (authUser: User): Promise<AuthUser> => {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('gym_id, role, full_name')
      .eq('id', authUser.id)
      .single()

    if (error) {
      console.error('Error fetching user profile:', error)
    }

    return {
      ...authUser,
      gym_id: profile?.gym_id,
      role: profile?.role as UserRole,
      full_name: profile?.full_name,
    }
  }

  // Initialize auth state - only run on client to prevent hydration mismatch
  useEffect(() => {
    if (!isClient) return

    let mounted = true

    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session?.user && mounted) {
          const userWithProfile = await fetchUserProfile(session.user)
          setUser(userWithProfile)
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    initializeAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return

        if (event === 'SIGNED_IN' && session?.user) {
          setLoading(true)
          try {
            const userWithProfile = await fetchUserProfile(session.user)
            setUser(userWithProfile)
          } catch (error) {
            console.error('Error updating user profile:', error)
          } finally {
            setLoading(false)
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
          setLoading(false)
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          try {
            const userWithProfile = await fetchUserProfile(session.user)
            setUser(userWithProfile)
          } catch (error) {
            console.error('Error refreshing user profile:', error)
          }
        }
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [isClient, supabase])

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        // Handle specific error cases from context7 search
        if (error.message.includes('Email not confirmed')) {
          return { error: 'Please check your email and click the confirmation link to verify your account before signing in.' }
        }
        if (error.message.includes('Invalid login credentials')) {
          return { error: 'Invalid email or password. Please check your credentials and try again.' }
        }
        return { error: error.message }
      }

      return {}
    } catch (error) {
      return { error: 'An unexpected error occurred during sign in' }
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (
    email: string, 
    password: string, 
    metadata?: { full_name?: string; gym_id?: string }
  ) => {
    try {
      setLoading(true)
      
      // Fix 400 Bad Request - ensure null values instead of undefined/empty strings
      // and fix 500 error by avoiding gym query during signup
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: metadata?.full_name || null,
            gym_id: metadata?.gym_id || null,
          },
          emailRedirectTo: undefined, // Disable email confirmation redirect
        },
      })

      if (error) {
        // Handle specific error cases from context7 search
        if (error.message.includes('Email not confirmed')) {
          return { error: 'Please check your email and click the confirmation link before signing in.' }
        }
        return { error: error.message }
      }

      return {}
    } catch (error) {
      return { error: 'An unexpected error occurred during signup' }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setLoading(true)
      await supabase.auth.signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (updates: Partial<{ full_name: string; role: UserRole }>) => {
    if (!user) return { error: 'No user logged in' }

    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)

      if (error) {
        return { error: error.message }
      }

      // Refresh user data
      await refreshUser()
      return {}
    } catch (error) {
      return { error: 'An unexpected error occurred' }
    }
  }

  const refreshUser = async () => {
    if (!user) return

    try {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (authUser) {
        const userWithProfile = await fetchUserProfile(authUser)
        setUser(userWithProfile)
      }
    } catch (error) {
      console.error('Error refreshing user:', error)
    }
  }

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
    refreshUser,
    isAuthenticated: !!user && isClient, // Fix hydration by ensuring client-only check
  }

  // Prevent hydration mismatch by suppressing hydration warning during client initialization
  if (!isClient) {
    return (
      <div suppressHydrationWarning>
        <AuthContext.Provider value={{
          user: null,
          loading: true,
          signIn,
          signUp,
          signOut,
          updateProfile,
          refreshUser,
          isAuthenticated: false,
        }}>
          {children}
        </AuthContext.Provider>
      </div>
    )
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