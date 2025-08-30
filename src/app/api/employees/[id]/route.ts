import { NextResponse } from 'next/server';
import { mockEmployee } from '@/mocks/api/employees';

export async function GET() {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  return NextResponse.json(mockEmployee);
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