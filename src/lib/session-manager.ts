import { NextResponse } from 'next/server';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const SESSION_COOKIE_NAME = 'b2b_session';
const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback_secret_key_change_in_production'
);

export interface SessionData {
  userId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  organizationId?: string;
  workosUserId: string;
  iat: number;
  exp: number;
}

/**
 * Create a JWT session token
 */
export async function createSessionToken(userData: {
  userId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  organizationId?: string;
  workosUserId: string;
}): Promise<string> {
  const token = await new SignJWT({
    userId: userData.userId,
    email: userData.email,
    firstName: userData.firstName,
    lastName: userData.lastName,
    organizationId: userData.organizationId,
    workosUserId: userData.workosUserId,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(SECRET_KEY);

  return token;
}

/**
 * Verify and decode a JWT session token
 */
export async function verifySessionToken(token: string): Promise<SessionData | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return payload as SessionData;
  } catch {
    return null;
  }
}

/**
 * Set session cookie on response
 */
export function setSessionCookie(response: NextResponse, token: string): void {
  response.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 24 * 60 * 60, // 24 hours
    path: '/',
  });
}

/**
 * Get session from cookies (server-side)
 */
export async function getServerSession(): Promise<SessionData | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
    
    if (!sessionCookie?.value) {
      return null;
    }

    return await verifySessionToken(sessionCookie.value);
  } catch {
    return null;
  }
}

/**
 * Clear session cookie
 */
export function clearSessionCookie(response: NextResponse): void {
  response.cookies.delete(SESSION_COOKIE_NAME);
}

/**
 * Check if session is expired
 */
export function isSessionExpired(session: SessionData): boolean {
  return Date.now() / 1000 > session.exp;
}