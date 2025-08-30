import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Mock refresh - return the same session data
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
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to refresh session' },
      { status: 401 }
    );
  }
}