import { refreshSession } from '@workos-inc/authkit-nextjs';
import { NextRequest, NextResponse } from 'next/server';

import { logger } from '@/utils/logger';

/**
 * Refresh authentication token endpoint
 * This endpoint is designed for mobile app integration to refresh JWT tokens
 *
 * WorkOS handles the actual token refresh via cookies (wos-session)
 * The mobile app should call this endpoint when tokens are about to expire
 */
export async function POST(request: NextRequest) {
  try {
    // Get the organization ID from the request body if provided
    // This allows mobile apps to refresh with a specific organization context
    const body = await request.json().catch(() => ({}));
    const { organizationId } = body;

    logger.info('Token refresh requested', {
      hasOrgId: !!organizationId,
      userAgent: request.headers.get('user-agent'),
    });

    // Refresh the session using WorkOS
    const result = await refreshSession(organizationId ? { organizationId } : undefined);

    if (!result?.user) {
      logger.warn('Token refresh failed - no valid session');
      return NextResponse.json({ error: 'No valid session to refresh' }, { status: 401 });
    }

    // Extract token expiry information from cookies for mobile app
    const sessionCookie = request.cookies.get('wos-session');
    const expiresAt = sessionCookie?.expires
      ? new Date(sessionCookie.expires).toISOString()
      : new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // Default 24h

    logger.info('Token refresh successful', {
      userId: result.user.id,
      organizationId: result.organizationId,
    });

    // Return user data and session info for mobile app
    return NextResponse.json({
      success: true,
      user: {
        id: result.user.id,
        email: result.user.email,
        firstName: result.user.firstName,
        lastName: result.user.lastName,
      },
      organizationId: result.organizationId,
      sessionExpiry: expiresAt,
      // Mobile apps can use this to know when to refresh again
      refreshIn: 23 * 60 * 60 * 1000, // Refresh 1 hour before expiry
    });
  } catch (error) {
    logger.error('Failed to refresh token', { error });

    return NextResponse.json({ error: 'Failed to refresh authentication token' }, { status: 500 });
  }
}

// GET endpoint to check current session status
export async function GET(request: NextRequest) {
  try {
    // Check if session cookie exists
    const sessionCookie = request.cookies.get('wos-session');

    if (!sessionCookie) {
      return NextResponse.json({
        authenticated: false,
        message: 'No active session',
      });
    }

    // Try to get current user without enforcing sign-in
    const { withAuth } = await import('@workos-inc/authkit-nextjs');
    const result = await withAuth({ ensureSignedIn: false });

    if (!result.user) {
      return NextResponse.json({
        authenticated: false,
        message: 'Session expired or invalid',
      });
    }

    const expiresAt = sessionCookie.expires ? new Date(sessionCookie.expires).toISOString() : null;

    return NextResponse.json({
      authenticated: true,
      user: {
        id: result.user.id,
        email: result.user.email,
      },
      organizationId: result.organizationId,
      sessionExpiry: expiresAt,
      // Calculate if refresh is needed soon
      needsRefresh: expiresAt
        ? new Date(expiresAt).getTime() - Date.now() < 60 * 60 * 1000 // Less than 1 hour
        : false,
    });
  } catch (error) {
    logger.error('Failed to check session status', { error });

    return NextResponse.json({ error: 'Failed to check session' }, { status: 500 });
  }
}
