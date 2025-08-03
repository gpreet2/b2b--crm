import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@workos-inc/authkit-nextjs';

export async function GET(request: NextRequest) {
  try {
    // Get the return URL from query params
    const returnTo = request.nextUrl.searchParams.get('returnTo') || '/onboarding';
    
    // Clear all cookies
    const response = NextResponse.redirect(new URL(returnTo, request.url));
    
    // Clear session cookies
    response.cookies.delete('b2b_session');
    response.cookies.delete('wos-session');
    
    // Add headers to prevent caching
    response.headers.set('Clear-Site-Data', '"cache", "cookies", "storage"');
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    
    return response;
  } catch (error) {
    console.error('Force logout error:', error);
    return NextResponse.redirect(new URL('/onboarding', request.url));
  }
}