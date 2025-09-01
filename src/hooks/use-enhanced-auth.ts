'use client';

import { useAuth } from '@workos-inc/authkit-nextjs/components';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

export function useEnhancedAuth() {
  const { user: workosUser } = useAuth();
  const currentUser = useQuery(api.auth.getCurrentUserQuery);
  
  // Combine WorkOS user with Convex data
  const user = workosUser && currentUser ? {
    id: (currentUser as any)._id || (currentUser as any).id,
    email: workosUser.email || '',
    firstName: workosUser.firstName || '',
    lastName: workosUser.lastName || '',
    profilePictureUrl: workosUser.profilePictureUrl || null,
  } : null;

  const getDisplayName = () => {
    if (!user) return 'Anonymous';
    if (user.firstName || user.lastName) {
      return `${user.firstName || ''} ${user.lastName || ''}`.trim();
    }
    return user.email || 'Unknown';
  };

  const getInitials = () => {
    if (!user) return 'A';
    if (user.firstName || user.lastName) {
      const firstName = user.firstName || '';
      const lastName = user.lastName || '';
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    }
    return user.email.charAt(0).toUpperCase();
  };

  const isImpersonating = () => false; // Not implemented yet

  // Permission helper methods
  const hasPermission = (permission: string): boolean => false; // Placeholder
  const hasAnyPermission = (permissions: string[]): boolean => false; // Placeholder
  const hasAllPermissions = (permissions: string[]): boolean => false; // Placeholder
  const hasRole = (role: string): boolean => false; // Placeholder
  const hasAnyRole = (roles: string[]): boolean => false; // Placeholder

  return {
    user,
    role: currentUser?.role || null,
    organizationId: currentUser?.organizationId || null,
    permissions: [], // Will be implemented with permission system
    isImpersonating,
    getDisplayName,
    getInitials,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    hasAnyRole,
    loading: false, // Placeholder
  };
}