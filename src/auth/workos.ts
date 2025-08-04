import {
  withAuth,
  getSignInUrl,
  getSignUpUrl,
  signOut,
  refreshSession,
  getWorkOS,
} from '@workos-inc/authkit-nextjs';

import { AuthError, PermissionError } from '@/errors';
import { logger } from '@/utils/logger';

// Re-export WorkOS auth functions
export { withAuth, getSignInUrl, getSignUpUrl, signOut, refreshSession, getWorkOS };

/**
 * Get current authenticated user with organization context
 */
export async function getCurrentUser(options?: { ensureSignedIn?: boolean }) {
  try {
    const result = await withAuth(options);
    return result;
  } catch (error) {
    logger.error('Failed to get current user', { error });
    throw new AuthError('Failed to authenticate user');
  }
}

/**
 * Require specific organization membership
 */
export async function requireOrganization(organizationId: string) {
  const { user, organizationId: currentOrgId } = await withAuth({ ensureSignedIn: true });

  if (!currentOrgId || currentOrgId !== organizationId) {
    throw new PermissionError('Access denied to this organization');
  }

  return { user, organizationId: currentOrgId };
}

/**
 * Switch to a different organization
 */
export async function switchOrganization(organizationId: string) {
  try {
    const result = await refreshSession({ organizationId });

    if (!result) {
      throw new AuthError('Failed to switch organization');
    }

    if (result.user) {
      logger.info('Switched organization', {
        userId: result.user.id,
        organizationId,
      });
    }

    return result;
  } catch (error) {
    logger.error('Failed to switch organization', {
      error,
      organizationId,
    });
    throw error;
  }
}

/**
 * Get user's organizations
 */
export async function getUserOrganizations(userId: string) {
  const workos = getWorkOS();

  try {
    const { data: organizationMemberships } =
      await workos.userManagement.listOrganizationMemberships({
        userId,
        limit: 100,
      });

    return organizationMemberships.map(membership => ({
      id: membership.organizationId,
      name: 'Organization', // Organization details need to be fetched separately
      role: membership.role?.slug || 'member',
    }));
  } catch (error) {
    logger.error('Failed to get user organizations', {
      error,
      userId,
    });
    throw new AuthError('Failed to retrieve organizations');
  }
}

/**
 * Check if user has specific role in organization
 */
export async function hasRole(
  userId: string,
  organizationId: string,
  requiredRole: 'owner' | 'admin' | 'member'
) {
  const workos = getWorkOS();

  try {
    const { data: memberships } = await workos.userManagement.listOrganizationMemberships({
      userId,
      organizationId,
    });

    if (memberships.length === 0) {
      return false;
    }

    const membership = memberships[0];
    const userRole = membership.role?.slug || 'member';

    // Role hierarchy: owner > admin > member
    const roleHierarchy = { owner: 3, admin: 2, member: 1 };
    const requiredLevel = roleHierarchy[requiredRole] || 1;
    const userLevel = roleHierarchy[userRole as keyof typeof roleHierarchy] || 1;

    return userLevel >= requiredLevel;
  } catch (error) {
    logger.error('Failed to check user role', {
      error,
      userId,
      organizationId,
    });
    return false;
  }
}

/**
 * Create invitation to organization
 */
export async function inviteToOrganization(
  organizationId: string,
  email: string,
  role: 'admin' | 'member' = 'member'
) {
  const workos = getWorkOS();

  try {
    const invitation = await workos.userManagement.sendInvitation({
      organizationId,
      email,
      inviterUserId: (await withAuth({ ensureSignedIn: true })).user.id,
      roleSlug: role,
    });

    logger.info('Sent organization invitation', {
      organizationId,
      email,
      invitationId: invitation.id,
    });

    return invitation;
  } catch (error) {
    logger.error('Failed to send invitation', {
      error,
      organizationId,
      email,
    });
    throw new AuthError('Failed to send invitation');
  }
}
