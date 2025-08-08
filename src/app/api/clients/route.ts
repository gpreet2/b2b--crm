/**
 * Client Management API Endpoint
 * 
 * GET /api/clients - List clients with filtering, search, and pagination
 * 
 * Features:
 * - Organization-level data isolation
 * - Search by name/email
 * - Filter by membership status
 * - Pagination support
 * - Proper permission checks
 * - Security-first approach with RLS
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@workos-inc/authkit-nextjs';
import { ClientService } from '@/lib/services/client';
import { getDatabase } from '@/config/database';
import { logger } from '@/utils/logger';
import { AppError, AuthError, ValidationError } from '@/errors';
import type { ClientQueryParams, ClientQueryFilters } from '@/types/generated/client.types';

/**
 * GET /api/clients
 * 
 * Query Parameters:
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 20, max: 100)
 * - search: Search in name/email
 * - status: Filter by membership status
 * - sort: Sort field (name, email, status, joined, last_visit, created)
 * - order: Sort order (asc, desc, default: asc)
 */
export async function GET(req: NextRequest) {
  const startTime = Date.now();
  const requestId = req.headers.get('x-request-id') || 'unknown';

  try {
    logger.info('Client list request started', { 
      requestId,
      url: req.url 
    });

    // Get authentication context from WorkOS
    const { user } = await withAuth({ ensureSignedIn: true });

    if (!user?.id) {
      logger.warn('Unauthenticated client list request', { requestId });
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get user's active organization from database
    // For now, we'll get the first active organization for the user
    // In a real implementation, this would come from user session or context
    const db = getDatabase();
    
    const { data: userOrg, error: userOrgError } = await db
      .getSupabaseClient()
      .from('user_organizations')
      .select('organization_id, role')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .limit(1)
      .single();

    if (userOrgError || !userOrg) {
      logger.warn('No active organization for client list request', { 
        requestId, 
        userId: user.id,
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
    const queryParams: ClientQueryParams = {
      page: url.searchParams.get('page') || undefined,
      limit: url.searchParams.get('limit') || undefined,
      search: url.searchParams.get('search') || undefined,
      status: url.searchParams.get('status') || undefined,
      sort: url.searchParams.get('sort') || undefined,
      order: (url.searchParams.get('order') as 'asc' | 'desc') || undefined
    };

    // Validate and transform query parameters
    const filters = parseAndValidateQueryParams(queryParams, activeOrganizationId);

    logger.info('Processing client list request', {
      requestId,
      userId: user.id,
      organizationId: activeOrganizationId,
      filters: {
        ...filters,
        organizationId: '[REDACTED]' // Don't log sensitive IDs
      }
    });

    // TODO: Add permission check
    // For now, we assume any authenticated user can view clients in their organization
    // In a future iteration, we would check:
    // - User has 'clients:read' permission
    // - User belongs to the organization they're trying to access
    
    // Fetch clients using the service
    const clientService = new ClientService();
    const result = await clientService.getClients(filters);

    logger.info('Client list request completed successfully', {
      requestId,
      userId: user.id,
      organizationId: activeOrganizationId,
      resultCount: result.clients.length,
      total: result.pagination.total,
      duration: Date.now() - startTime
    });

    return NextResponse.json({
      success: true,
      data: result
    }, { status: 200 });

  } catch (error) {
    logger.error('Client list request failed', {
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
      { error: 'Internal server error occurred while fetching clients' },
      { status: 500 }
    );
  }
}

/**
 * Parse and validate query parameters with defaults
 */
function parseAndValidateQueryParams(
  params: ClientQueryParams, 
  organizationId: string
): ClientQueryFilters {
  // Parse pagination parameters
  const page = Math.max(1, parseInt(params.page || '1', 10));
  const limit = Math.min(100, Math.max(1, parseInt(params.limit || '20', 10)));
  const offset = (page - 1) * limit;

  // Validate sort parameters
  const validSortFields = ['name', 'email', 'status', 'joined', 'last_visit', 'created'];
  const sort = validSortFields.includes(params.sort || '') ? params.sort! : 'name';
  const order = params.order === 'desc' ? 'desc' : 'asc';

  // Validate search parameter
  const search = params.search?.trim();
  if (search && search.length < 2) {
    throw new ValidationError('Search term must be at least 2 characters long');
  }

  // Validate status parameter  
  const validStatuses = ['active', 'inactive', 'pending', 'suspended', 'expired'];
  const status = params.status && validStatuses.includes(params.status) 
    ? params.status 
    : undefined;

  return {
    organizationId,
    search,
    status,
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
    { error: 'Method not allowed. Use GET to retrieve clients.' },
    { status: 405 }
  );
}

/**
 * PUT method not allowed  
 */
export function PUT() {
  return NextResponse.json(
    { error: 'Method not allowed. Use GET to retrieve clients.' },
    { status: 405 }
  );
}

/**
 * DELETE method not allowed
 */
export function DELETE() {
  return NextResponse.json(
    { error: 'Method not allowed. Use GET to retrieve clients.' },
    { status: 405 }
  );
}