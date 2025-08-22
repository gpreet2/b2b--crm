import { NextRequest, NextResponse } from 'next/server';
import { AuthData } from '@/lib/auth-server';
import { withPermission } from '@/lib/auth-with-permission';
import { OrganizationService } from '@/lib/services/organization';
import { MoveOrganizationSchema } from '@/lib/validations/organization';
import { logger } from '@/utils/logger';
import { z } from 'zod';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

/**
 * POST /api/organizations/[id]/move - Move organization to new parent
 */
export const POST = withPermission('organization', 'update')(async (request: NextRequest, authData: AuthData, { params }: RouteParams) => {
  try {

    const resolvedParams = await params;
    const { id } = resolvedParams;
    const body = await request.json();

    const validatedData = MoveOrganizationSchema.parse(body);

    const organizationService = new OrganizationService();
    const organization = await organizationService.moveOrganization(id, validatedData, authData.user.id);

    logger.info('Organization moved via API', {
      organizationId: id,
      newParentId: validatedData.new_parent_id,
      userId: authData.user.id,
    });

    return NextResponse.json({
      success: true,
      data: organization,
      message: 'Organization moved successfully',
    });
  } catch (error) {
    logger.error('Error moving organization', { error });

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

    if (error instanceof Error && error.message.includes('Circular reference detected')) {
      return NextResponse.json(
        { error: 'Circular reference detected in organization hierarchy' },
        { status: 400 }
      );
    }

    if (error instanceof Error && error.message.includes('cannot be its own parent')) {
      return NextResponse.json(
        { error: 'Organization cannot be its own parent' },
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