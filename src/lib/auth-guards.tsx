'use client'

import { ReactNode, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AuthUser, UserRole, Permission, hasPermission, hasRole, requireAuth, requirePermission, requireRole } from './auth'

interface AuthGuardProps {
  children: ReactNode
  user: AuthUser | null
  loading?: boolean
  fallback?: ReactNode
  redirectTo?: string
}

interface PermissionGuardProps extends AuthGuardProps {
  permission: Permission
}

interface RoleGuardProps extends AuthGuardProps {
  roles: UserRole[]
}

/**
 * Base authentication guard component
 */
export function AuthGuard({ children, user, loading, fallback, redirectTo = '/login' }: AuthGuardProps) {
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push(redirectTo)
    }
  }, [user, loading, router, redirectTo])

  if (loading) {
    return fallback || <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  if (!user) {
    return fallback || null
  }

  return <>{children}</>
}

/**
 * Permission-based guard component
 */
export function PermissionGuard({ 
  children, 
  user, 
  permission, 
  loading, 
  fallback, 
  redirectTo = '/unauthorized' 
}: PermissionGuardProps) {
  const router = useRouter()

  useEffect(() => {
    if (!loading && user && !hasPermission(user, permission)) {
      router.push(redirectTo)
    }
  }, [user, permission, loading, router, redirectTo])

  if (loading) {
    return fallback || <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  if (!user) {
    return <AuthGuard user={user} loading={loading} fallback={fallback}>{children}</AuthGuard>
  }

  if (!hasPermission(user, permission)) {
    return fallback || <div className="text-center p-8">Access denied. Insufficient permissions.</div>
  }

  return <>{children}</>
}

/**
 * Role-based guard component
 */
export function RoleGuard({ 
  children, 
  user, 
  roles, 
  loading, 
  fallback, 
  redirectTo = '/unauthorized' 
}: RoleGuardProps) {
  const router = useRouter()

  useEffect(() => {
    if (!loading && user && !hasRole(user, roles)) {
      router.push(redirectTo)
    }
  }, [user, roles, loading, router, redirectTo])

  if (loading) {
    return fallback || <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  if (!user) {
    return <AuthGuard user={user} loading={loading} fallback={fallback}>{children}</AuthGuard>
  }

  if (!hasRole(user, roles)) {
    return fallback || <div className="text-center p-8">Access denied. Insufficient role permissions.</div>
  }

  return <>{children}</>
}

/**
 * Admin-only guard (owner or admin role)
 */
export function AdminGuard(props: Omit<RoleGuardProps, 'roles'>) {
  return <RoleGuard {...props} roles={['owner', 'admin']} />
}

/**
 * Staff guard (owner, admin, or coach role)
 */
export function StaffGuard(props: Omit<RoleGuardProps, 'roles'>) {
  return <RoleGuard {...props} roles={['owner', 'admin', 'coach']} />
}

/**
 * Conditional rendering based on permissions
 */
interface ConditionalRenderProps {
  user: AuthUser | null
  children: ReactNode
  fallback?: ReactNode
}

interface PermissionRenderProps extends ConditionalRenderProps {
  permission: Permission
}

interface RoleRenderProps extends ConditionalRenderProps {
  roles: UserRole[]
}

export function PermissionRender({ user, permission, children, fallback }: PermissionRenderProps) {
  if (!hasPermission(user, permission)) {
    return fallback ? <>{fallback}</> : null
  }
  return <>{children}</>
}

export function RoleRender({ user, roles, children, fallback }: RoleRenderProps) {
  if (!hasRole(user, roles)) {
    return fallback ? <>{fallback}</> : null
  }
  return <>{children}</>
}

export function AdminRender(props: Omit<RoleRenderProps, 'roles'>) {
  return <RoleRender {...props} roles={['owner', 'admin']} />
}

export function StaffRender(props: Omit<RoleRenderProps, 'roles'>) {
  return <RoleRender {...props} roles={['owner', 'admin', 'coach']} />
}

/**
 * Higher-order component for protecting pages
 */
export function withAuthGuard<P extends object>(
  Component: React.ComponentType<P & { user: AuthUser }>,
  options?: {
    permission?: Permission
    roles?: UserRole[]
    fallback?: ReactNode
    redirectTo?: string
  }
) {
  return function AuthGuardedComponent(props: P & { user: AuthUser | null; loading?: boolean }) {
    const { user, loading, ...componentProps } = props

    if (options?.permission) {
      return (
        <PermissionGuard
          user={user}
          permission={options.permission}
          loading={loading}
          fallback={options.fallback}
          redirectTo={options.redirectTo}
        >
          <Component {...(componentProps as P)} user={user!} />
        </PermissionGuard>
      )
    }

    if (options?.roles) {
      return (
        <RoleGuard
          user={user}
          roles={options.roles}
          loading={loading}
          fallback={options.fallback}
          redirectTo={options.redirectTo}
        >
          <Component {...(componentProps as P)} user={user!} />
        </RoleGuard>
      )
    }

    return (
      <AuthGuard
        user={user}
        loading={loading}
        fallback={options?.fallback}
        redirectTo={options?.redirectTo}
      >
        <Component {...(componentProps as P)} user={user!} />
      </AuthGuard>
    )
  }
}