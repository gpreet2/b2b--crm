import { handleAuth } from '@workos-inc/authkit-nextjs';
import { logger } from '@/utils/logger';
import { initializeDatabase, getDatabase } from '@/config/database';

export const GET = handleAuth({
  returnPathname: '/dashboard',
  baseURL: process.env.NEXT_PUBLIC_APP_URL,
  signUpReturnPathname: '/dashboard',
  onSuccess: async ({ user, oauthTokens, authenticationMethod, organizationId }) => {
    try {
      // Initialize database if not already done
      let db;
      try {
        db = getDatabase();
      } catch (error) {
        // Database not initialized, initialize it now
        const dbInstance = initializeDatabase({
          supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
          supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        });
        await dbInstance.initialize();
        db = dbInstance;
      }
      
      // Log successful authentication
      logger.info('User authenticated successfully', {
        userId: user.id,
        email: user.email,
        organizationId,
        authenticationMethod,
      });

      // Store user in database if not exists
      const { data: existingUser } = await db.getSupabaseClient()
        .from('users')
        .select('id')
        .eq('workos_user_id', user.id)
        .single();

      if (!existingUser) {
        // Create user in database
        const { error } = await db.getSupabaseClient()
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
          });

        if (error) {
          logger.error('Failed to create user in database', {
            error,
            userId: user.id,
          });
        }
      }

      // Update organization association if provided
      if (organizationId && existingUser) {
        const { error: orgError } = await db.getSupabaseClient()
          .from('user_organizations')
          .upsert({
            user_id: user.id,
            organization_id: organizationId,
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'user_id,organization_id',
          });

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
  onError: async ({ error, request }) => {
    logger.error('Authentication error', {
      error: error instanceof Error ? error.message : String(error),
      url: request.url,
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