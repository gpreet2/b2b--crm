import { withAuth } from '@workos-inc/authkit-nextjs';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { getSupabaseClient } from '@/config/supabase';
import { checkPermission } from '@/middleware/permissions.middleware';


// Schema for creating a new role
const createRoleSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z
    .string()
    .min(1)
    .max(50)
    .regex(/^[a-z0-9_]+$/),
  description: z.string().optional(),
});

/**
 * GET /api/roles
 * Get all roles
 */
export async function GET() {
  try {
    const auth = await withAuth({ ensureSignedIn: false });

    if (!auth.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    if (!auth.organizationId) {
      return NextResponse.json({ error: 'No organization context' }, { status: 400 });
    }

    // Get all roles with their permission counts
    const { data: roles, error } = await getSupabaseClient()
      .from('roles')
      .select(
        `
        *,
        role_permissions(count)
      `
      )
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching roles:', error);
      return NextResponse.json({ error: 'Failed to fetch roles' }, { status: 500 });
    }

    // Transform the data to include permission count
    const rolesWithCounts = roles.map(role => ({
      ...role,
      permissionCount: role.role_permissions?.[0]?.count ?? 0,
      role_permissions: undefined,
    }));

    return NextResponse.json({
      roles: rolesWithCounts,
      total: rolesWithCounts.length,
    });
  } catch (error) {
    console.error('Roles endpoint error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/roles
 * Create a new custom role
 */
export async function POST(request: NextRequest) {
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

    // Parse and validate request body
    const body = await request.json();
    const validatedData = createRoleSchema.parse(body);

    // Check if slug already exists
    const { data: existing } = await getSupabaseClient()
      .from('roles')
      .select('id')
      .eq('slug', validatedData.slug)
      .single();

    if (existing) {
      return NextResponse.json({ error: 'Role with this slug already exists' }, { status: 409 });
    }

    // Create the role
    const { data: newRole, error } = await getSupabaseClient()
      .from('roles')
      .insert({
        ...validatedData,
        is_system: false,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating role:', error);
      return NextResponse.json({ error: 'Failed to create role' }, { status: 500 });
    }

    return NextResponse.json(newRole, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Create role error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
