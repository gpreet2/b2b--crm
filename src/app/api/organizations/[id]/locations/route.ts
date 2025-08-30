import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Mock locations data matching Location interface
    const mockLocations = [
      {
        id: '1',
        organization_id: id,
        name: 'Main Location - Bakersfield',
        address_line1: '123 Main St',
        address_line2: '',
        city: 'Bakersfield',
        state: 'CA',
        postal_code: '93301',
        country: 'US',
        phone: '(555) 123-4567',
        email: 'main@company.com',
        website: '',
        timezone: 'America/Los_Angeles',
        settings: {},
        is_active: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      },
      {
        id: '2',
        organization_id: id,
        name: 'Downtown Branch - Bakersfield',
        address_line1: '456 Downtown Ave',
        address_line2: 'Suite 200',
        city: 'Bakersfield',
        state: 'CA',
        postal_code: '93309',
        country: 'US',
        phone: '(555) 234-5678',
        email: 'downtown@company.com',
        website: '',
        timezone: 'America/Los_Angeles',
        settings: {},
        is_active: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }
    ];

    return NextResponse.json({
      success: true,
      data: {
        locations: mockLocations,
        total: mockLocations.length
      }
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch locations' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    // Mock creating location
    const newLocation = {
      id: Math.random().toString(36).substr(2, 9),
      name: body.name || '',
      address: body.address || '',
      phone: body.phone || '',
      email: body.email || '',
      isActive: body.isActive !== undefined ? body.isActive : true,
      organizationId: id
    };

    return NextResponse.json({
      success: true,
      data: newLocation
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to create location' },
      { status: 500 }
    );
  }
}