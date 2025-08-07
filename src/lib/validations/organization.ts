import { z } from 'zod';

// Base organization schema
export const OrganizationSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, 'Organization name is required').max(255, 'Name must be 255 characters or less'),
  domain: z.string().min(1).max(255).optional().nullable(),
  logo_url: z.string().url().optional().nullable(),
  settings: z.record(z.any()).optional().default({}),
  workos_id: z.string().max(255).optional().nullable(),
  slug: z.string().max(255).optional().nullable(),
  is_active: z.boolean().default(true),
  metadata: z.record(z.any()).optional().default({}),
  
  // Hierarchy fields
  parent_id: z.string().uuid().optional().nullable(),
  organization_type: z.enum(['single', 'parent', 'child', 'franchise_parent', 'franchise_child']).default('single'),
  hierarchy_level: z.number().int().min(0).max(5).default(0),
  owner_id: z.string().uuid(),
  
  // Timestamps (optional for creation, managed by database)
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

// Schema for creating organizations
export const CreateOrganizationSchema = OrganizationSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
  hierarchy_level: true, // Calculated by trigger
});

// Schema for updating organizations
export const UpdateOrganizationSchema = OrganizationSchema.partial().omit({
  id: true,
  created_at: true,
  updated_at: true,
  hierarchy_level: true, // Calculated by trigger
});

// Schema for organization query parameters
export const OrganizationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  organization_type: z.enum(['single', 'parent', 'child', 'franchise_parent', 'franchise_child']).optional(),
  is_active: z.coerce.boolean().optional(),
  parent_id: z.string().uuid().optional(),
  owner_id: z.string().uuid().optional(),
});

// Location validation schemas
export const LocationSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, 'Location name is required').max(255, 'Name must be 255 characters or less'),
  address: z.string().min(1, 'Address is required'),
  city: z.string().max(100).optional().nullable(),
  state: z.string().max(50).optional().nullable(),
  postal_code: z.string().max(20).optional().nullable(),
  country: z.string().max(50).default('US'),
  phone: z.string().max(20).optional().nullable(),
  email: z.string().email().optional().nullable(),
  organization_id: z.string().uuid(),
  is_active: z.boolean().default(true),
  settings: z.record(z.any()).optional().default({}),
  metadata: z.record(z.any()).optional().default({}),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

export const CreateLocationSchema = LocationSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const UpdateLocationSchema = LocationSchema.partial().omit({
  id: true,
  organization_id: true, // Cannot change which org a location belongs to
  created_at: true,
  updated_at: true,
});

// Organization with locations response schema
export const OrganizationWithLocationsSchema = OrganizationSchema.extend({
  locations: z.array(LocationSchema).optional(),
  child_organizations: z.array(OrganizationSchema).optional(),
  parent_organization: OrganizationSchema.optional().nullable(),
});

// Bulk operations schemas
export const BulkCreateOrganizationsSchema = z.object({
  organizations: z.array(CreateOrganizationSchema).min(1).max(50),
});

export const BulkUpdateOrganizationsSchema = z.object({
  updates: z.array(
    z.object({
      id: z.string().uuid(),
      data: UpdateOrganizationSchema,
    })
  ).min(1).max(50),
});

// Organization hierarchy move schema
export const MoveOrganizationSchema = z.object({
  new_parent_id: z.string().uuid().optional().nullable(),
  organization_type: z.enum(['single', 'parent', 'child', 'franchise_parent', 'franchise_child']).optional(),
});

// Organization settings update schema
export const OrganizationSettingsSchema = z.record(z.any());

// Export types
export type Organization = z.infer<typeof OrganizationSchema>;
export type CreateOrganization = z.infer<typeof CreateOrganizationSchema>;
export type UpdateOrganization = z.infer<typeof UpdateOrganizationSchema>;
export type OrganizationQuery = z.infer<typeof OrganizationQuerySchema>;
export type Location = z.infer<typeof LocationSchema>;
export type CreateLocation = z.infer<typeof CreateLocationSchema>;
export type UpdateLocation = z.infer<typeof UpdateLocationSchema>;
export type OrganizationWithLocations = z.infer<typeof OrganizationWithLocationsSchema>;
export type BulkCreateOrganizations = z.infer<typeof BulkCreateOrganizationsSchema>;
export type BulkUpdateOrganizations = z.infer<typeof BulkUpdateOrganizationsSchema>;
export type MoveOrganization = z.infer<typeof MoveOrganizationSchema>;
export type OrganizationSettings = z.infer<typeof OrganizationSettingsSchema>;