import { withAuth } from '@workos-inc/authkit-nextjs';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(_request: NextRequest) {
  try {
    // Try to get the authenticated user from JWT
    const { user, sessionId, organizationId, impersonator } = await withAuth();

    if (!user) {
      return NextResponse.json(
        {
          authenticated: false,
          message: 'No user session found',
        },
        { status: 401 }
      );
    }

    return NextResponse.json({
      authenticated: true,
      jwtPayload: {
        userId: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        emailVerified: user.emailVerified,
      },
      session: {
        sessionId,
        organizationId,
        impersonator,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        authenticated: false,
        error: error instanceof Error ? error.message : 'Failed to verify JWT',
      },
      { status: 401 }
    );
  }
}
