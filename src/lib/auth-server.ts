import { WorkOS } from '@workos-inc/node';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify, createRemoteJWKSet, JWTPayload } from 'jose';
import { logger } from '@/utils/logger';

// Initialize WorkOS
const workos = new WorkOS(process.env.WORKOS_API_KEY!);

// Create JWKS for WorkOS JWT verification
const JWKS = createRemoteJWKSet(new URL(`https://api.workos.com/sso/jwks/${process.env.WORKOS_CLIENT_ID}`));

export interface AuthUser {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  profilePictureUrl: string | null;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthSession {
  id: string;
  userId: string;
  organizationId: string | null;
  role: string | null;
  permissions: string[];
  entitlements: string[];
  impersonator: any | null;
}

export interface AuthData {
  user: AuthUser;
  session: AuthSession;
}

/**
 * Validate JWT access token and extract user info
 */
async function validateAccessToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWKS);
    return payload;
  } catch (error) {
    logger.warn('Failed to validate access token', { error });
    return null;
  }
}

/**
 * Get current user session from cookies (for server components)
 */
export async function getServerSession(): Promise<AuthData | null> {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('wos-session')?.value;

    if (!accessToken) {
      return null;
    }

    const payload = await validateAccessToken(accessToken);
    if (!payload) {
      return null;
    }

    // Get user details from WorkOS using the sub (user ID) from JWT
    const user = await workos.userManagement.getUser(payload.sub as string);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        profilePictureUrl: user.profilePictureUrl,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      session: {
        id: payload.jti as string || payload.sub as string,
        userId: payload.sub as string,
        organizationId: (payload as any).org_id || null,
        role: (payload as any).role || null,
        permissions: (payload as any).permissions || [],
        entitlements: (payload as any).entitlements || [],
        impersonator: (payload as any).impersonator || null,
      },
    };
  } catch (error) {
    logger.error('Failed to get server session', { error });
    return null;
  }
}

/**
 * Protect API routes - requires authentication
 */
export function withAuth<T extends any[]>(
  handler: (request: NextRequest, authData: AuthData, ...args: T) => Promise<NextResponse>
) {
  return async (request: NextRequest, ...args: T): Promise<NextResponse> => {
    try {
      const accessToken = request.cookies.get('wos-session')?.value;

      if (!accessToken) {
        return NextResponse.json({
          success: false,
          error: 'Authentication required',
        }, { status: 401 });
      }

      const payload = await validateAccessToken(accessToken);
      if (!payload) {
        return NextResponse.json({
          success: false,
          error: 'Invalid or expired session',
        }, { status: 401 });
      }

      // Get user details from WorkOS
      const user = await workos.userManagement.getUser(payload.sub as string);

      const authData: AuthData = {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          profilePictureUrl: user.profilePictureUrl,
          emailVerified: user.emailVerified,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
        session: {
          id: payload.jti as string || payload.sub as string,
          userId: payload.sub as string,
          organizationId: (payload as any).org_id || null,
          role: (payload as any).role || null,
          permissions: (payload as any).permissions || [],
          entitlements: (payload as any).entitlements || [],
          impersonator: (payload as any).impersonator || null,
        },
      };

      return handler(request, authData, ...args);
    } catch (error) {
      logger.error('Auth middleware failed', { error });
      return NextResponse.json({
        success: false,
        error: 'Authentication failed',
      }, { status: 500 });
    }
  };
}

/**
 * Create a session cookie
 */
export function createSessionCookie(accessToken: string): string {
  const maxAge = 30 * 24 * 60 * 60; // 30 days
  return `wos-session=${accessToken}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${maxAge}`;
}

/**
 * Clear session cookie
 */
export function clearSessionCookie(): string {
  return 'wos-session=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0';
}

/**
 * Get WorkOS instance for server-side operations
 */
export function getWorkOS(): WorkOS {
  return workos;
}