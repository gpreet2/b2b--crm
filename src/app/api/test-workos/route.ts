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
    };

    // Check if WorkOS SDK is available
    let sdkStatus = '✗ Not available';
    try {
      const _workos = await import('@workos-inc/authkit-nextjs');
      sdkStatus = '✓ Available';
    } catch (_error) {
      sdkStatus = '✗ Error loading SDK';
    }

    return NextResponse.json({
      status: 'ok',
      workosConfig: config,
      sdkStatus,
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
