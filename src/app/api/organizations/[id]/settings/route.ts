import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthData } from '@/lib/auth-server';
import { withPermission } from '@/lib/auth-with-permission';
import { OrganizationService } from '@/lib/services/organization';
import { OrganizationSettingsSchema } from '@/lib/validations/organization';
import { logger } from '@/utils/logger';
import { z } from 'zod';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

/**
 * GET /api/organizations/[id]/settings - Get organization settings
 */
export const GET = withAuth(async (request: NextRequest, authData: AuthData, { params }: RouteParams) => {
  try {

    const resolvedParams = await params;
    const { id } = resolvedParams;
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
    logger.error('Error getting organization settings', { error });

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
});

/**
 * PUT /api/organizations/[id]/settings - Update organization settings
 */
export const PUT = withPermission('organization', 'update')(async (request: NextRequest, authData: AuthData, { params }: RouteParams) => {
  try {

    const resolvedParams = await params;
    const { id } = resolvedParams;
    const body = await request.json();

    const validatedSettings = OrganizationSettingsSchema.parse(body);

    const organizationService = new OrganizationService();
    const organization = await organizationService.updateOrganizationSettings(
      id,
      validatedSettings,
      authData.user.id
    );

    logger.info('Organization settings updated via API', {
      organizationId: id,
      settingsKeys: Object.keys(validatedSettings),
      userId: authData.user.id,
    });

    return NextResponse.json({
      success: true,
      data: organization,
      message: 'Organization settings updated successfully',
    });
  } catch (error) {
    logger.error('Error updating organization settings', { error });

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
});

/**
 * PATCH /api/organizations/[id]/settings - Partially update organization settings
 */
export const PATCH = withPermission('organization', 'update')(async (request: NextRequest, authData: AuthData, { params }: RouteParams) => {
  try {

    const resolvedParams = await params;
    const { id } = resolvedParams;
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
      authData.user.id
    );

    logger.info('Organization settings partially updated via API', {
      organizationId: id,
      updatedKeys: Object.keys(body),
      userId: authData.user.id,
    });

    return NextResponse.json({
      success: true,
      data: updatedOrganization,
      message: 'Organization settings updated successfully',
    });
  } catch (error) {
    logger.error('Error partially updating organization settings', { error });

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
});