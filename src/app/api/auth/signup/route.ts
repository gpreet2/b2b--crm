import { NextRequest, NextResponse } from 'next/server';
import { getSignUpUrl } from '@workos-inc/authkit-nextjs';
import { logger } from '@/utils/logger';
import { z } from 'zod';

// Validation schema for signup request
const SignupRequestSchema = z.object({
  firstName: z.string().min(1, 'First name is required').optional(), // Will be removed after integration
  lastName: z.string().min(1, 'Last name is required').optional(),   // Will be removed after integration
  email: z.string().email().optional(), // WorkOS login hint
  organizationName: z.string().optional(), // For organization invitation
  sessionId: z.string().optional(), // Onboarding session ID for state persistence
  sessionToken: z.string().optional(), // Onboarding session token
});

/**
 * POST /api/auth/signup
 * Generate WorkOS signup URL for onboarding flow with session persistence
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = SignupRequestSchema.safeParse(body);
    
    if (!validation.success) {
      logger.warn('Invalid signup request', { 
        errors: validation.error.issues,
        body,
      });
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { email, firstName, lastName, organizationName, sessionId, sessionToken } = validation.data;

    // Get client information for logging  
    const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0] || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Generate WorkOS signup URL with explicit redirect URI
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback`;
    
    // Debug logging for redirect URI
    // eslint-disable-next-line no-console
    console.log("=== WorkOS Sign-Up Redirect URI Debug (POST) ===");
    // eslint-disable-next-line no-console
    console.log("NEXT_PUBLIC_APP_URL:", process.env.NEXT_PUBLIC_APP_URL);
    // eslint-disable-next-line no-console
    console.log("Constructed redirectUri:", redirectUri);
    
    const signUpUrl = await getSignUpUrl({
      redirectUri,
      ...(email && { loginHint: email }),
    });

    // eslint-disable-next-line no-console
    console.log("Full WorkOS sign-up URL:", signUpUrl);
    // eslint-disable-next-line no-console
    console.log("===============================================");

    logger.info('Signup URL generated for onboarding', {
      firstName,
      lastName,
      organizationName,
      sessionId,
      hasSessionToken: !!sessionToken,
      clientIp,
      userAgent,
      url: signUpUrl.replace(/&[^=]*token[^=]*=[^&]*/gi, '&token=***'), // Mask tokens in logs
    });

    return NextResponse.json({
      success: true,
      url: signUpUrl,
      message: 'Redirecting to WorkOS for account creation',
    });

  } catch (error) {
    logger.error('Failed to generate signup URL', { 
      error,
      stack: error instanceof Error ? error.stack : undefined,
    });

    return NextResponse.json(
      { 
        error: 'Failed to start authentication. Please try again.',
        details: process.env.NODE_ENV === 'development' ? error : undefined,
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/auth/signup
 * Alternative method for signup (for testing or direct access)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const organizationName = searchParams.get('organizationName');
    const email = searchParams.get('email');
    
    // Generate WorkOS signup URL with explicit redirect URI
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback`;
    
    // Debug logging for redirect URI
    // eslint-disable-next-line no-console
    console.log("=== WorkOS Sign-Up Redirect URI Debug (GET) ===");
    // eslint-disable-next-line no-console
    console.log("NEXT_PUBLIC_APP_URL:", process.env.NEXT_PUBLIC_APP_URL);
    // eslint-disable-next-line no-console
    console.log("Constructed redirectUri:", redirectUri);
    
    const signUpUrl = await getSignUpUrl({
      redirectUri,
      ...(email && { loginHint: email }),
    });

    // eslint-disable-next-line no-console
    console.log("Full WorkOS sign-up URL:", signUpUrl);
    // eslint-disable-next-line no-console
    console.log("==============================================");

    logger.info('Signup URL generated via GET', {
      organizationName,
      email,
      url: signUpUrl.replace(/&[^=]*token[^=]*=[^&]*/gi, '&token=***'),
    });

    // For GET requests, redirect directly
    return NextResponse.redirect(signUpUrl);

  } catch (error) {
    logger.error('Failed to generate signup URL via GET', { error });
    
    // Redirect to error page instead of returning JSON for GET requests
    const errorUrl = new URL('/?error=signup_failed', request.url);
    return NextResponse.redirect(errorUrl);
  }
}
