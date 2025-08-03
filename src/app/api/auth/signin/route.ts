import { NextRequest, NextResponse } from 'next/server';
import { getSignInUrl } from '@workos-inc/authkit-nextjs';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    
    console.log('Sign in request received:', { email });
    
    // Generate WorkOS sign-in URL with email hint
    const signInUrl = await getSignInUrl({
      screenHint: 'sign-in',
      ...(email && { loginHint: email }),
    });

    console.log('Generated WorkOS sign-in URL:', signInUrl);

    return NextResponse.json({ url: signInUrl });
  } catch (error) {
    console.error('Sign in error:', error);
    return NextResponse.json(
      { error: 'Failed to generate sign-in URL' },
      { status: 500 }
    );
  }
}