import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, role, firstName, lastName } = body;

    // Mock employee invitation
    const inviteToken = 'invite_' + Math.random().toString(36).substr(2, 16);
    
    return NextResponse.json({
      success: true,
      data: {
        id: 'invite_' + Math.random().toString(36).substr(2, 9),
        email,
        firstName: firstName || 'New',
        lastName: lastName || 'Employee',
        role: role || 'member',
        token: inviteToken,
        inviteUrl: `${request.nextUrl.origin}/invite/${inviteToken}`,
        status: 'pending',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString()
      },
      message: 'Employee invitation sent successfully'
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to send invitation' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // Mock invitations list
    const mockInvitations = [
      {
        id: 'invite_1',
        email: 'john@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'manager',
        status: 'pending',
        createdAt: '2024-01-15T10:00:00Z',
        expiresAt: '2024-01-22T10:00:00Z'
      }
    ];

    return NextResponse.json({
      success: true,
      data: {
        invitations: mockInvitations,
        pagination: {
          page,
          limit,
          total: mockInvitations.length,
          totalPages: 1
        }
      }
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch invitations' },
      { status: 500 }
    );
  }
}