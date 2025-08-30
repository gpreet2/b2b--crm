import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Mock permissions data
    const permissions = [
      { id: '1', name: 'read:all', description: 'Read all data' },
      { id: '2', name: 'write:all', description: 'Write all data' },
      { id: '3', name: 'delete:all', description: 'Delete all data' },
      { id: '4', name: 'admin:all', description: 'Full admin access' }
    ];

    return NextResponse.json({
      success: true,
      data: {
        permissions,
        total: permissions.length
      }
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch permissions' },
      { status: 500 }
    );
  }
}