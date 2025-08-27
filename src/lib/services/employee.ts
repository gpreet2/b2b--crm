/**
 * Employee Service
 * 
 * Handles business logic for employee/staff management operations.
 * Ensures proper organization-level data isolation and security.
 */

import { getDatabase } from '@/config/database';
import { logger } from '@/utils/logger';
import type { 
  EmployeeDTO, 
  EmployeeListResponse, 
  EmployeeQueryFilters,
  EmployeeWithStats,
  EmployeeStats,
  EmployeeListWithStatsResponse
} from '@/types/generated/employee.types';

export class EmployeeService {
  private db = getDatabase();

  /**
   * Get employees for a specific organization with filters, search, and pagination
   */
  async getEmployees(filters: EmployeeQueryFilters): Promise<EmployeeListResponse> {
    try {
      logger.info('Fetching employees with filters', { filters });

      // Validate and sanitize filters
      const sanitizedFilters = this.sanitizeFilters(filters);

      const query = this.buildEmployeeQuery(sanitizedFilters);
      const countQuery = this.buildEmployeeCountQuery(sanitizedFilters);

      // Execute both queries in parallel with proper error handling
      const [employeeResult, countResult] = await Promise.allSettled([
        query,
        countQuery
      ]);

      let employees = null;
      let employeeError = null;
      let countData = null;
      let countError = null;

      if (employeeResult.status === 'fulfilled') {
        employees = employeeResult.value.data;
        employeeError = employeeResult.value.error;
      } else {
        employeeError = employeeResult.reason;
      }

      if (countResult.status === 'fulfilled') {
        countData = countResult.value.data;
        countError = countResult.value.error;
      } else {
        countError = countResult.reason;
      }

      // Handle employee query errors more gracefully
      if (employeeError) {
        logger.error('Error fetching employees', { 
          error: employeeError, 
          organizationId: sanitizedFilters.organizationId,
          errorCode: employeeError.code,
          errorDetails: employeeError.details 
        });
        
        // If it's a "no rows found" type error, return empty results instead of throwing
        if (employeeError.code === 'PGRST116' || employeeError.message?.includes('No rows found')) {
          logger.info('No employees found for organization, returning empty result', { 
            organizationId: sanitizedFilters.organizationId 
          });
          return this.createEmptyResponse(sanitizedFilters);
        }
        
        throw new Error(`Failed to fetch employees: ${employeeError.message}`);
      }

      // Handle count query errors - use fallback count if RPC doesn't exist
      let total = 0;
      if (countError) {
        logger.warn('Error counting employees, using fallback count', { 
          error: countError,
          organizationId: sanitizedFilters.organizationId 
        });
        // Use length of actual results as fallback
        total = employees?.length || 0;
      } else {
        // Handle different count result formats
        if (Array.isArray(countData) && countData.length > 0 && 'total' in countData[0]) {
          total = (countData[0] as { total: number }).total;
        } else if (typeof countData === 'number') {
          total = countData;
        } else {
          total = Array.isArray(countData) ? countData.length : 0;
        }
      }

      const totalPages = Math.ceil(total / sanitizedFilters.limit);
      const currentPage = Math.floor(sanitizedFilters.offset / sanitizedFilters.limit) + 1;

      // Transform raw data to DTO format - handle null/empty employees
      let employeeDTOs: EmployeeDTO[] = [];
      if (employees && Array.isArray(employees) && employees.length > 0) {
        employeeDTOs = employees.map(employee => {
          try {
            return this.transformToEmployeeDTO(employee);
          } catch (transformError) {
            logger.error('Error transforming employee data', { 
              error: transformError, 
              employee,
              organizationId: sanitizedFilters.organizationId 
            });
            // Skip invalid employee records instead of failing entire request
            return null;
          }
        }).filter(Boolean) as EmployeeDTO[];
      }

      // Apply in-memory search filtering if needed
      if (sanitizedFilters.search) {
        const searchTerm = sanitizedFilters.search.toLowerCase();
        employeeDTOs = employeeDTOs.filter(employee => 
          employee.first_name?.toLowerCase().includes(searchTerm) ||
          employee.last_name?.toLowerCase().includes(searchTerm) ||
          employee.email.toLowerCase().includes(searchTerm) ||
          employee.role.toLowerCase().includes(searchTerm)
        );
      }

      // Apply in-memory sorting for user-related fields
      if (sanitizedFilters.sort === 'name') {
        employeeDTOs.sort((a, b) => {
          const nameA = `${a.first_name || ''} ${a.last_name || ''}`.trim().toLowerCase();
          const nameB = `${b.first_name || ''} ${b.last_name || ''}`.trim().toLowerCase();
          return sanitizedFilters.order === 'asc' 
            ? nameA.localeCompare(nameB)
            : nameB.localeCompare(nameA);
        });
      } else if (sanitizedFilters.sort === 'email') {
        employeeDTOs.sort((a, b) => {
          return sanitizedFilters.order === 'asc'
            ? a.email.localeCompare(b.email)
            : b.email.localeCompare(a.email);
        });
      }

      const response: EmployeeListResponse = {
        employees: employeeDTOs,
        pagination: {
          page: currentPage,
          limit: sanitizedFilters.limit,
          total,
          totalPages,
          hasNextPage: currentPage < totalPages,
          hasPreviousPage: currentPage > 1
        }
      };

      logger.info('Successfully fetched employees', { 
        count: employeeDTOs.length, 
        total, 
        page: currentPage 
      });

      return response;

    } catch (error) {
      logger.error('EmployeeService.getEmployees failed', { 
        error: error instanceof Error ? error.message : 'Unknown error', 
        stack: error instanceof Error ? error.stack : undefined,
        filters: {
          ...filters,
          organizationId: '[REDACTED]' // Don't log sensitive IDs
        }
      });
      
      // Return empty response instead of throwing for certain error types
      if (error instanceof Error && (
        error.message.includes('relation') || 
        error.message.includes('function') ||
        error.message.includes('RPC')
      )) {
        logger.warn('Database schema issue detected, returning empty response', {
          errorMessage: error.message
        });
        return this.createEmptyResponse(this.sanitizeFilters(filters));
      }
      
      throw error;
    }
  }

