import { createClient } from '@supabase/supabase-js';
import {
  verifyOrganizationAccess,
  getOrganizationSettings,
  isFeatureEnabled,
} from '@/middleware/organization.middleware';

describe('Organization Context Functions', () => {
  let supabase: ReturnType<typeof createClient>;

  beforeAll(() => {
    supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    );
  });

  describe('Organization access verification', () => {
    it('should correctly verify organization access', async () => {
      // Get a real user-organization pair from the database
      const { data: userOrg } = await supabase
        .from('user_organizations')
        .select('user_id, organization_id')
        .eq('is_active', true)
        .limit(1)
        .single();

      if (userOrg) {
        const hasAccess = await verifyOrganizationAccess(
          userOrg.user_id,
          userOrg.organization_id
        );
        expect(hasAccess).toBe(true);

        // Test with non-existent organization
        const noAccess = await verifyOrganizationAccess(
          userOrg.user_id,
          '00000000-0000-0000-0000-000000000000'
        );
        expect(noAccess).toBe(false);
      }
    });
  });

  describe('Organization settings', () => {
    it('should retrieve organization settings', async () => {
      // Get an organization with settings
      const { data: org } = await supabase
        .from('organizations')
        .select('id, settings')
        .not('settings', 'is', null)
        .limit(1)
        .single();

      if (org) {
        const settings = await getOrganizationSettings(org.id);
        expect(settings).toBeDefined();
        expect(typeof settings).toBe('object');
      }
    });

    it('should check feature flags correctly', async () => {
      // Create a test organization with known features
      const { data: testOrg } = await supabase
        .from('organizations')
        .insert({
          name: 'Feature Test Org',
          settings: {
            features: {
              testFeature: true,
              disabledFeature: false,
            },
          },
        })
        .select()
        .single();

      if (testOrg) {
        const enabledFeature = await isFeatureEnabled(testOrg.id, 'testFeature');
        expect(enabledFeature).toBe(true);

        const disabledFeature = await isFeatureEnabled(testOrg.id, 'disabledFeature');
        expect(disabledFeature).toBe(false);

        const unknownFeature = await isFeatureEnabled(testOrg.id, 'unknownFeature');
        expect(unknownFeature).toBe(false);

        // Clean up
        await supabase
          .from('organizations')
          .delete()
          .eq('id', testOrg.id);
      }
    });
  });
});