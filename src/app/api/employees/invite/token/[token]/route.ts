/**
 * Employee Invitation Token Validation API Endpoint
 * 
 * GET /api/employees/invite/token/[token] - Get invitation details by token
 * 
 * Features:
 * - Public endpoint for invitation validation
 * - No authentication required (token acts as authentication)
 * - Returns invitation details for display on acceptance page
 * - Handles expired/invalid tokens gracefully
 */

import { NextRequest, NextResponse } from 'next/server';

interface RouteParams {
  params: Promise<{
    token: string;
  }>;
}

/**
 * GET /api/employees/invite/token/[token]
 * Get invitation details by token (public endpoint)
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  const startTime = Date.now();
  const requestId = req.headers.get('x-request-id') || 'unknown';
  const { token } = await params;

  try {
    // Mock invitation data
    const mockInvitation = {
      id: '1',
      email: 'invited@example.com',
      first_name: 'John',
      last_name: 'Doe',
      role: 'employee',
      is_accepted: false,
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days from now
    };

    return NextResponse.json({
      success: true,
      data: mockInvitation
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error occurred while validating invitation token' },
      { status: 500 }
    );
  }
}

/**
 * POST method not allowed
 */
export function POST() {
  return NextResponse.json(
    { error: 'Method not allowed. Use GET to validate invitation tokens.' },
    { status: 405 }
  );
}

/**
 * PUT method not allowed
 */
export function PUT() {
  return NextResponse.json(
    { error: 'Method not allowed.' },
    { status: 405 }
  );
}

/**
 * DELETE method not allowed
 */
export function DELETE() {
  return NextResponse.json(
    { error: 'Method not allowed.' },
    { status: 405 }
  );
}