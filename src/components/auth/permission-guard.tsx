'use client';

import React from 'react';
import { useEnhancedAuth } from '@/hooks/use-enhanced-auth';

interface PermissionGuardProps {
  permission?: string;
  permissions?: string[];
  role?: string;
  roles?: string[];
  requireAll?: boolean; // For permissions array - require all vs any
  children: React.ReactNode;
  fallback?: React.ReactNode;
  loading?: React.ReactNode;
}

export function PermissionGuard({
  permission,
  permissions,
  role,
  roles,
  requireAll = false,
  children,
  fallback,
  loading,
}: PermissionGuardProps) {
  const {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    hasAnyRole,
    loading: authLoading,
  } = useEnhancedAuth();

  // Show loading state while auth is loading
  if (authLoading) {
    return <>{loading || <div className="animate-pulse bg-gray-200 h-4 rounded" />}</>;
  }

  // Check single permission
  if (permission && !hasPermission(permission)) {
    return <>{fallback || null}</>;
  }

  // Check permissions array
  if (permissions && permissions.length > 0) {
    const hasAccess = requireAll 
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions);
    
    if (!hasAccess) {
      return <>{fallback || null}</>;
    }
  }

  // Check single role
  if (role && !hasRole(role)) {
    return <>{fallback || null}</>;
  }

  // Check roles array
  if (roles && roles.length > 0 && !hasAnyRole(roles)) {
    return <>{fallback || null}</>;
  }

  return <>{children}</>;
}

interface RoleGuardProps {
  role?: string;
  roles?: string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
  loading?: React.ReactNode;
}

export function RoleGuard({
  role,
  roles,
  children,
  fallback,
  loading,
}: RoleGuardProps) {
  return (
    <PermissionGuard
      role={role}
      roles={roles}
      fallback={fallback}
      loading={loading}
    >
      {children}
    </PermissionGuard>
  );
}

// Access Denied component for fallbacks
export function AccessDenied({ 
  message = "You don't have permission to access this resource.",
  showContactAdmin = true 
}: { 
  message?: string;
  showContactAdmin?: boolean;
}) {
  return (
    <div className="flex items-center justify-center min-h-[200px] p-8">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Access Denied</h3>
        <p className="text-gray-600 mb-4">{message}</p>
        {showContactAdmin && (
          <p className="text-sm text-gray-500">
            Contact your administrator if you believe this is an error.
          </p>
        )}
      </div>
    </div>
  );
}