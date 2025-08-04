import { createClient } from '@supabase/supabase-js';
import { Response, NextFunction } from 'express';

import { AuthError, PermissionError } from '@/errors';

import {
  loadOrganizationContext,
  verifyOrganizationAccess,
  getUserOrganizations,
  requireOrganization,
  validateCrossOrgAccess,
  getOrganizationSettings,
  isFeatureEnabled,
  requireFeature,
} from '../organization.middleware';
import { AuthenticatedRequest } from '../permissions.middleware';


describe('Organization Middleware', () => {
  let supabase: ReturnType<typeof createClient>;
  let testUserId: string;
  let testOrgId: string;
  let secondOrgId: string;
  let mockReq: Partial<AuthenticatedRequest>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeAll(async () => {
    supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    );

    // Create test organizations
    const { data: org1 } = await supabase
      .from('organizations')
      .insert({
        name: 'Test Organization 1',
        settings: { features: { advancedAnalytics: true, customReports: false } },
      })
      .select()
      .single();

    testOrgId = org1!.id;

    const { data: org2 } = await supabase
      .from('organizations')
      .insert({
        name: 'Test Organization 2',
        settings: { features: { advancedAnalytics: false } },
      })
      .select()
      .single();

    secondOrgId = org2!.id;

    // Create test user
    const { data: user, error: userError } = await supabase
      .from('users')
      .insert({
        email: 'org-test@example.com',
        first_name: 'Org',
        last_name: 'Test',
        user_type: 'employee',
        workos_user_id: 'org-test-auth-id',
      })
      .select()
      .single();

    if (userError) {
      console.error('Failed to create test user:', userError);
      throw userError;
    }

    testUserId = user!.id;

    // Get admin role
    const { data: adminRole } = await supabase
      .from('roles')
      .select('id')
      .eq('slug', 'admin')
      .single();

    // Assign user to first organization
    const { error: assignError } = await supabase.from('user_organizations').insert({
      user_id: testUserId,
      organization_id: testOrgId,
      role_id: adminRole!.id,
      is_active: true,
    });

    if (assignError) {
      console.error('Failed to assign user to organization:', assignError);
      throw assignError;
    }
  });

  afterAll(async () => {
    // Clean up test data
    await supabase.from('user_organizations').delete().eq('user_id', testUserId);

    await supabase.from('users').delete().eq('id', testUserId);

    await supabase.from('organizations').delete().in('id', [testOrgId, secondOrgId]);
  });

  beforeEach(() => {
    mockReq = {
      authUser: {
        id: testUserId,
        email: 'org-test@example.com',
        firstName: 'Org',
        lastName: 'Test',
        emailVerified: true,
      },
      authOrganizationId: testOrgId,
      headers: {},
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    mockNext = jest.fn();
  });

  describe('loadOrganizationContext', () => {
    it('should load organization context successfully', async () => {
      await loadOrganizationContext(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
      expect(mockReq.organizationContext).toBeDefined();
      expect(mockReq.organizationContext?.id).toBe(testOrgId);
      expect(mockReq.organizationContext?.name).toBe('Test Organization 1');
      expect(mockReq.organizationContext?.userRole).toBe('admin');
      expect(mockReq.organizationContext?.isActive).toBe(true);
    });

    it('should use x-organization-id header if authOrganizationId not set', async () => {
      mockReq.authOrganizationId = undefined;
      mockReq.headers = { 'x-organization-id': testOrgId };

      await loadOrganizationContext(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
      expect(mockReq.organizationContext?.id).toBe(testOrgId);
    });

    it('should fail if user not authenticated', async () => {
      mockReq.authUser = undefined;

      await loadOrganizationContext(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'User not authenticated',
        })
      );
    });

    it('should fail if no organization context provided', async () => {
      mockReq.authOrganizationId = undefined;
      mockReq.headers = {};

      await loadOrganizationContext(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'No organization context provided',
        })
      );
    });

    it('should fail if user not authorized for organization', async () => {
      mockReq.authOrganizationId = secondOrgId; // User not assigned to this org

      await loadOrganizationContext(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'User not authorized for this organization',
        })
      );
    });
  });

  describe('verifyOrganizationAccess', () => {
    it('should return true for authorized user', async () => {
      const hasAccess = await verifyOrganizationAccess(testUserId, testOrgId);
      expect(hasAccess).toBe(true);
    });

    it('should return false for unauthorized organization', async () => {
      const hasAccess = await verifyOrganizationAccess(testUserId, secondOrgId);
      expect(hasAccess).toBe(false);
    });

    it('should return false for non-existent user', async () => {
      const hasAccess = await verifyOrganizationAccess('non-existent', testOrgId);
      expect(hasAccess).toBe(false);
    });

    it('should return false for inactive user', async () => {
      // Temporarily deactivate user
      await supabase
        .from('user_organizations')
        .update({ is_active: false })
        .eq('user_id', testUserId)
        .eq('organization_id', testOrgId);

      const hasAccess = await verifyOrganizationAccess(testUserId, testOrgId);
      expect(hasAccess).toBe(false);

      // Reactivate user
      await supabase
        .from('user_organizations')
        .update({ is_active: true })
        .eq('user_id', testUserId)
        .eq('organization_id', testOrgId);
    });
  });

  describe('getUserOrganizations', () => {
    it('should return all active organizations for user', async () => {
      const orgs = await getUserOrganizations(testUserId);

      expect(orgs).toHaveLength(1);
      expect(orgs[0].id).toBe(testOrgId);
      expect(orgs[0].name).toBe('Test Organization 1');
      expect(orgs[0].userRole).toBe('admin');
      expect(orgs[0].isActive).toBe(true);
    });

    it('should return empty array for user with no organizations', async () => {
      const orgs = await getUserOrganizations('non-existent');
      expect(orgs).toEqual([]);
    });

    it('should include multiple organizations if user has access', async () => {
      // Add user to second organization
      const { data: memberRole } = await supabase
        .from('roles')
        .select('id')
        .eq('slug', 'member')
        .single();

      await supabase.from('user_organizations').insert({
        user_id: testUserId,
        organization_id: secondOrgId,
        role_id: memberRole!.id,
        is_active: true,
      });

      const orgs = await getUserOrganizations(testUserId);
      expect(orgs).toHaveLength(2);

      const orgIds = orgs.map(o => o.id);
      expect(orgIds).toContain(testOrgId);
      expect(orgIds).toContain(secondOrgId);

      // Clean up
      await supabase
        .from('user_organizations')
        .delete()
        .eq('user_id', testUserId)
        .eq('organization_id', secondOrgId);
    });
  });

  describe('requireOrganization middleware', () => {
    it('should pass if organization context exists', () => {
      requireOrganization(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should fail if no organization context', () => {
      mockReq.authOrganizationId = undefined;
      mockReq.headers = {};

      requireOrganization(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Organization context required',
        })
      );
    });
  });

  describe('Organization settings and features', () => {
    it('should get organization settings', async () => {
      const settings = await getOrganizationSettings(testOrgId);

      expect(settings).toBeDefined();
      expect(settings?.features?.advancedAnalytics).toBe(true);
      expect(settings?.features?.customReports).toBe(false);
    });

    it('should check if feature is enabled', async () => {
      const analyticsEnabled = await isFeatureEnabled(testOrgId, 'advancedAnalytics');
      const reportsEnabled = await isFeatureEnabled(testOrgId, 'customReports');
      const unknownEnabled = await isFeatureEnabled(testOrgId, 'unknownFeature');

      expect(analyticsEnabled).toBe(true);
      expect(reportsEnabled).toBe(false);
      expect(unknownEnabled).toBe(false);
    });

    it('should require feature middleware', async () => {
      const middleware = requireFeature('advancedAnalytics');

      await middleware(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should block if feature not enabled', async () => {
      const middleware = requireFeature('customReports');

      await middleware(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Feature 'customReports' is not enabled for this organization",
        })
      );
    });
  });
});
