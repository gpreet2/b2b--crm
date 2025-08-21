import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getTokenClaims } from '@workos-inc/authkit-nextjs';

export interface AuthKitSession {
  user: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    profilePictureUrl?: string;
    emailVerified: boolean;
    createdAt: string;
    updatedAt: string;
  };
  sessionId: string;
  organizationId?: string;
  role?: string;
  permissions?: string[];
}

/**
 * Server-side authentication using AuthKit without middleware
 * Use this in Server Components and API routes
 */
export async function getAuthKitSession(options?: { 
  ensureSignedIn?: boolean;
  redirectTo?: string;
}): Promise<AuthKitSession | null> {
  const { ensureSignedIn = false, redirectTo = '/auth' } = options || {};
  
  try {
    // Get AuthKit session cookie
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('authkit-session');
    
    if (!sessionCookie) {
      if (ensureSignedIn) {
        redirect(redirectTo);
      }
      return null;
    }

    // Try to get token claims from the session
    const claims = await getTokenClaims();
    
    if (!claims || !claims.sub) {
      if (ensureSignedIn) {
        redirect(redirectTo);
      }
      return null;
    }

    // Basic user info from token claims
    const user = {
      id: claims.sub as string,
      email: claims.email as string || '',
      firstName: claims.given_name as string || undefined,
      lastName: claims.family_name as string || undefined,
      profilePictureUrl: claims.picture as string || undefined,
      emailVerified: claims.email_verified as boolean || false,
      createdAt: claims.iat ? new Date(claims.iat * 1000).toISOString() : new Date().toISOString(),
      updatedAt: claims.iat ? new Date(claims.iat * 1000).toISOString() : new Date().toISOString(),
    };

    return {
      user,
      sessionId: claims.sid as string || 'unknown',
      organizationId: claims.org_id as string || undefined,
      role: claims.role as string || undefined,
      permissions: (claims.permissions as string[]) || [],
    };
  } catch (error) {
    console.error('AuthKit session error:', error);
    if (ensureSignedIn) {
      redirect(redirectTo);
    }
    return null;
  }
}

/**
 * Require authentication - redirects if not signed in
 */
export async function requireAuth(redirectTo: string = '/auth'): Promise<AuthKitSession> {
  const session = await getAuthKitSession({ ensureSignedIn: true, redirectTo });
  if (!session) {
    // This should never happen due to redirect, but for type safety
    redirect(redirectTo);
  }
  return session;
}

/**
 * Check if user has specific permission
 */
export function hasPermission(session: AuthKitSession | null, permission: string): boolean {
  return session?.permissions?.includes(permission) ?? false;
}

/**
 * Check if user has any of the specified permissions
 */
export function hasAnyPermission(session: AuthKitSession | null, permissions: string[]): boolean {
  if (!session?.permissions) return false;
  return permissions.some(permission => session.permissions!.includes(permission));
}

/**
 * Check if user has specific role
 */
export function hasRole(session: AuthKitSession | null, role: string): boolean {
  return session?.role === role;
}

/**
 * Legacy compatibility - transform AuthKit session to our AuthSession format
 */
export function transformToLegacySession(authKitSession: AuthKitSession | null) {
  if (!authKitSession) return null;
  
  return {
    id: authKitSession.sessionId,
    userId: authKitSession.user.id,
    organizationId: authKitSession.organizationId || null,
    role: authKitSession.role || null,
    permissions: authKitSession.permissions || [],
    entitlements: [], // AuthKit doesn't have entitlements concept
    impersonator: null, // AuthKit handles impersonation internally
  };
}

/**
 * Legacy compatibility - transform AuthKit user to our AuthUser format
 */
export function transformToLegacyUser(user: AuthKitSession['user'] | null) {
  if (!user) return null;
  
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName || null,
    lastName: user.lastName || null,
    profilePictureUrl: user.profilePictureUrl || null,
    emailVerified: user.emailVerified,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}