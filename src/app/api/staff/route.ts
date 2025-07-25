import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { getSessionFromCookie } from '@/lib/session';
import { PERMISSIONS, roleHasPermission } from '@/lib/permissions';
import { withRateLimit } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';

// Get all staff members
export const GET = withRateLimit(async (request: NextRequest) => {
  try {
    const user = await getSessionFromCookie();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Check permission
    if (!roleHasPermission(user.role, PERMISSIONS.VIEW_STAFF)) {
      logger.logPermission(user.id, user.role, PERMISSIONS.VIEW_STAFF, false, '/api/staff');
      return NextResponse.json(
        { error: 'You do not have permission to view staff' },
        { status: 403 }
      );
    }
    
    const supabase = await createClient();
    
    // Get all staff members for the gym
    const { data: staff, error } = await supabase
      .from('profiles')
      .select('id, email, full_name, role, created_at, is_active')
      .eq('gym_id', user.gym_id)
      .in('role', ['owner', 'manager', 'trainer'])
      .order('created_at', { ascending: false });
    
    if (error) {
      logger.error('Failed to fetch staff', {
        method: 'GET',
        path: '/api/staff',
        userId: user.id,
        error
      });
      return NextResponse.json(
        { error: 'Failed to fetch staff members' },
        { status: 500 }
      );
    }
    
    logger.info('Staff list fetched', {
      method: 'GET',
      path: '/api/staff',
      userId: user.id,
      metadata: { staffCount: staff?.length || 0 }
    });
    
    return NextResponse.json({
      staff: staff || [],
      total: staff?.length || 0
    });
    
  } catch (error) {
    logger.error('Staff list error', {
      method: 'GET',
      path: '/api/staff',
      error
    });
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
});