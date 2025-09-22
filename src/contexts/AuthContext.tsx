'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth as useWorkOSAuth } from '@workos-inc/authkit-react';

export interface AuthUser {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  profilePictureUrl: string | null;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthSession {
  id: string;
  userId: string;
  organizationId: string | null;
  role: string | null;
  permissions: string[];
  entitlements: string[];
  impersonator: any | null;
}

export interface AuthContextType {
  user: AuthUser | null;
  session: AuthSession | null;
  loading: boolean;
  isAuthenticated: boolean;
  signOut: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  
  // Enhanced utility functions
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissionList: string[]) => boolean;
  hasAllPermissions: (permissionList: string[]) => boolean;
  hasRole: (requiredRole: string) => boolean;
  hasAnyRole: (roleList: string[]) => boolean;
  isImpersonating: () => boolean;
  getDisplayName: () => string;
  getInitials: () => string;
  
  // Computed properties
  hasOrganization: boolean;
  hasPermissions: boolean;
  hasRoles: boolean;
  
  // Legacy compatibility
  role: string | null;
  organizationId: string | null;
  permissions: string[];
  entitlements: string[];
  impersonator: any | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Use WorkOS AuthKit hook for authentication state
  const workosAuth = useWorkOSAuth();
  
  // Transform WorkOS auth state to match our AuthContext interface
  const user: AuthUser | null = workosAuth.user ? {
    id: workosAuth.user.id,
    email: workosAuth.user.email,
    firstName: workosAuth.user.firstName,
    lastName: workosAuth.user.lastName,
    profilePictureUrl: workosAuth.user.profilePictureUrl,
    emailVerified: workosAuth.user.emailVerified,
    createdAt: workosAuth.user.createdAt,
    updatedAt: workosAuth.user.updatedAt,
  } : null;

  const session: AuthSession | null = workosAuth.user ? {
    id: `session_${workosAuth.user.id}`,
    userId: workosAuth.user.id,
    organizationId: workosAuth.organizationId,
    role: workosAuth.role,
    permissions: workosAuth.permissions,
    entitlements: workosAuth.featureFlags,
    impersonator: workosAuth.impersonator,
  } : null;

  const refreshAuth = useCallback(async () => {
    // With WorkOS AuthKit, auth state is automatically managed
    // This could trigger a re-fetch if needed, but typically not required
    console.log('✅ Auth refresh handled by WorkOS AuthKit');
  }, []);

  const signOut = useCallback(async () => {
    try {
      // Use WorkOS AuthKit signOut method
      await workosAuth.signOut();
      console.log('✅ Signed out via WorkOS AuthKit');
    } catch (error) {
      console.error('Sign out error', { error });
    }
  }, [workosAuth]);

  // Enhanced utility functions
  const hasPermission = useCallback((permission: string): boolean => {
    return session?.permissions?.includes(permission) ?? false;
  }, [session?.permissions]);

  const hasAnyPermission = useCallback((permissionList: string[]): boolean => {
    if (!session?.permissions) return false;
    return permissionList.some(permission => session.permissions.includes(permission));
  }, [session?.permissions]);

  const hasAllPermissions = useCallback((permissionList: string[]): boolean => {
    if (!session?.permissions) return false;
    return permissionList.every(permission => session.permissions.includes(permission));
  }, [session?.permissions]);

  const hasRole = useCallback((requiredRole: string): boolean => {
    return session?.role === requiredRole;
  }, [session?.role]);

  const hasAnyRole = useCallback((roleList: string[]): boolean => {
    if (!session?.role) return false;
    return roleList.includes(session.role);
  }, [session?.role]);

  const isImpersonating = useCallback((): boolean => {
    return !!session?.impersonator;
  }, [session?.impersonator]);

  const getDisplayName = useCallback((): string => {
    if (!user) return '';
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    if (user.firstName) return user.firstName;
    if (user.lastName) return user.lastName;
    return user.email?.split('@')[0] || 'User';
  }, [user]);

  const getInitials = useCallback((): string => {
    if (!user) return '';
    const firstName = user.firstName || '';
    const lastName = user.lastName || '';
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    if (firstName) return firstName[0].toUpperCase();
    if (lastName) return lastName[0].toUpperCase();
    return (user.email?.[0] || 'U').toUpperCase();
  }, [user]);

  // No need to load auth state manually - WorkOS AuthKit handles it
  // useEffect removed as WorkOS AuthKit manages auth state automatically

  // Computed properties using WorkOS AuthKit state
  const loading = workosAuth.isLoading;
  const isAuthenticated = !!workosAuth.user;
  const hasOrganization = !!workosAuth.organizationId;
  const hasPermissions = !!(workosAuth.permissions && workosAuth.permissions.length > 0);
  const hasRoles = !!workosAuth.role;

  const contextValue: AuthContextType = {
    user,
    session,
    loading,
    isAuthenticated,
    signOut,
    refreshAuth,
    
    // Enhanced utility functions
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    hasAnyRole,
    isImpersonating,
    getDisplayName,
    getInitials,
    
    // Computed properties
    hasOrganization,
    hasPermissions,
    hasRoles,
    
    // Legacy compatibility (direct access to session properties)
    role: session?.role || null,
    organizationId: session?.organizationId || null,
    permissions: session?.permissions || [],
    entitlements: session?.entitlements || [],
    impersonator: session?.impersonator || null,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}