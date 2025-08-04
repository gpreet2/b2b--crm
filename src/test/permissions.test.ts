import { createClient } from '@supabase/supabase-js';

import {
  RESOURCES,
  ACTIONS,
  PERMISSION_DEFINITIONS,
  getAllPermissions,
  getPermissionsByResource,
  isValidPermission,
  getPermissionString,
  parsePermissionString,
} from '@/config/permissions';

describe('Permission Structure Tests', () => {
  let supabase: ReturnType<typeof createClient>;

  beforeAll(() => {
    supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    );
  });

  describe('Permission configuration matches database', () => {
    it('should have all permissions from database defined in code', async () => {
      // Get all permissions from database
      const { data: dbPermissions, error } = await supabase
        .from('permissions')
        .select('resource, action, description')
        .order('resource', { ascending: true })
        .order('action', { ascending: true });

      expect(error).toBeNull();
      expect(dbPermissions).toBeDefined();

      // Get all permissions from code
      const codePermissions = getAllPermissions();

      // Check that all DB permissions exist in code
      for (const dbPerm of dbPermissions!) {
        const found = codePermissions.find(
          p => p.resource === dbPerm.resource && p.action === dbPerm.action
        );

        expect(found).toBeDefined();
        expect(found?.description).toBe(dbPerm.description);
      }

      // Check that we have the same number of permissions
      expect(codePermissions.length).toBe(dbPermissions!.length);
    });

    it('should have all resources from database defined in code', async () => {
      // Get unique resources from database
      const { data: dbResources, error } = await supabase
        .from('permissions')
        .select('resource')
        .order('resource');

      expect(error).toBeNull();

      const uniqueDbResources = [...new Set(dbResources!.map(r => r.resource))];
      const codeResources = Object.values(RESOURCES);

      // Check all DB resources exist in code
      for (const resource of uniqueDbResources) {
        expect(codeResources).toContain(resource);
      }

      expect(codeResources.length).toBe(uniqueDbResources.length);
    });
  });

  describe('Permission utility functions', () => {
    it('should correctly format permission strings', () => {
      const permString = getPermissionString(RESOURCES.CLIENTS, ACTIONS.CLIENTS.VIEW);
      expect(permString).toBe('clients.view');
    });

    it('should correctly parse permission strings', () => {
      const parsed = parsePermissionString('events.create');
      expect(parsed).toEqual({
        resource: 'events',
        action: 'create',
      });
    });

    it('should return null for invalid permission strings', () => {
      expect(parsePermissionString('invalid')).toBeNull();
      expect(parsePermissionString('too.many.parts')).toBeNull();
      expect(parsePermissionString('')).toBeNull();
    });

    it('should validate permissions correctly', () => {
      expect(isValidPermission(RESOURCES.CLIENTS, ACTIONS.CLIENTS.VIEW)).toBe(true);
      expect(isValidPermission(RESOURCES.EVENTS, ACTIONS.EVENTS.CREATE)).toBe(true);
      expect(isValidPermission('invalid', 'action')).toBe(false);
      expect(isValidPermission(RESOURCES.CLIENTS, 'invalid')).toBe(false);
    });

    it('should get permissions by resource', () => {
      const clientPerms = getPermissionsByResource(RESOURCES.CLIENTS);

      expect(clientPerms).toHaveLength(5); // view, create, update, delete, export
      expect(clientPerms.every(p => p.resource === RESOURCES.CLIENTS)).toBe(true);
      expect(clientPerms.map(p => p.action)).toContain(ACTIONS.CLIENTS.VIEW);
      expect(clientPerms.map(p => p.action)).toContain(ACTIONS.CLIENTS.CREATE);
    });
  });

  describe('Permission structure completeness', () => {
    it('should have descriptions for all permissions', () => {
      const permissions = getAllPermissions();

      for (const perm of permissions) {
        expect(perm.description).toBeDefined();
        expect(perm.description).not.toBe('');
      }
    });

    it('should have consistent action naming', () => {
      const commonActions = ['view', 'create', 'update', 'delete'];

      // Check that resources with CRUD operations have consistent naming
      const crudResources = [
        RESOURCES.CLIENTS,
        RESOURCES.EVENTS,
        RESOURCES.MEMBERSHIPS,
        RESOURCES.WORKOUTS,
      ];

      for (const resource of crudResources) {
        const actions = PERMISSION_DEFINITIONS[resource];

        // Should have at least view action
        expect(Object.keys(actions)).toContain('view');
      }
    });
  });

  describe('Database function integration', () => {
    it('should verify has_permission function works with defined permissions', async () => {
      // Get a test user with admin role
      const { data: adminUser } = await supabase
        .from('user_organizations')
        .select('user_id, organization_id')
        .eq('is_active', true)
        .limit(1)
        .single();

      if (adminUser) {
        // Test a permission check using the function
        const { data: hasPermission, error } = await supabase.rpc('has_permission', {
          p_user_id: adminUser.user_id,
          p_organization_id: adminUser.organization_id,
          p_resource: RESOURCES.CLIENTS,
          p_action: ACTIONS.CLIENTS.VIEW,
        });

        expect(error).toBeNull();
        expect(typeof hasPermission).toBe('boolean');
      }
    });
  });
});
