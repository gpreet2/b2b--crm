import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@workos-inc/authkit-nextjs';
import { OrganizationService } from '@/lib/services/organization';
import { UpdateOrganizationSchema } from '@/lib/validations/organization';
import { logger } from '@/utils/logger';
import { z } from 'zod';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

/**
 * GET /api/organizations/[id] - Get organization by ID
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { user: _user } = await withAuth({ ensureSignedIn: true });

    const resolvedParams = await params;
    const { id } = resolvedParams;
    const { searchParams } = new URL(request.url);
    
    // Parse include options
    const includeLocations = searchParams.get('include_locations') === 'true';
    const includeChildren = searchParams.get('include_children') === 'true';
    const includeParent = searchParams.get('include_parent') === 'true';

    const organizationService = new OrganizationService();
    const organization = await organizationService.getOrganizationById(id, {
      includeLocations,
      includeChildren,
      includeParent,
    });

    if (!organization) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: organization,
    });
  } catch (error) {
    logger.error('Error getting organization by ID', { error });

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/organizations/[id] - Update organization
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { user } = await withAuth({ ensureSignedIn: true });

    const resolvedParams = await params;
    const { id } = resolvedParams;
    const body = await request.json();

    const validatedData = UpdateOrganizationSchema.parse(body);

    const organizationService = new OrganizationService();
    const organization = await organizationService.updateOrganization(id, validatedData, user.id);

    logger.info('Organization updated via API', {
      organizationId: id,
      userId: user.id,
    });

    return NextResponse.json({
      success: true,
      data: organization,
    });
  } catch (error) {
    logger.error('Error updating organization', { error });

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Invalid request data',
          details: error.issues,
        },
        { status: 400 }
      );
    }

    if (error instanceof Error && error.message === 'Organization not found') {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
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
 * DELETE /api/organizations/[id] - Delete organization (soft delete)
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { user } = await withAuth({ ensureSignedIn: true });

    const resolvedParams = await params;
    const { id } = resolvedParams;

    const organizationService = new OrganizationService();
    await organizationService.deleteOrganization(id, user.id);

    logger.info('Organization deleted via API', {
      organizationId: id,
      userId: user.id,
    });

    return NextResponse.json({
      success: true,
      message: 'Organization deleted successfully',
    });
  } catch (error) {
    logger.error('Error deleting organization', { error });

    if (error instanceof Error && error.message === 'Organization not found') {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      );
    }

    if (error instanceof Error && error.message.includes('Cannot delete organization with active child organizations')) {
      return NextResponse.json(
        { error: 'Cannot delete organization with active child organizations' },
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