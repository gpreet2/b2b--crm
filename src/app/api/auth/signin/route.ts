import { getSignInUrl } from '@workos-inc/authkit-nextjs';
import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/utils/logger';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    logger.info('Sign in request received', { email });

    // Use explicit redirect URI to ensure exact match with WorkOS dashboard
    const redirectUri = process.env.NODE_ENV === 'production' 
      ? 'https://b2b-crm-three.vercel.app/api/auth/callback'
      : 'http://localhost:3000/api/auth/callback';

    // Debug logging for redirect URI
    logger.info('=== WorkOS Sign-In Redirect URI Debug ===', {
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
      NODE_ENV: process.env.NODE_ENV,
      explicitRedirectUri: redirectUri,
    });
    
    const signInUrl = await getSignInUrl({
      redirectUri,
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
