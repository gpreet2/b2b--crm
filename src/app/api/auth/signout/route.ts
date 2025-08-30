import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const returnTo = formData.get('returnTo') as string || '/';
    
    // Create redirect response
    const response = NextResponse.redirect(new URL(returnTo, request.url));
    
    // Clear any session cookies
    response.cookies.delete('auth-session');
    response.cookies.delete('wos-session');
    
    return response;
  } catch (error) {
    const response = NextResponse.redirect(new URL('/?error=signout_failed', request.url));
    
    // Still clear cookies on error
    response.cookies.delete('auth-session');
    response.cookies.delete('wos-session');
    
    return response;
  }
}

export async function GET(request: NextRequest) {
  try {
    // For GET requests, redirect to home page
    const response = NextResponse.redirect(new URL('/', request.url));
    
    // Clear session cookies
    response.cookies.delete('auth-session');
    response.cookies.delete('wos-session');
    
    return response;
  } catch (error) {
    return NextResponse.redirect(new URL('/?error=signout_failed', request.url));
  }
}