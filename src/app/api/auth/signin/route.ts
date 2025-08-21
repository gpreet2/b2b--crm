import { getSignInUrl } from '@workos-inc/authkit-nextjs';
import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/utils/logger';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    logger.info('Sign in request received', { email });

    // Generate AuthKit sign-in URL
    const signInUrl = await getSignInUrl();

    logger.info('Generated AuthKit sign-in URL', { signInUrl });

    return NextResponse.json({ url: signInUrl });
  } catch (error) {
    logger.error('Sign in error', { error });
    return NextResponse.json({ error: 'Failed to generate sign-in URL' }, { status: 500 });
  }
}
