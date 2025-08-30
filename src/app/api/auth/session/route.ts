import { NextRequest, NextResponse } from 'next/server';

export async function GET(_request: NextRequest) {
  try {
    // Mock authenticated session matching AuthContext interface
    return NextResponse.json({
      success: true,
      user: {
        id: "dev_user_1",
        email: "dev@example.com",
        firstName: "Development",
        lastName: "User",
        profilePictureUrl: null,
        emailVerified: true,
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z"
      },
      session: {
        id: "dev_session_1",
        userId: "dev_user_1",
        organizationId: "1",
        role: "admin",
        permissions: ["read:all", "write:all", "delete:all", "admin:all"],
        entitlements: ["gym_management", "user_management", "billing"],
        impersonator: null
      }
    });
  } catch (_error) {
    return NextResponse.json({
      success: false,
      user: null,
      error: 'Authentication failed',
    });
  }
}

export function DELETE() {
  try {
    // Clear the session cookie
    const response = NextResponse.json({
      success: true,
      message: 'Signed out successfully',
    });
    
    response.cookies.delete('wos-session');
    return response;
  } catch (_error) {
    // Still clear the cookie even if there's an error
    const response = NextResponse.json({
      success: false,
      error: 'Sign out failed, but session cleared',
    });
    
    response.cookies.delete('wos-session');
    return response;
  }
}