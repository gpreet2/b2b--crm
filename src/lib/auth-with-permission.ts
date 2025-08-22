import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthData } from './auth-server';
import { checkPermission } from '@/middleware/permissions.middleware';
import { logger } from '@/utils/logger';

export function withPermission(
  resource: string,
  action: string
) {
  return function<T extends any[]>(
    handler: (request: NextRequest, authData: AuthData, ...args: T) => Promise<NextResponse>
  ) {
    return withAuth(async (request: NextRequest, authData: AuthData, ...args: T) => {
      try {
        // Check if user has required permission
        const hasPermission = await checkPermission(
          authData.user.id,
          authData.session.organizationId || '',
          resource,
          action
        );

        if (!hasPermission) {
          logger.warn('Permission denied', {
            userId: authData.user.id,
            organizationId: authData.session.organizationId,
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