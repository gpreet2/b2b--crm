import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Check if WorkOS environment variables are configured
    const config = {
      clientId: process.env.WORKOS_CLIENT_ID ? '✓ Configured' : '✗ Missing',
      apiKey: process.env.WORKOS_API_KEY ? '✓ Configured' : '✗ Missing',
      redirectUri: process.env.WORKOS_REDIRECT_URI ?? 'Not configured',
      cookiePassword: process.env.WORKOS_COOKIE_PASSWORD ? '✓ Configured' : '✗ Missing',
      environment: process.env.NODE_ENV,
      nextPublicAppUrl: process.env.NEXT_PUBLIC_APP_URL,
    };

    // Test redirect URI construction
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback`;

    // Check if WorkOS SDK is available and test URL generation
    let sdkStatus = '✗ Not available';
    let testSignInUrl = 'N/A';
    let testSignUpUrl = 'N/A';
    try {
      const { getSignInUrl, getSignUpUrl } = await import('@workos-inc/authkit-nextjs');
      sdkStatus = '✓ Available';
      
      // Test URL generation
      testSignInUrl = await getSignInUrl({ redirectUri });
      testSignUpUrl = await getSignUpUrl({ redirectUri });
    } catch (_error) {
      sdkStatus = '✗ Error loading SDK';
    }

    return NextResponse.json({
      status: 'ok',
      workosConfig: config,
      sdkStatus,
      redirectUriTest: {
        constructedRedirectUri: redirectUri,
        testSignInUrl: testSignInUrl.replace(/&[^=]*token[^=]*=[^&]*/gi, '&token=***'),
        testSignUpUrl: testSignUpUrl.replace(/&[^=]*token[^=]*=[^&]*/gi, '&token=***'),
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
