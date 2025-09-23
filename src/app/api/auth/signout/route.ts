import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Get form data from the request
    const formData = await request.formData();
    const returnTo = formData.get('returnTo') as string || '/auth';

    // Create response with redirect
    const response = NextResponse.redirect(new URL(returnTo, request.url));

    // Clear all auth-related cookies
    const cookieNames = [
      'workos-session',
      'workos-token',
      'session',
      'auth-token',
      'access-token',
      'refresh-token'
    ];

    cookieNames.forEach(name => {
      response.cookies.set(name, '', {
        expires: new Date(0),
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      });
    });

    return response;
  } catch (error) {
    console.error('Signout error:', error);
    // Fallback redirect to auth page
    return NextResponse.redirect(new URL('/auth', request.url));
  }
}

// Also handle GET requests for direct signout links
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const returnTo = url.searchParams.get('returnTo') || '/auth';

  const response = NextResponse.redirect(new URL(returnTo, request.url));

  // Clear cookies same as POST
  const cookieNames = [
    'workos-session',
    'workos-token',
    'session',
    'auth-token',
    'access-token',
    'refresh-token'
  ];

  cookieNames.forEach(name => {
    response.cookies.set(name, '', {
      expires: new Date(0),
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });
  });

  return response;
}