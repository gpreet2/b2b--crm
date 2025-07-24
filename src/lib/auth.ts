import { createClient } from '@/utils/supabase/client'
import { User } from '@supabase/supabase-js'

export type UserRole = 'owner' | 'admin' | 'coach' | 'member'

export interface AuthUser extends User {
  gym_id?: string
  role?: UserRole
  full_name?: string
}

export interface AuthContext {
  user: AuthUser | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, metadata?: any) => Promise<void>
  signOut: () => Promise<void>
  isAuthenticated: boolean
}

// Permission matrix defining what each role can do
export const PERMISSIONS = {
  owner: {
    // Owners can do everything
    can_manage_gym: true,
    can_manage_users: true,
    can_manage_finances: true,
    can_manage_classes: true,
    can_manage_clients: true,
    can_view_analytics: true,
    can_manage_settings: true,
  },
  admin: {
    // Admins have most permissions except gym management
    can_manage_gym: false,
    can_manage_users: true,
    can_manage_finances: true,
    can_manage_classes: true,
    can_manage_clients: true,
    can_view_analytics: true,
    can_manage_settings: true,
  },
  coach: {
    // Coaches can manage classes and clients
    can_manage_gym: false,
    can_manage_users: false,
    can_manage_finances: false,
    can_manage_classes: true,
    can_manage_clients: true,
    can_view_analytics: false,
    can_manage_settings: false,
  },
  member: {
    // Members have limited permissions
    can_manage_gym: false,
    can_manage_users: false,
    can_manage_finances: false,
    can_manage_classes: false,
    can_manage_clients: false,
    can_view_analytics: false,
    can_manage_settings: false,
  },
} as const

export type Permission = keyof typeof PERMISSIONS.owner

/**
 * Check if user has a specific permission
 */
export function hasPermission(user: AuthUser | null, permission: Permission): boolean {
  if (!user || !user.role) return false
  return PERMISSIONS[user.role][permission] || false
}

/**
 * Check if user has any of the specified roles
 */
export function hasRole(user: AuthUser | null, roles: UserRole[]): boolean {
  if (!user || !user.role) return false
  return roles.includes(user.role)
}

/**
 * Check if user is an admin (owner or admin role)
 */
export function isAdmin(user: AuthUser | null): boolean {
  return hasRole(user, ['owner', 'admin'])
}

/**
 * Check if user can manage other users
 */
export function canManageUsers(user: AuthUser | null): boolean {
  return hasPermission(user, 'can_manage_users')
}

/**
 * Check if user can view financial data
 */
export function canViewFinances(user: AuthUser | null): boolean {
  return hasPermission(user, 'can_manage_finances')
}

/**
 * Check if user can manage classes
 */
export function canManageClasses(user: AuthUser | null): boolean {
  return hasPermission(user, 'can_manage_classes')
}

/**
 * Check if user belongs to the same gym
 */
export function isSameGym(user: AuthUser | null, targetGymId: string): boolean {
  if (!user || !user.gym_id) return false
  return user.gym_id === targetGymId
}

/**
 * Get user's display name
 */
export function getDisplayName(user: AuthUser | null): string {
  if (!user) return 'Guest'
  return user.full_name || user.email || 'Unknown User'
}

/**
 * Initialize Supabase client for client-side operations
 */
export function createSupabaseClient() {
  return createClient()
}

/**
 * Authorization guard for protecting routes
 */
export function requireAuth(user: AuthUser | null): asserts user is AuthUser {
  if (!user) {
    throw new Error('Authentication required')
  }
}

/**
 * Authorization guard for specific permissions
 */
export function requirePermission(user: AuthUser | null, permission: Permission): asserts user is AuthUser {
  requireAuth(user)
  if (!hasPermission(user, permission)) {
    throw new Error(`Permission '${permission}' required`)
  }
}

/**
 * Authorization guard for specific roles
 */
export function requireRole(user: AuthUser | null, roles: UserRole[]): asserts user is AuthUser {
  requireAuth(user)
  if (!hasRole(user, roles)) {
    throw new Error(`One of roles [${roles.join(', ')}] required`)
  }
}

/**
 * Get protected navigation items based on user permissions
 */
export function getAuthorizedNavigation(user: AuthUser | null) {
  const navigation = []
  
  // Dashboard is available to all authenticated users
  if (user) {
    navigation.push({ name: 'Dashboard', href: '/', icon: 'dashboard' })
  }
  
  // Classes - available to coaches and above
  if (hasPermission(user, 'can_manage_classes')) {
    navigation.push({ name: 'Classes', href: '/classes', icon: 'classes' })
  }
  
  // People - available to coaches and above
  if (hasPermission(user, 'can_manage_clients')) {
    navigation.push({ name: 'People', href: '/people', icon: 'people' })
  }
  
  // Performance - available to all users
  if (user) {
    navigation.push({ name: 'Performance', href: '/perform', icon: 'performance' })
  }
  
  // Analytics - admin and owner only
  if (hasPermission(user, 'can_view_analytics')) {
    navigation.push({ name: 'Analytics', href: '/analytics', icon: 'analytics' })
  }
  
  // Financial - admin and owner only
  if (hasPermission(user, 'can_manage_finances')) {
    navigation.push({ name: 'Financial', href: '/financial', icon: 'financial' })
  }
  
  return navigation
}