/**
 * Employee-related TypeScript type definitions
 * 
 * Generated types for employee management operations,
 * API request/response structures, and database entities.
 */

/**
 * Base employee information from database
 */
export interface EmployeeDTO {
  id: string;
  user_id: string;
  // User information
  first_name: string | null;
  last_name: string | null;
  email: string;
  user_type: string;
  // Employee-specific information
  role: string;
  specialties?: string[];
  is_active: boolean;
  hire_date: string | null;
  // Organization-specific information
  organization_id: string;
  department?: string | null;
  position?: string | null;
  // Performance metrics
  classes_taught?: number;
  total_students?: number;
  average_attendance?: number;
  rating?: number;
  // Timestamps
  created_at: string;
  updated_at: string;
}

/**
 * Employee with calculated statistics
 */
export interface EmployeeWithStats extends EmployeeDTO {
  stats: EmployeeStats;
}

/**
 * Employee performance statistics
 */
export interface EmployeeStats {
  totalClassesTaught: number;
  totalStudents: number;
  averageAttendance: number;
  attendanceRate: number;
  rating: number;
  totalRevenue: number;
  upcomingClasses: number;
  completedClassesThisMonth: number;
  specialtyPrograms: string[];
  recentClasses: ClassWithAttendance[];
}

/**
 * Class information with attendance data
 */
export interface ClassWithAttendance {
  id: string;
  name: string;
  date: Date;
  startTime: string;
  endTime: string;
  capacity: number;
  enrolled: number;
  attended: number;
  attendanceRate: number;
  program: string;
  location: string;
}

/**
 * Query parameters for employee list API
 */
export interface EmployeeQueryParams {
  page?: string;
  limit?: string;
  search?: string;
  role?: string;
  is_active?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}

/**
 * Processed filters for employee database queries
 */
export interface EmployeeQueryFilters {
  organizationId: string;
  search?: string;
  role?: string;
  is_active?: boolean;
  limit: number;
  offset: number;
  sort: string;
  order: 'asc' | 'desc';
}

/**
 * Pagination metadata
 */
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * Employee list API response
 */
export interface EmployeeListResponse {
  employees: EmployeeDTO[];
  pagination: Pagination;
}

/**
 * Employee list API response with stats
 */
export interface EmployeeListWithStatsResponse {
  employees: EmployeeWithStats[];
  pagination: Pagination;
}

/**
 * API Error response
 */
export interface ApiError {
  error: string;
  details?: string;
  code?: string;
}

/**
 * API Success response wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Valid employee roles
 */
export type EmployeeRole = 'trainer' | 'coach' | 'front_desk' | 'manager' | 'admin' | 'owner';

/**
 * Valid sort fields for employee queries
 */
export type EmployeeSortField = 'name' | 'email' | 'role' | 'hire_date' | 'is_active' | 'created';

/**
 * Employee status filter options
 */
export type EmployeeStatusFilter = 'active' | 'inactive' | 'all';