'use client';

import {
  Search,
  User,
  Calendar,
  TrendingUp,
  Users,
  Clock,
  Star,
  Award,
  MoreVertical,
  ChevronRight,
  BarChart3,
  Target,
  CheckCircle,
  Loader,
  AlertCircle,
  ChevronLeft,
  Filter,
  UserPlus,
  Mail,
  X,
} from 'lucide-react';
import React, { useState, useMemo, useEffect } from 'react';
import { useEmployees } from '@/hooks/useEmployees';
import type { EmployeeDTO, EmployeeWithStats } from '@/types/generated/employee.types';

// Invitation form data interface
interface InvitationFormData {
  email: string;
  first_name: string;
  last_name: string;
  role: 'trainer' | 'coach' | 'front_desk' | 'manager' | 'admin';
  location_ids: string[];
}

export default function EmployeesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeWithStats | EmployeeDTO | null>(null);
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'performance'>('list');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<boolean | undefined>(true); // Default to active employees
  
  // Invitation modal state
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteFormData, setInviteFormData] = useState<InvitationFormData>({
    email: '',
    first_name: '',
    last_name: '',
    role: 'trainer',
    location_ids: []
  });
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteSuccess, setInviteSuccess] = useState<string | null>(null);

  // Use the custom hook for employee data
  const {
    employees,
    loading,
    error,
    pagination,
    setPage,
    setSearch,
    setRole,
    setActiveStatus,
    setIncludeStats,
    refetch
  } = useEmployees({
    page: 1,
    limit: 20,
    search: searchQuery,
    role: roleFilter,
    is_active: statusFilter,
    includeStats: viewMode === 'list' || viewMode === 'performance'
  });

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, setSearch]);

  // Update include stats when view mode changes
  useEffect(() => {
    setIncludeStats(true); // Always include stats for employee data
  }, [viewMode, setIncludeStats]);

  // Helper functions
  const getEmployeeFullName = (employee: EmployeeDTO | EmployeeWithStats) => {
    return `${employee.first_name || ''} ${employee.last_name || ''}`.trim() || 'Unknown';
  };

  const handleRoleFilterChange = (newRole: string) => {
    setRoleFilter(newRole);
    setRole(newRole);
  };

  const handleStatusFilterChange = (newStatus: string) => {
    const statusValue = newStatus === 'active' ? true : newStatus === 'inactive' ? false : undefined;
    setStatusFilter(statusValue);
    setActiveStatus(statusValue);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };

  const getPerformanceColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600 bg-green-100';
    if (percentage >= 75) return 'text-blue-600 bg-blue-100';
    if (percentage >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const handleViewPerformance = (employee: EmployeeWithStats | EmployeeDTO) => {
    setSelectedEmployee(employee);
    setViewMode('performance');
    setActiveDropdownId(null);
  };

  const handleBackToList = () => {
    setSelectedEmployee(null);
    setViewMode('list');
  };

  const isEmployeeWithStats = (employee: EmployeeDTO | EmployeeWithStats): employee is EmployeeWithStats => {
    return 'stats' in employee;
  };

  // Invitation form handlers
  const handleOpenInviteModal = () => {
    setShowInviteModal(true);
    setInviteError(null);
    setInviteSuccess(null);
    // Reset form
    setInviteFormData({
      email: '',
      first_name: '',
      last_name: '',
      role: 'trainer',
      location_ids: []
    });
  };

  const handleCloseInviteModal = () => {
    setShowInviteModal(false);
    setInviteError(null);
    setInviteSuccess(null);
  };

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteLoading(true);
    setInviteError(null);
    setInviteSuccess(null);

    try {
      const response = await fetch('/api/employees/invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(inviteFormData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to send invitation');
      }

      setInviteSuccess(
        `Invitation sent successfully to ${inviteFormData.email}! They can accept the invitation using this link: ${result.data.invitation_url}`
      );
      
      // Refresh employees list
      refetch();

      // Reset form after success
      setTimeout(() => {
        handleCloseInviteModal();
      }, 3000);

    } catch (error) {
      setInviteError(error instanceof Error ? error.message : 'Failed to send invitation');
    } finally {
      setInviteLoading(false);
    }
  };

  if (viewMode === 'performance' && selectedEmployee) {
    const employeeWithStats = isEmployeeWithStats(selectedEmployee) ? selectedEmployee : null;

    return (
      <div className='min-h-screen bg-white'>
        {/* Header */}
        <div className='bg-white border-b border-gray-200 px-6 py-4'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center space-x-4'>
              <button onClick={handleBackToList} className='text-gray-400 hover:text-gray-600'>
                <ChevronRight className='h-5 w-5 rotate-180' />
              </button>
              <div className='flex items-center space-x-4'>
                <div className='h-12 w-12 rounded-full bg-gray-300 flex items-center justify-center'>
                  <User className='h-6 w-6 text-gray-600' />
                </div>
                <div>
                  <h1 className='text-2xl font-semibold text-gray-900'>
                    {getEmployeeFullName(selectedEmployee)}
                  </h1>
                  <p className='text-sm text-gray-500'>{selectedEmployee.role} Performance Dashboard</p>
                </div>
              </div>
            </div>

            <div className='flex items-center space-x-2'>
              {employeeWithStats?.stats && (
                <div className='flex items-center space-x-1'>
                  <Star className='h-4 w-4 text-yellow-400 fill-current' />
                  <span className='text-sm font-medium text-gray-900'>
                    {employeeWithStats.stats.rating.toFixed(1)}
                  </span>
                </div>
              )}
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  selectedEmployee.is_active
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {selectedEmployee.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className='px-6 py-6'>
          {employeeWithStats?.stats ? (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
              <div className='bg-white rounded-lg border border-gray-200 p-6'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm font-medium text-gray-600'>Classes Taught</p>
                    <p className='text-2xl font-bold text-gray-900'>
                      {employeeWithStats.stats.totalClassesTaught}
                    </p>
                    <p className='text-sm text-gray-500'>
                      {employeeWithStats.stats.completedClassesThisMonth} this month
                    </p>
                  </div>
                  <Calendar className='h-8 w-8 text-blue-600' />
                </div>
              </div>

              <div className='bg-white rounded-lg border border-gray-200 p-6'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm font-medium text-gray-600'>Total Students</p>
                    <p className='text-2xl font-bold text-gray-900'>
                      {employeeWithStats.stats.totalStudents}
                    </p>
                    <p className='text-sm text-gray-500'>Across all classes</p>
                  </div>
                  <Users className='h-8 w-8 text-green-600' />
                </div>
              </div>

              <div className='bg-white rounded-lg border border-gray-200 p-6'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm font-medium text-gray-600'>Average Rating</p>
                    <p className='text-2xl font-bold text-gray-900'>
                      {employeeWithStats.stats.rating.toFixed(1)}
                    </p>
                    <p className='text-sm text-gray-500'>
                      Performance rating
                    </p>
                  </div>
                  <Star className='h-8 w-8 text-purple-600' />
                </div>
              </div>

              <div className='bg-white rounded-lg border border-gray-200 p-6'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm font-medium text-gray-600'>Revenue Generated</p>
                    <p className='text-2xl font-bold text-gray-900'>
                      ${employeeWithStats.stats.totalRevenue.toLocaleString()}
                    </p>
                    <p className='text-sm text-gray-500'>Total generated</p>
                  </div>
                  <Award className='h-8 w-8 text-yellow-600' />
                </div>
              </div>
            </div>
          ) : (
            <div className='text-center py-8'>
              <p className='text-gray-500'>Performance statistics not available. Enable stats to view detailed metrics.</p>
            </div>
          )}

          {/* Specialties */}
          <div className='bg-white rounded-lg border border-gray-200 p-6 mb-8'>
            <h3 className='text-lg font-medium text-gray-900 mb-4'>Specialties & Programs</h3>
            <div className='flex flex-wrap gap-2'>
              {selectedEmployee.specialties && selectedEmployee.specialties.length > 0 ? (
                selectedEmployee.specialties.map((specialty, index) => (
                  <span
                    key={index}
                    className='inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-full border'
                    style={{
                      backgroundColor: specialty.includes('Burn40')
                        ? '#fef2f2'
                        : specialty.includes('CrossFit')
                          ? '#ecfeff'
                          : specialty.includes('BurnDumbells')
                            ? '#f0fdf4'
                            : '#f9fafb',
                      color: specialty.includes('Burn40')
                        ? '#dc2626'
                        : specialty.includes('CrossFit')
                          ? '#0891b2'
                          : specialty.includes('BurnDumbells')
                            ? '#16a34a'
                            : '#6b7280',
                      borderColor: specialty.includes('Burn40')
                        ? '#fecaca'
                        : specialty.includes('CrossFit')
                          ? '#a5f3fc'
                          : specialty.includes('BurnDumbells')
                            ? '#bbf7d0'
                            : '#e5e7eb',
                    }}
                  >
                    <div
                      className='w-2 h-2 rounded-full mr-2'
                      style={{
                        backgroundColor: specialty.includes('Burn40')
                          ? '#ef4444'
                          : specialty.includes('CrossFit')
                            ? '#06b6d4'
                            : specialty.includes('BurnDumbells')
                              ? '#10b981'
                              : '#6b7280',
                      }}
                    />
                    {specialty}
                  </span>
                ))
              ) : (
                <span className='text-gray-500 text-sm'>No specialties listed</span>
              )}
            </div>
          </div>

          {/* Recent Classes Performance */}
          <div className='bg-white rounded-lg border border-gray-200 p-6'>
            <div className='flex items-center justify-between mb-6'>
              <h3 className='text-lg font-medium text-gray-900'>Recent Classes Performance</h3>
              <BarChart3 className='h-5 w-5 text-gray-400' />
            </div>

            <div className='text-center py-8'>
              <BarChart3 className='h-12 w-12 text-gray-300 mx-auto mb-4' />
              <p className='text-gray-500'>Class performance data not available</p>
              <p className='text-sm text-gray-400'>This feature will be implemented with the class management system</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-white'>
      {/* Header */}
      <div className='bg-white border-b border-gray-200 px-6 py-4'>
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-2xl font-semibold text-gray-900'>Employees</h1>
            <p className='text-sm text-gray-500 mt-1'>Manage trainers and staff performance</p>
          </div>

          <button 
            onClick={handleOpenInviteModal}
            className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2'
          >
            <UserPlus className='h-4 w-4' />
            <span>Invite Employee</span>
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className='px-6 py-4 bg-white border-b border-gray-200'>
        <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 sm:space-x-4'>
          <div className='relative max-w-md flex-1'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400' />
            <input
              type='text'
              placeholder='Search employees...'
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
            />
          </div>
          
          <div className='flex items-center space-x-3'>
            {/* Role Filter */}
            <select
              value={roleFilter}
              onChange={e => {
                setRoleFilter(e.target.value);
                setRole(e.target.value);
              }}
              className='px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm'
            >
              <option value=''>All Roles</option>
              <option value='trainer'>Trainer</option>
              <option value='coach'>Coach</option>
              <option value='front_desk'>Front Desk</option>
              <option value='manager'>Manager</option>
              <option value='admin'>Admin</option>
              <option value='owner'>Owner</option>
            </select>
            
            {/* Status Filter */}
            <select
              value={statusFilter === undefined ? 'all' : statusFilter ? 'active' : 'inactive'}
              onChange={e => {
                const value = e.target.value === 'all' ? undefined : e.target.value === 'active';
                setStatusFilter(value);
                setActiveStatus(value);
              }}
              className='px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm'
            >
              <option value='all'>All Status</option>
              <option value='active'>Active</option>
              <option value='inactive'>Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Employees Table */}
      <div className='px-6 py-4'>
        {loading ? (
          <div className='flex items-center justify-center py-8'>
            <div className='text-gray-500'>Loading employees...</div>
          </div>
        ) : error ? (
          <div className='bg-red-50 border border-red-200 rounded-lg p-4'>
            <p className='text-red-600'>{error}</p>
            <button
              onClick={refetch}
              className='mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors'
            >
              Retry
            </button>
          </div>
        ) : employees.length === 0 ? (
          <div className='text-center py-8'>
            <User className='h-12 w-12 text-gray-300 mx-auto mb-4' />
            <p className='text-gray-500'>No employees found</p>
          </div>
        ) : (
          <div className='bg-white rounded-lg shadow overflow-hidden'>
            <table className='min-w-full divide-y divide-gray-200'>
              <thead className='bg-gray-50'>
                <tr>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Employee
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Role
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Specialties
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Hire Date
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Status
                  </th>
                  <th className='relative px-6 py-3'>
                    <span className='sr-only'>Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className='bg-white divide-y divide-gray-200'>
                {employees.map(employee => {
                  const employeeWithStats = isEmployeeWithStats(employee) ? employee : null;
                  return (
                    <tr key={employee.id} className='hover:bg-gray-50'>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <div className='flex items-center'>
                          <div className='h-10 w-10 flex-shrink-0'>
                            <div className='h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center'>
                              <User className='h-5 w-5 text-gray-600' />
                            </div>
                          </div>
                          <div className='ml-4'>
                            <div className='text-sm font-medium text-gray-900'>
                              {getEmployeeFullName(employee)}
                            </div>
                            <div className='text-sm text-gray-500'>{employee.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <div className='text-sm text-gray-900 capitalize'>{employee.role}</div>
                      </td>
                      <td className='px-6 py-4'>
                        <div className='flex flex-wrap gap-1'>
                          {employee.specialties && employee.specialties.length > 0 ? (
                            employee.specialties.slice(0, 2).map((specialty, index) => (
                              <span
                                key={index}
                                className='inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full border'
                                style={{
                                  backgroundColor: specialty.includes('Burn40')
                                    ? '#fef2f2'
                                    : specialty.includes('CrossFit')
                                      ? '#ecfeff'
                                      : specialty.includes('BurnDumbells')
                                        ? '#f0fdf4'
                                        : '#f9fafb',
                                  color: specialty.includes('Burn40')
                                    ? '#dc2626'
                                    : specialty.includes('CrossFit')
                                      ? '#0891b2'
                                      : specialty.includes('BurnDumbells')
                                        ? '#16a34a'
                                        : '#6b7280',
                                  borderColor: specialty.includes('Burn40')
                                    ? '#fecaca'
                                    : specialty.includes('CrossFit')
                                      ? '#a5f3fc'
                                      : specialty.includes('BurnDumbells')
                                        ? '#bbf7d0'
                                        : '#e5e7eb',
                                }}
                              >
                                <div
                                  className='w-1.5 h-1.5 rounded-full mr-1.5'
                                  style={{
                                    backgroundColor: specialty.includes('Burn40')
                                      ? '#ef4444'
                                      : specialty.includes('CrossFit')
                                        ? '#06b6d4'
                                        : specialty.includes('BurnDumbells')
                                          ? '#10b981'
                                          : '#6b7280',
                                  }}
                                />
                                {specialty}
                              </span>
                            ))
                          ) : (
                            <span className='text-sm text-gray-400'>No specialties</span>
                          )}
                          {employee.specialties && employee.specialties.length > 2 && (
                            <span className='px-2.5 py-0.5 text-xs font-medium rounded-full bg-gray-50 text-gray-500 border border-gray-200'>
                              +{employee.specialties.length - 2}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <div className='text-sm text-gray-900'>
                          {employee.hire_date ? formatDate(employee.hire_date) : 'N/A'}
                        </div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            employee.is_active
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {employee.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium'>
                        <div className='relative'>
                          <button
                            onClick={() =>
                              setActiveDropdownId(activeDropdownId === employee.id ? null : employee.id)
                            }
                            className='text-gray-400 hover:text-gray-600'
                          >
                            <MoreVertical className='h-5 w-5' />
                          </button>

                          {activeDropdownId === employee.id && (
                            <div className='absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10'>
                              <div className='py-1'>
                                <button
                                  onClick={() => handleViewPerformance(employee)}
                                  className='w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2'
                                >
                                  <BarChart3 className='h-4 w-4' />
                                  <span>View Performance</span>
                                </button>
                                <button className='w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2'>
                                  <Calendar className='h-4 w-4' />
                                  <span>View Schedule</span>
                                </button>
                                <button className='w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2'>
                                  <User className='h-4 w-4' />
                                  <span>Edit Profile</span>
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className='flex items-center justify-between mt-6 px-4 py-3 bg-white border border-gray-200 rounded-lg'>
            <div className='flex items-center text-sm text-gray-700'>
              <span>
                Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                {pagination.total} results
              </span>
            </div>
            <div className='flex items-center space-x-2'>
              <button
                onClick={() => setPage(pagination.page - 1)}
                disabled={!pagination.hasPreviousPage}
                className='px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
              >
                Previous
              </button>
              <span className='px-3 py-1 text-sm font-medium text-gray-900'>
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                onClick={() => setPage(pagination.page + 1)}
                disabled={!pagination.hasNextPage}
                className='px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Invitation Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Mail className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Invite Employee</h2>
                  <p className="text-sm text-gray-500">Send an invitation to join your team</p>
                </div>
              </div>
              <button
                onClick={handleCloseInviteModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleInviteSubmit} className="p-6 space-y-4">
              {inviteError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-600">{inviteError}</p>
                </div>
              )}

              {inviteSuccess && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-sm text-green-600">{inviteSuccess}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    required
                    value={inviteFormData.first_name}
                    onChange={(e) => setInviteFormData(prev => ({ ...prev, first_name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter first name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    required
                    value={inviteFormData.last_name}
                    onChange={(e) => setInviteFormData(prev => ({ ...prev, last_name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter last name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={inviteFormData.email}
                  onChange={(e) => setInviteFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter email address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  value={inviteFormData.role}
                  onChange={(e) => setInviteFormData(prev => ({ ...prev, role: e.target.value as InvitationFormData['role'] }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="trainer">Trainer</option>
                  <option value="coach">Coach</option>
                  <option value="front_desk">Front Desk</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  This determines their permissions and access level
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location Access
                </label>
                <p className="text-xs text-gray-500 mb-3">
                  Leave empty to grant access to all locations, or select specific locations
                </p>
                <div className="text-sm text-gray-500">
                  Location selection will be implemented when location management is available
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseInviteModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={inviteLoading}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                >
                  {inviteLoading ? (
                    <>
                      <Loader className="h-4 w-4 animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Mail className="h-4 w-4" />
                      <span>Send Invitation</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
