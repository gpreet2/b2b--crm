'use client'

import { useMemo } from 'react'
import { useAuth } from './auth-context'
import { 
  UserRole, 
  Permission, 
  hasPermission, 
  hasRole, 
  isAdmin, 
  canManageUsers, 
  canViewFinances, 
  canManageClasses,
  getDisplayName,
  getAuthorizedNavigation
} from './auth'

/**
 * Hook to check if user has a specific permission
 */
export function usePermission(permission: Permission) {
  const { user } = useAuth()
  return useMemo(() => hasPermission(user, permission), [user, permission])
}

/**
 * Hook to check if user has any of the specified roles
 */
export function useRole(roles: UserRole[]) {
  const { user } = useAuth()
  return useMemo(() => hasRole(user, roles), [user, roles])
}

/**
 * Hook to check if user is admin (owner or admin role)
 */
export function useIsAdmin() {
  const { user } = useAuth()
  return useMemo(() => isAdmin(user), [user])
}

/**
 * Hook to check if user can manage other users
 */
export function useCanManageUsers() {
  const { user } = useAuth()
  return useMemo(() => canManageUsers(user), [user])
}

/**
 * Hook to check if user can view financial data
 */
export function useCanViewFinances() {
  const { user } = useAuth()
  return useMemo(() => canViewFinances(user), [user])
}

/**
 * Hook to check if user can manage classes
 */
export function useCanManageClasses() {
  const { user } = useAuth()
  return useMemo(() => canManageClasses(user), [user])
}

/**
 * Hook to get user's display name
 */
export function useDisplayName() {
  const { user } = useAuth()
  return useMemo(() => getDisplayName(user), [user])
}

/**
 * Hook to get user's gym ID
 */
export function useGymId() {
  const { user } = useAuth()
  return user?.gym_id || null
}

/**
 * Hook to get user's role
 */
export function useUserRole() {
  const { user } = useAuth()
  return user?.role || null
}

/**
 * Hook to get authorized navigation items
 */
export function useAuthorizedNavigation() {
  const { user } = useAuth()
  return useMemo(() => getAuthorizedNavigation(user), [user])
}

/**
 * Hook for form validation - check if current user can assign a role
 */
export function useCanAssignRole(targetRole: UserRole) {
  const { user } = useAuth()
  
  return useMemo(() => {
    if (!user || !user.role) return false
    
    // Only owners can assign owner role
    if (targetRole === 'owner' && user.role !== 'owner') {
      return false
    }
    
    // Only owners and admins can assign admin role
    if (targetRole === 'admin' && !['owner', 'admin'].includes(user.role)) {
      return false
    }
    
    // Coaches can only assign member role
    if (user.role === 'coach' && targetRole !== 'member') {
      return false
    }
    
    // Members cannot assign any roles
    if (user.role === 'member') {
      return false
    }
    
    return true
  }, [user, targetRole])
}

/**
 * Hook to check if user belongs to the same gym as a target
 */
export function useIsSameGym(targetGymId?: string) {
  const { user } = useAuth()
  
  return useMemo(() => {
    if (!user || !user.gym_id || !targetGymId) return false
    return user.gym_id === targetGymId
  }, [user, targetGymId])
}

/**
 * Hook to get available roles that current user can assign
 */
export function useAssignableRoles(): UserRole[] {
  const { user } = useAuth()
  
  return useMemo(() => {
    if (!user || !user.role) return []
    
    switch (user.role) {
      case 'owner':
        return ['owner', 'admin', 'coach', 'member']
      case 'admin':
        return ['admin', 'coach', 'member']
      case 'coach':
        return ['member']
      default:
        return []
    }
  }, [user])
}

/**
 * Hook for permission-based feature flags
 */
export function useFeatureFlags() {
  const { user } = useAuth()
  
  return useMemo(() => ({
    canViewAnalytics: hasPermission(user, 'can_view_analytics'),
    canManageFinances: hasPermission(user, 'can_manage_finances'),
    canManageGym: hasPermission(user, 'can_manage_gym'),
    canManageUsers: hasPermission(user, 'can_manage_users'),
    canManageClasses: hasPermission(user, 'can_manage_classes'),
    canManageClients: hasPermission(user, 'can_manage_clients'),
    canManageSettings: hasPermission(user, 'can_manage_settings'),
  }), [user])
}

/**
 * Hook for user preferences and settings
 */
export function useUserPreferences() {
  const { user } = useAuth()
  
  return useMemo(() => ({
    userId: user?.id,
    gymId: user?.gym_id,
    role: user?.role,
    fullName: user?.full_name,
    email: user?.email,
    isOwner: user?.role === 'owner',
    isAdmin: ['owner', 'admin'].includes(user?.role || ''),
    isStaff: ['owner', 'admin', 'coach'].includes(user?.role || ''),
    isMember: user?.role === 'member',
  }), [user])
}

/**
 * Hook for debugging auth state (development only)
 */
export function useAuthDebug() {
  const { user, loading, isAuthenticated } = useAuth()
  
  if (process.env.NODE_ENV !== 'development') {
    return null
  }
  
  return {
    user,
    loading,
    isAuthenticated,
    userId: user?.id,
    userRole: user?.role,
    userGym: user?.gym_id,
    permissions: user ? {
      canManageGym: hasPermission(user, 'can_manage_gym'),
      canManageUsers: hasPermission(user, 'can_manage_users'),
      canManageFinances: hasPermission(user, 'can_manage_finances'),
      canManageClasses: hasPermission(user, 'can_manage_classes'),
      canManageClients: hasPermission(user, 'can_manage_clients'),
      canViewAnalytics: hasPermission(user, 'can_view_analytics'),
      canManageSettings: hasPermission(user, 'can_manage_settings'),
    } : null
  }
}