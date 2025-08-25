import { NextRequest, NextResponse } from 'next/server';
import { WorkOS } from '@workos-inc/node';

import { initializeDatabase, getDatabase } from '@/config/database';
import { logger } from '@/utils/logger';
import { createSessionCookie } from '@/lib/auth-server';

// Initialize WorkOS
const workos = new WorkOS(process.env.WORKOS_API_KEY!);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const _state = searchParams.get('state');

    if (!code) {
      logger.error('No authorization code received in callback');
      return NextResponse.redirect(new URL('/?error=auth_failed', request.url));
    }

    // Exchange the authorization code for user and tokens
    const { user, accessToken, refreshToken: _refreshToken, organizationId } = await workos.userManagement.authenticateWithCode({
      code,
      clientId: process.env.WORKOS_CLIENT_ID!,
    });

    if (!user) {
      logger.error('Failed to authenticate with WorkOS');
      return NextResponse.redirect(new URL('/?error=auth_failed', request.url));
    }

    logger.info('User authenticated successfully', {
      userId: user.id,
      email: user.email,
      organizationId,
    });

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

        // Task 6.6 Bug Fix: Ensure new users can access role management
        // This assigns them to Default Gym so role management works immediately
        // Will be replaced by proper onboarding in Task 10
        try {
          const { data: defaultOrg } = await db
            .getSupabaseClient()
            .from('organizations')
            .select('id')
            .eq('name', 'Default Gym')
            .single();

          if (defaultOrg && newUser) {
            // Get appropriate role based on user_type
            const { data: roleData } = await db
              .getSupabaseClient()
              .from('roles')
              .select('id')
              .eq('slug', newUser.user_type === 'owner' ? 'owner' : 'admin')
              .single();

            if (roleData) {
              await db
                .getSupabaseClient()
                .from('user_organizations')
                .insert({
                  user_id: newUser.id,
                  organization_id: defaultOrg.id,
                  role_id: roleData.id,
                  role: newUser.user_type === 'owner' ? 'owner' : 'admin',
                  is_active: true,
                  is_primary: true,
                  joined_at: new Date().toISOString(),
                });

              logger.info('New user assigned to Default Gym for Task 6.6', {
                userId: newUser.id,
                organizationId: defaultOrg.id,
                role: newUser.user_type,
              });
            }
          }
        } catch (orgAssignError) {
          logger.error('Failed to assign new user to Default Gym', {
            error: orgAssignError,
            userId: user.id,
          });
        }
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

    // Create session cookie using the access token and redirect to dashboard
    const response = NextResponse.redirect(new URL('/dashboard', request.url));
    response.headers.set('Set-Cookie', createSessionCookie(accessToken));

    return response;
  } catch (error) {
    logger.error('Authentication callback failed', { error });
    return NextResponse.redirect(new URL('/?error=auth_failed', request.url));
  }
}
