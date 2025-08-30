import { z } from "zod";

// Mock validation schemas
export const CreateOrganizationSchema = z.object({
  name: z.string(),
  domain: z.string().optional()
});

export const OrganizationQuerySchema = z.object({
  owner_id: z.string().optional()
});

export const BulkCreateOrganizationsSchema = z.object({
  organizations: z.array(CreateOrganizationSchema)
});
