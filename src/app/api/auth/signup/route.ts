import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Mock signup response
    return NextResponse.json({
      success: true,
      url: '/onboarding?step=1',
      message: 'Account created successfully - redirecting to onboarding',
      user: {
        id: 'mock_user_' + Math.random().toString(36).substr(2, 9),
        email: body.email || 'user@example.com',
        firstName: body.firstName || 'New',
        lastName: body.lastName || 'User'
      }
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Signup failed' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    
    // For GET requests, redirect to auth page
    const redirectUrl = new URL('/auth', request.url);
    if (email) redirectUrl.searchParams.set('email', email);
    
    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    const errorUrl = new URL('/auth?error=signup_failed', request.url);
    return NextResponse.redirect(errorUrl);
  }
}