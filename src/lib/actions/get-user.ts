'use server';

import { withAuth } from '@workos-inc/authkit-nextjs';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

export async function getCurrentUser() {
  try {
    // Initialize Supabase client directly
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.log('Missing Supabase configuration');
      return {
        success: false,
        user: null,
        error: 'Database configuration missing'
      };
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // First try withAuth approach
    try {
      const authResult = await withAuth({ ensureSignedIn: false });
      
      if (authResult && authResult.user) {
        const workosUser = authResult.user;
        console.log('WorkOS user data available:', workosUser.id, workosUser.email);
        
        // Try to get real user data from database using WorkOS user ID
        try {
          const { data: userData, error: dbError } = await supabase
            .from('users')
            .select('first_name, last_name, email, workos_user_id')
            .eq('workos_user_id', workosUser.id)
            .single();
          
          if (userData && !dbError) {
            console.log('Database lookup successful via withAuth:', userData.email);
            return {
              success: true,
              user: {
                id: workosUser.id,
                name: userData.first_name && userData.last_name 
                  ? `${userData.first_name} ${userData.last_name}` 
                  : userData.email?.split('@')[0] || 'Unknown User',
                email: userData.email,
                firstName: userData.first_name,
                lastName: userData.last_name,
              }
            };
          } else {
            console.log('Database lookup failed for WorkOS user ID:', workosUser.id, dbError);
          }
        } catch (dbError) {
          console.log('Database error in withAuth path:', dbError);
        }
        
        // Fallback to WorkOS data if database lookup fails
        return {
          success: true,
          user: {
            id: workosUser.id,
            name: workosUser.firstName && workosUser.lastName 
              ? `${workosUser.firstName} ${workosUser.lastName}` 
              : workosUser.email?.split('@')[0] || 'Unknown User',
            email: workosUser.email || 'unknown@example.com',
            firstName: workosUser.firstName,
            lastName: workosUser.lastName,
          }
        };
      }
    } catch (withAuthError) {
      console.log('withAuth failed in server action, trying fallback:', withAuthError);
    }
    
    // Fallback: Check for session cookie existence and try to lookup user data
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('wos-session');
    const currentUserIdCookie = cookieStore.get('current-user-id');
    
    if (sessionCookie) {
      console.log('Found WorkOS session cookie, user is authenticated');
      
      // SOLUTION: Use the current-user-id cookie that's set during authentication success
      // This avoids trying to decrypt the encrypted WorkOS session cookie
      if (currentUserIdCookie) {
        const authenticatedUserId = currentUserIdCookie.value;
        console.log('Found current-user-id cookie:', authenticatedUserId);
        
        try {
          const { data: userData, error: dbError } = await supabase
            .from('users')
            .select('first_name, last_name, email, workos_user_id')
            .eq('workos_user_id', authenticatedUserId)
            .single();
          
          if (userData && !dbError) {
            console.log('Database lookup successful for current user:', userData.email);
            return {
              success: true,
              user: {
                id: userData.workos_user_id,
                name: userData.first_name && userData.last_name 
                  ? `${userData.first_name} ${userData.last_name}` 
                  : userData.email?.split('@')[0] || 'Unknown User',
                email: userData.email,
                firstName: userData.first_name,
                lastName: userData.last_name,
              }
            };
          } else {
            console.log('Database lookup failed for current user ID:', authenticatedUserId, dbError);
          }
        } catch (dbError) {
          console.log('Database error when looking up current user:', dbError);
        }
      } else {
        console.log('SECURITY: No current-user-id cookie found - cannot safely identify user');
        console.log('Refusing to guess user identity due to security concerns');
      }
      
      // Final fallback: Return generic authenticated user
      return {
        success: true,
        user: {
          id: 'authenticated-user',
          name: 'Authenticated User',
          email: 'user@authenticated.com',
          firstName: null,
          lastName: null,
        }
      };
    }
    
    return {
      success: false,
      user: null,
      error: 'No authenticated user found'
    };
  } catch (error) {
    return {
      success: false,
      user: null,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}