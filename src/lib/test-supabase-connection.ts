import { createClient } from '@/utils/supabase/client'

export async function testSupabaseConnection() {
  try {
    console.log('Testing Supabase connection...')
    
    const supabase = createClient()
    
    // Test 1: Check if we can connect and get auth status
    const { data: authData, error: authError } = await supabase.auth.getSession()
    if (authError) {
      console.error('Auth connection error:', authError)
      return { success: false, error: authError.message }
    }
    console.log('✅ Auth connection successful')

    // Test 2: Check if we can query the database (should get RLS error if not authenticated)
    const { data, error } = await supabase
      .from('gyms')
      .select('id, name')
      .limit(1)

    if (error) {
      // RLS error is expected when not authenticated - this means connection works
      if (error.message.includes('row-level security')) {
        console.log('✅ Database connection successful (RLS working as expected)')
        return { success: true, message: 'Connection successful, RLS policies working' }
      }
      console.error('Database query error:', error)
      return { success: false, error: error.message }
    }

    console.log('✅ Database connection successful, data retrieved:', data)
    return { success: true, message: 'Full connection successful', data }

  } catch (error) {
    console.error('Connection test failed:', error)
    return { success: false, error: 'Connection test failed' }
  }
}