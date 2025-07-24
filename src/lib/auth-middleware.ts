import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { AuthUser, UserRole, Permission, hasPermission, hasRole } from './auth'

/**
 * Server-side authentication utilities
 */
export class ServerAuth {
  private async getSupabaseClient() {
    return await createClient()
  }

  /**
   * Get current user from server session
   */
  async getUser(): Promise<AuthUser | null> {
    try {
      const supabase = await this.getSupabaseClient()
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error || !user) {
        return null
      }

      // Get user profile with gym and role information
      const { data: profile } = await supabase
        .from('profiles')
        .select('gym_id, role, full_name')
        .eq('id', user.id)
        .single()

      return {
        ...user,
        gym_id: profile?.gym_id,
        role: profile?.role as UserRole,
        full_name: profile?.full_name,
      }
    } catch (error) {
      console.error('Error getting user:', error)
      return null
    }
  }

  /**
   * Require authentication for server-side operations
   */
  async requireUser(): Promise<AuthUser> {
    const user = await this.getUser()
    if (!user) {
      throw new Error('Authentication required')
    }
    return user
  }

  /**
   * Require specific permission for server-side operations
   */
  async requirePermission(permission: Permission): Promise<AuthUser> {
    const user = await this.requireUser()
    if (!hasPermission(user, permission)) {
      throw new Error(`Permission '${permission}' required`)
    }
    return user
  }

  /**
   * Require specific role for server-side operations
   */
  async requireRole(roles: UserRole[]): Promise<AuthUser> {
    const user = await this.requireUser()
    if (!hasRole(user, roles)) {
      throw new Error(`One of roles [${roles.join(', ')}] required`)
    }
    return user
  }
}

/**
 * Middleware factory for protecting API routes
 */
export function withAuth(
  handler: (req: NextRequest, user: AuthUser) => Promise<NextResponse> | NextResponse
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    try {
      const auth = new ServerAuth()
      const user = await auth.requireUser()
      return await handler(req, user)
    } catch (error) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
  }
}

/**
 * Middleware factory for protecting API routes with permission check
 */
export function withPermission(
  permission: Permission,
  handler: (req: NextRequest, user: AuthUser) => Promise<NextResponse> | NextResponse
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    try {
      const auth = new ServerAuth()
      const user = await auth.requirePermission(permission)
      return await handler(req, user)
    } catch (error) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }
  }
}

/**
 * Middleware factory for protecting API routes with role check
 */
export function withRole(
  roles: UserRole[],
  handler: (req: NextRequest, user: AuthUser) => Promise<NextResponse> | NextResponse
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    try {
      const auth = new ServerAuth()
      const user = await auth.requireRole(roles)
      return await handler(req, user)
    } catch (error) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }
  }
}

/**
 * Page-level authorization component
 */
export async function protectPage(
  permission?: Permission,
  roles?: UserRole[]
): Promise<AuthUser | null> {
  try {
    const auth = new ServerAuth()
    let user: AuthUser

    if (permission) {
      user = await auth.requirePermission(permission)
    } else if (roles) {
      user = await auth.requireRole(roles)
    } else {
      user = await auth.requireUser()
    }

    return user
  } catch (error) {
    // In Next.js app router, we handle redirects differently
    // This would typically redirect to login page
    return null
  }
}

/**
 * Utility to check if user can access a specific gym's data
 */
export async function canAccessGym(gymId: string): Promise<boolean> {
  try {
    const auth = new ServerAuth()
    const user = await auth.getUser()
    
    if (!user || !user.gym_id) return false
    return user.gym_id === gymId
  } catch (error) {
    return false
  }
}

/**
 * Utility to get user's gym ID
 */
export async function getUserGymId(): Promise<string | null> {
  try {
    const auth = new ServerAuth()
    const user = await auth.getUser()
    return user?.gym_id || null
  } catch (error) {
    return null
  }
}