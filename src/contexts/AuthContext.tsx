'use client';

import React, { createContext, useContext, useCallback, useEffect, useState } from 'react';

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

  // Fetch session data from our custom API
  const fetchSession = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/auth/session', {
        method: 'GET',
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.user && data.session) {
          setUser(data.user);
          setSession(data.session);
        } else {
          setUser(null);
          setSession(null);
        }
      } else {
        setUser(null);
        setSession(null);
      }
    } catch (error) {
      console.error('Failed to fetch session:', error);
      setUser(null);
      setSession(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial session fetch
  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  const signOut = useCallback(async () => {
    try {
      await fetch('/api/auth/session', {
        method: 'DELETE',
        credentials: 'include',
      });
      
      setUser(null);
      setSession(null);
      
      // Redirect to auth page
      window.location.href = '/auth';
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  }, []);

  const refreshAuth = useCallback(async () => {
    await fetchSession();
  }, [fetchSession]);

  // Computed values
  const isAuthenticated = !!user && !!session;
  const hasOrganization = !!session?.organizationId;
  const hasPermissions = !!session?.permissions && session.permissions.length > 0;
  const hasRoles = !!session?.role;

  // Enhanced utility functions
  const hasPermission = useCallback((permission: string) => {
    return session?.permissions?.includes(permission) ?? false;
  }, [session?.permissions]);

  const hasAnyPermission = useCallback((permissionList: string[]) => {
    return permissionList.some(permission => hasPermission(permission));
  }, [hasPermission]);

  const hasAllPermissions = useCallback((permissionList: string[]) => {
    return permissionList.every(permission => hasPermission(permission));
  }, [hasPermission]);

  const hasRole = useCallback((requiredRole: string) => {
    return session?.role === requiredRole;
  }, [session?.role]);

  const hasAnyRole = useCallback((roleList: string[]) => {
    return roleList.includes(session?.role || '');
  }, [session?.role]);

  const isImpersonating = useCallback(() => {
    return !!session?.impersonator;
  }, [session?.impersonator]);

  const getDisplayName = useCallback(() => {
    if (!user) return '';
    if (user.firstName || user.lastName) {
      return `${user.firstName || ''} ${user.lastName || ''}`.trim();
    }
    return user.email;
  }, [user]);

  const getInitials = useCallback(() => {
    if (!user) return '';
    if (user.firstName || user.lastName) {
      const first = user.firstName?.[0]?.toUpperCase() || '';
      const last = user.lastName?.[0]?.toUpperCase() || '';
      return `${first}${last}`;
    }
    return user.email.substring(0, 2).toUpperCase();
  }, [user]);

  const value: AuthContextType = {
    user,
    session,
    loading,
    isAuthenticated,
    signOut,
    refreshAuth,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    hasAnyRole,
    isImpersonating,
    getDisplayName,
    getInitials,
    hasOrganization,
    hasPermissions,
    hasRoles,
    // Legacy compatibility
    role: session?.role || null,
    organizationId: session?.organizationId || null,
    permissions: session?.permissions || [],
    entitlements: session?.entitlements || [],
    impersonator: session?.impersonator || null,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}