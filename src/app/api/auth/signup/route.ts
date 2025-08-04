import { getSignUpUrl } from '@workos-inc/authkit-nextjs';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email, firstName, lastName } = await request.json();

    // eslint-disable-next-line no-console
    console.log('Sign up request received:', { email, firstName, lastName });

    // Generate WorkOS sign-up URL with user data hints
    // Add a unique identifier to the state to ensure fresh authentication
    const signUpUrl = await getSignUpUrl({
      screenHint: 'sign-up',
      ...(email && { loginHint: email }),
      state: JSON.stringify({
        prompt: 'create',
        returnTo: '/dashboard',
        forceNewAccount: true,
        timestamp: Date.now(),
      }),
    });

    // eslint-disable-next-line no-console
    console.log('Generated WorkOS sign-up URL:', signUpUrl);

    return NextResponse.json({ url: signUpUrl });
  } catch (error) {
    console.error('Sign up error:', error);
    return NextResponse.json({ error: 'Failed to generate sign-up URL' }, { status: 500 });
  }
}
