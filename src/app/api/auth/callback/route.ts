import { handleAuth } from '@workos-inc/authkit-nextjs';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

import { initializeDatabase, getDatabase } from '@/config/database';
import { logger } from '@/utils/logger';

// Add immediate logging to verify callback is hit

function logCallbackEntry(request: NextRequest) {
  const url = new URL(request.url);
  logger.info('=== Auth Callback Entry ===', {
    method: request.method,
    url: request.url,
    searchParams: Object.fromEntries(url.searchParams.entries()),
    headers: {
      userAgent: request.headers.get('user-agent'),
      referer: request.headers.get('referer'),
    },
    baseURL: process.env.NEXT_PUBLIC_APP_URL,
  });
}

export const GET = async (request: NextRequest) => {
  // Log immediately when callback is hit
  logCallbackEntry(request);
  
  // Call the original handleAuth
  const handler = handleAuth({
    returnPathname: '/dashboard',
    baseURL: process.env.NEXT_PUBLIC_APP_URL,
    onSuccess: async ({ user, oauthTokens, authenticationMethod, organizationId }) => {
      logger.info('=== Auth Callback Success ===', {
        userId: user.id,
        email: user.email,
        organizationId,
        authenticationMethod,
        baseURL: process.env.NEXT_PUBLIC_APP_URL,
      });

      try {
      // Initialize database if not already done
      let db;
      try {
        db = getDatabase();
      } catch (_error) {
        // Database not initialized, initialize it now
        const dbInstance = initializeDatabase({
          supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
          supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        });
        await dbInstance.initialize();
        db = dbInstance;
      }

      // Note: Onboarding session handling moved to separate flow
      // WorkOS callback doesn't provide state parameter in current version

      // Log successful authentication
      logger.info('User authenticated successfully', {
        userId: user.id,
        email: user.email,
        organizationId,
        authenticationMethod,
      });

      // Store current authenticated user ID in a simple cookie for fallback lookup
      // This helps our server action identify the correct user when WorkOS withAuth() fails
      const cookieStore = await cookies();
      cookieStore.set('current-user-id', user.id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });

      // Check for existing user by WorkOS user ID first
      const { data: existingUserByWorkosId } = await db
        .getSupabaseClient()
        .from('users')
        .select('id, email, workos_user_id')
        .eq('workos_user_id', user.id)
        .single();

      // Check for existing user by email (in case WorkOS ID changed)
      const { data: existingUserByEmail } = await db
        .getSupabaseClient()
        .from('users')
        .select('id, email, workos_user_id, first_name, last_name')
        .eq('email', user.email)
        .single();

      if (existingUserByWorkosId) {
        // User exists with correct WorkOS ID - no action needed
        logger.info('User found by WorkOS ID - already up to date', {
          userId: user.id,
          email: user.email,
        });
      } else if (existingUserByEmail && existingUserByEmail.workos_user_id !== user.id) {
        // User exists by email but has different WorkOS ID - update it
        logger.info('Updating existing user with new WorkOS ID', {
          oldWorkosId: existingUserByEmail.workos_user_id,
          newWorkosId: user.id,
          email: user.email,
        });

        const { error: updateError } = await db
          .getSupabaseClient()
          .from('users')
          .update({
            workos_user_id: user.id,
            first_name: user.firstName,
            last_name: user.lastName,
            avatar_url: user.profilePictureUrl,
            metadata: {
              email_verified: user.emailVerified,
              authentication_method: authenticationMethod,
              workos_id_updated_at: new Date().toISOString(),
            },
            updated_at: new Date().toISOString(),
          })
          .eq('email', user.email);

        if (updateError) {
          logger.error('Failed to update user WorkOS ID', {
            error: updateError,
            userId: user.id,
            email: user.email,
          });
        } else {
          logger.info('Successfully updated user WorkOS ID', {
            userId: user.id,
            email: user.email,
          });
        }
      } else if (!existingUserByEmail) {
        // No existing user - create new one
        const { error } = await db
          .getSupabaseClient()
          .from('users')
          .insert({
            workos_user_id: user.id,
            email: user.email,
            first_name: user.firstName,
            last_name: user.lastName,
            avatar_url: user.profilePictureUrl,
            user_type: 'owner', // Default to owner for now
            metadata: {
              email_verified: user.emailVerified,
              authentication_method: authenticationMethod,
            },
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (error) {
          logger.error('Failed to create user in database', {
            error,
            userId: user.id,
          });
        } else {
          logger.info('New user created in database', {
            userId: user.id,
            email: user.email,
          });
        }
      }

      // Update organization association if provided
      if (organizationId && (existingUserByWorkosId || existingUserByEmail)) {
        const { error: orgError } = await db.getSupabaseClient().from('user_organizations').upsert(
          {
            user_id: user.id,
            organization_id: organizationId,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: 'user_id,organization_id',
          }
        );

        if (orgError) {
          logger.error('Failed to update user organization', {
            error: orgError,
            userId: user.id,
            organizationId,
          });
        }
      }

      // Store OAuth tokens if needed (optional)
      if (oauthTokens) {
        logger.debug('OAuth tokens received', {
          userId: user.id,
          provider: authenticationMethod,
        });
        // You can store these securely if needed for API calls
      }
    } catch (error) {
      logger.error('Error in auth success handler', {
        error,
        userId: user.id,
      });
      // Don't throw - let the user continue
    }
  },
    onError: ({ error, request }) => {
      logger.error('=== Auth Callback Error ===', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        url: request.url,
        method: request.method,
        baseURL: process.env.NEXT_PUBLIC_APP_URL,
      });
      
      // Return a redirect response to the home page with error
      return new Response(null, {
        status: 302,
        headers: {
          Location: '/?error=auth_failed',
        },
      });
    },
  });

  return handler(request);
};
