import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    // Mock signin - return success and redirect to dashboard
    return NextResponse.json({
      success: true,
      url: '/dashboard',
      message: 'Sign in successful',
      user: {
        id: 'dev_user_1',
        email: email || 'dev@example.com',
        firstName: 'Development',
        lastName: 'User'
      }
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to sign in' },
      { status: 500 }
    );
  }
}