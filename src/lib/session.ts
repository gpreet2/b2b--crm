import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';
import crypto from 'crypto';
import { AuthUser, Session } from './auth-types';

const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME || 'b2b_session';
const SESSION_DURATION_HOURS = parseInt(process.env.SESSION_DURATION_HOURS || '24');
const SESSION_DURATION_MS = SESSION_DURATION_HOURS * 60 * 60 * 1000;

// Generate a secure random token
export function generateSecureToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Create a new session in the database
export async function createSession(
  profileId: string,
  ipAddress?: string,
  userAgent?: string
): Promise<string> {
  const supabase = await createClient();
  const token = generateSecureToken();
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);
  
  const { error } = await supabase.from('sessions').insert({
    profile_id: profileId,
    token,
    expires_at: expiresAt.toISOString(),
    ip_address: ipAddress || null,
    user_agent: userAgent || null,
  });
  
  if (error) {
    console.error('Error creating session:', error);
    throw new Error('Failed to create session');
  }
  
  return token;
}

// Validate session and return user data
export async function validateSession(token: string): Promise<AuthUser | null> {
  const supabase = await createClient();
  
  // Get session with user profile
  const { data: session, error } = await supabase
    .from('sessions')
    .select(`
      *,
      profiles (
        id,
        email,
        gym_id,
        role,
        full_name,
        workos_user_id,
        workos_organization_id,
        auth_provider,
        last_login_at
      )
    `)
    .eq('token', token)
    .gt('expires_at', new Date().toISOString())
    .single();
  
  if (error || !session || !session.profiles) {
    return null;
  }
  
  // Update last activity
  await supabase
    .from('sessions')
    .update({ last_activity_at: new Date().toISOString() })
    .eq('id', session.id);
  
  return session.profiles as unknown as AuthUser;
}

// Get session from cookies
export async function getSessionFromCookie(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  
  if (!token) {
    return null;
  }
  
  return validateSession(token);
}

// Set session cookie
export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_DURATION_MS / 1000, // Convert to seconds
    path: '/',
  });
}

// Clear session cookie
export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  
  cookieStore.delete(SESSION_COOKIE_NAME);
}

// Delete session from database
export async function deleteSession(token: string): Promise<void> {
  const supabase = await createClient();
  
  await supabase.from('sessions').delete().eq('token', token);
}

// Clean up expired sessions (can be called periodically)
export async function cleanupExpiredSessions(): Promise<void> {
  const supabase = await createClient();
  
  const { error } = await supabase.rpc('cleanup_expired_sessions');
  
  if (error) {
    console.error('Error cleaning up sessions:', error);
  }
}