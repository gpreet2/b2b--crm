import { withAuth, AuthData } from '@/lib/auth-server';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { getSupabaseClient } from '@/config/supabase';
import { checkPermission } from '@/middleware/permissions.middleware';


// Schema for query parameters
const querySchema = z.object({
  resource: z.string().optional(),
  action: z.string().optional(),
});

/**
 * GET /api/permissions
 * Get all permissions or filter by resource/action
 */
export const GET = withAuth(async (request: NextRequest, authData: AuthData) => {
  console.log('[PERMISSIONS API] Starting permissions fetch request');
  console.log('[PERMISSIONS API] WorkOS User ID:', authData.user.id);
  console.log('[PERMISSIONS API] User email:', authData.user.email);

  try {
    // First get the database user ID from WorkOS user ID
    console.log('[PERMISSIONS API] Step 1: Looking up database user ID');
    const { data: dbUser, error: dbUserError } = await getSupabaseClient()
      .from('users')
      .select('id')
      .eq('workos_user_id', authData.user.id)
      .single();

    if (dbUserError || !dbUser) {
      console.error('[PERMISSIONS API] Database user lookup failed:', {
        error: dbUserError,
        workosUserId: authData.user.id,
        foundUser: !!dbUser
      });
      return NextResponse.json({ error: 'User not found in database.' }, { status: 404 });
    }

    console.log('[PERMISSIONS API] Step 2: Found database user ID:', dbUser.id);

    // Get user's active organization from database
    console.log('[PERMISSIONS API] Step 3: Looking up user organization');
    const { data: userOrg, error: userOrgError } = await getSupabaseClient()
      .from('user_organizations')
      .select('organization_id, role_id')
      .eq('user_id', dbUser.id)
      .eq('is_active', true)
      .limit(1)
      .single();

    if (userOrgError || !userOrg) {
      console.error('[PERMISSIONS API] User organization lookup failed:', {
        error: userOrgError,
        userId: dbUser.id,
        foundOrg: !!userOrg
      });
      return NextResponse.json({ error: 'No active organization. Please select an organization first.' }, { status: 403 });
    }

    console.log('[PERMISSIONS API] Step 4: Found user organization:', {
      organizationId: userOrg.organization_id,
      roleId: userOrg.role_id
    });

    // Check if user can view permissions
    console.log('[PERMISSIONS API] Step 5: Checking user permissions');
    const canView = await checkPermission(
      authData.user.id,
      userOrg.organization_id,
      'organization',
      'manage_roles'
    );

    if (!canView) {
      console.error('[PERMISSIONS API] Permission check failed - user cannot manage roles');
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
    }

    console.log('[PERMISSIONS API] Step 6: User has permission to view roles');

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const params = querySchema.parse({
      resource: searchParams.get('resource'),
      action: searchParams.get('action'),
    });

    console.log('[PERMISSIONS API] Step 7: Query parameters:', params);

    // Build query
    let query = getSupabaseClient()
      .from('permissions')
      .select('*')
      .order('resource', { ascending: true })
      .order('action', { ascending: true });

    if (params.resource) {
      query = query.eq('resource', params.resource);
    }

    if (params.action) {
      query = query.eq('action', params.action);
    }

    console.log('[PERMISSIONS API] Step 8: Executing permissions query');
    const { data, error } = await query;

    if (error) {
      console.error('[PERMISSIONS API] Error fetching permissions:', error);
      return NextResponse.json({ error: 'Failed to fetch permissions' }, { status: 500 });
    }

    console.log('[PERMISSIONS API] Step 9: Successfully fetched permissions:', {
      permissionCount: data?.length || 0,
      permissions: data?.slice(0, 5).map(p => ({ resource: p.resource, action: p.action }))
    });

    return NextResponse.json({
      success: true,
      data: {
        permissions: data,
        total: data.length,
      }
    });
  } catch (error) {
    console.error('[PERMISSIONS API] Unexpected error in permissions endpoint:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});
