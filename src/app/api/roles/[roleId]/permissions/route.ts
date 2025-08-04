import { withAuth } from '@workos-inc/authkit-nextjs';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { getSupabaseClient } from '@/config/supabase';
import { checkPermission } from '@/middleware/permissions.middleware';


// Schema for updating role permissions
const updatePermissionsSchema = z.object({
  permissions: z.array(
    z.object({
      permissionId: z.string().uuid(),
      granted: z.boolean(),
    })
  ),
});

/**
 * GET /api/roles/[roleId]/permissions
 * Get all permissions for a specific role
 */
export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ roleId: string }> }
) {
  const params = await context.params;
  try {
    const auth = await withAuth({ ensureSignedIn: false });

    if (!auth.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    if (!auth.organizationId) {
      return NextResponse.json({ error: 'No organization context' }, { status: 400 });
    }

    const { roleId } = params;

    // Get role details
    const { data: role, error: roleError } = await getSupabaseClient()
      .from('roles')
      .select('id, name, slug, is_system')
      .eq('id', roleId)
      .single();

    if (roleError || !role) {
      return NextResponse.json({ error: 'Role not found' }, { status: 404 });
    }

    // Get all permissions with role assignment status
    const { data: permissions, error } = await getSupabaseClient()
      .from('permissions')
      .select(
        `
        id,
        resource,
        action,
        description,
        role_permissions!left(
          role_id
        )
      `
      )
      .order('resource', { ascending: true })
      .order('action', { ascending: true });

    if (error) {
      console.error('Error fetching permissions:', error);
      return NextResponse.json({ error: 'Failed to fetch permissions' }, { status: 500 });
    }

    // Transform data to include granted status
    const permissionsWithStatus = permissions.map(perm => ({
      id: perm.id,
      resource: perm.resource,
      action: perm.action,
      description: perm.description,
      granted: perm.role_permissions?.some(rp => rp.role_id === roleId) || false,
    }));

    return NextResponse.json({
      role,
      permissions: permissionsWithStatus,
    });
  } catch (error) {
    console.error('Get role permissions error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PUT /api/roles/[roleId]/permissions
 * Update permissions for a role
 */
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ roleId: string }> }
) {
  const params = await context.params;
  try {
    const auth = await withAuth({ ensureSignedIn: false });

    if (!auth.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    if (!auth.organizationId) {
      return NextResponse.json({ error: 'No organization context' }, { status: 400 });
    }

    // Check if user can manage roles
    const canManage = await checkPermission(
      auth.user.id,
      auth.organizationId,
      'organization',
      'manage_roles'
    );

    if (!canManage) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
    }

    const { roleId } = params;

    // Check if role exists and is not a system role
    const { data: role, error: roleError } = await getSupabaseClient()
      .from('roles')
      .select('id, is_system')
      .eq('id', roleId)
      .single();

    if (roleError || !role) {
      return NextResponse.json({ error: 'Role not found' }, { status: 404 });
    }

    if (role.is_system) {
      return NextResponse.json(
        { error: 'Cannot modify permissions for system roles' },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = updatePermissionsSchema.parse(body);

    // Start a transaction to update permissions
    const supabase = getSupabaseClient();

    // First, remove all existing permissions for this role
    const { error: deleteError } = await supabase
      .from('role_permissions')
      .delete()
      .eq('role_id', roleId);

    if (deleteError) {
      console.error('Error removing permissions:', deleteError);
      return NextResponse.json({ error: 'Failed to update permissions' }, { status: 500 });
    }

    // Then, add the new permissions
    const permissionsToAdd = validatedData.permissions
      .filter(p => p.granted)
      .map(p => ({
        role_id: roleId,
        permission_id: p.permissionId,
      }));

    if (permissionsToAdd.length > 0) {
      const { error: insertError } = await supabase
        .from('role_permissions')
        .insert(permissionsToAdd);

      if (insertError) {
        console.error('Error adding permissions:', insertError);
        return NextResponse.json({ error: 'Failed to update permissions' }, { status: 500 });
      }
    }

    return NextResponse.json({
      message: 'Permissions updated successfully',
      updatedCount: permissionsToAdd.length,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Update role permissions error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
