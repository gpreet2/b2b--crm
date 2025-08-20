import { WorkOS } from '@workos-inc/node';
import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/utils/logger';

// Initialize WorkOS
const workos = new WorkOS(process.env.WORKOS_API_KEY!);

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    logger.info('Sign in request received', { email });

    // Generate WorkOS authorization URL
    const authorizationUrl = workos.userManagement.getAuthorizationUrl({
      provider: 'authkit',
      clientId: process.env.WORKOS_CLIENT_ID!,
      redirectUri: process.env.WORKOS_REDIRECT_URI!,
      state: JSON.stringify({ 
        returnPath: '/dashboard',
        timestamp: Date.now(),
      }),
      ...(email && { loginHint: email }),
    });

    logger.info('Generated WorkOS authorization URL', { authorizationUrl });

    return NextResponse.json({ url: authorizationUrl });
  } catch (error) {
    logger.error('Sign in error', { error });
    return NextResponse.json({ error: 'Failed to generate sign-in URL' }, { status: 500 });
  }
}
