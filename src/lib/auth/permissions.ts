import { withAuth } from '@workos-inc/authkit-nextjs';
import { redirect } from 'next/navigation';

export class PermissionError extends Error {
  constructor(message: string, public requiredPermission?: string, public userPermissions?: string[]) {
    super(message);
    this.name = 'PermissionError';
  }
}

export class RoleError extends Error {
  constructor(message: string, public requiredRole?: string, public userRole?: string) {
    super(message);
    this.name = 'RoleError';
  }
}

/**
 * Server-side permission check - throws error if user doesn't have permission
 */
export async function requirePermission(permission: string) {
  const { permissions, user } = await withAuth({ ensureSignedIn: true });
  
  if (!permissions?.includes(permission)) {
    throw new PermissionError(
      `Permission '${permission}' required but not found`,
      permission,
      permissions
    );
  }
}

/**
 * Server-side role check - throws error if user doesn't have role
 */
export async function requireRole(role: string) {
  const { role: userRole, user } = await withAuth({ ensureSignedIn: true });
  
  if (userRole !== role) {
    throw new RoleError(
      `Role '${role}' required but user has role '${userRole}'`,
      role,
      userRole
    );
  }
}

/**
 * Server-side check for any of multiple permissions
 */
export async function requireAnyPermission(permissions: string[]) {
  const { permissions: userPermissions } = await withAuth({ ensureSignedIn: true });
  
  const hasAnyPermission = permissions.some(permission => 
    userPermissions?.includes(permission)
  );
  
  if (!hasAnyPermission) {
    throw new PermissionError(
      `One of these permissions required: ${permissions.join(', ')}`,
      permissions.join('|'),
      userPermissions
    );
  }
}

/**
 * Server-side check for all of multiple permissions
 */
export async function requireAllPermissions(permissions: string[]) {
  const { permissions: userPermissions } = await withAuth({ ensureSignedIn: true });
  
  const hasAllPermissions = permissions.every(permission => 
    userPermissions?.includes(permission)
  );
  
  if (!hasAllPermissions) {
    const missingPermissions = permissions.filter(permission => 
      !userPermissions?.includes(permission)
    );
    
    throw new PermissionError(
      `Missing permissions: ${missingPermissions.join(', ')}`,
      permissions.join('&'),
      userPermissions
    );
  }
}

/**
 * Server-side check for any of multiple roles
 */
export async function requireAnyRole(roles: string[]) {
  const { role: userRole } = await withAuth({ ensureSignedIn: true });
  
  if (!userRole || !roles.includes(userRole)) {
    throw new RoleError(
      `One of these roles required: ${roles.join(', ')}`,
      roles.join('|'),
      userRole
    );
  }
}

/**
 * Get user session with permissions - safe version that doesn't throw
 */
export async function getAuthSession() {
  try {
    return await withAuth();
  } catch (error) {
    return null;
  }
}

/**
 * Check if user has permission - safe version that doesn't throw
 */
export async function hasPermission(permission: string): Promise<boolean> {
  try {
    const session = await getAuthSession();
    return session?.permissions?.includes(permission) ?? false;
  } catch {
    return false;
  }
}

/**
 * Check if user has role - safe version that doesn't throw
 */
export async function hasRole(role: string): Promise<boolean> {
  try {
    const session = await getAuthSession();
    return session?.role === role;
  } catch {
    return false;
  }
}

/**
 * Redirect if user doesn't have permission
 */
export async function requirePermissionOrRedirect(
  permission: string,
  redirectTo: string = '/unauthorized'
) {
  try {
    await requirePermission(permission);
  } catch (error) {
    redirect(redirectTo);
  }
}

/**
 * Redirect if user doesn't have role
 */
export async function requireRoleOrRedirect(
  role: string,
  redirectTo: string = '/unauthorized'
) {
  try {
    await requireRole(role);
  } catch (error) {
    redirect(redirectTo);
  }
}