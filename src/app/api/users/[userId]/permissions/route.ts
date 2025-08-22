import { withAuth, AuthData } from '@/lib/auth-server';
import { NextRequest, NextResponse } from 'next/server';

import { getUserPermissions, getUserRole , checkPermission } from '@/middleware/permissions.middleware';

/**
 * GET /api/users/[userId]/permissions
 * Get all permissions for a specific user in the current organization
 */
export const GET = withAuth(async (
  _request: NextRequest,
  authData: AuthData,
  context: { params: Promise<{ userId: string }> }
) => {
  const params = await context.params;
  try {
    if (!authData.session.organizationId) {
      return NextResponse.json({ error: 'No organization context' }, { status: 400 });
    }

    const { userId } = params;

    // Check if user can view other users' permissions
    const canView = await checkPermission(
      authData.user.id,
      authData.session.organizationId,
      'organization',
      'manage_roles'
    );

    // Users can always view their own permissions
    if (!canView && userId !== authData.user.id) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
    }

    // Get user's role
    const userRole = await getUserRole(userId, authData.session.organizationId);

    if (!userRole) {
      return NextResponse.json({ error: 'User not found in organization' }, { status: 404 });
    }

    // Get user's permissions
    const permissions = await getUserPermissions(userId, authData.session.organizationId);

    // Group permissions by resource
    const permissionsByResource: Record<string, { action: string; granted: boolean }[]> = {};

    permissions.forEach(perm => {
      if (!permissionsByResource[perm.resource]) {
        permissionsByResource[perm.resource] = [];
      }
      permissionsByResource[perm.resource].push({
        action: perm.action,
        granted: perm.granted,
      });
    });

    return NextResponse.json({
      userId,
      organizationId: authData.session.organizationId,
      role: userRole,
      permissions: permissionsByResource,
      totalPermissions: permissions.filter(p => p.granted).length,
    });
  } catch (error) {
    console.error('Get user permissions error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});
