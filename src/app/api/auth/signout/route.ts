import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { deleteSession, clearSessionCookie } from '@/lib/session';

const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME || 'b2b_session';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    
    if (token) {
      // Delete session from database
      await deleteSession(token);
    }
    
    // Clear session cookie
    await clearSessionCookie();
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Sign out error:', error);
    // Still clear the cookie even if database deletion fails
    await clearSessionCookie();
    
    return NextResponse.json({ success: true });
  }
}