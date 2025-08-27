/**
 * Custom hook for managing employee data from API
 */

import { useState, useEffect, useCallback } from 'react';
import type { 
  EmployeeListResponse, 
  EmployeeDTO, 
  EmployeeQueryParams,
  EmployeeWithStats,
  EmployeeListWithStatsResponse
} from '@/types/generated/employee.types';

interface UseEmployeesOptions {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  is_active?: boolean;
  sort?: string;
  order?: 'asc' | 'desc';
  includeStats?: boolean;
  autoFetch?: boolean;
}

interface UseEmployeesReturn {
  employees: (EmployeeDTO | EmployeeWithStats)[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  } | null;
  refetch: () => Promise<void>;
  setPage: (page: number) => void;
  setSearch: (search: string) => void;
  setRole: (role: string) => void;
  setActiveStatus: (isActive: boolean | undefined) => void;
  setSort: (sort: string, order?: 'asc' | 'desc') => void;
  setIncludeStats: (include: boolean) => void;
}

export function useEmployees(options: UseEmployeesOptions = {}): UseEmployeesReturn {
  const {
    page = 1,
    limit = 20,
    search = '',
    role = '',
    is_active = undefined,
    sort = 'name',
    order = 'asc',
    includeStats = false,
    autoFetch = true
  } = options;

  const [employees, setEmployees] = useState<(EmployeeDTO | EmployeeWithStats)[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<UseEmployeesReturn['pagination']>(null);

  // State for query parameters
  const [currentPage, setCurrentPage] = useState(page);
  const [currentSearch, setCurrentSearch] = useState(search);
  const [currentRole, setCurrentRole] = useState(role);
  const [currentActiveStatus, setCurrentActiveStatus] = useState<boolean | undefined>(is_active);
  const [currentSort, setCurrentSort] = useState(sort);
  const [currentOrder, setCurrentOrder] = useState<'asc' | 'desc'>(order);
  const [currentIncludeStats, setCurrentIncludeStats] = useState(includeStats);

  const fetchEmployees = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Build query parameters
      const params = new URLSearchParams();
      params.set('page', currentPage.toString());
      params.set('limit', limit.toString());
      
      if (currentSearch.trim()) {
        params.set('search', currentSearch.trim());
      }
      
      if (currentRole) {
        params.set('role', currentRole);
      }
      
      if (currentActiveStatus !== undefined) {
        params.set('is_active', currentActiveStatus.toString());
      }
      
      params.set('sort', currentSort);
      params.set('order', currentOrder);
      
      if (currentIncludeStats) {
        params.set('include_stats', 'true');
      }

      const response = await fetch(`/api/employees?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for authentication
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch employees');
      }

      const employeeResponse: EmployeeListResponse | EmployeeListWithStatsResponse = data.data;
      setEmployees(employeeResponse.employees);
      setPagination(employeeResponse.pagination);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      console.error('Error fetching employees:', err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, limit, currentSearch, currentRole, currentActiveStatus, currentSort, currentOrder, currentIncludeStats]);

  // Auto-fetch on mount and when dependencies change
  useEffect(() => {
    if (autoFetch) {
      fetchEmployees();
    }
  }, [fetchEmployees, autoFetch]);

  // Helper functions to update query parameters
  const setPage = useCallback((newPage: number) => {
    setCurrentPage(newPage);
  }, []);

  const setSearch = useCallback((newSearch: string) => {
    setCurrentSearch(newSearch);
    setCurrentPage(1); // Reset to first page when searching
  }, []);

  const setRole = useCallback((newRole: string) => {
    setCurrentRole(newRole);
    setCurrentPage(1); // Reset to first page when filtering
  }, []);

  const setActiveStatus = useCallback((newActiveStatus: boolean | undefined) => {
    setCurrentActiveStatus(newActiveStatus);
    setCurrentPage(1); // Reset to first page when filtering
  }, []);

  const setSort = useCallback((newSort: string, newOrder: 'asc' | 'desc' = 'asc') => {
    setCurrentSort(newSort);
    setCurrentOrder(newOrder);
    setCurrentPage(1); // Reset to first page when sorting
  }, []);

  const setIncludeStats = useCallback((include: boolean) => {
    setCurrentIncludeStats(include);
  }, []);

  return {
    employees,
    loading,
    error,
    pagination,
    refetch: fetchEmployees,
    setPage,
    setSearch,
    setRole,
    setActiveStatus,
    setSort,
    setIncludeStats
  };
}

/**
 * Hook for fetching a single employee by ID
 */
export function useEmployee(employeeId: string | null) {
  const [employee, setEmployee] = useState<EmployeeDTO | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEmployee = useCallback(async () => {
    if (!employeeId) {
      setEmployee(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/employees/${employeeId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch employee');
      }

      setEmployee(data.data);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      console.error('Error fetching employee:', err);
    } finally {
      setLoading(false);
    }
  }, [employeeId]);

  useEffect(() => {
    fetchEmployee();
  }, [fetchEmployee]);

  return {
    employee,
    loading,
    error,
    refetch: fetchEmployee
  };
}