'use client';

import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useState, useEffect } from 'react';
import { Id } from '../../convex/_generated/dataModel';

export function useOrganization() {
  const [localActiveOrgId, setLocalActiveOrgId] = useState<string | null>(null);

  // Get organization context (comprehensive view)
  const organizationContext = useQuery(api.organizationContext.getOrganizationContext);

  // Get user organizations (for potential multi-org support)
  const userOrganizations = useQuery(api.organizationContext.getUserOrganizations);

  // Get current user (legacy compatibility)
  const currentUser = useQuery(api.auth.getCurrentUserQuery);

  // Organization switching mutation
  const setActiveOrganization = useMutation(api.organizationContext.setActiveOrganization);

  // Initialize local state from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('activeOrganizationId');
      if (stored) {
        setLocalActiveOrgId(stored);
      }
    }
  }, []);

  // Update localStorage when organization changes
  useEffect(() => {
    if (organizationContext?.organization?.id && typeof window !== 'undefined') {
      localStorage.setItem('activeOrganizationId', organizationContext.organization.id);
      setLocalActiveOrgId(organizationContext.organization.id);
    }
  }, [organizationContext?.organization?.id]);

  const switchOrganization = async (organizationId: Id<"organizations">) => {
    try {
      await setActiveOrganization({ organizationId });

      // Update local state and localStorage
      setLocalActiveOrgId(organizationId);
      if (typeof window !== 'undefined') {
        localStorage.setItem('activeOrganizationId', organizationId);
      }

      return { success: true };
    } catch (error) {
      console.error('Failed to switch organization:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to switch organization'
      };
    }
  };

  const clearOrganizationContext = () => {
    setLocalActiveOrgId(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('activeOrganizationId');
    }
  };

  return {
    // Organization data
    organizationId: organizationContext?.organization?.id || currentUser?.organizationId,
    organization: organizationContext?.organization || currentUser?.organization,
    organizations: userOrganizations || [],

    // User data
    role: organizationContext?.user?.role || currentUser?.role,
    permissions: organizationContext?.user?.permissions || currentUser?.permissions || [],

    // Access control
    hasPermission: (permission: string) =>
      organizationContext?.user?.permissions?.includes(permission) ||
      organizationContext?.user?.permissions?.includes("*") ||
      currentUser?.permissions?.includes(permission) ||
      false,

    canAccessOrganization: (orgId: string) =>
      organizationContext?.organization?.id === orgId ||
      currentUser?.organizationId === orgId,

    // Convenience access flags
    canManageOrganization: organizationContext?.access?.canManageOrganization || false,
    canManageUsers: organizationContext?.access?.canManageUsers || false,
    canViewReports: organizationContext?.access?.canViewReports || false,
    canManageClients: organizationContext?.access?.canManageClients || false,
    isOwner: organizationContext?.access?.isOwner || currentUser?.role === "owner",
    isAdmin: organizationContext?.access?.isAdmin || ["admin", "owner"].includes(currentUser?.role || ""),

    // State flags
    hasOrganization: organizationContext?.hasOrganization ?? currentUser?.hasOrganization ?? false,
    needsOnboarding: organizationContext?.needsOnboarding ?? !currentUser?.hasOrganization ?? true,
    loading: organizationContext === undefined || currentUser === undefined,

    // Organization management
    switchOrganization,
    clearOrganizationContext,

    // Active organization state
    activeOrganizationId: localActiveOrgId,

    // Raw context for advanced use cases
    _context: organizationContext,
    _currentUser: currentUser,
  };
}