import { NextRequest, NextResponse } from 'next/server';
import { mockEmployees } from '@/lib/mock-data';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const is_active = searchParams.get('is_active');
    const sort = searchParams.get('sort') || 'name';
    const order = searchParams.get('order') || 'asc';
    const include_stats = searchParams.get('include_stats') === 'true';

    let filteredEmployees = mockEmployees;

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filteredEmployees = filteredEmployees.filter(employee =>
        employee.first_name.toLowerCase().includes(searchLower) ||
        employee.last_name.toLowerCase().includes(searchLower) ||
        employee.email.toLowerCase().includes(searchLower)
      );
    }

    // Apply active filter
    if (is_active !== null) {
      const activeFilter = is_active === 'true';
      filteredEmployees = filteredEmployees.filter(employee => employee.is_active === activeFilter);
    }

    // Apply sorting
    filteredEmployees.sort((a, b) => {
      let aValue: string, bValue: string;
      
      switch (sort) {
        case 'name':
          aValue = `${a.first_name} ${a.last_name}`;
          bValue = `${b.first_name} ${b.last_name}`;
          break;
        case 'email':
          aValue = a.email;
          bValue = b.email;
          break;
        case 'role':
          aValue = a.role;
          bValue = b.role;
          break;
        default:
          aValue = a.first_name;
          bValue = b.first_name;
      }
      
      const comparison = aValue.localeCompare(bValue);
      return order === 'asc' ? comparison : -comparison;
    });

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedEmployees = filteredEmployees.slice(startIndex, endIndex);

    // Add stats if requested
    const employeesWithStats = include_stats ? paginatedEmployees.map(emp => ({
      ...emp,
      stats: {
        total_workouts: Math.floor(Math.random() * 100),
        completed_programs: Math.floor(Math.random() * 10),
        active_memberships: Math.floor(Math.random() * 3)
      }
    })) : paginatedEmployees;

    return NextResponse.json({
      success: true,
      data: {
        employees: employeesWithStats,
        pagination: {
          page,
          limit,
          total: filteredEmployees.length,
          totalPages: Math.ceil(filteredEmployees.length / limit),
          hasNextPage: endIndex < filteredEmployees.length,
          hasPreviousPage: page > 1
        }
      }
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch employees' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Mock creating employee
    const newEmployee = {
      id: Math.random().toString(36).substr(2, 9),
      first_name: body.first_name || '',
      last_name: body.last_name || '',
      email: body.email || '',
      role: body.role || 'staff',
      is_active: body.is_active !== undefined ? body.is_active : true,
      created_at: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      data: newEmployee
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to create employee' },
      { status: 500 }
    );
  }
}