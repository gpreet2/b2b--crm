/**
 * Permissions API Client
 * 
 * This module provides client-side functions for interacting with the permissions API.
 * Used for fetching available permissions and managing permission assignments.
 */

// Types for API responses
export interface Permission {
  id: string;
  resource: string;
  action: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  details?: any;
}

interface PermissionsListResponse {
  permissions: Permission[];
  total: number;
}

/**
 * Permissions API Client
 */
export class PermissionsApi {
  private baseUrl = '/api';

  /**
   * Fetch all available permissions
   */
  async getPermissions(): Promise<PermissionsListResponse> {
    const response = await fetch(`${this.baseUrl}/permissions`);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to fetch permissions');
    }

    const data: ApiResponse<PermissionsListResponse> = await response.json();
    
    if (!data.success || !data.data) {
      throw new Error(data.error || 'Invalid response from server');
    }

    return data.data;
  }

  /**
   * Get permissions grouped by resource
   */
  async getPermissionsByResource(): Promise<Record<string, Permission[]>> {
    const permissionsData = await this.getPermissions();
    const grouped: Record<string, Permission[]> = {};

    permissionsData.permissions.forEach(permission => {
      if (!grouped[permission.resource]) {
        grouped[permission.resource] = [];
      }
      grouped[permission.resource].push(permission);
    });

    return grouped;
  }
}

/**
 * Default export - singleton instance of PermissionsApi
 */
const permissionsApi = new PermissionsApi();
export default permissionsApi;

/**
 * Hook-style functions for easy use in React components
 */

/**
 * Fetch all permissions with error handling
 */
export async function fetchPermissions(): Promise<PermissionsListResponse> {
  return permissionsApi.getPermissions();
}

/**
 * Fetch permissions grouped by resource with error handling
 */
export async function fetchPermissionsByResource(): Promise<Record<string, Permission[]>> {
  return permissionsApi.getPermissionsByResource();
}