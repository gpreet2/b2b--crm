import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@workos-inc/authkit-nextjs';
import { getDatabase } from '@/config/database';
import { logger } from '@/utils/logger';
import { z } from 'zod';

const SwitchOrganizationSchema = z.object({
  organization_id: z.string().uuid(),
});

/**
 * POST /api/organizations/switch - Switch user's current organization context
 */
export async function POST(request: NextRequest) {
  try {
    const { user } = await withAuth({ ensureSignedIn: true });

    const body = await request.json();
    const validatedData = SwitchOrganizationSchema.parse(body);
    const { organization_id } = validatedData;

    const db = getDatabase();

    // Verify user has access to this organization
    const { data: userOrg, error: userOrgError } = await db
      .getSupabaseClient()
      .from('user_organizations')
      .select(`
        id,
        role,
        is_active,
        organization:organizations(
          id,
          name,
          is_active,
          organization_type,
          parent_id
        )
      `)
      .eq('user_id', user.id)
      .eq('organization_id', organization_id)
      .eq('is_active', true)
      .single();

    if (userOrgError || !userOrg) {
      logger.warn('User attempted to switch to unauthorized organization', {
        userId: user.id,
        organizationId: organization_id,
        error: userOrgError,
      });

      return NextResponse.json(
        { error: 'Organization not found or access denied' },
        { status: 403 }
      );
    }

    // Check if organization is active
    if (!userOrg.organization.is_active) {
      return NextResponse.json(
        { error: 'Organization is inactive' },
        { status: 400 }
      );
    }

    // Update user's primary organization flag
    await db.getSupabaseClient().rpc('switch_user_primary_organization', {
      p_user_id: user.id,
      p_organization_id: organization_id,
    });

    // Get updated organization details with related data
    const { data: organizationDetails, error: orgError } = await db
      .getSupabaseClient()
      .from('organizations')
      .select(`
        id,
        name,
        domain,
        logo_url,
        settings,
        organization_type,
        hierarchy_level,
        parent_id,
        is_active,
        metadata,
        created_at,
        updated_at,
        locations:locations(
          id,
          name,
          address,
          city,
          state,
          is_active
        )
      `)
      .eq('id', organization_id)
      .single();

    if (orgError || !organizationDetails) {
      logger.error('Failed to get organization details after switch', {
        error: orgError,
        organizationId: organization_id,
      });

      return NextResponse.json(
        { error: 'Failed to get organization details' },
        { status: 500 }
      );
    }

    // Get user's role and permissions in this organization
    const { data: permissions, error: permError } = await db
      .getSupabaseClient()
      .from('user_effective_permissions')
      .select('permission_name')
      .eq('user_id', user.id)
      .eq('organization_id', organization_id);

    if (permError) {
      logger.error('Failed to get user permissions for organization', {
        error: permError,
        userId: user.id,
        organizationId: organization_id,
      });
    }

    // Log audit event
    await db.getSupabaseClient().from('audit_logs').insert({
      action: 'organization_switch',
      entity_type: 'organization',
      entity_id: organization_id,
      user_id: user.id,
      metadata: {
        organization_name: organizationDetails.name,
        organization_type: organizationDetails.organization_type,
        role: userOrg.role,
      },
      created_at: new Date().toISOString(),
    });

    logger.info('User switched organization context', {
      userId: user.id,
      organizationId: organization_id,
      organizationName: organizationDetails.name,
      role: userOrg.role,
    });

    // Return organization context data
    return NextResponse.json({
      success: true,
      data: {
        organization: organizationDetails,
        user_role: userOrg.role,
        permissions: permissions?.map(p => p.permission_name) || [],
        context: {
          switched_at: new Date().toISOString(),
          can_access_parent: organizationDetails.parent_id !== null,
          can_access_children: organizationDetails.organization_type === 'parent' || organizationDetails.organization_type === 'franchise_parent',
          hierarchy_level: organizationDetails.hierarchy_level,
        },
      },
      message: `Switched to organization: ${organizationDetails.name}`,
    });

  } catch (error) {
    logger.error('Error switching organization context', { error });

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Invalid request data',
          details: error.issues,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/organizations/switch - Get user's available organizations for switching
 */
export async function GET(request: NextRequest) {
  try {
    const { user } = await withAuth({ ensureSignedIn: true });

    const db = getDatabase();

    // Get all organizations user has access to
    const { data: userOrganizations, error } = await db
      .getSupabaseClient()
      .from('user_organizations')
      .select(`
        id,
        role,
        is_primary,
        is_active,
        joined_at,
        organization:organizations(
          id,
          name,
          domain,
          logo_url,
          organization_type,
          hierarchy_level,
          is_active,
          parent_id,
          metadata
        )
      `)
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('is_primary', { ascending: false })
      .order('joined_at', { ascending: true });

    if (error) {
      logger.error('Failed to get user organizations for switching', {
        error,
        userId: user.id,
      });

      return NextResponse.json(
        { error: 'Failed to get available organizations' },
        { status: 500 }
      );
    }

    // Filter only active organizations
    const availableOrganizations = userOrganizations?.filter(
      uo => uo.organization && uo.organization.is_active
    ) || [];

    return NextResponse.json({
      success: true,
      data: {
        organizations: availableOrganizations,
        current_organization: availableOrganizations.find(org => org.is_primary),
        total_count: availableOrganizations.length,
      },
    });

  } catch (error) {
    logger.error('Error getting available organizations for switching', { error });

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}