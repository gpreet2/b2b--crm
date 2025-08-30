export interface EmployeeDTO {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
  permissions?: string[];
}

export interface EmployeeWithStats extends EmployeeDTO {
  stats?: {
    total_workouts: number;
    completed_programs: number;
    active_memberships: number;
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