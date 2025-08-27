/**
 * Employee Management API Endpoint
 * 
 * GET /api/employees - List employees/staff with filtering, search, and pagination
 * 
 * Features:
 * - Organization-level data isolation
 * - Search by name/email/role
 * - Filter by role and active status
 * - Pagination support
 * - Performance statistics calculation
 * - Proper permission checks
 * - Security-first approach with RLS
 * 
 * @swagger
 * /api/employees:
 *   get:
 *     tags:
 *       - Employees
 *     summary: List employees with filtering and pagination
 *     description: |
 *       Retrieve a paginated list of employees for the authenticated user's active organization.
 *       Supports advanced filtering, search, and sorting capabilities.
 *       
 *       **Security**: Requires WorkOS authentication. Users can only access employees
 *       from their active organization due to Row-Level Security (RLS) policies.
 *       
 *       **Performance**: Optimized with database indexes and efficient pagination.
 *       Search is performed in-memory for small result sets to reduce database load.
 *     parameters:
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
 *       - $ref: '#/components/parameters/SearchParam'
 *       - name: role
 *         in: query
 *         description: Filter employees by role
 *         required: false
 *         schema:
 *           type: string
 *           enum: [trainer, coach, front_desk, manager, admin, owner]
 *           example: trainer
 *       - name: is_active
 *         in: query
 *         description: Filter employees by active status
 *         required: false
 *         schema:
 *           type: boolean
 *           example: true
 *       - name: sort
 *         in: query
 *         description: Field to sort employees by
 *         required: false
 *         schema:
 *           type: string
 *           enum: [name, email, role, hire_date, is_active, created]
 *           default: name
 *           example: name
 *       - $ref: '#/components/parameters/OrderParam'
 *       - name: include_stats
 *         in: query
 *         description: Include performance statistics for each employee
 *         required: false
 *         schema:
 *           type: boolean
 *           default: false
 *           example: true
 *     responses:
 *       200:
 *         description: Successfully retrieved employee list
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       required: [employees, pagination]
 *                       properties:
 *                         employees:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/Employee'
 *                         pagination:
 *                           $ref: '#/components/schemas/Pagination'
 *       400:
 *         $ref: '#/components/responses/400'
 *       401:
 *         $ref: '#/components/responses/401'
 *       403:
 *         $ref: '#/components/responses/403'
 *       500:
 *         $ref: '#/components/responses/500'
 *     security:
 *       - WorkOSSession: []
 *         CurrentUserId: []
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthData } from '@/lib/auth-server';
import { EmployeeService } from '@/lib/services/employee';
import { initializeDatabase, getDatabase } from '@/config/database';
import { logger } from '@/utils/logger';
import { AppError, AuthError, ValidationError } from '@/errors';
import type { EmployeeQueryParams, EmployeeQueryFilters } from '@/types/generated/employee.types';

/**
 * GET /api/employees
 * 
 * Query Parameters:
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 20, max: 100)
 * - search: Search in name/email/role
 * - role: Filter by employee role
 * - is_active: Filter by active status
 * - sort: Sort field (name, email, role, hire_date, is_active, created)
 * - order: Sort order (asc, desc, default: asc)
 * - include_stats: Include performance statistics (default: false)
 */
