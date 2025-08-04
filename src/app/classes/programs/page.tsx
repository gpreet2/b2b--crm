'use client';

import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  XCircleIcon,
  ListBulletIcon,
} from '@heroicons/react/24/outline';
import React, { useState, useMemo } from 'react';

import { Button } from '@/components/ui/Button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/Dialog';
import { Input } from '@/components/ui/Input';

interface Program {
  id: string;
  name: string;
  description: string;
  color: string;
  category: string;
  duration: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  isActive: boolean;
  coach?: string;
  capacity?: number;
  location?: string;
  lastUpdated?: Date;
}

export default function ProgramsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState<Program | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#ef4444',
    category: '',
    duration: '45 min',
    difficulty: 'intermediate' as 'beginner' | 'intermediate' | 'advanced',
    coach: '',
    capacity: 20,
    location: '',
  });

  // Mock data for programs - Only the three specific programs
  const programs: Program[] = useMemo(
    () => [
      {
        id: '1',
        name: 'Burn40',
        description: 'High-intensity interval training for maximum calorie burn',
        color: '#ef4444',
        category: 'Cardio',
        duration: '40 min',
        difficulty: 'intermediate',
        isActive: true,
        coach: 'Sarah Johnson',
        capacity: 20,
        location: 'Studio A',
        lastUpdated: new Date(2024, 2, 15),
      },
      {
        id: '2',
        name: 'CrossFit',
        description: 'Functional fitness with varied, high-intensity movements',
        color: '#06b6d4',
        category: 'Strength',
        duration: '60 min',
        difficulty: 'advanced',
        isActive: true,
        coach: 'Mike Chen',
        capacity: 15,
        location: 'Weight Room',
        lastUpdated: new Date(2024, 2, 12),
      },
      {
        id: '3',
        name: 'BurnDumbells',
        description: 'Strength training with dumbbells for muscle building',
        color: '#10b981',
        category: 'Strength',
        duration: '60 min',
        difficulty: 'intermediate',
        isActive: true,
        coach: 'Emma Davis',
        capacity: 20,
        location: 'Weight Room',
        lastUpdated: new Date(2024, 2, 10),
      },
    ],
    []
  );

  // Filter programs based on search and active tab
  const filteredPrograms = useMemo(() => {
    let filtered = programs;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        program =>
          program.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          program.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          program.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (program.coach?.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Filter by active tab
    if (activeTab === 'active') {
      filtered = filtered.filter(program => program.isActive);
    } else if (activeTab === 'inactive') {
      filtered = filtered.filter(program => !program.isActive);
    }

    return filtered;
  }, [programs, searchQuery, activeTab]);

  const handleCreateProgram = () => {
    if (formData.name && formData.description && formData.category) {
      // In a real app, you'd update the state here
      handleCloseModal();
    }
  };

  const handleEditProgram = () => {
    if (editingProgram && formData.name && formData.description && formData.category) {
      // In a real app, you'd update the state here
      handleCloseModal();
    }
  };

  const handleDeleteProgram = (id: string) => {
    // In a real app, you'd update the state here
    console.log('Delete program:', id);
  };

  const handleToggleActive = (id: string) => {
    // In a real app, you'd update the state here
    console.log('Toggle active:', id);
  };

  const handleCloseModal = () => {
    setIsCreateModalOpen(false);
    setEditingProgram(null);
    setFormData({
      name: '',
      description: '',
      color: '#ef4444',
      category: '',
      duration: '45 min',
      difficulty: 'intermediate',
      coach: '',
      capacity: 20,
      location: '',
    });
  };

  const handleEditClick = (program: Program) => {
    setEditingProgram(program);
    setFormData({
      name: program.name,
      description: program.description,
      color: program.color,
      category: program.category,
      duration: program.duration,
      difficulty: program.difficulty as 'intermediate',
      coach: program.coach || '',
      capacity: program.capacity || 20,
      location: program.location || '',
    });
    setIsCreateModalOpen(true);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30';
      case 'intermediate':
        return 'bg-amber-500/20 text-amber-500 border-amber-500/30';
      case 'advanced':
        return 'bg-red-500/20 text-red-500 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-500 border-gray-500/30';
    }
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive
      ? 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30'
      : 'bg-gray-500/20 text-gray-500 border-gray-500/30';
  };

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
    return `${Math.floor(diffInMinutes / 1440)} days ago`;
  };

  // const totalPrograms = programs.length
  // const activePrograms = programs.filter(p => p.isActive).length

  return (
    <div className='p-6 space-y-6 bg-background min-h-screen'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-light text-primary-text mb-1'>PROGRAM TEMPLATES</h1>
          <p className='text-secondary-text font-light'>
            Manage program templates for your classes
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className='px-6 py-3 bg-primary text-white rounded-xl font-light text-sm hover:bg-primary-dark transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl'
        >
          <PlusIcon className='h-4 w-4' />
          <span>Create Program</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className='flex items-center space-x-4'>
        <div className='relative flex-1 max-w-md'>
          <MagnifyingGlassIcon className='absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-secondary-text' />
          <input
            type='text'
            placeholder='Search programs, coaches, or categories...'
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
            { value: 'all', label: 'ALL PROGRAMS', count: programs.length },
            { value: 'active', label: 'ACTIVE', count: programs.filter(p => p.isActive).length },
            {
              value: 'inactive',
              label: 'INACTIVE',
              count: programs.filter(p => !p.isActive).length,
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
            LAST UPDATED
          </div>
          <div className='text-sm font-light text-secondary-text uppercase tracking-wider'>
            DIFFICULTY
          </div>
          <div className='text-sm font-light text-secondary-text uppercase tracking-wider'>
            ACTIONS
          </div>
        </div>

        {/* Table Body */}
        <div className='divide-y divide-border'>
          {filteredPrograms.length === 0 ? (
            <div className='px-6 py-12 text-center'>
              <ListBulletIcon className='h-12 w-12 text-secondary-text mx-auto mb-4' />
              <h3 className='text-lg font-light text-primary-text mb-2'>No programs found</h3>
              <p className='text-sm text-secondary-text'>
                {searchQuery
                  ? `No programs match "${searchQuery}"`
                  : `No ${activeTab === 'all' ? '' : activeTab} programs available`}
              </p>
            </div>
          ) : (
            filteredPrograms.map((program, index) => (
              <div
                key={program.id}
                className={`grid grid-cols-7 gap-4 px-6 py-4 hover:bg-accent transition-colors ${
                  index < filteredPrograms.length - 1 ? 'border-b border-border-light' : ''
                }`}
              >
                {/* Program Name */}
                <div className='flex items-center space-x-3'>
                  <div
                    className='w-3 h-3 rounded-full shadow-sm'
                    style={{ backgroundColor: program.color }}
                  />
                  <div>
                    <div className='font-medium text-primary-text'>{program.name}</div>
                    <div className='text-sm text-secondary-text'>{program.duration}</div>
                  </div>
                </div>

                {/* Category */}
                <div className='flex items-center'>
                  <span className='text-sm text-secondary-text'>{program.category}</span>
                </div>

                {/* Status */}
                <div className='flex items-center'>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(program.isActive)}`}
                  >
                    {program.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                {/* Coach */}
                <div className='flex items-center'>
                  <span className='text-sm text-secondary-text'>{program.coach || '—'}</span>
                </div>

                {/* Last Updated */}
                <div className='flex items-center'>
                  <span className='text-sm text-secondary-text'>
                    {program.lastUpdated ? getTimeAgo(program.lastUpdated) : '—'}
                  </span>
                </div>

                {/* Difficulty */}
                <div className='flex items-center'>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(program.difficulty)}`}
                  >
                    {program.difficulty.charAt(0).toUpperCase() + program.difficulty.slice(1)}
                  </span>
                </div>

                {/* Actions */}
                <div className='flex items-center space-x-2'>
                  <button
                    onClick={() => handleEditClick(program)}
                    className='p-2 rounded-lg hover:bg-accent/80 transition-colors text-secondary-text hover:text-primary-text'
                  >
                    <PencilIcon className='h-4 w-4' />
                  </button>
                  <button
                    onClick={() => handleToggleActive(program.id)}
                    className='p-2 rounded-lg hover:bg-accent/80 transition-colors text-secondary-text hover:text-primary-text'
                  >
                    <EyeIcon className='h-4 w-4' />
                  </button>
                  <button
                    onClick={() => handleDeleteProgram(program.id)}
                    className='p-2 rounded-lg hover:bg-red-500/20 transition-colors text-secondary-text hover:text-red-500'
                  >
                    <TrashIcon className='h-4 w-4' />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Create/Edit Program Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={handleCloseModal}>
        <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
          {/* Header */}
          <DialogHeader className='px-8 pt-8 pb-6'>
            <div className='flex items-center space-x-4'>
              <div className='p-3 bg-gradient-to-br from-primary to-primary-dark rounded-2xl shadow-lg'>
                <PlusIcon className='h-6 w-6 text-white' />
              </div>
              <div>
                <DialogTitle className='text-2xl font-light text-primary-text'>
                  {editingProgram ? 'Edit Program Template' : 'Create Program Template'}
                </DialogTitle>
                <DialogDescription className='text-sm text-secondary-text font-light mt-1'>
                  {editingProgram
                    ? 'Update program template details'
                    : 'Add a new program template for your classes'}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {/* Form */}
          <form className='px-8 pb-8 space-y-8'>
            {/* Basic Information */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div>
                <label className='block text-sm font-light text-primary-text mb-3'>
                  Program Name *
                </label>
                <Input
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder='e.g., Burn40, CrossFit'
                  className='bg-accent border-border rounded-xl px-4 py-3 text-primary-text focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200'
                />
              </div>

              <div>
                <label className='block text-sm font-light text-primary-text mb-3'>
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                  className='w-full px-4 py-3 bg-accent border border-border rounded-xl text-primary-text focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 font-light'
                >
                  <option value=''>Select category</option>
                  <option value='Cardio'>Cardio</option>
                  <option value='Strength'>Strength</option>
                </select>
              </div>
            </div>

            <div>
              <label className='block text-sm font-light text-primary-text mb-3'>
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                placeholder='Describe the program...'
                rows={3}
                className='w-full px-4 py-3 bg-accent border border-border rounded-xl text-primary-text focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 font-light resize-none'
              />
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div>
                <label className='block text-sm font-light text-primary-text mb-3'>Duration</label>
                <select
                  value={formData.duration}
                  onChange={e => setFormData({ ...formData, duration: e.target.value })}
                  className='w-full px-4 py-3 bg-accent border border-border rounded-xl text-primary-text focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 font-light'
                >
                  <option value='30 min'>30 min</option>
                  <option value='40 min'>40 min</option>
                  <option value='45 min'>45 min</option>
                  <option value='50 min'>50 min</option>
                  <option value='60 min'>60 min</option>
                  <option value='75 min'>75 min</option>
                  <option value='90 min'>90 min</option>
                </select>
              </div>

              <div>
                <label className='block text-sm font-light text-primary-text mb-3'>
                  Difficulty Level
                </label>
                <select
                  value={formData.difficulty}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      difficulty: e.target.value as 'beginner' | 'intermediate' | 'advanced',
                    })
                  }
                  className='w-full px-4 py-3 bg-accent border border-border rounded-xl text-primary-text focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 font-light'
                >
                  <option value='beginner'>Beginner</option>
                  <option value='intermediate'>Intermediate</option>
                  <option value='advanced'>Advanced</option>
                </select>
              </div>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div>
                <label className='block text-sm font-light text-primary-text mb-3'>
                  Coach (Optional)
                </label>
                <Input
                  value={formData.coach}
                  onChange={e => setFormData({ ...formData, coach: e.target.value })}
                  placeholder='e.g., Sarah Johnson'
                  className='bg-accent border-border rounded-xl px-4 py-3 text-primary-text focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200'
                />
              </div>

              <div>
                <label className='block text-sm font-light text-primary-text mb-3'>Capacity</label>
                <Input
                  type='number'
                  value={formData.capacity}
                  onChange={e =>
                    setFormData({ ...formData, capacity: parseInt(e.target.value) || 20 })
                  }
                  placeholder='20'
                  className='bg-accent border-border rounded-xl px-4 py-3 text-primary-text focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200'
                />
              </div>
            </div>

            <div>
              <label className='block text-sm font-light text-primary-text mb-3'>
                Location (Optional)
              </label>
              <Input
                value={formData.location}
                onChange={e => setFormData({ ...formData, location: e.target.value })}
                placeholder='e.g., Studio A, Weight Room'
                className='bg-accent border-border rounded-xl px-4 py-3 text-primary-text focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200'
              />
            </div>

            <div>
              <label className='block text-sm font-light text-primary-text mb-3'>
                Program Color
              </label>
              <div className='flex items-center space-x-4'>
                <input
                  type='color'
                  value={formData.color}
                  onChange={e => setFormData({ ...formData, color: e.target.value })}
                  className='w-16 h-16 rounded-xl border border-border cursor-pointer shadow-lg'
                />
                <div className='flex-1'>
                  <div className='text-sm text-secondary-text font-light mb-1'>Color Preview</div>
                  <div className='text-sm text-primary-text font-light'>{formData.color}</div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className='flex items-center justify-end space-x-4 pt-6 border-t border-border'>
              <Button
                variant='outline'
                onClick={handleCloseModal}
                className='px-6 py-3 bg-accent border-border rounded-xl font-light text-sm hover:bg-accent/80 transition-all duration-200'
              >
                Cancel
              </Button>
              <Button
                variant='primary'
                onClick={editingProgram ? handleEditProgram : handleCreateProgram}
                className='px-6 py-3 rounded-xl font-light text-sm transition-all duration-200 shadow-lg hover:shadow-xl'
              >
                {editingProgram ? 'Update Program' : 'Create Program'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
