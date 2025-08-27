/**
 * Organization Management API Client
 * 
 * This module provides client-side functions for interacting with the organization management API.
 * All functions handle error responses and provide proper TypeScript typing.
 */

import { z } from 'zod';

// Types for API responses
export interface Organization {
  id: string;
  name: string;
  domain?: string;
  logo_url?: string;
  slug?: string;
  workos_id?: string;
  is_active: boolean;
  organization_type: 'single' | 'franchise_parent' | 'franchise_child';
  parent_id?: string;
  owner_id?: string;
  hierarchy_level: number;
  settings: Record<string, any>;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Location {
  id: string;
  organization_id: string;
  name: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  phone?: string;
  email?: string;
  website?: string;
  timezone?: string;
  settings: Record<string, any>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface OrganizationWithLocations extends Organization {
  locations?: Location[];
  children?: Organization[];
  parent?: Organization;
}

// Request schemas
const CreateOrganizationSchema = z.object({
  name: z.string().min(1).max(255),
  domain: z.string().optional(),
  logo_url: z.string().url().optional(),
  slug: z.string().min(1).max(100).optional(),
  organization_type: z.enum(['single', 'franchise_parent', 'franchise_child']).default('single'),
  parent_id: z.string().uuid().optional(),
  settings: z.record(z.string(), z.any()).default({}),
  metadata: z.record(z.string(), z.any()).default({}),
});

const UpdateOrganizationSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  domain: z.string().optional(),
  logo_url: z.string().url().optional(),
  slug: z.string().min(1).max(100).optional(),
  is_active: z.boolean().optional(),
  settings: z.record(z.string(), z.any()).optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});

const CreateLocationSchema = z.object({
  name: z.string().min(1).max(255),
  address_line1: z.string().optional(),
  address_line2: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postal_code: z.string().optional(),
  country: z.string().default('US'),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  website: z.string().url().optional(),
  timezone: z.string().default('UTC'),
  settings: z.record(z.string(), z.any()).default({}),
});

const UpdateLocationSchema = CreateLocationSchema.partial();

export type CreateOrganizationRequest = z.infer<typeof CreateOrganizationSchema>;
export type UpdateOrganizationRequest = z.infer<typeof UpdateOrganizationSchema>;
export type CreateLocationRequest = z.infer<typeof CreateLocationSchema>;
export type UpdateLocationRequest = z.infer<typeof UpdateLocationSchema>;

// API Response types
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  details?: any;
  message?: string;
}

interface OrganizationsListResponse {
  organizations: Organization[];
  total: number;
  page?: number;
  limit?: number;
}

interface LocationsListResponse {
  locations: Location[];
  total: number;
}

/**
 * Organization Management API Client
 */
export class OrganizationsApi {
  private baseUrl = '/api';

