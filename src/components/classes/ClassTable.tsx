'use client'

import React, { useState, useMemo } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { 
  ChevronUpIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  CalendarIcon,
  MapPinIcon
} from '@heroicons/react/24/outline'
import { Class, Program, Coach } from '@/lib/types'

interface ClassTableProps {
  classes: Class[]
  programs: Program[]
  coaches: Coach[]
  onClassClick?: (classItem: Class) => void
  onEditClass?: (classItem: Class) => void
  onDeleteClass?: (classItem: Class) => void

  pageSize?: number
}

type SortField = 'name' | 'date' | 'startTime' | 'program' | 'coach' | 'enrolled' | 'status'
type SortDirection = 'asc' | 'desc'

export default function ClassTable({
  classes,
  programs,
  coaches,
  onClassClick,
  onEditClass,
  onDeleteClass,
  pageSize = 10
}: ClassTableProps) {
  const [sortField, setSortField] = useState<SortField>('date')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  const [currentPage, setCurrentPage] = useState(1)

  // Create lookup maps
  const programMap = useMemo(() => {
    return programs.reduce((acc, program) => {
      acc[program.id] = program
      return acc
    }, {} as Record<string, Program>)
  }, [programs])

  const coachMap = useMemo(() => {
    return coaches.reduce((acc, coach) => {
      acc[coach.id] = coach
      return acc
    }, {} as Record<string, Coach>)
  }, [coaches])

  // Sort classes
  const sortedClasses = useMemo(() => {
    return [...classes].sort((a, b) => {
      let aValue: string | number
      let bValue: string | number

      switch (sortField) {
        case 'name':
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
          break
        case 'date':
          aValue = new Date(a.date).getTime()
          bValue = new Date(b.date).getTime()
          break
        case 'startTime':
          aValue = a.startTime
          bValue = b.startTime
          break
        case 'program':
          aValue = programMap[a.programId]?.name.toLowerCase() || ''
          bValue = programMap[b.programId]?.name.toLowerCase() || ''
          break
        case 'coach':
          aValue = coachMap[a.coachId]?.name.toLowerCase() || ''
          bValue = coachMap[b.coachId]?.name.toLowerCase() || ''
          break
        case 'enrolled':
          aValue = a.enrolled
          bValue = b.enrolled
          break
        case 'status':
          aValue = a.status
          bValue = b.status
          break
        default:
          return 0
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
      return 0
    })
  }, [classes, sortField, sortDirection, programMap, coachMap])

  // Pagination
  const totalPages = Math.ceil(sortedClasses.length / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedClasses = sortedClasses.slice(startIndex, endIndex)

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      case 'completed':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-blue-100 text-blue-800'
    }
  }

  const SortButton = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center space-x-1 text-left font-medium text-gray-900 hover:text-gray-600 transition-colors"
    >
      <span>{children}</span>
      {sortField === field && (
        sortDirection === 'asc' ? 
          <ChevronUpIcon className="h-4 w-4" /> : 
          <ChevronDownIcon className="h-4 w-4" />
      )}
    </button>
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Classes ({sortedClasses.length})</CardTitle>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left">
                  <SortButton field="name">Class Name</SortButton>
                </th>
                <th className="px-4 py-3 text-left">
                  <SortButton field="program">Program</SortButton>
                </th>
                <th className="px-4 py-3 text-left">
                  <SortButton field="date">Date</SortButton>
                </th>
                <th className="px-4 py-3 text-left">
                  <SortButton field="startTime">Time</SortButton>
                </th>
                <th className="px-4 py-3 text-left">
                  <SortButton field="coach">Coach</SortButton>
                </th>
                <th className="px-4 py-3 text-left">
                  <SortButton field="enrolled">Capacity</SortButton>
                </th>
                <th className="px-4 py-3 text-left">Location</th>
                <th className="px-4 py-3 text-left">
                  <SortButton field="status">Status</SortButton>
                </th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedClasses.map((classItem) => {
                const program = programMap[classItem.programId]
                const coach = coachMap[classItem.coachId]

                return (
                  <tr key={classItem.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{classItem.name}</div>
                      {classItem.isRecurring && (
                        <div className="text-xs text-blue-600 flex items-center mt-1">
                          <CalendarIcon className="h-3 w-3 mr-1" />
                          Recurring
                        </div>
                      )}
                    </td>
                    
                    <td className="px-4 py-3">
                      {program && (
                        <div className="flex items-center space-x-2">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: program.color }}
                          />
                          <span className="text-sm text-gray-900">{program.name}</span>
                        </div>
                      )}
                    </td>
                    
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-900">{formatDate(classItem.date)}</div>
                    </td>
                    
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-900">
                        {formatTime(classItem.startTime)} - {formatTime(classItem.endTime)}
                      </div>
                    </td>
                    
                    <td className="px-4 py-3">
                      {coach && (
                        <div className="text-sm text-gray-900">{coach.name}</div>
                      )}
                    </td>
                    
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-gray-900">
                        {classItem.enrolled}/{classItem.capacity}
                      </div>
                      <div className="w-16 bg-gray-200 rounded-full h-1 mt-1">
                        <div 
                          className="h-1 rounded-full bg-blue-500 transition-all duration-300"
                          style={{ width: `${Math.min((classItem.enrolled / classItem.capacity) * 100, 100)}%` }}
                        />
                      </div>
                    </td>
                    
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-900 flex items-center">
                        <MapPinIcon className="h-3 w-3 mr-1 text-gray-400" />
                        {classItem.location}
                      </div>
                    </td>
                    
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(classItem.status)}`}>
                        {classItem.status.charAt(0).toUpperCase() + classItem.status.slice(1)}
                      </span>
                    </td>
                    
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onClassClick?.(classItem)}
                          className="p-1"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </Button>
                        {onEditClass && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEditClass(classItem)}
                            className="p-1"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </Button>
                        )}
                        {onDeleteClass && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDeleteClass(classItem)}
                            className="p-1 text-red-600 hover:text-red-800"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="border-t border-gray-200 px-4 py-3 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {startIndex + 1} to {Math.min(endIndex, sortedClasses.length)} of {sortedClasses.length} results
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeftIcon className="h-4 w-4" />
              </Button>
              
              <span className="text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRightIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}