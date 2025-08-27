import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthData } from './auth-server';
import { checkPermission } from '@/middleware/permissions.middleware';
import { logger } from '@/utils/logger';
import { getSupabaseClient } from '@/config/supabase';

export function withPermission(
  resource: string,
  action: string
) {
  return function<T extends any[]>(
    handler: (request: NextRequest, authData: AuthData, ...args: T) => Promise<NextResponse>
  ) {
    return withAuth(async (request: NextRequest, authData: AuthData, ...args: T) => {
      try {
        // Get database user ID from WorkOS user ID first
        const { data: dbUser, error: dbUserError } = await getSupabaseClient()
          .from('users')
          .select('id')
          .eq('workos_user_id', authData.user.id)
          .single();

        if (dbUserError || !dbUser) {
          return NextResponse.json({
            success: false,
            error: 'User not found in database',
          }, { status: 404 });
        }

        // Task 6.6 Fix: Get organization from database if not in session
        let organizationId = authData.session.organizationId;
        
        if (!organizationId) {
          // Get user's active organization from database
          const { data: userOrg, error: userOrgError } = await getSupabaseClient()
            .from('user_organizations')
            .select('organization_id')
            .eq('user_id', dbUser.id)
            .eq('is_active', true)
            .single();

          if (userOrgError || !userOrg) {
            return NextResponse.json({
              success: false,
              error: 'No organization context',
            }, { status: 400 });
          }

          organizationId = userOrg.organization_id;
        }

        // Check if user has required permission using database user ID
        const hasPermission = await checkPermission(
          dbUser.id,
          organizationId!,
          resource,
          action
        );

        if (!hasPermission) {
          logger.warn('Permission denied', {
            userId: authData.user.id,
            organizationId: organizationId,
            resource,
            action,
          });

          return NextResponse.json({
            success: false,
            error: 'Permission denied',
            required: `${resource}.${action}`,
          }, { status: 403 });
        }

        // User has permission, proceed with handler
        return handler(request, authData, ...args);
      } catch (error) {
        logger.error('Permission check failed', { error });
        return NextResponse.json({
          success: false,
          error: 'Permission check failed',
        }, { status: 500 });
      }
    });
  };
}