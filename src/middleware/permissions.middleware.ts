import { getSupabaseClient } from '@/config/supabase';

/**
 * Check if a user has a specific permission for a resource within an organization
 */
export async function checkPermission(
  userId: string,
  organizationId: string,
  resource: string,
  action: string
): Promise<boolean> {
  try {
    const supabase = getSupabaseClient();

    // Get user roles in the organization
    const { data: userRoles, error: rolesError } = await supabase
      .from('user_organizations')
      .select(`
        role_id,
        roles!inner(
          id,
          name,
          role_permissions!inner(
            permission_id,
            permissions!inner(
              id,
              resource,
              action
            )
          )
        )
      `)
      .eq('user_id', userId)
      .eq('organization_id', organizationId);

    if (rolesError) {
      console.error('Error fetching user roles:', rolesError);
      return false;
    }

    if (!userRoles || userRoles.length === 0) {
      return false;
    }

    // Check if any role has the required permission
    for (const userRole of userRoles) {
      const role = userRole.roles as any;
      if (role && Array.isArray(role.role_permissions)) {
        for (const rolePermission of role.role_permissions) {
          const permission = rolePermission.permissions;
          if (permission && permission.resource === resource && permission.action === action) {
            return true;
          }
        }
      }
    }

    return false;
  } catch (error) {
    console.error('Permission check error:', error);
    return false;
  }
}

/**
 * Get user's role in an organization
 */
export async function getUserRole(
  userId: string,
  organizationId: string
): Promise<string | null> {
  try {
    const supabase = getSupabaseClient();

    const { data: userRole, error } = await supabase
      .from('user_organizations')
      .select(`
        roles!inner(name)
      `)
      .eq('user_id', userId)
      .eq('organization_id', organizationId)
      .single();

    if (error) {
      console.error('Error fetching user role:', error);
      return null;
    }

    return (userRole?.roles as any)?.name || null;
  } catch (error) {
    console.error('Get user role error:', error);
    return null;
  }
}

/**
 * Get all permissions for a user in an organization
 */
export async function getUserPermissions(
  userId: string,
  organizationId: string
): Promise<Array<{ resource: string; action: string; granted: boolean }>> {
  try {
    const supabase = getSupabaseClient();

    const { data: userRoles, error } = await supabase
      .from('user_organizations')
      .select(`
        role_id,
        roles!inner(
          id,
          name,
          role_permissions!inner(
            permission_id,
            permissions!inner(
              id,
              resource,
              action
            )
          )
        )
      `)
      .eq('user_id', userId)
      .eq('organization_id', organizationId);

    if (error) {
      console.error('Error fetching user permissions:', error);
      return [];
    }

    if (!userRoles) {
      return [];
    }

    const permissions: Array<{ resource: string; action: string; granted: boolean }> = [];

    userRoles.forEach((userRole) => {
      const role = userRole.roles as any;
      if (role && Array.isArray(role.role_permissions)) {
        role.role_permissions.forEach((rolePermission: any) => {
          const permission = rolePermission.permissions;
          if (permission) {
            permissions.push({
              resource: permission.resource,
              action: permission.action,
              granted: true
            });
          }
        });
      }
    });

    return permissions;
  } catch (error) {
    console.error('Get user permissions error:', error);
    return [];
  }
}