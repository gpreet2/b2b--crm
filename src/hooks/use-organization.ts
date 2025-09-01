'use client';

import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

export function useOrganization() {
  const currentUser = useQuery(api.auth.getCurrentUserQuery);
  
  return {
    organizationId: currentUser?.organizationId,
    role: currentUser?.role,
    permissions: currentUser?.permissions,
    organization: currentUser?.organization,
    hasPermission: (permission: string) => 
      currentUser?.permissions?.includes(permission) || false,
    canAccessOrganization: (orgId: string) => 
      currentUser?.organizationId === orgId,
    hasOrganization: currentUser?.hasOrganization || false,
    loading: currentUser === undefined,
  };
}