  /**
   * Fetch all organizations
   */
  async getOrganizations(params?: {
    page?: number;
    limit?: number;
    owner_id?: string;
    organization_type?: string;
  }): Promise<OrganizationsListResponse> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.owner_id) searchParams.set('owner_id', params.owner_id);
    if (params?.organization_type) searchParams.set('organization_type', params.organization_type);

    const response = await fetch(`${this.baseUrl}/organizations?${searchParams.toString()}`);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(errorData.error || `Failed to fetch organizations: ${response.status}`);
    }

    const result: ApiResponse<OrganizationsListResponse> = await response.json();
    
    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to fetch organizations');
    }

    return result.data;
  }

  /**
   * Fetch a single organization by ID
   */
  async getOrganization(
    id: string,
    options?: {
      include_locations?: boolean;
      include_children?: boolean;
      include_parent?: boolean;
    }
  ): Promise<OrganizationWithLocations> {
    const searchParams = new URLSearchParams();
    if (options?.include_locations) searchParams.set('include_locations', 'true');
    if (options?.include_children) searchParams.set('include_children', 'true');
    if (options?.include_parent) searchParams.set('include_parent', 'true');

    const response = await fetch(`${this.baseUrl}/organizations/${id}?${searchParams.toString()}`);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(errorData.error || `Failed to fetch organization: ${response.status}`);
    }

    const result: ApiResponse<OrganizationWithLocations> = await response.json();
    
    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to fetch organization');
    }

    return result.data;
  }

  /**
   * Create a new organization
   */
  async createOrganization(data: CreateOrganizationRequest): Promise<Organization> {
    const validatedData = CreateOrganizationSchema.parse(data);

    const response = await fetch(`${this.baseUrl}/organizations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validatedData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(errorData.error || `Failed to create organization: ${response.status}`);
    }

    const result: ApiResponse<Organization> = await response.json();
    
    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to create organization');
    }

    return result.data;
  }

  /**
   * Update an organization
   */
  async updateOrganization(id: string, data: UpdateOrganizationRequest): Promise<Organization> {
    const validatedData = UpdateOrganizationSchema.parse(data);

    const response = await fetch(`${this.baseUrl}/organizations/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validatedData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(errorData.error || `Failed to update organization: ${response.status}`);
    }

    const result: ApiResponse<Organization> = await response.json();
    
    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to update organization');
    }

    return result.data;
  }

  /**
   * Delete an organization
   */
  async deleteOrganization(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/organizations/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(errorData.error || `Failed to delete organization: ${response.status}`);
    }

    const result: ApiResponse<void> = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to delete organization');
    }
  }

  /**
   * Fetch organization settings
   */
  async getOrganizationSettings(id: string): Promise<Record<string, any>> {
    const response = await fetch(`${this.baseUrl}/organizations/${id}/settings`);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(errorData.error || `Failed to fetch organization settings: ${response.status}`);
    }

    const result: ApiResponse<Record<string, any>> = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch organization settings');
    }

    return result.data || {};
  }

  /**
   * Update organization settings
   */
  async updateOrganizationSettings(
    id: string, 
    settings: Record<string, any>,
    partial: boolean = false
  ): Promise<Organization> {
    const method = partial ? 'PATCH' : 'PUT';
    const response = await fetch(`${this.baseUrl}/organizations/${id}/settings`, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(settings),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(errorData.error || `Failed to update organization settings: ${response.status}`);
    }

    const result: ApiResponse<Organization> = await response.json();
    
    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to update organization settings');
    }

    return result.data;
  }

  /**
   * Fetch organization locations
   */
  async getOrganizationLocations(organizationId: string): Promise<LocationsListResponse> {
    const response = await fetch(`${this.baseUrl}/organizations/${organizationId}/locations`);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(errorData.error || `Failed to fetch locations: ${response.status}`);
    }

    const result: ApiResponse<LocationsListResponse> = await response.json();
    
    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to fetch locations');
    }

    return result.data;
  }

  /**
   * Create a new location
   */
  async createLocation(organizationId: string, data: CreateLocationRequest): Promise<Location> {
    const validatedData = CreateLocationSchema.parse(data);

    const response = await fetch(`${this.baseUrl}/organizations/${organizationId}/locations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validatedData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(errorData.error || `Failed to create location: ${response.status}`);
    }

    const result: ApiResponse<Location> = await response.json();
    
    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to create location');
    }

    return result.data;
  }

  /**
   * Update a location
   */
  async updateLocation(
    organizationId: string, 
    locationId: string, 
    data: UpdateLocationRequest
  ): Promise<Location> {
    const validatedData = UpdateLocationSchema.parse(data);

    const response = await fetch(`${this.baseUrl}/organizations/${organizationId}/locations/${locationId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validatedData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(errorData.error || `Failed to update location: ${response.status}`);
    }

    const result: ApiResponse<Location> = await response.json();
    
    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to update location');
    }

    return result.data;
  }

  /**
   * Delete a location
   */
  async deleteLocation(organizationId: string, locationId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/organizations/${organizationId}/locations/${locationId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(errorData.error || `Failed to delete location: ${response.status}`);
    }

    const result: ApiResponse<void> = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to delete location');
    }
  }
}

// Create default instance
const organizationsApi = new OrganizationsApi();
export default organizationsApi;

// Named exports for convenience functions
export const fetchOrganizations = (params?: Parameters<OrganizationsApi['getOrganizations']>[0]) => 
  organizationsApi.getOrganizations(params);

export const fetchOrganization = (id: string, options?: Parameters<OrganizationsApi['getOrganization']>[1]) => 
  organizationsApi.getOrganization(id, options);

export const createOrganization = (data: CreateOrganizationRequest) => 
  organizationsApi.createOrganization(data);

export const updateOrganization = (id: string, data: UpdateOrganizationRequest) => 
  organizationsApi.updateOrganization(id, data);

export const deleteOrganization = (id: string) => 
  organizationsApi.deleteOrganization(id);

export const fetchOrganizationSettings = (id: string) => 
  organizationsApi.getOrganizationSettings(id);

export const updateOrganizationSettings = (id: string, settings: Record<string, any>, partial?: boolean) => 
  organizationsApi.updateOrganizationSettings(id, settings, partial);

export const fetchOrganizationLocations = (organizationId: string) => 
  organizationsApi.getOrganizationLocations(organizationId);

export const createLocation = (organizationId: string, data: CreateLocationRequest) => 
  organizationsApi.createLocation(organizationId, data);

export const updateLocation = (organizationId: string, locationId: string, data: UpdateLocationRequest) => 
  organizationsApi.updateLocation(organizationId, locationId, data);

export const deleteLocation = (organizationId: string, locationId: string) => 
  organizationsApi.deleteLocation(organizationId, locationId);