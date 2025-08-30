import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { token, user_id } = await request.json();
    
    return NextResponse.json({
      success: true,
      message: 'Account created and invitation accepted successfully',
      data: {
        user: {
          id: user_id || 'user_demo_123',
          email: 'invited.user@example.com',
          firstName: 'Invited',
          lastName: 'User',
          role: 'member',
          organizationId: '1'
        }
      }
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to process invitation' },
      { status: 500 }
    );
  }
}