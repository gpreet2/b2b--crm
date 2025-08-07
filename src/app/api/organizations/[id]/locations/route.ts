import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@workos-inc/authkit-nextjs';
import { OrganizationService } from '@/lib/services/organization';
import { CreateLocationSchema } from '@/lib/validations/organization';
import { logger } from '@/utils/logger';
import { z } from 'zod';

interface RouteParams {
  params: {
    id: string;
  };
}

/**
 * GET /api/organizations/[id]/locations - Get locations for organization
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { user } = await withAuth({ ensureSignedIn: true });
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const organizationService = new OrganizationService();
    const organization = await organizationService.getOrganizationById(id, {
      includeLocations: true,
    });

    if (!organization) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: organization.locations || [],
    });
  } catch (error) {
    logger.error('Error getting organization locations', { error, id: params.id });

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/organizations/[id]/locations - Create location for organization
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { user } = await withAuth({ ensureSignedIn: true });
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();

    // Set organization_id from URL parameter
    const locationData = { ...body, organization_id: id };
    const validatedData = CreateLocationSchema.parse(locationData);

    // Verify organization exists
    const organizationService = new OrganizationService();
    const organization = await organizationService.getOrganizationById(id);

    if (!organization) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      );
    }

    const location = await organizationService.createLocation(validatedData, user.id);

    logger.info('Location created via API', {
      locationId: location.id,
      organizationId: id,
      userId: user.id,
    });

    return NextResponse.json({
      success: true,
      data: location,
    }, { status: 201 });
  } catch (error) {
    logger.error('Error creating location', { error, organizationId: params.id });

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Invalid request data',
          details: error.errors,
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