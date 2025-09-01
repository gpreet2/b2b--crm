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

/**
 * GET /api/docs/openapi.json
 * Returns the OpenAPI specification in JSON format
 */
export async function GET(req: NextRequest) {
  const requestId = req.headers.get('x-request-id') || 'unknown';
  
  try {
    // Simple mock OpenAPI spec
    const mockSwaggerSpec = {
      openapi: "3.0.0",
      info: {
        title: "B2B CRM API",
        version: "1.0.0",
        description: "Backend under reconstruction - mock data only"
      },
      paths: {},
      components: {}
    };

    // Return the OpenAPI specification
    return NextResponse.json(mockSwaggerSpec, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    });
    
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to generate API documentation' },
      { status: 500 }
    );
  }
}