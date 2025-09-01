import { NextResponse } from 'next/server';
import { mockEmployees } from '@/lib/mock-data';

export async function GET() {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  return NextResponse.json({
    success: true,
    data: mockEmployees[0] // Return first mock employee
  });
}

export async function PUT() {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  return NextResponse.json({
    success: true,
    data: {
      message: "Backend under reconstruction - mock data only"
    }
  });
}

export async function DELETE() {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  return NextResponse.json({
    success: true,
    data: {
      message: "Backend under reconstruction - mock data only"
    }
  });
}