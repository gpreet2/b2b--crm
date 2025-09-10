'use client';

import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useAuthenticatedUser } from './use-authenticated-user';

export function useEnhancedAuth() {
  const { user: currentUser, isLoading } = useAuthenticatedUser();
  
  // Use Convex user data directly
  const user = currentUser ? {
    id: currentUser._id,
    email: currentUser.email || '',
    firstName: currentUser.name?.split(' ')[0] || '',
    lastName: currentUser.name?.split(' ').slice(1).join(' ') || '',
    profilePictureUrl: currentUser.picture || null,
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
    loading: isLoading
  };
}