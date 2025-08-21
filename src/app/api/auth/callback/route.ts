import { NextRequest, NextResponse } from 'next/server';
import { getWorkOS } from '@workos-inc/authkit-nextjs';
import { initializeDatabase, getDatabase } from '@/config/database';
import { createSessionToken, setSessionCookie } from '@/lib/session-manager';
import { logger } from '@/utils/logger';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    
    if (!code) {
      logger.error('No authorization code provided in callback');
      return NextResponse.redirect(new URL('/auth?error=no_code', request.url));
    }

    const workos = getWorkOS();
    
    // Exchange code for token
    const { user, organizationId } = await workos.userManagement.authenticateWithCode({
      code,
      clientId: process.env.WORKOS_CLIENT_ID!,
    });

    logger.info('User authenticated successfully', {
      userId: user.id,
      email: user.email,
      organizationId,
    });

    // Database sync logic
    let dbUserId: string = user.id; // Default to WorkOS user ID
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
        // User exists with correct WorkOS ID - use database user ID
        dbUserId = existingUserByWorkosId.id;
        logger.info('User found by WorkOS ID - already up to date', {
          userId: user.id,
          dbUserId,
          email: user.email,
        });
      } else if (existingUserByEmail && existingUserByEmail.workos_user_id !== user.id) {
        // User exists by email but has different WorkOS ID - update it
        dbUserId = existingUserByEmail.id;
        logger.info('Updating existing user with new WorkOS ID', {
          oldWorkosId: existingUserByEmail.workos_user_id,
          newWorkosId: user.id,
          dbUserId,
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
              workos_id_updated_at: new Date().toISOString(),
            },
            updated_at: new Date().toISOString(),
          })
          .eq('email', user.email);

        if (updateError) {
          logger.error('Failed to update user WorkOS ID', {
            error: updateError,
            userId: user.id,
            dbUserId,
            email: user.email,
          });
        } else {
          logger.info('Successfully updated user WorkOS ID', {
            userId: user.id,
            dbUserId,
            email: user.email,
          });
        }
      } else if (!existingUserByEmail) {
        // No existing user - create new one
        const { data: newUser, error } = await db
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
            },
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select('id')
          .single();

        if (error) {
          logger.error('Failed to create user in database', {
            error,
            userId: user.id,
          });
        } else {
          dbUserId = newUser.id;
          logger.info('New user created in database', {
            userId: user.id,
            dbUserId,
            email: user.email,
          });
        }
      }

      // Update organization association if provided
      if (organizationId && dbUserId) {
        const { error: orgError } = await db.getSupabaseClient().from('user_organizations').upsert(
          {
            user_id: dbUserId,
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
            dbUserId,
            organizationId,
          });
        }
      }
    } catch (error) {
      logger.error('Database sync failed in auth callback', { error });
    }

    // Create our own session token
    const sessionToken = await createSessionToken({
      userId: dbUserId,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      organizationId,
      workosUserId: user.id,
    });

    // Create response and set session cookie
    const dashboardUrl = new URL('/dashboard', request.url);
    const response = NextResponse.redirect(dashboardUrl);
    setSessionCookie(response, sessionToken);

    logger.info('Session created successfully', {
      userId: user.id,
      dbUserId,
      email: user.email,
    });

    return response;
  } catch (error) {
    logger.error('Authentication callback failed', { error });
    
    // Return a redirect response to auth page with error
    const authUrl = new URL('/auth?error=auth_failed', request.url);
    return NextResponse.redirect(authUrl);
  }
}