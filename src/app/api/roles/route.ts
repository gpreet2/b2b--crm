import { withAuth, AuthData } from '@/lib/auth-server';
import { withPermission } from '@/lib/auth-with-permission';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { getSupabaseClient } from '@/config/supabase';


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
export const GET = withAuth(async (request: NextRequest, authData: AuthData) => {
  console.log('[ROLES API] Starting roles fetch request');
  console.log('[ROLES API] WorkOS User ID:', authData.user.id);
  console.log('[ROLES API] User email:', authData.user.email);

  try {
    // First get the database user ID from WorkOS user ID
    console.log('[ROLES API] Step 1: Looking up database user ID');
    const { data: dbUser, error: dbUserError } = await getSupabaseClient()
      .from('users')
      .select('id')
      .eq('workos_user_id', authData.user.id)
      .single();

    if (dbUserError || !dbUser) {
      console.error('[ROLES API] Database user lookup failed:', {
        error: dbUserError,
        workosUserId: authData.user.id,
        foundUser: !!dbUser
      });
      return NextResponse.json({ error: 'User not found in database.' }, { status: 404 });
    }

    console.log('[ROLES API] Step 2: Found database user ID:', dbUser.id);

    // Get user's active organization from database
    console.log('[ROLES API] Step 3: Looking up user organization');
    const { data: userOrg, error: userOrgError } = await getSupabaseClient()
      .from('user_organizations')
      .select('organization_id, role_id')
      .eq('user_id', dbUser.id)
      .eq('is_active', true)
      .limit(1)
      .single();

    if (userOrgError || !userOrg) {
      console.error('[ROLES API] User organization lookup failed:', {
        error: userOrgError,
        userId: dbUser.id,
        foundOrg: !!userOrg
      });
      return NextResponse.json({ error: 'No active organization. Please select an organization first.' }, { status: 403 });
    }

    console.log('[ROLES API] Step 4: Found user organization:', {
      organizationId: userOrg.organization_id,
      roleId: userOrg.role_id
    });

    // Get all roles with their permission counts
    console.log('[ROLES API] Step 5: Fetching roles from database');
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
      console.error('[ROLES API] Error fetching roles:', error);
      return NextResponse.json({ error: 'Failed to fetch roles' }, { status: 500 });
    }

    console.log('[ROLES API] Step 6: Successfully fetched roles:', {
      roleCount: roles?.length || 0,
      roles: roles?.map(r => ({ id: r.id, name: r.name, slug: r.slug }))
    });

    // Transform the data to include permission count
    const rolesWithCounts = roles.map(role => ({
      ...role,
      permissionCount: role.role_permissions?.[0]?.count ?? 0,
      role_permissions: undefined,
    }));

    console.log('[ROLES API] Step 7: Returning success response with', rolesWithCounts.length, 'roles');

    return NextResponse.json({
      success: true,
      data: {
        roles: rolesWithCounts,
        total: rolesWithCounts.length,
      }
    });
  } catch (error) {
    console.error('[ROLES API] Unexpected error in roles endpoint:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});

/**
 * POST /api/roles
 * Create a new custom role
 */
export const POST = withPermission('organization', 'manage_roles')(async (request: NextRequest, authData: AuthData) => {
  try {
    // First get the database user ID from WorkOS user ID
    const { data: dbUser, error: dbUserError } = await getSupabaseClient()
      .from('users')
      .select('id')
      .eq('workos_user_id', authData.user.id)
      .single();

    if (dbUserError || !dbUser) {
      return NextResponse.json({ error: 'User not found in database.' }, { status: 404 });
    }

    // Get user's active organization from database
    const { data: userOrg, error: userOrgError } = await getSupabaseClient()
      .from('user_organizations')
      .select('organization_id, role_id')
      .eq('user_id', dbUser.id)
      .eq('is_active', true)
      .limit(1)
      .single();

    if (userOrgError || !userOrg) {
      return NextResponse.json({ error: 'No active organization. Please select an organization first.' }, { status: 403 });
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
});