  /**
   * Get employees with calculated performance statistics
   */
  async getEmployeesWithStats(filters: EmployeeQueryFilters): Promise<EmployeeListWithStatsResponse> {
    try {
      // First get the basic employee data
      const employeeResponse = await this.getEmployees(filters);
      
      // Calculate stats for each employee
      const employeesWithStats: EmployeeWithStats[] = await Promise.all(
        employeeResponse.employees.map(async (employee) => {
          const stats = await this.calculateEmployeeStats(employee.user_id);
          return {
            ...employee,
            stats
          };
        })
      );

      return {
        employees: employeesWithStats,
        pagination: employeeResponse.pagination
      };

    } catch (error) {
      logger.error('EmployeeService.getEmployeesWithStats failed', { error, filters });
      throw error;
    }
  }

  /**
   * Create an empty response for when no employees are found
   */
  private createEmptyResponse(filters: EmployeeQueryFilters): EmployeeListResponse {
    return {
      employees: [],
      pagination: {
        page: 1,
        limit: filters.limit,
        total: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false
      }
    };
  }

  /**
   * Calculate performance statistics for a specific employee
   */
  private async calculateEmployeeStats(employeeId: string): Promise<EmployeeStats> {
    try {
      // For now, return mock stats - in production this would query actual class/performance data
      // TODO: Implement real statistics calculation from classes, reservations, and performance data
      
      const mockStats: EmployeeStats = {
        totalClassesTaught: Math.floor(Math.random() * 100) + 20,
        totalStudents: Math.floor(Math.random() * 200) + 50,
        averageAttendance: Math.floor(Math.random() * 30) + 70,
        attendanceRate: Math.floor(Math.random() * 20) + 75,
        rating: 4.2 + Math.random() * 0.6,
        totalRevenue: (Math.floor(Math.random() * 100) + 20) * 45,
        upcomingClasses: Math.floor(Math.random() * 10) + 2,
        completedClassesThisMonth: Math.floor(Math.random() * 20) + 5,
        specialtyPrograms: ['Burn40', 'CrossFit', 'BurnDumbells'].slice(0, Math.floor(Math.random() * 3) + 1),
        recentClasses: [] // Mock empty for now
      };

      return mockStats;

    } catch (error) {
      logger.error('Error calculating employee stats', { error, employeeId });
      // Return default stats on error
      return {
        totalClassesTaught: 0,
        totalStudents: 0,
        averageAttendance: 0,
        attendanceRate: 0,
        rating: 0,
        totalRevenue: 0,
        upcomingClasses: 0,
        completedClassesThisMonth: 0,
        specialtyPrograms: [],
        recentClasses: []
      };
    }
  }

  /**
   * Sanitize and validate filter parameters
   */
  private sanitizeFilters(filters: EmployeeQueryFilters): EmployeeQueryFilters {
    return {
      organizationId: filters.organizationId,
      search: filters.search,
      role: filters.role,
      is_active: filters.is_active,
      limit: Math.max(1, Math.min(100, filters.limit)), // Ensure positive, max 100
      offset: Math.max(0, filters.offset), // Ensure non-negative
      sort: filters.sort,
      order: filters.order
    };
  }

