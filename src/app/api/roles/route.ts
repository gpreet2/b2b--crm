import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Mock roles data
    const roles = [
      { 
        id: '1', 
        name: 'admin', 
        description: 'Administrator role',
        permissions: ['read:all', 'write:all', 'delete:all', 'admin:all'],
        permissionCount: 4
      },
      { 
        id: '2', 
        name: 'coach', 
        description: 'Coach role',
        permissions: ['read:all', 'write:all'],
        permissionCount: 2
      },
      { 
        id: '3', 
        name: 'staff', 
        description: 'Staff role',
        permissions: ['read:all'],
        permissionCount: 1
      }
    ];

    return NextResponse.json({
      success: true,
      data: {
        roles,
        total: roles.length
      }
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch roles' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Mock creating role
    const newRole = {
      id: Math.random().toString(36).substr(2, 9),
      name: body.name,
      description: body.description,
      permissions: body.permissions || [],
      permissionCount: (body.permissions || []).length
    };

    return NextResponse.json({
      success: true,
      data: newRole
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to create role' },
      { status: 500 }
    );
  }
}