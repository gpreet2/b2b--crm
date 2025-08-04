'use client';

import {
  PlusIcon,
  MagnifyingGlassIcon,
  XCircleIcon,
  ListBulletIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  UserIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  BellIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import React, { useState, useMemo, useEffect } from 'react';

interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  isFirstTime: boolean;
  checkedIn: boolean;
  checkedInAt?: Date;
  autoCheckedIn?: boolean;
  kisiBadgeId?: string;
  status: 'checked-in' | 'registered' | 'no-show' | 'cancelled';
}

interface ClassItem {
  id: string;
  title: string;
  date: Date;
  startTime: string;
  endTime: string;
  coach: string;
  capacity: number;
  enrolledCount: number;
  status: string;
  category: string;
  program: string;
  isRecurring: boolean;
  recurrencePattern?: string;
  lastUpdated?: Date;
  students: Student[];
  isCompleted?: boolean;
}

export default function CalendarClassListPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [selectedClass, setSelectedClass] = useState<ClassItem | null>(null);
  const [rosterTab, setRosterTab] = useState<'checked-in' | 'registered' | 'missing'>('checked-in');
  const [showNotifications, setShowNotifications] = useState<string[]>([]);

  // Mock data for classes with students
  const classes: ClassItem[] = useMemo(() => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    return [
      {
        id: '1',
        title: 'Burn40',
        date: new Date(currentYear, currentMonth, 15, 6, 0),
        startTime: '06:00',
        endTime: '06:40',
        coach: 'Sarah Johnson',
        capacity: 20,
        enrolledCount: 18,
        status: 'active',
        category: 'Cardio',
        program: 'Burn40',
        isRecurring: true,
        recurrencePattern: 'Mon, Wed, Fri',
        lastUpdated: new Date(2024, 2, 15),
        students: [
          {
            id: 's1',
            name: 'Alex Thompson',
            email: 'alex@example.com',
            phone: '+1-555-0101',
            isFirstTime: false,
            checkedIn: true,
            checkedInAt: new Date(),
            autoCheckedIn: true,
            kisiBadgeId: 'K001',
            status: 'checked-in',
          },
          {
            id: 's2',
            name: 'Maria Garcia',
            email: 'maria@example.com',
            phone: '+1-555-0102',
            isFirstTime: true,
            checkedIn: true,
            checkedInAt: new Date(),
            status: 'checked-in',
          },
          {
            id: 's3',
            name: 'John Smith',
            email: 'john@example.com',
            phone: '+1-555-0103',
            isFirstTime: false,
            checkedIn: false,
            status: 'registered',
          },
          {
            id: 's4',
            name: 'Jane Davis',
            email: 'jane@example.com',
            phone: '+1-555-0104',
            isFirstTime: false,
            checkedIn: false,
            status: 'no-show',
          },
        ],
      },
      {
        id: '2',
        title: 'CrossFit',
        date: new Date(currentYear, currentMonth, 15, 7, 0),
        startTime: '07:00',
        endTime: '08:00',
        coach: 'Mike Chen',
        capacity: 15,
        enrolledCount: 12,
        status: 'active',
        category: 'Strength',
        program: 'CrossFit',
        isRecurring: true,
        recurrencePattern: 'Mon, Wed, Fri',
        lastUpdated: new Date(2024, 2, 12),
        students: [
          {
            id: 's5',
            name: 'Emily Wilson',
            email: 'emily@example.com',
            phone: '+1-555-0105',
            isFirstTime: false,
            checkedIn: true,
            status: 'checked-in',
          },
          {
            id: 's6',
            name: 'David Brown',
            email: 'david@example.com',
            phone: '+1-555-0106',
            isFirstTime: true,
            checkedIn: false,
            status: 'registered',
          },
        ],
      },
      // ... other classes
    ];
  }, []);

  // Simulate Kisi door unlock auto check-in
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate random auto check-ins for demo
      if (Math.random() > 0.95 && selectedClass) {
        const unCheckedStudents = selectedClass.students.filter(s => !s.checkedIn && s.kisiBadgeId);
        if (unCheckedStudents.length > 0) {
          const randomStudent =
            unCheckedStudents[Math.floor(Math.random() * unCheckedStudents.length)];
          randomStudent.checkedIn = true;
          randomStudent.checkedInAt = new Date();
          randomStudent.autoCheckedIn = true;
          randomStudent.status = 'checked-in';
          // This would trigger a re-render in a real app
        }
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [selectedClass]);

  // Filter classes based on search and active tab
  const filteredClasses = useMemo(() => {
    let filtered = classes;

    if (searchQuery) {
      filtered = filtered.filter(
        classItem =>
          classItem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          classItem.coach.toLowerCase().includes(searchQuery.toLowerCase()) ||
          classItem.program.toLowerCase().includes(searchQuery.toLowerCase()) ||
          classItem.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (activeTab === 'active') {
      filtered = filtered.filter(classItem => classItem.status === 'active');
    } else if (activeTab === 'inactive') {
      filtered = filtered.filter(classItem => classItem.status === 'inactive');
    }

    return filtered;
  }, [classes, searchQuery, activeTab]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30';
      case 'inactive':
        return 'bg-gray-500/20 text-gray-500 border-gray-500/30';
      default:
        return 'bg-gray-500/20 text-gray-500 border-gray-500/30';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'inactive':
        return 'Inactive';
      default:
        return 'Unknown';
    }
  };

  const getProgramColor = (program: string) => {
    switch (program) {
      case 'Burn40':
        return '#ef4444';
      case 'CrossFit':
        return '#06b6d4';
      case 'BurnDumbells':
        return '#10b981';
      default:
        return '#6b7280';
    }
  };

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
    return `${Math.floor(diffInMinutes / 1440)} days ago`;
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const handleClassClick = (classItem: ClassItem) => {
    setSelectedClass(classItem);
    setRosterTab('checked-in');
  };

  const closeRosterModal = () => {
    setSelectedClass(null);
  };

  const handleNotifyFirstTime = (studentId: string) => {
    setShowNotifications([...showNotifications, studentId]);
    // In real app, this would send a notification
    setTimeout(() => {
      setShowNotifications(prev => prev.filter(id => id !== studentId));
    }, 3000);
  };

  const handleCompleteClass = (classId: string) => {
    const classData = classes.find(c => c.id === classId);
    if (classData) {
      classData.isCompleted = true;
      // Trigger post-class flows
      alert('Class completed! Post-class flows triggered.');
      setSelectedClass(null); // Close modal
    }
  };

  const getStudentsByTab = (classData: ClassItem) => {
    switch (rosterTab) {
      case 'checked-in':
        return classData.students.filter(s => s.checkedIn);
      case 'registered':
        return classData.students.filter(s => !s.checkedIn && s.status === 'registered');
      case 'missing':
        return classData.students.filter(
          s => s.status === 'no-show' || (!s.checkedIn && s.status !== 'registered')
        );
      default:
        return [];
    }
  };

  const getStudentStatusColor = (status: string) => {
    switch (status) {
      case 'checked-in':
        return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      case 'registered':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'no-show':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className='p-6 space-y-6 bg-background min-h-screen'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-light text-primary-text mb-1'>CLASSES</h1>
          <p className='text-secondary-text font-light'>Manage your scheduled classes</p>
        </div>

        <button
          onClick={() => {
            /* Add class modal */
          }}
          className='px-6 py-3 bg-primary text-white rounded-xl font-light text-sm hover:bg-primary-dark transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl'
        >
          <PlusIcon className='h-4 w-4' />
          <span>Schedule Class</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className='flex items-center space-x-4'>
        <div className='relative flex-1 max-w-md'>
          <MagnifyingGlassIcon className='absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-secondary-text' />
          <input
            type='text'
            placeholder='Search classes, programs, or coaches...'
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className='w-full pl-12 pr-4 py-3 bg-accent border border-border rounded-xl text-primary-text placeholder-secondary-text focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200'
          />
          {searchQuery ? <button
              onClick={() => setSearchQuery('')}
              className='absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-accent/80 rounded-full transition-colors'
            >
              <XCircleIcon className='h-4 w-4 text-secondary-text' />
            </button> : null}
        </div>

        <div className='flex bg-accent rounded-xl p-1 border border-border-light'>
          {[
            { value: 'all', label: 'ALL CLASSES', count: classes.length },
            {
              value: 'active',
              label: 'ACTIVE',
              count: classes.filter(c => c.status === 'active').length,
            },
            {
              value: 'inactive',
              label: 'INACTIVE',
              count: classes.filter(c => c.status === 'inactive').length,
            },
          ].map(tab => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`px-4 py-2 rounded-lg font-light text-sm transition-all duration-200 ${
                activeTab === tab.value
                  ? 'bg-primary text-white shadow-lg'
                  : 'text-secondary-text hover:text-primary-text hover:bg-accent/80'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Modern Table */}
      <div className='bg-surface/95 backdrop-blur-sm border border-border rounded-2xl overflow-hidden shadow-lg'>
        {/* Table Header */}
        <div className='grid grid-cols-7 gap-4 px-6 py-4 bg-accent border-b border-border'>
          <div className='text-sm font-light text-secondary-text uppercase tracking-wider'>
            PROGRAM
          </div>
          <div className='text-sm font-light text-secondary-text uppercase tracking-wider'>
            CATEGORY
          </div>
          <div className='text-sm font-light text-secondary-text uppercase tracking-wider'>
            STATUS
          </div>
          <div className='text-sm font-light text-secondary-text uppercase tracking-wider'>
            COACH
          </div>
          <div className='text-sm font-light text-secondary-text uppercase tracking-wider'>
            ENROLLMENT
          </div>
          <div className='text-sm font-light text-secondary-text uppercase tracking-wider'>
            TIME
          </div>
          <div className='text-sm font-light text-secondary-text uppercase tracking-wider'>
            ACTIONS
          </div>
        </div>

        {/* Table Body */}
        <div className='divide-y divide-border'>
          {filteredClasses.length === 0 ? (
            <div className='px-6 py-12 text-center'>
              <ListBulletIcon className='h-12 w-12 text-secondary-text mx-auto mb-4' />
              <h3 className='text-lg font-light text-primary-text mb-2'>No classes found</h3>
              <p className='text-sm text-secondary-text'>
                {searchQuery
                  ? `No classes match "${searchQuery}"`
                  : `No ${activeTab === 'all' ? '' : activeTab} classes available`}
              </p>
            </div>
          ) : (
            filteredClasses.map(classItem => (
              <div key={classItem.id}>
                {/* Main Class Row */}
                <div
                  className='grid grid-cols-7 gap-4 px-6 py-4 hover:bg-accent transition-colors cursor-pointer'
                  onClick={() => handleClassClick(classItem)}
                >
                  {/* PROGRAM */}
                  <div className='flex items-center space-x-3'>
                    <div
                      className='w-3 h-3 rounded-full shadow-sm'
                      style={{ backgroundColor: getProgramColor(classItem.program) }}
                    />
                    <div>
                      <div className='font-medium text-primary-text'>{classItem.program}</div>
                      <div className='text-sm text-secondary-text'>
                        {formatTime(classItem.startTime)} - {formatTime(classItem.endTime)}
                      </div>
                    </div>
                  </div>

                  {/* CATEGORY */}
                  <div className='flex items-center'>
                    <span className='text-sm text-secondary-text'>{classItem.category}</span>
                  </div>

                  {/* STATUS */}
                  <div className='flex items-center'>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(classItem.status)}`}
                    >
                      {getStatusText(classItem.status)}
                    </span>
                  </div>

                  {/* COACH */}
                  <div className='flex items-center'>
                    <span className='text-sm text-secondary-text'>{classItem.coach}</span>
                  </div>

                  {/* ENROLLMENT */}
                  <div className='flex items-center'>
                    <div className='flex items-center space-x-2'>
                      <span className='text-sm font-medium text-primary-text'>
                        {classItem.enrolledCount}/{classItem.capacity}
                      </span>
                      <div className='w-16 bg-accent rounded-full h-2 border border-border-light'>
                        <div
                          className='h-2 rounded-full bg-gradient-to-r from-primary to-primary-dark transition-all duration-500'
                          style={{
                            width: `${(classItem.enrolledCount / classItem.capacity) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* TIME */}
                  <div className='flex items-center'>
                    <span className='text-sm text-secondary-text'>
                      {classItem.lastUpdated ? getTimeAgo(classItem.lastUpdated) : '—'}
                    </span>
                  </div>

                  {/* ACTIONS */}
                  <div className='flex items-center space-x-2' onClick={e => e.stopPropagation()}>
                    <button className='p-2 rounded-lg hover:bg-accent/80 transition-colors text-secondary-text hover:text-primary-text'>
                      <PencilIcon className='h-4 w-4' />
                    </button>
                    <button className='p-2 rounded-lg hover:bg-accent/80 transition-colors text-secondary-text hover:text-primary-text'>
                      <EyeIcon className='h-4 w-4' />
                    </button>
                    <button className='p-2 rounded-lg hover:bg-red-500/20 transition-colors text-secondary-text hover:text-red-500'>
                      <TrashIcon className='h-4 w-4' />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Roster Modal */}
      {selectedClass ? <div className='fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4'>
          <div className='bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden'>
            {/* Modal Header */}
            <div className='px-6 py-4 border-b border-gray-200 flex items-center justify-between'>
              <div className='flex items-center space-x-3'>
                <div
                  className='w-4 h-4 rounded-full'
                  style={{ backgroundColor: getProgramColor(selectedClass.program) }}
                />
                <div>
                  <h2 className='text-xl font-semibold text-gray-900'>
                    {selectedClass.program} Roster
                  </h2>
                  <p className='text-sm text-gray-500'>
                    {formatTime(selectedClass.startTime)} - {formatTime(selectedClass.endTime)} •{' '}
                    {selectedClass.coach}
                  </p>
                </div>
              </div>
              <div className='flex items-center space-x-3'>
                {!selectedClass.isCompleted && (
                  <button
                    onClick={() => handleCompleteClass(selectedClass.id)}
                    className='px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors flex items-center space-x-2'
                  >
                    <CheckCircleIcon className='h-4 w-4' />
                    <span>Complete Class</span>
                  </button>
                )}
                <button
                  onClick={closeRosterModal}
                  className='p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors'
                >
                  <XMarkIcon className='h-5 w-5' />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className='px-6 py-4 overflow-y-auto max-h-[calc(90vh-120px)]'>
              {/* Roster Tabs */}
              <div className='flex space-x-1 mb-6 bg-gray-100 rounded-lg p-1'>
                {[
                  {
                    value: 'checked-in',
                    label: 'Checked In',
                    count: selectedClass.students.filter(s => s.checkedIn).length,
                    icon: CheckCircleIcon,
                  },
                  {
                    value: 'registered',
                    label: 'Registered',
                    count: selectedClass.students.filter(
                      s => !s.checkedIn && s.status === 'registered'
                    ).length,
                    icon: UserIcon,
                  },
                  {
                    value: 'missing',
                    label: 'Missing/Absent',
                    count: selectedClass.students.filter(
                      s => s.status === 'no-show' || (!s.checkedIn && s.status !== 'registered')
                    ).length,
                    icon: ExclamationTriangleIcon,
                  },
                ].map(tab => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.value}
                      onClick={() =>
                        setRosterTab(tab.value as 'checked-in' | 'registered' | 'missing')
                      }
                      className={`px-4 py-2 rounded-md font-medium text-sm transition-all duration-200 flex items-center space-x-2 ${
                        rosterTab === tab.value
                          ? 'bg-primary text-white shadow-sm'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                      }`}
                    >
                      <Icon className='h-4 w-4' />
                      <span>{tab.label}</span>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          rosterTab === tab.value
                            ? 'bg-white/20 text-white'
                            : 'bg-gray-300 text-gray-700'
                        }`}
                      >
                        {tab.count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Student List */}
              <div className='space-y-3'>
                {getStudentsByTab(selectedClass).map(student => (
                  <div
                    key={student.id}
                    className='bg-gray-50 rounded-lg p-4 border border-gray-200 flex items-center justify-between'
                  >
                    <div className='flex items-center space-x-3'>
                      <div className='flex-shrink-0'>
                        <div className='w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center'>
                          <UserIcon className='h-5 w-5 text-primary' />
                        </div>
                      </div>
                      <div>
                        <div className='flex items-center space-x-2'>
                          <h4 className='font-medium text-gray-900'>{student.name}</h4>
                          {student.isFirstTime ? <span className='px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full'>
                              First Time
                            </span> : null}
                          {student.autoCheckedIn ? <span className='px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full'>
                              Auto Check-in
                            </span> : null}
                        </div>
                        <div className='text-sm text-gray-600'>
                          {student.email} • {student.phone}
                        </div>
                        {student.checkedInAt ? <div className='flex items-center space-x-1 text-xs text-gray-500 mt-1'>
                            <ClockIcon className='h-3 w-3' />
                            <span>Checked in {getTimeAgo(student.checkedInAt)}</span>
                          </div> : null}
                      </div>
                    </div>

                    <div className='flex items-center space-x-2'>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium border ${getStudentStatusColor(student.status)}`}
                      >
                        {student.status.replace('-', ' ').toUpperCase()}
                      </span>

                      {student.isFirstTime && !showNotifications.includes(student.id) ? <button
                          onClick={() => handleNotifyFirstTime(student.id)}
                          className='p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors'
                          title='Notify first-time student'
                        >
                          <BellIcon className='h-4 w-4' />
                        </button> : null}

                      {showNotifications.includes(student.id) && (
                        <div className='px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full'>
                          Notified ✓
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {getStudentsByTab(selectedClass).length === 0 && (
                  <div className='text-center py-12 text-gray-500'>
                    <UserIcon className='h-12 w-12 mx-auto mb-3 opacity-30' />
                    <p>No students in this category</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div> : null}
    </div>
  );
}
