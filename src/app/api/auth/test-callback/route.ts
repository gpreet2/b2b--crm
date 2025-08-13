import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/utils/logger';

/**
 * GET /api/auth/test-callback
 * Test endpoint to verify WorkOS is actually redirecting back
 * This helps distinguish between "WorkOS not redirecting" vs "callback processing failing"
 */
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const params = Object.fromEntries(url.searchParams.entries());
    
    logger.info('=== TEST CALLBACK HIT ===', {
      method: request.method,
      url: request.url,
      searchParams: params,
      headers: {
        userAgent: request.headers.get('user-agent'),
        referer: request.headers.get('referer'),
        cookie: request.headers.get('cookie')?.substring(0, 100) + '...',
      },
      timestamp: new Date().toISOString(),
      baseURL: process.env.NEXT_PUBLIC_APP_URL,
    });

    // Check for common WorkOS callback parameters
    const hasWorkOSParams = params.code || params.state || params.error;
    
    return NextResponse.json({
      status: 'success',
      message: 'Test callback endpoint was hit successfully',
      workosParamsPresent: hasWorkOSParams,
      receivedParams: params,
      timestamp: new Date().toISOString(),
      callbackWorking: true,
    });

  } catch (error) {
    logger.error('Test callback endpoint error', { error });
    
    return NextResponse.json(
      {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/auth/test-callback
 * Handle POST requests to test callback as well
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const url = new URL(request.url);
    const params = Object.fromEntries(url.searchParams.entries());
    
    logger.info('=== TEST CALLBACK POST HIT ===', {
      method: request.method,
      url: request.url,
      searchParams: params,
      body,
      headers: {
        userAgent: request.headers.get('user-agent'),
        referer: request.headers.get('referer'),
        contentType: request.headers.get('content-type'),
      },
      timestamp: new Date().toISOString(),
      baseURL: process.env.NEXT_PUBLIC_APP_URL,
    });

    return NextResponse.json({
      status: 'success',
      message: 'Test callback POST endpoint was hit successfully',
      receivedParams: params,
      receivedBody: body,
      timestamp: new Date().toISOString(),
      callbackWorking: true,
    });

  } catch (error) {
    logger.error('Test callback POST endpoint error', { error });
    
    return NextResponse.json(
      {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}