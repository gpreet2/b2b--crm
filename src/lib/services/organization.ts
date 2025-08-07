import { getDatabase } from '@/config/database';
import { logger } from '@/utils/logger';
import type {
  Organization,
  CreateOrganization,
  UpdateOrganization,
  OrganizationQuery,
  Location,
  CreateLocation,
  UpdateLocation,
  OrganizationWithLocations,
  MoveOrganization,
  OrganizationSettings,
} from '@/lib/validations/organization';

export class OrganizationService {
  private db: ReturnType<typeof getDatabase>;

  constructor() {
    this.db = getDatabase();
  }

  /**
   * Create a new organization with audit logging
   */
  async createOrganization(data: CreateOrganization, createdBy: string): Promise<Organization> {
    try {
      const { data: organization, error } = await this.db
        .getSupabaseClient()
        .from('organizations')
        .insert({
          name: data.name,
          domain: data.domain || null,
          logo_url: data.logo_url || null,
          settings: data.settings || {},
          workos_id: data.workos_id || null,
          slug: data.slug || null,
          is_active: data.is_active ?? true,
          metadata: data.metadata || {},
          parent_id: data.parent_id || null,
          organization_type: data.organization_type || 'single',
          owner_id: data.owner_id,
        })
        .select()
        .single();

      if (error) {
        logger.error('Failed to create organization', { error, data });
        throw new Error(`Failed to create organization: ${error.message}`);
      }

      // Log audit event
      await this.logAuditEvent('organization_created', organization.id, createdBy, {
        organization_name: organization.name,
        organization_type: organization.organization_type,
        parent_id: organization.parent_id,
      });

      logger.info('Organization created successfully', {
        organizationId: organization.id,
        name: organization.name,
        createdBy,
      });

      return organization;
    } catch (error) {
      logger.error('Error creating organization', { error, data });
      throw error;
    }
  }

  /**
   * Get organization by ID with optional related data
   */
  async getOrganizationById(
    id: string,
    options: {
      includeLocations?: boolean;
      includeChildren?: boolean;
      includeParent?: boolean;
    } = {}
  ): Promise<OrganizationWithLocations | null> {
    try {
      const { data: organization, error } = await this.db
        .getSupabaseClient()
        .from('organizations')
        .select()
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Not found
        }
        logger.error('Failed to get organization', { error, id });
        throw new Error(`Failed to get organization: ${error.message}`);
      }

      const result: OrganizationWithLocations = organization;

      // Include locations if requested
      if (options.includeLocations) {
        const { data: locations, error: locError } = await this.db
          .getSupabaseClient()
          .from('locations')
          .select()
          .eq('organization_id', id)
          .eq('is_active', true)
          .order('name');

        if (locError) {
          logger.error('Failed to get organization locations', { error: locError, organizationId: id });
        } else {
          result.locations = locations || [];
        }
      }

      // Include child organizations if requested
      if (options.includeChildren) {
        const { data: children, error: childError } = await this.db
          .getSupabaseClient()
          .from('organizations')
          .select()
          .eq('parent_id', id)
          .eq('is_active', true)
          .order('name');

        if (childError) {
          logger.error('Failed to get child organizations', { error: childError, organizationId: id });
        } else {
          result.child_organizations = children || [];
        }
      }

      // Include parent organization if requested
      if (options.includeParent && organization.parent_id) {
        const { data: parent, error: parentError } = await this.db
          .getSupabaseClient()
          .from('organizations')
          .select()
          .eq('id', organization.parent_id)
          .single();

        if (parentError) {
          logger.error('Failed to get parent organization', { error: parentError, parentId: organization.parent_id });
        } else {
          result.parent_organization = parent;
        }
      }