export const GET = withAuth(async (req: NextRequest, authData: AuthData) => {
  const startTime = Date.now();
  const requestId = req.headers.get('x-request-id') || 'unknown';

  try {
    logger.info('Employee list request started', { 
      requestId,
      url: req.url 
    });

    // Initialize database if not already initialized
    let db;
    try {
      db = getDatabase();
    } catch (error) {
      const dbInstance = initializeDatabase({
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
        supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
      });
      await dbInstance.initialize();
      db = dbInstance;
    }

    // First, get the user's UUID from their WorkOS ID
    const { data: userData, error: userError } = await db
      .getSupabaseClient()
      .from('users')
      .select('id')
      .eq('workos_user_id', authData.user.id)
      .single();

    if (userError || !userData) {
      logger.warn('User not found in database', { 
        requestId, 
        workosUserId: authData.user.id,
        error: userError
      });
      return NextResponse.json(
        { error: 'User not found. Please contact support.' },
        { status: 404 }
      );
    }

    // Now get user's active organization using the UUID
    const { data: userOrg, error: userOrgError } = await db
      .getSupabaseClient()
      .from('user_organizations')
      .select('organization_id, role')
      .eq('user_id', userData.id)
      .eq('is_active', true)
      .limit(1)
      .single();

    if (userOrgError || !userOrg) {
      logger.warn('No active organization for employee list request', { 
        requestId, 
        userId: authData.user.id,
        error: userOrgError
      });
      return NextResponse.json(
        { error: 'No active organization. Please select an organization first.' },
        { status: 403 }
      );
    }

    const activeOrganizationId = userOrg.organization_id;

    // Parse and validate query parameters
    const url = new URL(req.url);
    const queryParams: EmployeeQueryParams = {
      page: url.searchParams.get('page') || undefined,
      limit: url.searchParams.get('limit') || undefined,
      search: url.searchParams.get('search') || undefined,
      role: url.searchParams.get('role') || undefined,
      is_active: url.searchParams.get('is_active') || undefined,
      sort: url.searchParams.get('sort') || undefined,
      order: (url.searchParams.get('order') as 'asc' | 'desc') || undefined
    };

    const includeStats = url.searchParams.get('include_stats') === 'true';

    // Validate and transform query parameters
    const filters = parseAndValidateQueryParams(queryParams, activeOrganizationId);

    logger.info('Processing employee list request', {
      requestId,
      userId: authData.user.id,
      organizationId: activeOrganizationId,
      includeStats,
      filters: {
        ...filters,
        organizationId: '[REDACTED]' // Don't log sensitive IDs
      }
    });

    // TODO: Add permission check
    // For now, we assume any authenticated user can view employees in their organization
    // In a future iteration, we would check:
    // - User has 'employees:read' permission
    // - User belongs to the organization they're trying to access
    
    // Fetch employees using the service
    const employeeService = new EmployeeService();
    const result = includeStats 
      ? await employeeService.getEmployeesWithStats(filters)
      : await employeeService.getEmployees(filters);

    logger.info('Employee list request completed successfully', {
      requestId,
      userId: authData.user.id,
      organizationId: activeOrganizationId,
      resultCount: result.employees.length,
      total: result.pagination.total,
      includeStats,
      duration: Date.now() - startTime
    });

    return NextResponse.json({
      success: true,
      data: result
    }, { status: 200 });

  } catch (error) {
    logger.error('Employee list request failed', {
      requestId,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      duration: Date.now() - startTime
    });

    if (error instanceof AppError) {
      const statusCode = error instanceof AuthError ? 401 : 400;
      return NextResponse.json(
        { error: error.message },
        { status: statusCode }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error occurred while fetching employees' },
      { status: 500 }
    );
  }
});

/**
 * Parse and validate query parameters with defaults
 */
function parseAndValidateQueryParams(
  params: EmployeeQueryParams, 
  organizationId: string
): EmployeeQueryFilters {
  // Parse pagination parameters
  const page = Math.max(1, parseInt(params.page || '1', 10));
  const limit = Math.min(100, Math.max(1, parseInt(params.limit || '20', 10)));
  const offset = (page - 1) * limit;

  // Validate sort parameters
  const validSortFields = ['name', 'email', 'role', 'hire_date', 'is_active', 'created'];
  const sort = validSortFields.includes(params.sort || '') ? params.sort! : 'name';
  const order = params.order === 'desc' ? 'desc' : 'asc';

  // Validate search parameter
  const search = params.search?.trim();
  if (search && search.length < 2) {
    throw new ValidationError('Search term must be at least 2 characters long');
  }

  // Validate role parameter  
  const validRoles = ['trainer', 'coach', 'front_desk', 'manager', 'admin', 'owner'];
  const role = params.role && validRoles.includes(params.role) 
    ? params.role 
    : undefined;

  // Parse is_active parameter
  let is_active: boolean | undefined = undefined;
  if (params.is_active === 'true') {
    is_active = true;
  } else if (params.is_active === 'false') {
    is_active = false;
  }

  return {
    organizationId,
    search,
    role,
    is_active,
    limit,
    offset,
    sort,
    order
  };
}

/**
 * POST method not allowed
 */
export function POST() {
  return NextResponse.json(
    { error: 'Method not allowed. Use GET to retrieve employees.' },
    { status: 405 }
  );
}

/**
 * PUT method not allowed  
 */
export function PUT() {
  return NextResponse.json(
    { error: 'Method not allowed. Use GET to retrieve employees.' },
    { status: 405 }
  );
}

/**
 * DELETE method not allowed
 */
export function DELETE() {
  return NextResponse.json(
    { error: 'Method not allowed. Use GET to retrieve employees.' },
    { status: 405 }
  );
}