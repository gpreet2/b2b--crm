'use client'

import { useAuth } from './auth-context';
import { Permission, roleHasPermission, roleHasAllPermissions, roleHasAnyPermission, getRolePermissions } from './permissions';

// Hook to check if the current user has a specific permission
export function usePermission(permission: Permission): boolean {
  const { user } = useAuth();
  
  if (!user) return false;
  
  // Check role-based permissions
  return roleHasPermission(user.role, permission);
}

// Hook to check if the current user has ALL of the specified permissions
export function usePermissions(permissions: Permission[]): boolean {
  const { user } = useAuth();
  
  if (!user) return false;
  
  return roleHasAllPermissions(user.role, permissions);
}

// Hook to check if the current user has ANY of the specified permissions
export function useAnyPermission(permissions: Permission[]): boolean {
  const { user } = useAuth();
  
  if (!user) return false;
  
  return roleHasAnyPermission(user.role, permissions);
}

// Hook to get all permissions for the current user
export function useUserPermissions(): Permission[] {
  const { user } = useAuth();
  
  if (!user) return [];
  
  // If user has explicit permissions in JWT, use those
  if (user.permissions) {
    return user.permissions as Permission[];
  }
  
  // Otherwise, derive from role
  return getRolePermissions(user.role);
}

// Component wrapper that only renders children if user has permission
interface ProtectedComponentProps {
  permission: Permission;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function ProtectedComponent({ permission, children, fallback = null }: ProtectedComponentProps) {
  const hasPermission = usePermission(permission);
  
  return hasPermission ? <>{children}</> : <>{fallback}</>;
}

// Component wrapper that only renders children if user has ALL permissions
interface RequireAllPermissionsProps {
  permissions: Permission[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function RequireAllPermissions({ permissions, children, fallback = null }: RequireAllPermissionsProps) {
  const hasPermissions = usePermissions(permissions);
  
  return hasPermissions ? <>{children}</> : <>{fallback}</>;
}

// Component wrapper that only renders children if user has ANY permission
interface RequireAnyPermissionProps {
  permissions: Permission[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function RequireAnyPermission({ permissions, children, fallback = null }: RequireAnyPermissionProps) {
  const hasPermission = useAnyPermission(permissions);
  
  return hasPermission ? <>{children}</> : <>{fallback}</>;
}

// Helper function for conditional rendering based on permission
export function withPermission<T extends {}>(
  Component: React.ComponentType<T>,
  permission: Permission,
  Fallback?: React.ComponentType<T>
) {
  return function ProtectedWrapper(props: T) {
    const hasPermission = usePermission(permission);
    
    if (hasPermission) {
      return <Component {...props} />;
    }
    
    if (Fallback) {
      return <Fallback {...props} />;
    }
    
    return null;
  };
}