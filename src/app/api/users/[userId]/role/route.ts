import { withAuth, AuthData } from '@/lib/auth-server';
import { withPermission } from '@/lib/auth-with-permission';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { getSupabaseClient } from '@/config/supabase';
import { getUserRole } from '@/middleware/permissions.middleware';


// Schema for updating user role
const updateRoleSchema = z.object({
  roleId: z.string().uuid(),
});

/**
 * GET /api/users/[userId]/role
 * Get the user's role in the current organization
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

    // Get user's current role
    const roleSlug = await getUserRole(userId, authData.session.organizationId);

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
      organizationId: authData.session.organizationId,
    });
  } catch (error) {
    console.error('Get user role error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});

/**
 * PUT /api/users/[userId]/role
 * Update the user's role in the organization
 */
export const PUT = withPermission('organization', 'manage_staff')(async (
  request: NextRequest,
  authData: AuthData,
  context: { params: Promise<{ userId: string }> }
) => {
  const params = await context.params;
  try {
    if (!authData.session.organizationId) {
      return NextResponse.json({ error: 'No organization context' }, { status: 400 });
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
      .eq('organization_id', authData.session.organizationId);

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
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Update user role error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});
