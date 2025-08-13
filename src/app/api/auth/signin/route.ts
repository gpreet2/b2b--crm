import { getSignInUrl } from '@workos-inc/authkit-nextjs';
import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/utils/logger';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    logger.info('Sign in request received', { email });

    // Generate WorkOS sign-in URL with email hint, using default redirect URI from dashboard
    // Debug logging for redirect URI
    logger.info('=== WorkOS Sign-In Redirect URI Debug ===', {
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
      message: 'Using WorkOS default redirect URI from dashboard',
    });
    
    const signInUrl = await getSignInUrl({
      screenHint: 'sign-in',
      ...(email && { loginHint: email }),
    });

    logger.info('WorkOS sign-in URL generated', {
      signInUrl: signInUrl.replace(/&[^=]*token[^=]*=[^&]*/gi, '&token=***'), // Mask tokens
      hasRedirectUriParam: signInUrl.includes('redirect_uri='),
    });

    return NextResponse.json({ url: signInUrl });
  } catch (error) {
    logger.error('Sign in error', { error });
    return NextResponse.json({ error: 'Failed to generate sign-in URL' }, { status: 500 });
  }
}
