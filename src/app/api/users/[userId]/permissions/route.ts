import { withAuth } from '@workos-inc/authkit-nextjs';
import { NextRequest, NextResponse } from 'next/server';

import { getUserPermissions, getUserRole , checkPermission } from '@/middleware/permissions.middleware';

interface RouteParams {
  params: {
    userId: string;
  };
}

/**
 * GET /api/users/[userId]/permissions
 * Get all permissions for a specific user in the current organization
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const auth = await withAuth({ ensureSignedIn: false });

    if (!auth.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    if (!auth.organizationId) {
      return NextResponse.json({ error: 'No organization context' }, { status: 400 });
    }

    const { userId } = params;

    // Check if user can view other users' permissions
    const canView = await checkPermission(
      auth.user.id,
      auth.organizationId,
      'organization',
      'manage_roles'
    );

    // Users can always view their own permissions
    if (!canView && userId !== auth.user.id) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
    }

    // Get user's role
    const userRole = await getUserRole(userId, auth.organizationId);

    if (!userRole) {
      return NextResponse.json({ error: 'User not found in organization' }, { status: 404 });
    }

    // Get user's permissions
    const permissions = await getUserPermissions(userId, auth.organizationId);

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
      organizationId: auth.organizationId,
      role: userRole,
      permissions: permissionsByResource,
      totalPermissions: permissions.filter(p => p.granted).length,
    });
  } catch (error) {
    console.error('Get user permissions error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
