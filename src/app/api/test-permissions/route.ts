import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@workos-inc/authkit-nextjs';
import { checkPermission, getUserPermissions, getUserRole } from '@/middleware/permissions.middleware';

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const auth = await withAuth({ ensureSignedIn: false });
    
    if (!auth.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    if (!auth.organizationId) {
      return NextResponse.json({ error: 'No organization context' }, { status: 400 });
    }

    // Test permission check
    const canReadUsers = await checkPermission(
      auth.user.id,
      auth.organizationId,
      'users',
      'read'
    );

    const canWriteUsers = await checkPermission(
      auth.user.id,
      auth.organizationId,
      'users',
      'write'
    );

    const canDeleteUsers = await checkPermission(
      auth.user.id,
      auth.organizationId,
      'users',
      'delete'
    );

    // Get all user permissions
    const permissions = await getUserPermissions(
      auth.user.id,
      auth.organizationId
    );

    // Get user role
    const role = await getUserRole(
      auth.user.id,
      auth.organizationId
    );

    return NextResponse.json({
      user: {
        id: auth.user.id,
        email: auth.user.email,
      },
      organizationId: auth.organizationId,
      role,
      permissionChecks: {
        'users.read': canReadUsers,
        'users.write': canWriteUsers,
        'users.delete': canDeleteUsers,
      },
      allPermissions: permissions,
    });
  } catch (error) {
    console.error('Permission test error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}