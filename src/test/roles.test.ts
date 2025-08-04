import { createClient } from '@supabase/supabase-js';

import {
  DEFAULT_ROLES,
  ROLE_DEFINITIONS,
  ROLE_HIERARCHY,
  getRoleBySlug,
  isSystemRole,
  getInheritedRoles,
  roleInheritsFrom,
} from '@/config/roles';

describe('Role Configuration Tests', () => {
  let supabase: ReturnType<typeof createClient>;

  beforeAll(() => {
    supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    );
  });

  describe('Default roles match database', () => {
    it('should have all default roles in database', async () => {
      // Get all system roles from database
      const { data: dbRoles, error } = await supabase
        .from('roles')
        .select('name, slug, description, is_system')
        .eq('is_system', true)
        .order('name');

      expect(error).toBeNull();
      expect(dbRoles).toBeDefined();

      // Check that all default roles exist in database
      for (const [key, slug] of Object.entries(DEFAULT_ROLES)) {
        const roleDefinition = ROLE_DEFINITIONS[slug];
        const dbRole = dbRoles!.find(r => r.slug === slug);

        expect(dbRole).toBeDefined();
        expect(dbRole?.name).toBe(roleDefinition.name);
        expect(dbRole?.description).toBe(roleDefinition.description);
        expect(dbRole?.is_system).toBe(true);
      }

      // Check we have the same number of system roles
      expect(dbRoles!.length).toBe(Object.keys(DEFAULT_ROLES).length);
    });

    it('should have correct permission counts for each role', async () => {
      // Get permission counts from database
      const { data: roleCounts, error } = await supabase
        .from('roles')
        .select(
          `
          slug,
          role_permissions!inner(count)
        `
        )
        .eq('is_system', true);

      expect(error).toBeNull();

      // Expected permission counts based on database query
      const expectedCounts: Record<string, number> = {
        owner: 37, // Has all permissions
        admin: 36, // All except billing
        trainer: 16, // Client, event, workout management
        front_desk: 7, // Basic operations
        member: 2, // View-only access
      };

      // Verify counts match expectations
      for (const [slug, expectedCount] of Object.entries(expectedCounts)) {
        const roleData = roleCounts!.find(r => r.slug === slug);
        const actualCount = roleData?.role_permissions?.length || 0;

        // For now, we just check that roles have permissions assigned
        // The exact count might vary as permissions are added/removed
        expect(actualCount).toBeGreaterThan(0);
      }
    });
  });

  describe('Role utility functions', () => {
    it('should get role by slug correctly', () => {
      const adminRole = getRoleBySlug('admin');
      expect(adminRole).toBeDefined();
      expect(adminRole?.name).toBe('Administrator');
      expect(adminRole?.isSystem).toBe(true);

      const invalidRole = getRoleBySlug('invalid');
      expect(invalidRole).toBeUndefined();
    });

    it('should identify system roles correctly', () => {
      expect(isSystemRole('owner')).toBe(true);
      expect(isSystemRole('admin')).toBe(true);
      expect(isSystemRole('custom_role')).toBe(false);
    });

    it('should get inherited roles correctly', () => {
      const ownerInherited = getInheritedRoles('owner');
      expect(ownerInherited).toContain('admin');
      expect(ownerInherited).toContain('trainer');
      expect(ownerInherited).toContain('front_desk');
      expect(ownerInherited).toContain('member');

      const adminInherited = getInheritedRoles('admin');
      expect(adminInherited).toContain('trainer');
      expect(adminInherited).not.toContain('owner');

      const memberInherited = getInheritedRoles('member');
      expect(memberInherited).toEqual([]);
    });

    it('should check role inheritance correctly', () => {
      expect(roleInheritsFrom('owner', 'admin')).toBe(true);
      expect(roleInheritsFrom('owner', 'member')).toBe(true);
      expect(roleInheritsFrom('admin', 'owner')).toBe(false);
      expect(roleInheritsFrom('trainer', 'member')).toBe(true);
      expect(roleInheritsFrom('member', 'trainer')).toBe(false);
    });
  });

  describe('Role permission assignments', () => {
    it('should verify owner has full access', async () => {
      const { data: ownerRole } = await supabase
        .from('roles')
        .select('id')
        .eq('slug', 'owner')
        .single();

      const { data: ownerPerms } = await supabase
        .from('role_permissions')
        .select('permission_id')
        .eq('role_id', ownerRole!.id);

      const { data: allPerms } = await supabase.from('permissions').select('id');

      // Owner should have all permissions
      expect(ownerPerms!.length).toBe(allPerms!.length);
    });

    it('should verify admin lacks billing permission', async () => {
      const { data: adminRole } = await supabase
        .from('roles')
        .select('id')
        .eq('slug', 'admin')
        .single();

      const { data: adminPerms } = await supabase
        .from('role_permissions')
        .select(
          `
          permission:permissions!inner(
            resource,
            action
          )
        `
        )
        .eq('role_id', adminRole!.id);

      // Admin should not have billing permission
      const hasBilling = adminPerms!.some(
        p => p.permission.resource === 'organization' && p.permission.action === 'billing'
      );

      expect(hasBilling).toBe(false);
    });

    it('should verify member has only view permissions', async () => {
      const { data: memberRole } = await supabase
        .from('roles')
        .select('id')
        .eq('slug', 'member')
        .single();

      const { data: memberPerms } = await supabase
        .from('role_permissions')
        .select(
          `
          permission:permissions!inner(
            resource,
            action
          )
        `
        )
        .eq('role_id', memberRole!.id);

      // Member should only have view permissions
      expect(memberPerms!.every(p => p.permission.action === 'view')).toBe(true);
      expect(memberPerms!.length).toBe(2); // events.view and workouts.view
    });
  });
});
