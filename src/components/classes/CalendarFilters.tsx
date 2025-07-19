'use client'

import React, { useState } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { 
  FunnelIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  CalendarIcon,
  UserIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline'
import { Program, Coach } from '@/lib/types'

export interface FilterState {
  search: string
  programIds: string[]
  coachIds: string[]
  dateRange: {
    start: string
    end: string
  }
  status: string[]
  timeRange: {
    start: string
    end: string
  }
}

interface CalendarFiltersProps {
  programs: Program[]
  coaches: Coach[]
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
  onClearFilters: () => void
  isExpanded?: boolean
  onToggleExpanded?: () => void
}

export default function CalendarFilters({
  programs,
  coaches,
  filters,
  onFiltersChange,
  onClearFilters,
  isExpanded = false,
  onToggleExpanded
}: CalendarFiltersProps) {
  const [localFilters, setLocalFilters] = useState<FilterState>(filters)

  const handleFilterChange = (field: keyof FilterState, value: string | string[] | { start: string; end: string }) => {
    const newFilters = { ...localFilters, [field]: value }
    setLocalFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const handleArrayFilterToggle = (field: 'programIds' | 'coachIds' | 'status', value: string) => {
    const currentArray = localFilters[field]
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value]
    
    handleFilterChange(field, newArray)
  }

  const handleDateRangeChange = (field: 'start' | 'end', value: string) => {
    const newDateRange = { ...localFilters.dateRange, [field]: value }
    handleFilterChange('dateRange', newDateRange)
  }

  const handleTimeRangeChange = (field: 'start' | 'end', value: string) => {
    const newTimeRange = { ...localFilters.timeRange, [field]: value }
    handleFilterChange('timeRange', newTimeRange)
  }

  const getActiveFilterCount = () => {
    let count = 0
    if (filters.search) count++
    if (filters.programIds.length > 0) count++
    if (filters.coachIds.length > 0) count++
    if (filters.dateRange.start || filters.dateRange.end) count++
    if (filters.status.length > 0) count++
    if (filters.timeRange.start || filters.timeRange.end) count++
    return count
  }

  const activeFilterCount = getActiveFilterCount()

  const statusOptions = [
    { value: 'scheduled', label: 'Scheduled', color: 'bg-blue-100 text-blue-800' },
    { value: 'confirmed', label: 'Confirmed', color: 'bg-green-100 text-green-800' },
    { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800' },
    { value: 'completed', label: 'Completed', color: 'bg-gray-100 text-gray-800' }
  ]

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        {/* Filter Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <FunnelIcon className="h-5 w-5 text-gray-500" />
            <span className="font-medium text-gray-900">Filters</span>
            {activeFilterCount > 0 && (
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                {activeFilterCount}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {activeFilterCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearFilters}
                className="text-gray-500 hover:text-gray-700"
              >
                <XMarkIcon className="h-4 w-4 mr-1" />
                Clear All
              </Button>
            )}
            {onToggleExpanded && (
              <Button
                variant="outline"
                size="sm"
                onClick={onToggleExpanded}
              >
                {isExpanded ? 'Less Filters' : 'More Filters'}
              </Button>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="mb-4">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search classes..."
              value={localFilters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Quick Filters Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {/* Program Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <AcademicCapIcon className="h-4 w-4 inline mr-1" />
              Programs
            </label>
            <div className="flex flex-wrap gap-2">
              {programs.slice(0, isExpanded ? programs.length : 4).map(program => (
                <button
                  key={program.id}
                  type="button"
                  onClick={() => handleArrayFilterToggle('programIds', program.id)}
                  className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full border transition-colors ${
                    localFilters.programIds.includes(program.id)
                      ? 'text-white border-transparent'
                      : 'text-gray-700 border-gray-300 bg-white hover:bg-gray-50'
                  }`}
                  style={localFilters.programIds.includes(program.id) ? {
                    backgroundColor: program.color,
                    borderColor: program.color
                  } : {}}
                >
                  <div 
                    className="w-2 h-2 rounded-full mr-2"
                    style={{ backgroundColor: program.color }}
                  />
                  {program.name}
                </button>
              ))}
              {!isExpanded && programs.length > 4 && (
                <span className="text-xs text-gray-500 px-2 py-1">
                  +{programs.length - 4} more
                </span>
              )}
            </div>
          </div>

          {/* Coach Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <UserIcon className="h-4 w-4 inline mr-1" />
              Coaches
            </label>
            <div className="flex flex-wrap gap-2">
              {coaches.filter(coach => coach.isActive).slice(0, isExpanded ? coaches.length : 3).map(coach => (
                <button
                  key={coach.id}
                  type="button"
                  onClick={() => handleArrayFilterToggle('coachIds', coach.id)}
                  className={`px-3 py-1 text-xs font-medium rounded-full border transition-colors ${
                    localFilters.coachIds.includes(coach.id)
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'text-gray-700 border-gray-300 bg-white hover:bg-gray-50'
                  }`}
                >
                  {coach.name}
                </button>
              ))}
              {!isExpanded && coaches.length > 3 && (
                <span className="text-xs text-gray-500 px-2 py-1">
                  +{coaches.length - 3} more
                </span>
              )}
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <div className="flex flex-wrap gap-2">
              {statusOptions.map(status => (
                <button
                  key={status.value}
                  type="button"
                  onClick={() => handleArrayFilterToggle('status', status.value)}
                  className={`px-3 py-1 text-xs font-medium rounded-full border transition-colors ${
                    localFilters.status.includes(status.value)
                      ? status.color
                      : 'text-gray-700 border-gray-300 bg-white hover:bg-gray-50'
                  }`}
                >
                  {status.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Expanded Filters */}
        {isExpanded && (
          <div className="border-t border-gray-200 pt-4 space-y-4">
            {/* Date Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <CalendarIcon className="h-4 w-4 inline mr-1" />
                  Start Date
                </label>
                <Input
                  type="date"
                  value={localFilters.dateRange.start}
                  onChange={(e) => handleDateRangeChange('start', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date
                </label>
                <Input
                  type="date"
                  value={localFilters.dateRange.end}
                  onChange={(e) => handleDateRangeChange('end', e.target.value)}
                />
              </div>
            </div>

            {/* Time Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Earliest Time
                </label>
                <Input
                  type="time"
                  value={localFilters.timeRange.start}
                  onChange={(e) => handleTimeRangeChange('start', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Latest Time
                </label>
                <Input
                  type="time"
                  value={localFilters.timeRange.end}
                  onChange={(e) => handleTimeRangeChange('end', e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Active Filters Summary */}
        {activeFilterCount > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                {activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''} applied
              </span>
              <div className="flex flex-wrap gap-2">
                {filters.search && (
                  <span className="inline-flex items-center px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded">
                    Search: &quot;{filters.search}&quot;
                    <button
                      onClick={() => handleFilterChange('search', '')}
                      className="ml-1 text-gray-500 hover:text-gray-700"
                    >
                      <XMarkIcon className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {filters.programIds.length > 0 && (
                  <span className="inline-flex items-center px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                    {filters.programIds.length} program{filters.programIds.length !== 1 ? 's' : ''}
                    <button
                      onClick={() => handleFilterChange('programIds', [])}
                      className="ml-1 text-blue-600 hover:text-blue-800"
                    >
                      <XMarkIcon className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {filters.coachIds.length > 0 && (
                  <span className="inline-flex items-center px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                    {filters.coachIds.length} coach{filters.coachIds.length !== 1 ? 'es' : ''}
                    <button
                      onClick={() => handleFilterChange('coachIds', [])}
                      className="ml-1 text-green-600 hover:text-green-800"
                    >
                      <XMarkIcon className="h-3 w-3" />
                    </button>
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}