import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth-server';

export async function GET(_request: NextRequest) {
  try {
    const authData = await getServerSession();

    if (!authData) {
      return NextResponse.json({
        success: false,
        user: null,
        error: 'No valid session found',
      });
    }

    // Return user and session data
    return NextResponse.json({
      success: true,
      user: authData.user,
      session: authData.session,
    });
  } catch (_error) {
    // Clear potentially corrupted session cookie
    const response = NextResponse.json({
      success: false,
      user: null,
      error: 'Authentication failed',
    });
    
    response.cookies.delete('wos-session');
    return response;
  }
}

export function DELETE() {
  try {
    // Clear the session cookie
    const response = NextResponse.json({
      success: true,
      message: 'Signed out successfully',
    });
    
    response.cookies.delete('wos-session');
    return response;
  } catch (_error) {
    // Still clear the cookie even if there's an error
    const response = NextResponse.json({
      success: false,
      error: 'Sign out failed, but session cleared',
    });
    
    response.cookies.delete('wos-session');
    return response;
  }
}