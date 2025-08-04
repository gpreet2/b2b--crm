import { withAuth } from '@workos-inc/authkit-nextjs';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { switchOrganization, getUserOrganizations } from '@/auth/workos';
import { logger } from '@/utils/logger';


// Request validation schema
const switchOrgSchema = z.object({
  organizationId: z.string().min(1, 'Organization ID is required'),
});

export async function POST(request: NextRequest) {
  try {
    // Get current user
    const { user } = await withAuth({ ensureSignedIn: true });

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = switchOrgSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { organizationId } = validation.data;

    // Verify user has access to this organization
    const userOrganizations = await getUserOrganizations(user.id);
    const hasAccess = userOrganizations.some(org => org.organization.id === organizationId);

    if (!hasAccess) {
      logger.warn('User attempted to switch to unauthorized organization', {
        userId: user.id,
        attemptedOrgId: organizationId,
      });

      return NextResponse.json({ error: 'Access denied to this organization' }, { status: 403 });
    }

    // Switch organization context
    const result = await switchOrganization(organizationId);

    logger.info('Organization switch successful', {
      userId: user.id,
      newOrgId: organizationId,
    });

    return NextResponse.json({
      success: true,
      organizationId,
      user: {
        id: result.user?.id,
        email: result.user?.email,
        firstName: result.user?.firstName,
        lastName: result.user?.lastName,
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
    const { user, organizationId } = await withAuth({ ensureSignedIn: true });

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's organizations
    const organizations = await getUserOrganizations(user.id);

    return NextResponse.json({
      currentOrganizationId: organizationId,
      organizations: organizations.map(org => ({
        id: org.organization.id,
        name: org.organization.name,
        role: org.role?.slug ?? 'member',
        isCurrent: org.organization.id === organizationId,
      })),
    });
  } catch (error) {
    logger.error('Failed to get user organizations', { error });

    return NextResponse.json({ error: 'Failed to get organizations' }, { status: 500 });
  }
}