  /**
   * Build the main employee query with joins and filters
   */
  private buildEmployeeQuery(filters: EmployeeQueryFilters) {
    // Use left join instead of inner join to handle missing user records gracefully
    let query = this.db
      .getSupabaseClient()
      .from('user_organizations')
      .select(`
        user_id,
        role,
        role_id,
        is_active,
        organization_id,
        users(
          id,
          first_name,
          last_name,
          email,
          user_type,
          created_at,
          updated_at
        )
      `)
      .eq('organization_id', filters.organizationId)
      .in('role', ['trainer', 'coach', 'front_desk', 'manager', 'admin', 'owner']);

    // Apply role filter
    if (filters.role) {
      query = query.eq('role', filters.role);
    }

    // Apply active status filter
    if (filters.is_active !== undefined) {
      query = query.eq('is_active', filters.is_active);
    }

    // Apply sorting - use only user_organizations table fields for database sorting
    // Related table sorting will be done in memory
    if (['role', 'is_active'].includes(filters.sort)) {
      const sortField = this.mapSortField(filters.sort);
      query = query.order(sortField, { ascending: filters.order === 'asc' });
    } else {
      // Default sort by role since we don't have created_at
      query = query.order('role', { ascending: filters.order === 'asc' });
    }

    // Apply pagination
    query = query.range(filters.offset, filters.offset + filters.limit - 1);

    return query;
  }

  /**
   * Build the count query for pagination
   */
  private buildEmployeeCountQuery(filters: EmployeeQueryFilters) {
    // First try using RPC function, with fallback to manual count
    return this.db
      .getSupabaseClient()
      .rpc('count_employees_for_organization', {
        org_id: filters.organizationId,
        role_filter: filters.role || null,
        is_active_filter: filters.is_active ?? null,
        search_term: filters.search || null
      })
      .then(result => {
        // If RPC succeeds, return result
        if (!result.error) {
          return result;
        }
        
        // If RPC fails (function doesn't exist), fall back to manual count
        logger.warn('RPC count function not found, using manual count', { 
          error: result.error,
          organizationId: filters.organizationId 
        });
        
        // Build a simpler count query manually
        let countQuery = this.db
          .getSupabaseClient()
          .from('user_organizations')
          .select('user_id', { count: 'exact', head: true })
          .eq('organization_id', filters.organizationId)
          .in('role', ['trainer', 'coach', 'front_desk', 'manager', 'admin', 'owner']);

        if (filters.role) {
          countQuery = countQuery.eq('role', filters.role);
        }

        if (filters.is_active !== undefined) {
          countQuery = countQuery.eq('is_active', filters.is_active);
        }

        return countQuery;
      });
  }

  /**
   * Map API sort parameters to database columns
   */
  private mapSortField(sort: string): string {
    const sortMap: Record<string, string> = {
      'role': 'role',
      'is_active': 'is_active'
    };

    return sortMap[sort] || 'role';
  }

  /**
   * Transform raw database result to EmployeeDTO
   */
  private transformToEmployeeDTO(raw: Record<string, any>): EmployeeDTO {
    if (!raw?.user_id) {
      throw new Error('Invalid employee data: missing user_id');
    }

    // Handle different structures depending on how Supabase returns the data
    const userData = Array.isArray(raw.users) ? raw.users[0] : raw.users || {};
    
    // If user data is null/missing, we still create the DTO but with default values
    if (!userData || (!userData.email && !userData.id)) {
      logger.warn('Employee has missing or incomplete user data', { 
        userId: raw.user_id,
        organizationId: raw.organization_id 
      });
    }

    return {
      id: userData.id || raw.user_id,
      user_id: raw.user_id,
      // User information - provide defaults for missing data
      first_name: userData.first_name || null,
      last_name: userData.last_name || null,
      email: userData.email || `user_${raw.user_id}@unknown.com`, // Provide fallback email
      user_type: userData.user_type || 'employee',
      // Employee-specific information
      role: raw.role || 'trainer',
      specialties: [], // TODO: Get from employee_specialties table
      is_active: raw.is_active !== undefined ? raw.is_active : false,
      hire_date: null, // TODO: Get from employee profile table
      // Organization-specific information
      organization_id: raw.organization_id,
      department: null, // TODO: Get from employee profile
      position: null, // TODO: Get from employee profile
      // Timestamps - use user timestamps since user_organizations doesn't have them
      created_at: userData.created_at || new Date().toISOString(),
      updated_at: userData.updated_at || new Date().toISOString()
    };
  }

  /**
   * Get a single employee by ID (with organization check)
   */
  async getEmployeeById(employeeId: string, organizationId: string): Promise<EmployeeDTO | null> {
    try {
      logger.info('Fetching employee by ID', { employeeId, organizationId });

      const { data: employee, error } = await this.db
        .getSupabaseClient()
        .from('user_organizations')
        .select(`
          user_id,
          role,
          role_id,
          is_active,
          organization_id,
          users!inner(
            id,
            first_name,
            last_name,
            email,
            user_type,
            created_at,
            updated_at
          )
        `)
        .eq('user_id', employeeId)
        .eq('organization_id', organizationId)
        .in('role', ['trainer', 'coach', 'front_desk', 'manager', 'admin', 'owner'])
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          logger.info('Employee not found', { employeeId, organizationId });
          return null;
        }
        logger.error('Error fetching employee by ID', { error, employeeId });
        throw new Error(`Failed to fetch employee: ${error.message}`);
      }

      return this.transformToEmployeeDTO(employee);

    } catch (error) {
      logger.error('EmployeeService.getEmployeeById failed', { error, employeeId, organizationId });
      throw error;
    }
  }
}