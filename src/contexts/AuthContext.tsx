'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

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
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshAuth = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/session', {
        credentials: 'include',
      });
      
      const data = await response.json();
      
      if (data.success && data.user && data.session) {
        setUser(data.user);
        setSession(data.session);
      } else {
        setUser(null);
        setSession(null);
      }
    } catch (error) {
      console.error('Failed to refresh auth', { error });
      setUser(null);
      setSession(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/auth/session', {
        method: 'DELETE',
        credentials: 'include',
      });
      
      if (response.ok) {
        setUser(null);
        setSession(null);
        // Redirect to home page
        window.location.href = '/';
      } else {
        console.error('Failed to sign out');
      }
    } catch (error) {
      console.error('Sign out error', { error });
    } finally {
      setLoading(false);
    }
  }, []);

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

  // Load auth state on mount
  useEffect(() => {
    refreshAuth();
  }, [refreshAuth]);

  // Computed properties
  const isAuthenticated = !!user;
  const hasOrganization = !!session?.organizationId;
  const hasPermissions = !!(session?.permissions && session.permissions.length > 0);
  const hasRoles = !!session?.role;

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