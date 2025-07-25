import { workos } from './workos-client';
import { Organization, OrganizationMembership } from '@workos-inc/node';

// Organization management functions

export async function createOrganization(data: {
  name: string;
  gymId: string;
}): Promise<Organization> {
  try {
    const organization = await workos.organizations.createOrganization({
      name: data.name,
      // Store gym_id in metadata for reference
      metadata: {
        gym_id: data.gymId,
      },
    });
    
    return organization;
  } catch (error) {
    console.error('Error creating organization:', error);
    throw new Error('Failed to create organization');
  }
}

export async function updateOrganization(
  organizationId: string,
  data: {
    name?: string;
    metadata?: Record<string, any>;
  }
): Promise<Organization> {
  try {
    const organization = await workos.organizations.updateOrganization({
      organization: organizationId,
      ...data,
    });
    
    return organization;
  } catch (error) {
    console.error('Error updating organization:', error);
    throw new Error('Failed to update organization');
  }
}

export async function getOrganization(organizationId: string): Promise<Organization | null> {
  try {
    const organization = await workos.organizations.getOrganization(organizationId);
    return organization;
  } catch (error) {
    console.error('Error fetching organization:', error);
    return null;
  }
}

export async function deleteOrganization(organizationId: string): Promise<void> {
  try {
    await workos.organizations.deleteOrganization(organizationId);
  } catch (error) {
    console.error('Error deleting organization:', error);
    throw new Error('Failed to delete organization');
  }
}

// Organization membership functions

export async function createOrganizationMembership(data: {
  organizationId: string;
  userId: string;
  roleSlug?: string;
}): Promise<OrganizationMembership> {
  try {
    const membership = await workos.userManagement.createOrganizationMembership({
      organizationId: data.organizationId,
      userId: data.userId,
      roleSlug: data.roleSlug || 'member', // Default to member role
    });
    
    return membership;
  } catch (error) {
    console.error('Error creating organization membership:', error);
    throw new Error('Failed to create organization membership');
  }
}

export async function updateOrganizationMembership(
  membershipId: string,
  data: {
    roleSlug: string;
  }
): Promise<OrganizationMembership> {
  try {
    const membership = await workos.userManagement.updateOrganizationMembership({
      id: membershipId,
      roleSlug: data.roleSlug,
    });
    
    return membership;
  } catch (error) {
    console.error('Error updating organization membership:', error);
    throw new Error('Failed to update organization membership');
  }
}

export async function listOrganizationMemberships(
  organizationId: string,
  options?: {
    limit?: number;
    before?: string;
    after?: string;
  }
): Promise<{
  data: OrganizationMembership[];
  hasMore: boolean;
}> {
  try {
    const memberships = await workos.userManagement.listOrganizationMemberships({
      organizationId,
      ...options,
    });
    
    return {
      data: memberships.data,
      hasMore: memberships.listMetadata?.after ? true : false,
    };
  } catch (error) {
    console.error('Error listing organization memberships:', error);
    throw new Error('Failed to list organization memberships');
  }
}

export async function deleteOrganizationMembership(membershipId: string): Promise<void> {
  try {
    await workos.userManagement.deleteOrganizationMembership(membershipId);
  } catch (error) {
    console.error('Error deleting organization membership:', error);
    throw new Error('Failed to delete organization membership');
  }
}

// Helper function to get organization by gym ID
export async function getOrganizationByGymId(gymId: string): Promise<Organization | null> {
  try {
    // Search for organization with gym_id in metadata
    const organizations = await workos.organizations.listOrganizations({
      limit: 100, // Adjust as needed
    });
    
    const org = organizations.data.find(
      org => org.metadata?.gym_id === gymId
    );
    
    return org || null;
  } catch (error) {
    console.error('Error finding organization by gym ID:', error);
    return null;
  }
}

// Helper function to sync gym data with WorkOS organization
export async function syncGymWithOrganization(gym: {
  id: string;
  name: string;
  workos_organization_id?: string | null;
}): Promise<Organization> {
  try {
    if (gym.workos_organization_id) {
      // Update existing organization
      return await updateOrganization(gym.workos_organization_id, {
        name: gym.name,
        metadata: {
          gym_id: gym.id,
          updated_at: new Date().toISOString(),
        },
      });
    } else {
      // Create new organization
      return await createOrganization({
        name: gym.name,
        gymId: gym.id,
      });
    }
  } catch (error) {
    console.error('Error syncing gym with organization:', error);
    throw new Error('Failed to sync gym with organization');
  }
}