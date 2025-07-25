import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromCookie } from './session';
import { Permission, roleHasPermission, roleHasAllPermissions, roleHasAnyPermission } from './permissions';

// Middleware to check if user has a specific permission
export async function requirePermission(
  permission: Permission,
  handler: (request: NextRequest, user: any) => Promise<NextResponse>
) {
  return async (request: NextRequest) => {
    try {
      const user = await getSessionFromCookie();
      
      if (!user) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
      
      if (!roleHasPermission(user.role, permission)) {
        return NextResponse.json(
          { error: 'Insufficient permissions' },
          { status: 403 }
        );
      }
      
      // Pass the user to the handler to avoid duplicate session checks
      return handler(request, user);
    } catch (error) {
      console.error('Permission middleware error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}

// Middleware to check if user has ALL of the specified permissions
export async function requireAllPermissions(
  permissions: Permission[],
  handler: (request: NextRequest, user: any) => Promise<NextResponse>
) {
  return async (request: NextRequest) => {
    try {
      const user = await getSessionFromCookie();
      
      if (!user) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
      
      if (!roleHasAllPermissions(user.role, permissions)) {
        return NextResponse.json(
          { error: 'Insufficient permissions' },
          { status: 403 }
        );
      }
      
      return handler(request, user);
    } catch (error) {
      console.error('Permission middleware error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}

// Middleware to check if user has ANY of the specified permissions
export async function requireAnyPermission(
  permissions: Permission[],
  handler: (request: NextRequest, user: any) => Promise<NextResponse>
) {
  return async (request: NextRequest) => {
    try {
      const user = await getSessionFromCookie();
      
      if (!user) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
      
      if (!roleHasAnyPermission(user.role, permissions)) {
        return NextResponse.json(
          { error: 'Insufficient permissions' },
          { status: 403 }
        );
      }
      
      return handler(request, user);
    } catch (error) {
      console.error('Permission middleware error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}

// Middleware to check if user has a specific role
export async function requireRole(
  roles: string[],
  handler: (request: NextRequest, user: any) => Promise<NextResponse>
) {
  return async (request: NextRequest) => {
    try {
      const user = await getSessionFromCookie();
      
      if (!user) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
      
      if (!roles.includes(user.role)) {
        return NextResponse.json(
          { error: 'Insufficient permissions' },
          { status: 403 }
        );
      }
      
      return handler(request, user);
    } catch (error) {
      console.error('Role middleware error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}

// Helper to create permission-protected API routes
export function createProtectedRoute(
  permission: Permission | Permission[],
  handlers: {
    GET?: (request: NextRequest, user: any) => Promise<NextResponse>;
    POST?: (request: NextRequest, user: any) => Promise<NextResponse>;
    PUT?: (request: NextRequest, user: any) => Promise<NextResponse>;
    DELETE?: (request: NextRequest, user: any) => Promise<NextResponse>;
    PATCH?: (request: NextRequest, user: any) => Promise<NextResponse>;
  }
) {
  const middleware = Array.isArray(permission)
    ? requireAllPermissions.bind(null, permission)
    : requirePermission.bind(null, permission);
  
  const protectedHandlers: any = {};
  
  for (const [method, handler] of Object.entries(handlers)) {
    if (handler) {
      protectedHandlers[method] = middleware(handler);
    }
  }
  
  return protectedHandlers;
}