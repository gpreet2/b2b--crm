import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@workos-inc/authkit-nextjs';
import { OrganizationService } from '@/lib/services/organization';
import { OrganizationSettingsSchema } from '@/lib/validations/organization';
import { logger } from '@/utils/logger';
import { z } from 'zod';

interface RouteParams {
  params: {
    id: string;
  };
}

/**
 * GET /api/organizations/[id]/settings - Get organization settings
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { user } = await withAuth({ ensureSignedIn: true });
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const organizationService = new OrganizationService();
    const organization = await organizationService.getOrganizationById(id);

    if (!organization) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: organization.settings || {},
    });
  } catch (error) {
    logger.error('Error getting organization settings', { error, id: params.id });

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/organizations/[id]/settings - Update organization settings
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { user } = await withAuth({ ensureSignedIn: true });
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();

    const validatedSettings = OrganizationSettingsSchema.parse(body);

    const organizationService = new OrganizationService();
    const organization = await organizationService.updateOrganizationSettings(
      id,
      validatedSettings,
      user.id
    );

    logger.info('Organization settings updated via API', {
      organizationId: id,
      settingsKeys: Object.keys(validatedSettings),
      userId: user.id,
    });

    return NextResponse.json({
      success: true,
      data: organization,
      message: 'Organization settings updated successfully',
    });
  } catch (error) {
    logger.error('Error updating organization settings', { error, id: params.id });

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Invalid settings data',
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
 * PATCH /api/organizations/[id]/settings - Partially update organization settings
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { user } = await withAuth({ ensureSignedIn: true });
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();

    // Get current settings
    const organizationService = new OrganizationService();
    const organization = await organizationService.getOrganizationById(id);

    if (!organization) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      );
    }

    // Merge with new settings
    const currentSettings = organization.settings || {};
    const newSettings = { ...currentSettings, ...body };

    const validatedSettings = OrganizationSettingsSchema.parse(newSettings);

    const updatedOrganization = await organizationService.updateOrganizationSettings(
      id,
      validatedSettings,
      user.id
    );

    logger.info('Organization settings partially updated via API', {
      organizationId: id,
      updatedKeys: Object.keys(body),
      userId: user.id,
    });

    return NextResponse.json({
      success: true,
      data: updatedOrganization,
      message: 'Organization settings updated successfully',
    });
  } catch (error) {
    logger.error('Error partially updating organization settings', { error, id: params.id });

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Invalid settings data',
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