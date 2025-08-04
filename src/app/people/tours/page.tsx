'use client';

import {
  Search,
  Calendar,
  Clock,
  User,
  Mail,
  MapPin,
  Plus,
  MoreVertical,
  CheckCircle,
  XCircle,
  AlertCircle,
  Users,
  UserCheck,
} from 'lucide-react';
import React, { useState, useMemo } from 'react';

import { mockTours } from '@/lib/mock-data';
import { Tour } from '@/lib/types';

export default function ToursPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);

  const filteredTours = useMemo(() => {
    let filtered = mockTours;

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        tour =>
          tour.prospectName.toLowerCase().includes(query) ||
          tour.prospectEmail.toLowerCase().includes(query) ||
          tour.assignedEmployee.name.toLowerCase().includes(query) ||
          tour.interests.some(interest => interest.toLowerCase().includes(query))
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(tour => tour.status === statusFilter);
    }

    // Sort by scheduled date and time
    return filtered.sort((a, b) => {
      const dateA = new Date(`${a.scheduledDate.toDateString()} ${a.scheduledTime}`);
      const dateB = new Date(`${b.scheduledDate.toDateString()} ${b.scheduledTime}`);
      return dateA.getTime() - dateB.getTime();
    });
  }, [searchQuery, statusFilter]);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };

  const getStatusColor = (status: Tour['status']) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'scheduled':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'completed':
        return 'bg-gray-50 text-gray-700 border-gray-200';
      case 'cancelled':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'no-show':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: Tour['status']) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className='h-4 w-4' />;
      case 'scheduled':
        return <Clock className='h-4 w-4' />;
      case 'completed':
        return <UserCheck className='h-4 w-4' />;
      case 'cancelled':
        return <XCircle className='h-4 w-4' />;
      case 'no-show':
        return <AlertCircle className='h-4 w-4' />;
      default:
        return <Clock className='h-4 w-4' />;
    }
  };

  const getTourTypeIcon = (type: Tour['tourType']) => {
    switch (type) {
      case 'individual':
        return <User className='h-4 w-4' />;
      case 'group':
        return <Users className='h-4 w-4' />;
      case 'family':
        return <Users className='h-4 w-4' />;
      default:
        return <User className='h-4 w-4' />;
    }
  };

  const handleStatusChange = (tourId: string, newStatus: Tour['status']) => {
    // In a real app, this would make an API call
    console.log(`Changing tour ${tourId} status to ${newStatus}`);
    setActiveDropdownId(null);
  };

  return (
    <div className='min-h-screen bg-white'>
      {/* Header */}
      <div className='bg-white border-b border-gray-200 px-6 py-4'>
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-2xl font-semibold text-gray-900'>Tours</h1>
            <p className='text-sm text-gray-500 mt-1'>
              Manage scheduled gym tours and prospect visits
            </p>
          </div>

          <button className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2'>
            <Plus className='h-4 w-4' />
            <span>Schedule Tour</span>
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className='px-6 py-4 bg-white border-b border-gray-200'>
        <div className='flex flex-col sm:flex-row gap-4 justify-between'>
          <div className='flex-1 max-w-md'>
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400' />
              <input
                type='text'
                placeholder='Search tours, prospects, or staff...'
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              />
            </div>
          </div>

          <div className='flex gap-2 flex-wrap'>
            {(['all', 'scheduled', 'confirmed', 'completed', 'cancelled'] as const).map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors border ${
                  statusFilter === status
                    ? 'bg-primary text-white border-primary'
                    : 'bg-surface text-secondary-text hover:bg-accent border-border hover:border-primary/30'
                }`}
              >
                {status === 'all' ? 'All Tours' : status.charAt(0).toUpperCase() + status.slice(1)}
                {status !== 'all' && (
                  <span className='ml-2 px-1.5 py-0.5 bg-white/20 rounded-full text-xs font-semibold'>
                    {filteredTours.filter(t => t.status === status).length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tours List */}
      <div className='px-6 py-4'>
        <div className='bg-white rounded-lg shadow overflow-hidden'>
          <div className='divide-y divide-gray-200'>
            {filteredTours.map(tour => (
              <div key={tour.id} className='p-6 hover:bg-gray-50 transition-colors'>
                <div className='flex items-start justify-between'>
                  {/* Main Tour Info */}
                  <div className='flex-1'>
                    <div className='flex items-start justify-between mb-4'>
                      <div className='flex items-center space-x-3'>
                        <div className='flex items-center space-x-2'>
                          {getTourTypeIcon(tour.tourType)}
                          <h3 className='text-sm font-medium text-gray-900'>{tour.prospectName}</h3>
                        </div>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full border ${getStatusColor(tour.status)}`}
                        >
                          {getStatusIcon(tour.status)}
                          <span className='ml-1'>
                            {tour.status.charAt(0).toUpperCase() + tour.status.slice(1)}
                          </span>
                        </span>
                      </div>

                      <div className='relative'>
                        <button
                          onClick={() =>
                            setActiveDropdownId(activeDropdownId === tour.id ? null : tour.id)
                          }
                          className='text-gray-400 hover:text-gray-600'
                        >
                          <MoreVertical className='h-5 w-5' />
                        </button>

                        {activeDropdownId === tour.id && (
                          <div className='absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10'>
                            <div className='py-1'>
                              <button
                                onClick={() => handleStatusChange(tour.id, 'confirmed')}
                                className='w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'
                              >
                                Mark as Confirmed
                              </button>
                              <button
                                onClick={() => handleStatusChange(tour.id, 'completed')}
                                className='w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'
                              >
                                Mark as Completed
                              </button>
                              <button
                                onClick={() => handleStatusChange(tour.id, 'cancelled')}
                                className='w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100'
                              >
                                Cancel Tour
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Tour Details Grid */}
                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4'>
                      {/* Date & Time */}
                      <div className='flex items-center space-x-2'>
                        <Calendar className='h-4 w-4 text-gray-400' />
                        <div>
                          <p className='text-sm text-gray-900'>{formatDate(tour.scheduledDate)}</p>
                          <p className='text-sm text-gray-500'>
                            {tour.scheduledTime} ({tour.duration} min)
                          </p>
                        </div>
                      </div>

                      {/* Contact Info */}
                      <div className='flex items-center space-x-2'>
                        <Mail className='h-4 w-4 text-gray-400' />
                        <div>
                          <p className='text-sm text-gray-900'>{tour.prospectEmail}</p>
                          <p className='text-sm text-gray-500'>{tour.prospectPhone}</p>
                        </div>
                      </div>

                      {/* Assigned Employee */}
                      <div className='flex items-center space-x-2'>
                        <User className='h-4 w-4 text-gray-400' />
                        <div>
                          <p className='text-sm text-gray-900'>{tour.assignedEmployee.name}</p>
                          <p className='text-sm text-gray-500'>Tour Guide</p>
                        </div>
                      </div>

                      {/* Tour Type & Source */}
                      <div className='flex items-center space-x-2'>
                        <MapPin className='h-4 w-4 text-gray-400' />
                        <div>
                          <p className='text-sm text-gray-900 capitalize'>{tour.tourType} Tour</p>
                          <p className='text-sm text-gray-500'>
                            via {tour.source.replace('-', ' ')}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Interests */}
                    {tour.interests.length > 0 && (
                      <div className='mb-3'>
                        <p className='text-sm text-gray-500 mb-2'>Interested in:</p>
                        <div className='flex flex-wrap gap-1'>
                          {tour.interests.map((interest, index) => (
                            <span
                              key={index}
                              className='inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full border bg-blue-50 text-blue-700 border-blue-200'
                            >
                              {interest}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Notes */}
                    {tour.notes ? <div className='bg-gray-50 rounded-lg p-3 mb-3'>
                        <p className='text-sm text-gray-500'>{tour.notes}</p>
                      </div> : null}

                    {/* Follow-up Date */}
                    {tour.followUpDate ? <div className='flex items-center space-x-2 text-sm text-gray-500'>
                        <Clock className='h-4 w-4' />
                        <span>Follow up: {formatDate(tour.followUpDate)}</span>
                      </div> : null}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredTours.length === 0 && (
            <div className='text-center py-12'>
              <Calendar className='h-12 w-12 text-gray-400 mx-auto mb-4' />
              <h3 className='text-lg font-medium text-gray-900 mb-2'>
                {searchQuery ? 'No tours match your search' : 'No tours scheduled'}
              </h3>
              <p className='text-gray-500 mb-6'>
                {searchQuery
                  ? `No tours found matching "${searchQuery}". Try adjusting your search or filters.`
                  : 'Schedule your first gym tour to start converting prospects into members.'}
              </p>
              {!searchQuery && (
                <button className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 mx-auto'>
                  <Plus className='h-4 w-4' />
                  <span>Schedule First Tour</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
