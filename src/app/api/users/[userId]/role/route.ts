import { withAuth } from '@workos-inc/authkit-nextjs';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { getSupabaseClient } from '@/config/supabase';
import { checkPermission, getUserRole } from '@/middleware/permissions.middleware';


// Schema for updating user role
const updateRoleSchema = z.object({
  roleId: z.string().uuid(),
});

interface RouteParams {
  params: {
    userId: string;
  };
}

/**
 * GET /api/users/[userId]/role
 * Get the user's role in the current organization
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

    // Get user's current role
    const roleSlug = await getUserRole(userId, auth.organizationId);

    if (!roleSlug) {
      return NextResponse.json({ error: 'User not found in organization' }, { status: 404 });
    }

    // Get full role details
    const { data: role, error } = await getSupabaseClient()
      .from('roles')
      .select('*')
      .eq('slug', roleSlug)
      .single();

    if (error || !role) {
      return NextResponse.json({ error: 'Role not found' }, { status: 404 });
    }

    // Get user details
    const { data: user } = await getSupabaseClient()
      .from('users')
      .select('id, email, first_name, last_name')
      .eq('id', userId)
      .single();

    return NextResponse.json({
      user,
      role,
      organizationId: auth.organizationId,
    });
  } catch (error) {
    console.error('Get user role error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PUT /api/users/[userId]/role
 * Update the user's role in the organization
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const auth = await withAuth({ ensureSignedIn: false });

    if (!auth.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    if (!auth.organizationId) {
      return NextResponse.json({ error: 'No organization context' }, { status: 400 });
    }

    // Check if user can manage staff
    const canManage = await checkPermission(
      auth.user.id,
      auth.organizationId,
      'organization',
      'manage_staff'
    );

    if (!canManage) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
    }

    const { userId } = params;

    // Parse and validate request body
    const body = await request.json();
    const validatedData = updateRoleSchema.parse(body);

    // Check if the new role exists
    const { data: role, error: roleError } = await getSupabaseClient()
      .from('roles')
      .select('id')
      .eq('id', validatedData.roleId)
      .single();

    if (roleError || !role) {
      return NextResponse.json({ error: 'Role not found' }, { status: 404 });
    }

    // Update user's role
    const { error: updateError } = await getSupabaseClient()
      .from('user_organizations')
      .update({ role_id: validatedData.roleId })
      .eq('user_id', userId)
      .eq('organization_id', auth.organizationId);

    if (updateError) {
      console.error('Error updating user role:', updateError);
      return NextResponse.json({ error: 'Failed to update user role' }, { status: 500 });
    }

    return NextResponse.json({
      message: 'User role updated successfully',
      userId,
      roleId: validatedData.roleId,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Update user role error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
