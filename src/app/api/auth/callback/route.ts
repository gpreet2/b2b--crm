import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Mock auth callback - redirect to dashboard
    const { searchParams } = new URL(request.url);
    const redirectPath = searchParams.get('redirect') || '/dashboard';
    
    const response = NextResponse.redirect(new URL(redirectPath, request.url));
    
    // Set mock auth cookie
    response.cookies.set('auth-session', 'mock-session-token', {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    });
    
    return response;
  } catch (error) {
    return NextResponse.redirect(new URL('/auth?error=callback_failed', request.url));
  }
}