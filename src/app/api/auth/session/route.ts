import { NextRequest, NextResponse } from 'next/server';
import { getServerSession, isSessionExpired, clearSessionCookie } from '@/lib/session-manager';

export async function GET(_request: NextRequest) {
  try {
    // Get our custom session
    const session = await getServerSession();
    
    if (!session || isSessionExpired(session)) {
      return NextResponse.json({
        success: false,
        user: null,
        session: null,
        error: 'No valid session found',
      });
    }

    // Transform to our expected format
    const user = {
      id: session.userId,
      email: session.email,
      firstName: session.firstName || null,
      lastName: session.lastName || null,
      profilePictureUrl: null, // Not stored in our custom session
      emailVerified: true, // WorkOS handles email verification
      createdAt: new Date(session.iat * 1000).toISOString(),
      updatedAt: new Date(session.iat * 1000).toISOString(),
    };

    const sessionData = {
      id: `session_${session.userId}`,
      userId: session.userId,
      organizationId: session.organizationId || null,
      role: null, // To be implemented when roles are added
      permissions: [], // To be implemented when permissions are added
      entitlements: [],
      impersonator: null,
    };

    return NextResponse.json({
      success: true,
      user,
      session: sessionData,
    });
  } catch (error) {
    console.error('Session API error:', error);
    return NextResponse.json({
      success: false,
      user: null,
      session: null,
      error: 'Authentication failed',
    });
  }
}

export async function DELETE() {
  try {
    const response = NextResponse.json({
      success: true,
      message: 'Signed out successfully',
    });
    
    // Clear our custom session cookie
    clearSessionCookie(response);
    
    return response;
  } catch (error) {
    console.error('Sign out error:', error);
    return NextResponse.json({
      success: false,
      error: 'Sign out failed',
    });
  }
}