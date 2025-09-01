export interface EmployeeDTO {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
  hire_date?: string;
  permissions?: string[];
  specialties?: string[];
}

export interface EmployeeWithStats extends EmployeeDTO {
  stats?: {
    total_workouts: number;
    completed_programs: number;
    active_memberships: number;
    rating: number;
    totalClassesTaught: number;
    completedClassesThisMonth: number;
    upcomingClasses: number;
    totalStudents: number;
    totalRevenue: number;
  };
}

export interface CreateEmployeeRequest {
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  is_active?: boolean;
}

export interface EmployeeQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  is_active?: boolean;
  sort?: string;
  order?: 'asc' | 'desc';
  include_stats?: boolean;
}

export interface EmployeeListResponse {
  success: boolean;
  data: EmployeeDTO[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface EmployeeListWithStatsResponse {
  success: boolean;
  data: EmployeeWithStats[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
  };
}