'use client';

import { useAuth } from '@workos-inc/authkit-nextjs/components';

export function useOrganization() {
  const { user, organizationId, role, permissions } = useAuth();
  
  return {
    organizationId,
    role,
    permissions,
    hasPermission: (permission: string) => permissions?.includes(permission) || false,
    canAccessOrganization: (orgId: string) => organizationId === orgId,
  };
}