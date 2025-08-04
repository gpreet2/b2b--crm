import { withAuth } from '@workos-inc/authkit-nextjs';
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
export async function GET(request: NextRequest) {
  try {
    const auth = await withAuth({ ensureSignedIn: false });

    if (!auth.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    if (!auth.organizationId) {
      return NextResponse.json({ error: 'No organization context' }, { status: 400 });
    }

    // Check if user can view permissions
    const canView = await checkPermission(
      auth.user.id,
      auth.organizationId,
      'organization',
      'manage_roles'
    );

    if (!canView) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const params = querySchema.parse({
      resource: searchParams.get('resource'),
      action: searchParams.get('action'),
    });

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

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching permissions:', error);
      return NextResponse.json({ error: 'Failed to fetch permissions' }, { status: 500 });
    }

    return NextResponse.json({
      permissions: data,
      total: data.length,
    });
  } catch (error) {
    console.error('Permission endpoint error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
