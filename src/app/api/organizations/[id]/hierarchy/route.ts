import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@workos-inc/authkit-nextjs';
import { OrganizationService } from '@/lib/services/organization';
import { logger } from '@/utils/logger';

/**
 * GET /api/organizations/[id]/hierarchy - Get organization hierarchy
 */
export async function GET(
  request: NextRequest, 
  segmentData: { params: Promise<{ id: string }> }
) {
  try {
    const { user } = await withAuth({ ensureSignedIn: true });
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const params = await segmentData.params;
    const { id } = params;
    const organizationService = new OrganizationService();
    const hierarchy = await organizationService.getOrganizationHierarchy(id);

    return NextResponse.json({
      success: true,
      data: hierarchy,
    });
  } catch (error) {
    logger.error('Error getting organization hierarchy', { error, id: params.id });

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