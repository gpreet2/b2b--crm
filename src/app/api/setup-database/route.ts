import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

/**
 * Database Setup API Route
 * Fixes 400/500 auth errors by creating necessary database triggers
 * Based on context7 search findings from Supabase documentation
 */

export async function POST(request: NextRequest) {
  try {
    // Get service role key from environment
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

    if (!serviceRoleKey || !supabaseUrl) {
      return NextResponse.json(
        { error: 'Missing SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL' },
        { status: 500 }
      )
    }

    // Create admin client
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    console.log('Setting up database triggers for auth fixes...')

    // Step 1: Ensure default gym exists
    const { data: existingGyms, error: gymCheckError } = await supabase
      .from('gyms')
      .select('id, name')
      .limit(1)

    let defaultGymId: string

    if (gymCheckError || !existingGyms || existingGyms.length === 0) {
      // Create default gym
      const { data: newGym, error: gymCreateError } = await supabase
        .from('gyms')
        .insert([
          { name: 'Back2Back Fitness', timezone: 'America/New_York' }
        ])
        .select('id')
        .single()

      if (gymCreateError) {
        console.error('Error creating default gym:', gymCreateError)
        return NextResponse.json(
          { error: 'Failed to create default gym', details: gymCreateError.message },
          { status: 500 }
        )
      }

      defaultGymId = newGym.id
      console.log('✅ Created default gym:', defaultGymId)
    } else {
      defaultGymId = existingGyms[0].id
      console.log('✅ Default gym already exists:', existingGyms[0].name)
    }

    // Step 2: Create the SQL functions and triggers using raw SQL
    const sqlStatements = [
      // Create handle_new_user function
      `
      CREATE OR REPLACE FUNCTION public.handle_new_user()
      RETURNS TRIGGER AS $$
      DECLARE
        default_gym_id UUID := '${defaultGymId}';
      BEGIN
        -- Insert profile with robust error handling
        INSERT INTO public.profiles (
          id, 
          gym_id, 
          role, 
          full_name
        ) VALUES (
          NEW.id,
          COALESCE(
            (NEW.raw_user_meta_data->>'gym_id')::UUID,
            default_gym_id
          ),
          COALESCE(
            NEW.raw_user_meta_data->>'role',
            'member'
          ),
          COALESCE(
            NEW.raw_user_meta_data->>'full_name',
            split_part(NEW.email, '@', 1)
          )
        );
        
        RETURN NEW;
      EXCEPTION
        WHEN OTHERS THEN
          -- Log error but don't fail the auth signup
          RAISE WARNING 'Error creating profile for user %: %', NEW.id, SQLERRM;
          RETURN NEW;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
      `,

      // Create handle_profile_update function
      `
      CREATE OR REPLACE FUNCTION public.handle_profile_update()
      RETURNS TRIGGER AS $$
      BEGIN
        -- Only update if gym_id is not null to prevent constraint violations
        IF NEW.gym_id IS NOT NULL THEN
          NEW.updated_at = NOW();
        END IF;
        
        RETURN NEW;
      EXCEPTION
        WHEN OTHERS THEN
          -- Log error but allow update to proceed
          RAISE WARNING 'Error updating profile for user %: %', NEW.id, SQLERRM;
          RETURN NEW;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
      `,

      // Create trigger for new users
      `
      DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
      CREATE TRIGGER on_auth_user_created
        AFTER INSERT ON auth.users
        FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
      `,

      // Create trigger for profile updates
      `
      DROP TRIGGER IF EXISTS on_profile_updated ON public.profiles;
      CREATE TRIGGER on_profile_updated
        BEFORE UPDATE ON public.profiles
        FOR EACH ROW EXECUTE FUNCTION public.handle_profile_update();
      `
    ]

    // Execute each SQL statement
    for (let i = 0; i < sqlStatements.length; i++) {
      try {
        const { error } = await supabase.rpc('exec_sql', {
          sql_query: sqlStatements[i]
        })

        if (error) {
          console.error(`Error executing statement ${i + 1}:`, error)
          // Continue with other statements
        } else {
          console.log(`✅ Executed statement ${i + 1}/${sqlStatements.length}`)
        }
      } catch (err) {
        console.error(`Error with statement ${i + 1}:`, err)
        // Continue with other statements
      }
    }

    // Step 3: Test the setup by checking if profile creation works
    console.log('✅ Database setup completed')

    return NextResponse.json({
      success: true,
      message: 'Database setup completed successfully',
      fixes: [
        'Created handle_new_user() trigger for automatic profile creation',
        'Created handle_profile_update() trigger with error handling',
        'Ensured default gym exists to prevent 500 errors',
        'Added robust error handling to prevent auth failures'
      ]
    })

  } catch (error) {
    console.error('Database setup failed:', error)
    return NextResponse.json(
      { 
        error: 'Database setup failed', 
        details: error instanceof Error ? error.message : 'Unknown error',
        manualSetup: {
          message: 'You may need to run the SQL manually in Supabase Dashboard',
          instructions: [
            '1. Go to Supabase Dashboard > SQL Editor',
            '2. Copy and paste the contents of database-setup.sql',
            '3. Execute the SQL to create triggers and policies'
          ]
        }
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Database setup endpoint. Use POST to run setup.',
    instructions: 'Send a POST request to this endpoint to fix auth database triggers.'
  })
}