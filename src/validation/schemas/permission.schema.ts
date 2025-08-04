import { z } from 'zod';

import { RESOURCES } from '@/config/permissions';

/**
 * Schema for permission resource
 */
export const permissionResourceSchema = z.enum([
  RESOURCES.ANALYTICS,
  RESOURCES.CLIENTS,
  RESOURCES.DOCUMENTS,
  RESOURCES.EVENTS,
  RESOURCES.MEMBERSHIPS,
  RESOURCES.NOTIFICATIONS,
  RESOURCES.ORGANIZATION,
  RESOURCES.SYSTEM,
  RESOURCES.WORKOUTS,
]);

/**
 * Schema for permission check request
 */
export const permissionCheckSchema = z.object({
  resource: z.string().min(1, 'Resource is required'),
  action: z.string().min(1, 'Action is required'),
  organizationId: z.string().uuid('Invalid organization ID'),
  userId: z.string().uuid('Invalid user ID').optional(),
});

/**
 * Schema for bulk permission check
 */
export const bulkPermissionCheckSchema = z.object({
  permissions: z
    .array(
      z.object({
        resource: z.string().min(1),
        action: z.string().min(1),
      })
    )
    .min(1, 'At least one permission is required'),
  organizationId: z.string().uuid('Invalid organization ID'),
  userId: z.string().uuid('Invalid user ID').optional(),
});

/**
 * Schema for role permission assignment
 */
export const rolePermissionAssignmentSchema = z.object({
  roleId: z.string().uuid('Invalid role ID'),
  permissions: z
    .array(
      z.object({
        resource: z.string().min(1),
        action: z.string().min(1),
        granted: z.boolean().default(true),
      })
    )
    .min(1, 'At least one permission is required'),
});

/**
 * Schema for user role assignment
 */
export const userRoleAssignmentSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
  organizationId: z.string().uuid('Invalid organization ID'),
  roleId: z.string().uuid('Invalid role ID'),
  isActive: z.boolean().default(true),
});

/**
 * Schema for permission response
 */
export const permissionResponseSchema = z.object({
  id: z.string().uuid(),
  resource: z.string(),
  action: z.string(),
  description: z.string().nullable(),
  createdAt: z.string().datetime(),
});

/**
 * Schema for role response
 */
export const roleResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  isSystemRole: z.boolean(),
  createdAt: z.string().datetime(),
  permissions: z.array(permissionResponseSchema).optional(),
});

/**
 * Schema for user permissions response
 */
export const userPermissionsResponseSchema = z.object({
  userId: z.string().uuid(),
  organizationId: z.string().uuid(),
  role: z.object({
    id: z.string().uuid(),
    name: z.string(),
    slug: z.string(),
  }),
  permissions: z.array(
    z.object({
      resource: z.string(),
      action: z.string(),
      granted: z.boolean(),
    })
  ),
});

export type PermissionResource = z.infer<typeof permissionResourceSchema>;
export type PermissionCheckRequest = z.infer<typeof permissionCheckSchema>;
export type BulkPermissionCheckRequest = z.infer<typeof bulkPermissionCheckSchema>;
export type RolePermissionAssignment = z.infer<typeof rolePermissionAssignmentSchema>;
export type UserRoleAssignment = z.infer<typeof userRoleAssignmentSchema>;
export type PermissionResponse = z.infer<typeof permissionResponseSchema>;
export type RoleResponse = z.infer<typeof roleResponseSchema>;
export type UserPermissionsResponse = z.infer<typeof userPermissionsResponseSchema>;
