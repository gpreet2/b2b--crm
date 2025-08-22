/**
 * Role Management API Client
 * 
 * This module provides client-side functions for interacting with the role management API.
 * All functions handle error responses and provide proper TypeScript typing.
 */

import { z } from 'zod';

// Types for API responses
export interface Role {
  id: string;
  name: string;
  slug: string;
  description?: string;
  is_system: boolean;
  permissionCount: number;
  created_at: string;
  updated_at: string;
}

export interface Permission {
  id: string;
  resource: string;
  action: string;
  description?: string;
  granted: boolean;
}

export interface RolePermissions {
  role: {
    id: string;
    name: string;
    slug: string;
    is_system: boolean;
  };
  permissions: Permission[];
}

export interface UserRole {
  user: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
  };
  role: Role;
  organizationId: string;
}

// Request schemas
const CreateRoleSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(50).regex(/^[a-z0-9_]+$/),
  description: z.string().optional(),
});

const UpdatePermissionsSchema = z.object({
  permissions: z.array(
    z.object({
      permissionId: z.string().uuid(),
      granted: z.boolean(),
    })
  ),
});

const UpdateUserRoleSchema = z.object({
  roleId: z.string().uuid(),
});

export type CreateRoleRequest = z.infer<typeof CreateRoleSchema>;
export type UpdatePermissionsRequest = z.infer<typeof UpdatePermissionsSchema>;
export type UpdateUserRoleRequest = z.infer<typeof UpdateUserRoleSchema>;

// API Response types
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  details?: any;
}

interface RolesListResponse {
  roles: Role[];
  total: number;
}

/**
 * Role Management API Client
 */
export class RolesApi {
  private baseUrl = '/api';

  /**
   * Fetch all roles
   */
  async getRoles(): Promise<RolesListResponse> {
    const response = await fetch(`${this.baseUrl}/roles`);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('[ROLES API CLIENT] Error response:', errorData);
      throw new Error(errorData.error || 'Failed to fetch roles');
    }

    const data: ApiResponse<RolesListResponse> = await response.json();
    
    if (!data.success || !data.data) {
      console.error('[ROLES API CLIENT] Invalid response format:', data);
      throw new Error(data.error || 'Invalid response from server');
    }

    return data.data;
  }

  /**
   * Create a new role
   */
  async createRole(roleData: CreateRoleRequest): Promise<Role> {
    // Validate request data
    const validatedData = CreateRoleSchema.parse(roleData);

    const response = await fetch(`${this.baseUrl}/roles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validatedData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to create role');
    }

    const data: Role = await response.json();
    return data;
  }

  /**
   * Get permissions for a specific role
   */
  async getRolePermissions(roleId: string): Promise<RolePermissions> {
    const response = await fetch(`${this.baseUrl}/roles/${roleId}/permissions`);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to fetch role permissions');
    }

    const data: RolePermissions = await response.json();
    return data;
  }

  /**
   * Update permissions for a role
   */
  async updateRolePermissions(
    roleId: string, 
    permissions: UpdatePermissionsRequest
  ): Promise<{ message: string; updatedCount: number }> {
    // Validate request data
    const validatedData = UpdatePermissionsSchema.parse(permissions);

    const response = await fetch(`${this.baseUrl}/roles/${roleId}/permissions`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validatedData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to update role permissions');
    }

    const data = await response.json();
    return data;
  }

  /**
   * Get user's role in current organization
   */
  async getUserRole(userId: string): Promise<UserRole> {
    const response = await fetch(`${this.baseUrl}/users/${userId}/role`);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to fetch user role');
    }

    const data: UserRole = await response.json();
    return data;
  }

  /**
   * Update user's role in organization
   */
  async updateUserRole(userId: string, roleData: UpdateUserRoleRequest): Promise<{
    message: string;
    userId: string;
    roleId: string;
  }> {
    // Validate request data
    const validatedData = UpdateUserRoleSchema.parse(roleData);

    const response = await fetch(`${this.baseUrl}/users/${userId}/role`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validatedData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to update user role');
    }

    const data = await response.json();
    return data;
  }

  /**
   * Get user's permissions in current organization
   */
  async getUserPermissions(userId: string): Promise<{
    userId: string;
    organizationId: string;
    role: string;
    permissions: Record<string, { action: string; granted: boolean }[]>;
    totalPermissions: number;
  }> {
    const response = await fetch(`${this.baseUrl}/users/${userId}/permissions`);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to fetch user permissions');
    }

    const data = await response.json();
    return data;
  }
}

/**
 * Default export - singleton instance of RolesApi
 */
const rolesApi = new RolesApi();
export default rolesApi;

/**
 * Hook-style functions for easy use in React components
 */

/**
 * Fetch all roles with error handling
 */
export async function fetchRoles(): Promise<RolesListResponse> {
  return rolesApi.getRoles();
}

/**
 * Create a new role with error handling
 */
export async function createRole(roleData: CreateRoleRequest): Promise<Role> {
  return rolesApi.createRole(roleData);
}

/**
 * Fetch role permissions with error handling
 */
export async function fetchRolePermissions(roleId: string): Promise<RolePermissions> {
  return rolesApi.getRolePermissions(roleId);
}

/**
 * Update role permissions with error handling
 */
export async function updateRolePermissions(
  roleId: string,
  permissions: UpdatePermissionsRequest
): Promise<{ message: string; updatedCount: number }> {
  return rolesApi.updateRolePermissions(roleId, permissions);
}

/**
 * Fetch user role with error handling
 */
export async function fetchUserRole(userId: string): Promise<UserRole> {
  return rolesApi.getUserRole(userId);
}

/**
 * Update user role with error handling
 */
export async function updateUserRole(
  userId: string,
  roleData: UpdateUserRoleRequest
): Promise<{ message: string; userId: string; roleId: string }> {
  return rolesApi.updateUserRole(userId, roleData);
}

/**
 * Fetch user permissions with error handling
 */
export async function fetchUserPermissions(userId: string): Promise<{
  userId: string;
  organizationId: string;
  role: string;
  permissions: Record<string, { action: string; granted: boolean }[]>;
  totalPermissions: number;
}> {
  return rolesApi.getUserPermissions(userId);
}