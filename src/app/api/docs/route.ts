/**
 * API Documentation Endpoint
 * 
 * GET /api/docs - Serves Swagger UI for interactive API documentation
 * GET /api/docs/openapi.json - Returns OpenAPI specification as JSON
 * 
 * This endpoint provides comprehensive API documentation including:
 * - Interactive API explorer
 * - Authentication flow documentation
 * - Request/response examples
 * - Security schemas and requirements
 */

import { NextRequest, NextResponse } from 'next/server';
import { swaggerSpec } from '@/config/swagger';
import { logger } from '@/utils/logger';

/**
 * GET /api/docs/openapi.json
 * Returns the OpenAPI specification in JSON format
 */
export async function GET(req: NextRequest) {
  const requestId = req.headers.get('x-request-id') || 'unknown';
  
  try {
    logger.info('OpenAPI spec request', { 
      requestId,
      userAgent: req.headers.get('user-agent'),
    });

    // Return the OpenAPI specification
    return NextResponse.json(swaggerSpec, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    });
    
  } catch (error) {
    logger.error('Failed to generate OpenAPI spec', {
      requestId,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });

    return NextResponse.json(
      { error: 'Failed to generate API documentation' },
      { status: 500 }
    );
  }
}