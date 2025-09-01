'use client';

import {
  Search,
  User,
  Clock,
  CreditCard,
  CheckCircle,
  Calendar,
  X,
  Ticket,
  MoreVertical,
  Loader,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import React, { useState, useMemo, useEffect } from 'react';
import { useClients } from '@/hooks/useClients';
import type { ClientDTO } from '@/types/generated/client.types';

interface DayPass {
  id: string;
  name: string;
  email: string;
  phone: string;
  purchasedAt: Date;
  expiresAt: Date;
  accessCode: string;
  paymentStatus: 'pending' | 'completed' | 'failed';
  amount: number;
}

export default function ClientsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClient, setSelectedClient] = useState<ClientDTO | null>(null);
  const [showDayPassModal, setShowDayPassModal] = useState(false);
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [dayPassForm, setDayPassForm] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Use the custom hook for client data
  const {
    clients,
    loading,
    error,
    pagination,
    setPage,
    setSearch,
    setStatus,
    refetch
  } = useClients({
    page: 1,
    limit: 20,
    search: searchQuery,
    status: statusFilter
  });

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchQuery);
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [searchQuery, setSearch]);

  // Handle status filter changes
  const handleStatusFilterChange = (newStatus: string) => {
    setStatusFilter(newStatus);
    setStatus(newStatus);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
      case 'expired':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'suspended':
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateValue: string | number | null | undefined) => {
    if (!dateValue) return 'N/A';
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return 'Invalid Date';
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };

  const getTimeAgo = (dateValue: string | number | null | undefined) => {
    if (!dateValue) return 'Never';
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return 'Never';
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return formatDate(dateValue);
  };

  const handleManualCheckIn = (clientId: string) => {
    // In real app, this would make an API call
    console.warn(`Client ${clientId} checked in successfully!`);
    setActiveDropdownId(null);
  };

  const handleViewClasses = (client: ClientDTO) => {
    setSelectedClient(client);
    setActiveDropdownId(null);
  };

  const getClientFullName = (client: ClientDTO) => {
    return `${client.firstName || ''} ${client.lastName || ''}`.trim() || 'Unknown';
  };

  const generateAccessCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const handleDayPassSubmit = async () => {
    setIsProcessingPayment(true);

    // Simulate payment processing
    setTimeout(() => {
      const newDayPass: DayPass = {
        id: Date.now().toString(),
        name: dayPassForm.name,
        email: dayPassForm.email,
        phone: dayPassForm.phone,
        purchasedAt: new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        accessCode: generateAccessCode(),
        paymentStatus: 'completed',
        amount: 25,
      };

      setIsProcessingPayment(false);
      console.warn(`Day pass created! Access code: ${newDayPass.accessCode}`);
      setShowDayPassModal(false);
      setDayPassForm({ name: '', email: '', phone: '' });
    }, 2000);
  };

  return (
    <div className='min-h-screen bg-white'>
      {/* Header */}
      <div className='bg-white border-b border-gray-200 px-6 py-4'>
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-2xl font-semibold text-gray-900'>Clients</h1>
            <p className='text-sm text-gray-500 mt-1'>Manage members and day passes</p>
          </div>

          <button
            onClick={() => setShowDayPassModal(true)}
            className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2'
          >
            <Ticket className='h-4 w-4' />
            <span>Sell Day Pass</span>
          </button>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className='px-6 py-4 bg-white border-b border-gray-200'>
        <div className='flex flex-col sm:flex-row gap-4'>
          <div className='relative flex-1 max-w-md'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400' />
            <input
              type='text'
              placeholder='Search clients...'
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
            />
          </div>
          <div className='flex gap-2'>
            <select
              value={statusFilter}
              onChange={e => handleStatusFilterChange(e.target.value)}
              className='px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
            >
              <option value=''>All Status</option>
              <option value='active'>Active</option>
              <option value='inactive'>Inactive</option>
              <option value='pending'>Pending</option>
              <option value='suspended'>Suspended</option>
              <option value='expired'>Expired</option>
            </select>
            {error && (
              <button
                onClick={() => refetch()}
                className='px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors flex items-center gap-1'
              >
                <AlertCircle className='h-4 w-4' />
                Retry
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className='px-6 py-4'>
          <div className='bg-red-50 border border-red-200 rounded-lg p-4'>
            <div className='flex items-center'>
              <AlertCircle className='h-5 w-5 text-red-400 mr-3' />
              <div>
                <h3 className='text-sm font-medium text-red-800'>Error loading clients</h3>
                <p className='text-sm text-red-700 mt-1'>{error}</p>
              </div>
              <button
                onClick={() => refetch()}
                className='ml-auto px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200'
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className='px-6 py-8 flex items-center justify-center'>
          <Loader className='h-8 w-8 animate-spin text-blue-600' />
          <span className='ml-3 text-gray-600'>Loading clients...</span>
        </div>
      )}

      {/* Clients Table */}
      {!loading && !error && (
        <div className='px-6 py-4'>
          <div className='bg-white rounded-lg shadow overflow-hidden'>
            <table className='min-w-full divide-y divide-gray-200'>
              <thead className='bg-gray-50'>
                <tr>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Client
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Contact
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Membership
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Last Visit
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
                {clients.length === 0 ? (
                  <tr>
                    <td colSpan={6} className='px-6 py-8 text-center text-gray-500'>
                      No clients found. {searchQuery || statusFilter ? 'Try adjusting your search or filters.' : 'Add your first client to get started.'}
                    </td>
                  </tr>
                ) : (
                  clients.map(client => (
                    <tr key={client._id} className='hover:bg-gray-50'>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <div className='flex items-center'>
                          <div className='h-10 w-10 flex-shrink-0'>
                            <div className='h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center'>
                              <User className='h-5 w-5 text-gray-600' />
                            </div>
                          </div>
                          <div className='ml-4'>
                            <div className='text-sm font-medium text-gray-900'>{getClientFullName(client)}</div>
                            <div className='text-sm text-gray-500'>
                              Member since {formatDate(client.membershipStartDate)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <div className='text-sm text-gray-900'>{client.email}</div>
                        <div className='text-sm text-gray-500'>{client.phone || 'No phone'}</div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <div className='text-sm text-gray-900'>{client.membershipType || 'Unknown'}</div>
                        <div className='text-sm text-gray-500'>
                          Active membership
                        </div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                        {getTimeAgo(client.updatedAt)}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(client.membershipType || 'unknown')}`}
                        >
                          {client.membershipType || 'unknown'}
                        </span>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium'>
                        <div className='relative'>
                          <button
                            onClick={() =>
                              setActiveDropdownId(activeDropdownId === client.id ? null : client.id)
                            }
                            className='text-gray-400 hover:text-gray-600'
                          >
                            <MoreVertical className='h-5 w-5' />
                          </button>

                          {activeDropdownId === client.id && (
                            <div className='absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10'>
                              <div className='py-1'>
                                <button
                                  onClick={() => handleManualCheckIn(client.id)}
                                  className='w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2'
                                >
                                  <CheckCircle className='h-4 w-4' />
                                  <span>Manual Check-in</span>
                                </button>
                                <button
                                  onClick={() => handleViewClasses(client)}
                                  className='w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2'
                                >
                                  <Calendar className='h-4 w-4' />
                                  <span>View Classes</span>
                                </button>
                                <button className='w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2'>
                                  <User className='h-4 w-4' />
                                  <span>View Profile</span>
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className='bg-white px-4 py-3 border-t border-gray-200 flex items-center justify-between sm:px-6'>
              <div className='flex-1 flex justify-between items-center'>
                <div className='text-sm text-gray-700'>
                  Showing <span className='font-medium'>{((pagination.page - 1) * pagination.limit) + 1}</span> to{' '}
                  <span className='font-medium'>
                    {Math.min(pagination.page * pagination.limit, pagination.total)}
                  </span>{' '}
                  of <span className='font-medium'>{pagination.total}</span> results
                </div>
                <div className='flex items-center space-x-2'>
                  <button
                    onClick={() => pagination.hasPreviousPage && setPage(pagination.page - 1)}
                    disabled={!pagination.hasPreviousPage}
                    className={`relative inline-flex items-center px-2 py-2 rounded-md text-sm font-medium ${
                      pagination.hasPreviousPage
                        ? 'bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-700 border border-gray-300'
                        : 'bg-gray-100 text-gray-300 border border-gray-200 cursor-not-allowed'
                    }`}
                  >
                    <ChevronLeft className='h-5 w-5' />
                    <span className='sr-only'>Previous</span>
                  </button>
                  <span className='text-sm text-gray-700'>
                    Page {pagination.page} of {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => pagination.hasNextPage && setPage(pagination.page + 1)}
                    disabled={!pagination.hasNextPage}
                    className={`relative inline-flex items-center px-2 py-2 rounded-md text-sm font-medium ${
                      pagination.hasNextPage
                        ? 'bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-700 border border-gray-300'
                        : 'bg-gray-100 text-gray-300 border border-gray-200 cursor-not-allowed'
                    }`}
                  >
                    <ChevronRight className='h-5 w-5' />
                    <span className='sr-only'>Next</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Client Details Modal */}
      {selectedClient && (
        <div className='fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50'>
          <div className='bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden'>
            <div className='px-6 py-4 border-b border-gray-200'>
              <div className='flex items-center justify-between'>
                <h2 className='text-lg font-medium text-gray-900'>
                  Client Details: {getClientFullName(selectedClient)}
                </h2>
                <button
                  onClick={() => setSelectedClient(null)}
                  className='text-gray-400 hover:text-gray-500'
                >
                  <X className='h-6 w-6' />
                </button>
              </div>
            </div>

            <div className='px-6 py-4 overflow-y-auto max-h-[60vh]'>
              <div className='space-y-4'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700'>Email</label>
                    <p className='mt-1 text-sm text-gray-900'>{selectedClient.email}</p>
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700'>Status</label>
                    <span className={`mt-1 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedClient.membershipType || 'unknown')}`}>
                      {selectedClient.membershipType || 'unknown'}
                    </span>
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700'>Joined</label>
                    <p className='mt-1 text-sm text-gray-900'>{formatDate(selectedClient.membershipStartDate)}</p>
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700'>Last Visit</label>
                    <p className='mt-1 text-sm text-gray-900'>{getTimeAgo(selectedClient.updatedAt)}</p>
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700'>Total Visits</label>
                    <p className='mt-1 text-sm text-gray-900'>0</p>
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700'>Emergency Contact</label>
                    <p className='mt-1 text-sm text-gray-900'>{selectedClient.phone || 'None'}</p>
                  </div>
                </div>
                {selectedClient.notes && (
                  <div>
                    <label className='block text-sm font-medium text-gray-700'>Notes</label>
                    <p className='mt-1 text-sm text-gray-900'>{selectedClient.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Day Pass Modal */}
      {showDayPassModal && (
        <div className='fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50'>
          <div className='bg-white rounded-lg max-w-md w-full'>
            <div className='px-6 py-4 border-b border-gray-200'>
              <div className='flex items-center justify-between'>
                <div>
                  <h2 className='text-lg font-medium text-gray-900'>Sell Day Pass</h2>
                  <p className='text-sm text-gray-500'>24-hour gym access</p>
                </div>
                <button
                  onClick={() => setShowDayPassModal(false)}
                  className='text-gray-400 hover:text-gray-500'
                >
                  <X className='h-6 w-6' />
                </button>
              </div>
            </div>

            <div className='px-6 py-4'>
              <div className='space-y-4'>
                <div>
                  <label htmlFor='name' className='block text-sm font-medium text-gray-700'>
                    Name
                  </label>
                  <input
                    type='text'
                    id='name'
                    value={dayPassForm.name}
                    onChange={e => setDayPassForm({ ...dayPassForm, name: e.target.value })}
                    className='mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                    placeholder='John Doe'
                  />
                </div>

                <div>
                  <label htmlFor='email' className='block text-sm font-medium text-gray-700'>
                    Email
                  </label>
                  <input
                    type='email'
                    id='email'
                    value={dayPassForm.email}
                    onChange={e => setDayPassForm({ ...dayPassForm, email: e.target.value })}
                    className='mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                    placeholder='john@example.com'
                  />
                </div>

                <div>
                  <label htmlFor='phone' className='block text-sm font-medium text-gray-700'>
                    Phone (optional)
                  </label>
                  <input
                    type='tel'
                    id='phone'
                    value={dayPassForm.phone}
                    onChange={e => setDayPassForm({ ...dayPassForm, phone: e.target.value })}
                    className='mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                    placeholder='(555) 555-5555'
                  />
                </div>

                <div className='bg-gray-50 rounded-lg p-4'>
                  <div className='flex items-center justify-between'>
                    <span className='text-sm font-medium text-gray-900'>Day Pass (24 hours)</span>
                    <span className='text-lg font-semibold text-gray-900'>$25.00</span>
                  </div>
                  <p className='text-xs text-gray-500 mt-1'>
                    Access expires 24 hours after purchase
                  </p>
                </div>
              </div>
            </div>

            <div className='px-6 py-4 border-t border-gray-200'>
              <button
                onClick={handleDayPassSubmit}
                disabled={!dayPassForm.name || !dayPassForm.email || isProcessingPayment}
                className='w-full bg-blue-600 text-white rounded-md py-2 px-4 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2'
              >
                {isProcessingPayment ? (
                  <>
                    <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white' />
                    <span>Processing Payment...</span>
                  </>
                ) : (
                  <>
                    <CreditCard className='h-4 w-4' />
                    <span>Process with Square/Stripe</span>
                  </>
                )}
              </button>
              {!isProcessingPayment && (
                <p className='text-xs text-gray-500 text-center mt-2'>
                  Day pass active for 24 hours after purchase
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
