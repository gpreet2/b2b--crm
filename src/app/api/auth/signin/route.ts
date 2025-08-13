import { getSignInUrl } from '@workos-inc/authkit-nextjs';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    // eslint-disable-next-line no-console
    console.log('Sign in request received:', { email });

    // Generate WorkOS sign-in URL with email hint and explicit redirect URI
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback`;
    const signInUrl = await getSignInUrl({
      screenHint: 'sign-in',
      redirectUri,
      ...(email && { loginHint: email }),
    });

    // eslint-disable-next-line no-console
    console.log('Generated WorkOS sign-in URL:', signInUrl);

    return NextResponse.json({ url: signInUrl });
  } catch (error) {
    console.error('Sign in error:', error);
    return NextResponse.json({ error: 'Failed to generate sign-in URL' }, { status: 500 });
  }
}