      return result;
    } catch (error) {
      logger.error('Error getting organization', { error, id });
      throw error;
    }
  }

  /**
   * Get organizations with filtering, pagination, and search
   */
  async getOrganizations(query: OrganizationQuery): Promise<{
    organizations: Organization[];
    total: number;
    page: number;
    limit: number;
  }> {
    try {
      let baseQuery = this.db
        .getSupabaseClient()
        .from('organizations')
        .select('*', { count: 'exact' });

      // Apply filters
      if (query.search) {
        baseQuery = baseQuery.or(
          `name.ilike.%${query.search}%,domain.ilike.%${query.search}%,slug.ilike.%${query.search}%`
        );
      }

      if (query.organization_type) {
        baseQuery = baseQuery.eq('organization_type', query.organization_type);
      }

      if (query.is_active !== undefined) {
        baseQuery = baseQuery.eq('is_active', query.is_active);
      }

      if (query.parent_id) {
        baseQuery = baseQuery.eq('parent_id', query.parent_id);
      }

      if (query.owner_id) {
        baseQuery = baseQuery.eq('owner_id', query.owner_id);
      }

      // Apply pagination
      const offset = (query.page - 1) * query.limit;
      baseQuery = baseQuery
        .order('created_at', { ascending: false })
        .range(offset, offset + query.limit - 1);

      const { data, count, error } = await baseQuery;

      if (error) {
        logger.error('Failed to get organizations', { error, query });
        throw new Error(`Failed to get organizations: ${error.message}`);
      }

      return {
        organizations: data || [],
        total: count || 0,
        page: query.page,
        limit: query.limit,
      };
    } catch (error) {
      logger.error('Error getting organizations', { error, query });
      throw error;
    }
  }

  /**
   * Update organization with audit logging
   */
  async updateOrganization(id: string, data: UpdateOrganization, updatedBy: string): Promise<Organization> {
    try {
      // Get current organization for audit logging
      const current = await this.getOrganizationById(id);
      if (!current) {
        throw new Error('Organization not found');
      }

      const updateData: any = {};
      if (data.name !== undefined) updateData.name = data.name;
      if (data.domain !== undefined) updateData.domain = data.domain;
      if (data.logo_url !== undefined) updateData.logo_url = data.logo_url;
      if (data.settings !== undefined) updateData.settings = data.settings;
      if (data.workos_id !== undefined) updateData.workos_id = data.workos_id;
      if (data.slug !== undefined) updateData.slug = data.slug;
      if (data.is_active !== undefined) updateData.is_active = data.is_active;
      if (data.metadata !== undefined) updateData.metadata = data.metadata;
      if (data.parent_id !== undefined) updateData.parent_id = data.parent_id;
      if (data.organization_type !== undefined) updateData.organization_type = data.organization_type;
      if (data.owner_id !== undefined) updateData.owner_id = data.owner_id;

      const { data: organization, error } = await this.db
        .getSupabaseClient()
        .from('organizations')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        logger.error('Failed to update organization', { error, id, data });
        throw new Error(`Failed to update organization: ${error.message}`);
      }

      // Log audit event
      await this.logAuditEvent('organization_updated', organization.id, updatedBy, {
        changes: updateData,
        previous_name: current.name,
        new_name: organization.name,
      });

      logger.info('Organization updated successfully', {
        organizationId: organization.id,
        updatedBy,
      });

      return organization;
    } catch (error) {
      logger.error('Error updating organization', { error, id });
      throw error;
    }
  }

  /**
   * Delete organization (soft delete by setting is_active to false)
   */
  async deleteOrganization(id: string, deletedBy: string): Promise<void> {
    try {
      const organization = await this.getOrganizationById(id);
      if (!organization) {
        throw new Error('Organization not found');
      }

      // Check if organization has active child organizations
      const { data: children, error: childError } = await this.db
        .getSupabaseClient()
        .from('organizations')
        .select('id')
        .eq('parent_id', id)
        .eq('is_active', true);

      if (childError) {
        logger.error('Failed to check child organizations', { error: childError, id });
        throw new Error('Failed to check child organizations');
      }

      if (children && children.length > 0) {
        throw new Error('Cannot delete organization with active child organizations');
      }

      const { error } = await this.db
        .getSupabaseClient()
        .from('organizations')
        .update({ is_active: false })
        .eq('id', id);

      if (error) {
        logger.error('Failed to delete organization', { error, id });
        throw new Error(`Failed to delete organization: ${error.message}`);
      }

      // Log audit event
      await this.logAuditEvent('organization_deleted', id, deletedBy, {
        organization_name: organization.name,
      });

      logger.info('Organization deleted successfully', { organizationId: id, deletedBy });
    } catch (error) {
      logger.error('Error deleting organization', { error, id });
      throw error;
    }
  }

  /**
   * Move organization to new parent (hierarchy change)
   */
  async moveOrganization(id: string, data: MoveOrganization, updatedBy: string): Promise<Organization> {
    try {
      const organization = await this.getOrganizationById(id);
      if (!organization) {
        throw new Error('Organization not found');
      }

      const updateData: any = {};
      if (data.new_parent_id !== undefined) updateData.parent_id = data.new_parent_id;
      if (data.organization_type !== undefined) updateData.organization_type = data.organization_type;

      const { data: updated, error } = await this.db
        .getSupabaseClient()
        .from('organizations')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        logger.error('Failed to move organization', { error, id, data });
        throw new Error(`Failed to move organization: ${error.message}`);
      }

      // Log audit event
      await this.logAuditEvent('organization_moved', id, updatedBy, {
        previous_parent_id: organization.parent_id,
        new_parent_id: data.new_parent_id,
        organization_name: organization.name,
      });

      logger.info('Organization moved successfully', { organizationId: id, updatedBy });

      return updated;
    } catch (error) {
      logger.error('Error moving organization', { error, id });
      throw error;
    }
  }

  /**
   * Update organization settings
   */
  async updateOrganizationSettings(
    id: string,
    settings: OrganizationSettings,
    updatedBy: string
  ): Promise<Organization> {
    try {
      const { data: organization, error } = await this.db
        .getSupabaseClient()
        .from('organizations')
        .update({ settings })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        logger.error('Failed to update organization settings', { error, id, settings });
        throw new Error(`Failed to update organization settings: ${error.message}`);
      }

      // Log audit event
      await this.logAuditEvent('organization_settings_updated', id, updatedBy, {
        settings_keys: Object.keys(settings),
      });

      return organization;
    } catch (error) {
      logger.error('Error updating organization settings', { error, id });
      throw error;
    }
  }

  /**
   * Create location for organization
   */
  async createLocation(data: CreateLocation, createdBy: string): Promise<Location> {
    try {
      const { data: location, error } = await this.db
        .getSupabaseClient()
        .from('locations')
        .insert({
          name: data.name,
          address: data.address,
          city: data.city || null,
          state: data.state || null,
          postal_code: data.postal_code || null,
          country: data.country || 'US',
          phone: data.phone || null,
          email: data.email || null,
          organization_id: data.organization_id,
          is_active: data.is_active ?? true,
          settings: data.settings || {},
          metadata: data.metadata || {},
        })
        .select()
        .single();

      if (error) {
        logger.error('Failed to create location', { error, data });
        throw new Error(`Failed to create location: ${error.message}`);
      }

      // Log audit event
      await this.logAuditEvent('location_created', location.id, createdBy, {
        location_name: location.name,
        organization_id: location.organization_id,
      });

      return location;
    } catch (error) {
      logger.error('Error creating location', { error, data });
      throw error;
    }
  }

  /**
   * Get organization hierarchy (parent and all descendants)
   */
  async getOrganizationHierarchy(id: string): Promise<{
    root: Organization;
    children: Organization[];
    descendants: Organization[];
  }> {
    try {
      const root = await this.getOrganizationById(id);
      if (!root) {
        throw new Error('Organization not found');
      }

      // Get direct children
      const { data: children, error: childError } = await this.db
        .getSupabaseClient()
        .from('organizations')
        .select()
        .eq('parent_id', id)
        .eq('is_active', true)
        .order('name');

      if (childError) {
        logger.error('Failed to get organization children', { error: childError, id });
        throw new Error('Failed to get organization hierarchy');
      }

      // Get all descendants (recursive)
      const descendants = await this.getAllDescendants(id);

      return {
        root,
        children: children || [],
        descendants,
      };
    } catch (error) {
      logger.error('Error getting organization hierarchy', { error, id });
      throw error;
    }
  }

  /**
   * Get all descendant organizations recursively
   */
  private async getAllDescendants(parentId: string): Promise<Organization[]> {
    const allDescendants: Organization[] = [];
    
    const getChildren = async (id: string): Promise<void> => {
      const { data: children, error } = await this.db
        .getSupabaseClient()
        .from('organizations')
        .select()
        .eq('parent_id', id)
        .eq('is_active', true);

      if (error) {
        logger.error('Failed to get descendants', { error, parentId: id });
        return;
      }

      for (const child of children || []) {
        allDescendants.push(child);
        await getChildren(child.id); // Recursive call
      }
    };

    await getChildren(parentId);
    return allDescendants;
  }

  /**
   * Log audit event for organization changes
   */
  private async logAuditEvent(
    action: string,
    resourceId: string,
    userId: string,
    metadata: Record<string, any>
  ): Promise<void> {
    try {
      // Attempting to insert audit log for: { action, resourceId, userId }
      
      const { error } = await this.db.getSupabaseClient().from('audit_logs').insert({
        action,
        entity_type: 'organization',
        entity_id: resourceId,
        user_id: userId,
        metadata,
        created_at: new Date().toISOString(),
      });
      
      if (error) {
        logger.error('Audit log insert error', { error, action, resourceId });
      }
    } catch (error) {
      logger.error('Failed to log audit event', { error, action, resourceId });
      // Don't throw - audit logging failure shouldn't block the main operation
    }
  }
}