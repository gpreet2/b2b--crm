import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { getServerSession, isSessionExpired } from '@/lib/session-manager';
import { logger } from '@/utils/logger';


// Request validation schema
const switchOrgSchema = z.object({
  organizationId: z.string().min(1, 'Organization ID is required'),
});

export async function POST(request: NextRequest) {
  try {
    // Get current user
    const session = await getServerSession();
    
    if (!session || isSessionExpired(session)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = switchOrgSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { organizationId } = validation.data;

    // TODO: Implement organization verification when WorkOS organization management is set up
    // For now, return a placeholder success response
    
    logger.info('Organization switch placeholder (not yet implemented)', {
      userId: session.userId,
      attemptedOrgId: organizationId,
    });

    logger.info('Organization switch successful', {
      userId: session.userId,
      newOrgId: organizationId,
    });

    return NextResponse.json({
      success: true,
      organizationId,
      message: 'Organization switching will be implemented when WorkOS organization management is configured',
      user: {
        id: session.userId,
        email: session.email,
        firstName: session.firstName,
        lastName: session.lastName,
      },
    });
  } catch (error) {
    logger.error('Failed to switch organization', { error });

    return NextResponse.json({ error: 'Failed to switch organization' }, { status: 500 });
  }
}

export async function GET(_request: NextRequest) {
  try {
    // Get current user
    const session = await getServerSession();
    
    if (!session || isSessionExpired(session)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // TODO: Implement organization fetching when WorkOS organization management is set up
    // For now, return placeholder data
    const mockOrganizations = [
      {
        id: 'org_placeholder_1',
        name: 'Demo Organization',
        role: 'admin',
        isCurrent: true,
      }
    ];

    return NextResponse.json({
      currentOrganizationId: session.organizationId || 'org_placeholder_1',
      organizations: mockOrganizations,
      message: 'Using placeholder data - organization management not yet implemented',
    });
  } catch (error) {
    logger.error('Failed to get user organizations', { error });

    return NextResponse.json({ error: 'Failed to get organizations' }, { status: 500 });
  }
}
