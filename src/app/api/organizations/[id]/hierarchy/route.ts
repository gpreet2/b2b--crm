import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthData } from '@/lib/auth-server';
import { OrganizationService } from '@/lib/services/organization';
import { ensureDatabaseInitialized } from '@/lib/database-init';
import { logger } from '@/utils/logger';

/**
 * GET /api/organizations/[id]/hierarchy - Get organization hierarchy
 */
export const GET = withAuth(async (
  request: NextRequest,
  authData: AuthData,
  segmentData: { params: Promise<{ id: string }> }
) => {
  try {
    // Ensure database is initialized before proceeding
    await ensureDatabaseInitialized();
    
    const params = await segmentData.params;
    const { id } = params;
    
    const organizationService = new OrganizationService();
    const hierarchy = await organizationService.getOrganizationHierarchy(id);

    return NextResponse.json({
      success: true,
      data: hierarchy,
    });
  } catch (error) {
    logger.error('Error getting organization hierarchy', { error });

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