import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@workos-inc/authkit-nextjs';
import { OrganizationService } from '@/lib/services/organization';
import {
  CreateOrganizationSchema,
  OrganizationQuerySchema,
  BulkCreateOrganizationsSchema,
} from '@/lib/validations/organization';
import { logger } from '@/utils/logger';
import { z } from 'zod';

/**
 * GET /api/organizations - Get organizations with filtering and pagination
 */
export async function GET(request: NextRequest) {
  try {
    const { user: _user } = await withAuth({ ensureSignedIn: true });

    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());

    // Validate query parameters
    const validatedQuery = OrganizationQuerySchema.parse(queryParams);

    const organizationService = new OrganizationService();
    const result = await organizationService.getOrganizations(validatedQuery);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error('Error getting organizations', { error });

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Invalid query parameters',
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
 * POST /api/organizations - Create a new organization
 */
export async function POST(request: NextRequest) {
  try {
    const { user } = await withAuth({ ensureSignedIn: true });

    const body = await request.json();

    // Check if it's a bulk create request
    if (body.organizations && Array.isArray(body.organizations)) {
      return handleBulkCreate(body, user.id);
    }

    // Single organization creation
    const validatedData = CreateOrganizationSchema.parse(body);

    const organizationService = new OrganizationService();
    const organization = await organizationService.createOrganization(validatedData, user.id);

    logger.info('Organization created via API', {
      organizationId: organization.id,
      userId: user.id,
    });

    return NextResponse.json({
      success: true,
      data: organization,
    }, { status: 201 });
    } catch (error) {
      logger.error('Error creating organization', { error });

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
 * Handle bulk organization creation
 */
async function handleBulkCreate(body: any, userId: string) {
  try {
    const validatedData = BulkCreateOrganizationsSchema.parse(body);
    const organizationService = new OrganizationService();
    const results = [];
    const errors = [];

    // Process each organization
    for (let i = 0; i < validatedData.organizations.length; i++) {
      try {
        const orgData = validatedData.organizations[i];
        const organization = await organizationService.createOrganization(orgData, userId);
        results.push({
          index: i,
          success: true,
          data: organization,
        });
      } catch (error) {
        errors.push({
          index: i,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    logger.info('Bulk organization creation completed', {
      total: validatedData.organizations.length,
      successful: results.length,
      failed: errors.length,
      userId,
    });

    return NextResponse.json({
      success: true,
      data: {
        results,
        errors,
        summary: {
          total: validatedData.organizations.length,
          successful: results.length,
          failed: errors.length,
        },
      },
    }, { status: 201 });
  } catch (error) {
    logger.error('Error in bulk organization creation', { error });

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Invalid bulk request data',
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