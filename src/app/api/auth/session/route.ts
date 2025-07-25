import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromCookie } from '@/lib/session';

export async function GET(request: NextRequest) {
  try {
    const user = await getSessionFromCookie();
    
    if (!user) {
      return NextResponse.json({ user: null });
    }
    
    return NextResponse.json({ user });
  } catch (error) {
    console.error('Session error:', error);
    return NextResponse.json({ user: null });
  }
}