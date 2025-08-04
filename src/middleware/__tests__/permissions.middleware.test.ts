import { createClient } from '@supabase/supabase-js';
import { Request, Response, NextFunction } from 'express';

import { AuthError, PermissionError } from '@/errors';

import {
  checkPermission,
  requirePermission,
  getUserPermissions,
  getUserRole,
  hasRole,
  requireRole,
  loadUserPermissions,
  AuthenticatedRequest,
} from '../permissions.middleware';


describe('Permission Middleware', () => {
  let supabase: ReturnType<typeof createClient>;
  let testUserId: string;
  let testOrgId: string;
  let mockReq: Partial<AuthenticatedRequest>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeAll(async () => {
    // Use real Supabase client for integration tests
    supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    );

    // Create test organization
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .insert({
        name: 'Test Organization',
      })
      .select()
      .single();

    if (orgError) throw orgError;
    testOrgId = org.id;

    // Create test user
    const { data: user, error: userError } = await supabase
      .from('users')
      .insert({
        email: 'test@example.com',
        first_name: 'Test',
        last_name: 'User',
        user_type: 'employee',
        workos_user_id: 'test-auth-id',
      })
      .select()
      .single();

    if (userError) throw userError;
    testUserId = user.id;

    // Get admin role
    const { data: adminRole, error: roleError } = await supabase
      .from('roles')
      .select('id')
      .eq('slug', 'admin')
      .single();

    if (roleError) throw roleError;

    // Assign user to organization with admin role
    const { error: assignError } = await supabase.from('user_organizations').insert({
      user_id: testUserId,
      organization_id: testOrgId,
      role_id: adminRole.id,
      role: 'admin',
      is_active: true,
    });

    if (assignError) throw assignError;
  });

  afterAll(async () => {
    // Clean up test data
    if (testUserId && testOrgId) {
      await supabase
        .from('user_organizations')
        .delete()
        .eq('user_id', testUserId)
        .eq('organization_id', testOrgId);
    }

    if (testUserId) {
      await supabase.from('users').delete().eq('id', testUserId);
    }

    if (testOrgId) {
      await supabase.from('organizations').delete().eq('id', testOrgId);
    }
  });

  beforeEach(() => {
    mockReq = {
      authUser: {
        id: testUserId,
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        emailVerified: true,
      },
      authOrganizationId: testOrgId,
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    mockNext = jest.fn();
  });

  describe('checkPermission with real database', () => {
    it('should return true for admin permissions', async () => {
      const result = await checkPermission(testUserId, testOrgId, 'users', 'read');

      expect(result).toBe(true);
    });

    it('should return true for multiple admin permissions', async () => {
      const permissions = [
        { resource: 'users', action: 'write' },
        { resource: 'users', action: 'delete' },
        { resource: 'events', action: 'create' },
        { resource: 'organization', action: 'manage_roles' },
      ];

      for (const perm of permissions) {
        const result = await checkPermission(testUserId, testOrgId, perm.resource, perm.action);
        expect(result).toBe(true);
      }
    });

    it('should return false for non-existent user', async () => {
      const result = await checkPermission('non-existent-user-id', testOrgId, 'users', 'read');

      expect(result).toBe(false);
    });

    it('should return false for non-existent organization', async () => {
      const result = await checkPermission(testUserId, 'non-existent-org-id', 'users', 'read');

      expect(result).toBe(false);
    });

    it('should return false for invalid permission', async () => {
      const result = await checkPermission(
        testUserId,
        testOrgId,
        'invalid-resource',
        'invalid-action'
      );

      expect(result).toBe(false);
    });
  });

  describe('getUserPermissions with real database', () => {
    it('should fetch all permissions for admin user', async () => {
      const permissions = await getUserPermissions(testUserId, testOrgId);

      expect(permissions).toBeInstanceOf(Array);
      expect(permissions.length).toBeGreaterThan(0);

      // Admin should have many permissions
      expect(permissions.length).toBeGreaterThan(20);

      // Check for specific expected permissions
      const hasUsersRead = permissions.some(
        p => p.resource === 'users' && p.action === 'read' && p.granted
      );
      const hasEventsCreate = permissions.some(
        p => p.resource === 'events' && p.action === 'create' && p.granted
      );

      expect(hasUsersRead).toBe(true);
      expect(hasEventsCreate).toBe(true);
    });

    it('should return empty array for non-existent user', async () => {
      const permissions = await getUserPermissions('non-existent-user', testOrgId);

      expect(permissions).toEqual([]);
    });
  });

  describe('getUserRole with real database', () => {
    it('should fetch user role correctly', async () => {
      const role = await getUserRole(testUserId, testOrgId);

      expect(role).toBe('admin');
    });

    it('should return null for non-existent user', async () => {
      const role = await getUserRole('non-existent-user', testOrgId);

      expect(role).toBeNull();
    });

    it('should return null for user not in organization', async () => {
      // Create a new user without organization assignment
      const { data: newUser } = await supabase
        .from('users')
        .insert({
          email: 'unassigned@example.com',
          first_name: 'Unassigned',
          last_name: 'User',
          user_type: 'employee',
          workos_user_id: 'unassigned-auth-id',
        })
        .select()
        .single();

      const role = await getUserRole(newUser!.id, testOrgId);

      expect(role).toBeNull();

      // Clean up
      await supabase.from('users').delete().eq('id', newUser!.id);
    });
  });

  describe('hasRole with real database', () => {
    it('should return true when user has the role', async () => {
      const result = await hasRole(testUserId, testOrgId, ['admin']);

      expect(result).toBe(true);
    });

    it('should return true when user has one of multiple roles', async () => {
      const result = await hasRole(testUserId, testOrgId, ['owner', 'admin', 'trainer']);

      expect(result).toBe(true);
    });

    it('should return false when user lacks the role', async () => {
      const result = await hasRole(testUserId, testOrgId, ['owner']);

      expect(result).toBe(false);
    });
  });

  describe('requirePermission middleware with real checks', () => {
    it('should allow access when permission exists', async () => {
      const middleware = requirePermission('users', 'read');

      await middleware(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
      expect(mockNext).not.toHaveBeenCalledWith(expect.any(Error));
    });

    it('should deny access for permission user does not have', async () => {
      // First, let's create a limited role user
      const { data: memberRole } = await supabase
        .from('roles')
        .select('id')
        .eq('slug', 'member')
        .single();

      const { data: limitedUser } = await supabase
        .from('users')
        .insert({
          email: 'limited@example.com',
          first_name: 'Limited',
          last_name: 'User',
          user_type: 'employee',
          workos_user_id: 'limited-auth-id',
        })
        .select()
        .single();

      await supabase.from('user_organizations').insert({
        user_id: limitedUser!.id,
        organization_id: testOrgId,
        role_id: memberRole!.id,
        role: 'member',
        is_active: true,
      });

      // Test with limited user
      mockReq.authUser!.id = limitedUser!.id;

      const middleware = requirePermission('organization', 'manage_roles');

      await middleware(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('Permission denied'),
        })
      );

      // Clean up
      await supabase.from('user_organizations').delete().eq('user_id', limitedUser!.id);

      await supabase.from('users').delete().eq('id', limitedUser!.id);
    });
  });

  describe('loadUserPermissions middleware with real data', () => {
    it('should load all user permissions into request', async () => {
      await loadUserPermissions(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
      expect((mockReq as any).userPermissions).toBeDefined();
      expect((mockReq as any).userPermissions).toBeInstanceOf(Array);
      expect((mockReq as any).userPermissions.length).toBeGreaterThan(20);
    });
  });

  describe('Cross-organization isolation', () => {
    let otherOrgId: string;

    beforeAll(async () => {
      // Create another organization
      const { data: otherOrg } = await supabase
        .from('organizations')
        .insert({
          name: 'Other Organization',
        })
        .select()
        .single();

      otherOrgId = otherOrg!.id;
    });

    afterAll(async () => {
      if (otherOrgId) {
        await supabase.from('organizations').delete().eq('id', otherOrgId);
      }
    });

    it('should not grant permissions across organizations', async () => {
      // User has admin in testOrgId but should have no permissions in otherOrgId
      const result = await checkPermission(testUserId, otherOrgId, 'users', 'read');

      expect(result).toBe(false);
    });

    it('should not return role for other organizations', async () => {
      const role = await getUserRole(testUserId, otherOrgId);

      expect(role).toBeNull();
    });

    it('should return empty permissions for other organizations', async () => {
      const permissions = await getUserPermissions(testUserId, otherOrgId);

      expect(permissions).toEqual([]);
    });
  });
});
