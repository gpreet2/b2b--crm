/**
 * Database setup utilities for tests with real data
 */
import { getSupabaseClient } from '../config/supabase';

// Lazy initialization of Supabase client
function getServiceClient() {
  return getSupabaseClient();
}

export interface TestUser {
  id: string;
  email: string;
  organization_id: string;
  role: string;
}

export interface TestOrganization {
  id: string;
  name: string;
  workos_id?: string;
  slug?: string;
}

/**
 * Create test organization with real data
 */
export async function createTestOrganization(overrides: Partial<TestOrganization> = {}): Promise<TestOrganization> {
  const org = {
    name: `Test Organization ${Date.now()}`,
    workos_id: `org_${Math.random().toString(36).substr(2, 9)}`,
    ...overrides,
  };

  const { data, error } = await getServiceClient()
    .from('organizations')
    .insert(org)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create test organization: ${error.message}`);
  }

  return data;
}

/**
 * Create test user with real data
 */
export async function createTestUser(organizationId: string, overrides: Partial<TestUser> = {}): Promise<TestUser> {
  const user = {
    email: `test-${Date.now()}@example.com`,
    organization_id: organizationId,
    role: 'admin',
    ...overrides,
  };

  // First create the user in the users table
  const { data: userData, error: userError } = await getServiceClient()
    .from('users')
    .insert({
      email: user.email,
      workos_user_id: `user_${Math.random().toString(36).substr(2, 9)}`,
      first_name: `Test`,
      last_name: `User ${Date.now()}`,
      user_type: 'employee',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (userError) {
    throw new Error(`Failed to create test user: ${userError.message}`);
  }

  // Then create the user-organization relationship
  const { data: relationData, error: relationError } = await getServiceClient()
    .from('user_organizations')
    .insert({
      user_id: userData.id,
      organization_id: organizationId,
      role: user.role,
      joined_at: new Date().toISOString(),
      is_active: true,
    })
    .select()
    .single();

  if (relationError) {
    throw new Error(`Failed to create user-organization relationship: ${relationError.message}`);
  }

  return {
    id: userData.id,
    email: user.email,
    organization_id: organizationId,
    role: user.role,
  };
}

/**
 * Create test role with permissions
 */
export async function createTestRole(organizationId: string, permissions: Array<{ resource: string; action: string }> = []) {
  const roleId = `test-role-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  // Create role
  const { data: roleData, error: roleError } = await getServiceClient()
    .from('roles')
    .insert({
      id: roleId,
      name: `Test Role ${Date.now()}`,
      slug: `test-role-${Date.now()}`,
      description: 'Test role for automated testing',
      organization_id: organizationId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (roleError) {
    throw new Error(`Failed to create test role: ${roleError.message}`);
  }

  // Add permissions to role
  if (permissions.length > 0) {
    // First ensure permissions exist
    for (const perm of permissions) {
      await getServiceClient()
        .from('permissions')
        .upsert({
          resource: perm.resource,
          action: perm.action,
          description: `${perm.action} ${perm.resource}`,
        }, { onConflict: 'resource,action' });
    }

    // Get permission IDs
    const { data: permissionData, error: permissionError } = await getServiceClient()
      .from('permissions')
      .select('id, resource, action')
      .in('resource', permissions.map(p => p.resource))
      .in('action', permissions.map(p => p.action));

    if (permissionError) {
      throw new Error(`Failed to fetch permissions: ${permissionError.message}`);
    }

    // Create role-permission relationships
    const rolePermissions = permissionData
      .filter(p => permissions.some(perm => perm.resource === p.resource && perm.action === p.action))
      .map(p => ({
        role_id: roleId,
        permission_id: p.id,
        created_at: new Date().toISOString(),
      }));

    if (rolePermissions.length > 0) {
      const { error: rolePermError } = await getServiceClient()
        .from('role_permissions')
        .insert(rolePermissions);

      if (rolePermError) {
        throw new Error(`Failed to create role permissions: ${rolePermError.message}`);
      }
    }
  }

  return roleData;
}

/**
 * Clean up test data
 */
export async function cleanupTestData(testIds: { users?: string[]; organizations?: string[]; roles?: string[] } = {}) {
  const cleanup = async (table: string, ids: string[]) => {
    if (ids.length === 0) return;
    
    try {
      const { error } = await getServiceClient()
        .from(table)
        .delete()
        .in('id', ids);
      
      if (error) {
        console.warn(`Failed to cleanup ${table}:`, error.message);
      }
    } catch (err) {
      console.warn(`Error during ${table} cleanup:`, err);
    }
  };

  // Clean up in dependency order
  if (testIds.users) {
    await cleanup('user_organizations', testIds.users);
    await cleanup('users', testIds.users);
  }
  
  if (testIds.roles) {
    await cleanup('role_permissions', testIds.roles);
    await cleanup('roles', testIds.roles);
  }
  
  if (testIds.organizations) {
    await cleanup('organizations', testIds.organizations);
  }
}

/**
 * Test database connection and tables
 */
export async function verifyTestDatabase() {
  try {
    // Test basic connection
    const { data, error } = await getServiceClient()
      .from('organizations')
      .select('id')
      .limit(1);

    if (error) {
      throw new Error(`Database connection failed: ${error.message}`);
    }

    // Test required tables exist
    const requiredTables = ['users', 'organizations', 'user_organizations', 'roles', 'permissions', 'role_permissions'];
    
    for (const table of requiredTables) {
      const { error: tableError } = await getServiceClient()
        .from(table)
        .select('*')
        .limit(1);
      
      if (tableError) {
        throw new Error(`Required table '${table}' not found or inaccessible: ${tableError.message}`);
      }
    }

    return true;
  } catch (error) {
    console.error('Test database verification failed:', error);
    throw error;
  }
}