'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { 
  AcademicCapIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  FireIcon,
  UsersIcon,
  ClockIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'

interface Program {
  id: string
  name: string
  description: string
  color: string
  category: string
  classCount: number
  activeMembers: number
  duration: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  isActive: boolean
}

export default function ProgramsPage() {
  const [programs, setPrograms] = useState<Program[]>([
    {
      id: '1',
      name: 'HIIT Training',
      description: 'High-intensity interval training for maximum calorie burn',
      color: '#ef4444',
      category: 'Cardio',
      classCount: 12,
      activeMembers: 45,
      duration: '45 min',
      difficulty: 'intermediate',
      isActive: true
    },
    {
      id: '2',
      name: 'Strength & Power',
      description: 'Muscle building and strength development',
      color: '#06b6d4',
      category: 'Strength',
      classCount: 8,
      activeMembers: 32,
      duration: '60 min',
      difficulty: 'advanced',
      isActive: true
    },
    {
      id: '3',
      name: 'Yoga Flow',
      description: 'Mindful movement and flexibility training',
      color: '#8b5cf6',
      category: 'Wellness',
      classCount: 6,
      activeMembers: 38,
      duration: '75 min',
      difficulty: 'beginner',
      isActive: true
    },
    {
      id: '4',
      name: 'Boxing Fundamentals',
      description: 'Combat fitness and self-defense training',
      color: '#f97316',
      category: 'Martial Arts',
      classCount: 4,
      activeMembers: 28,
      duration: '50 min',
      difficulty: 'intermediate',
      isActive: true
    },
    {
      id: '5',
      name: 'Functional Movement',
      description: 'Real-world strength and mobility training',
      color: '#3b82f6',
      category: 'Functional',
      classCount: 5,
      activeMembers: 22,
      duration: '45 min',
      difficulty: 'intermediate',
      isActive: true
    },
    {
      id: '6',
      name: 'Pilates Core',
      description: 'Core strength and stability training',
      color: '#10b981',
      category: 'Wellness',
      classCount: 3,
      activeMembers: 18,
      duration: '60 min',
      difficulty: 'beginner',
      isActive: false
    }
  ])

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingProgram, setEditingProgram] = useState<Program | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#6366f1',
    category: '',
    duration: '45 min',
    difficulty: 'intermediate' as const
  })

  const handleCreateProgram = () => {
    if (formData.name && formData.description && formData.category) {
      const newProgram: Program = {
        id: Date.now().toString(),
        name: formData.name,
        description: formData.description,
        color: formData.color,
        category: formData.category,
        classCount: 0,
        activeMembers: 0,
        duration: formData.duration,
        difficulty: formData.difficulty,
        isActive: true
      }
      setPrograms([...programs, newProgram])
      handleCloseModal()
    }
  }

  const handleEditProgram = () => {
    if (editingProgram && formData.name && formData.description && formData.category) {
      setPrograms(programs.map(p => 
        p.id === editingProgram.id 
          ? { ...p, ...formData }
          : p
      ))
      handleCloseModal()
    }
  }

  const handleDeleteProgram = (id: string) => {
    setPrograms(programs.filter(p => p.id !== id))
  }

  const handleToggleActive = (id: string) => {
    setPrograms(programs.map(p => 
      p.id === id ? { ...p, isActive: !p.isActive } : p
    ))
  }

  const handleCloseModal = () => {
    setIsCreateModalOpen(false)
    setEditingProgram(null)
    setFormData({
      name: '',
      description: '',
      color: '#dc2626',
      category: '',
      duration: '45 min',
      difficulty: 'intermediate'
    })
  }

  const handleEditClick = (program: Program) => {
    setEditingProgram(program)
    setFormData({
      name: program.name,
      description: program.description,
      color: program.color,
      category: program.category,
      duration: program.duration,
      difficulty: program.difficulty as 'intermediate'
    })
    setIsCreateModalOpen(true)
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30'
      case 'intermediate': return 'bg-amber-500/20 text-amber-500 border-amber-500/30'
      case 'advanced': return 'bg-red-500/20 text-red-500 border-red-500/30'
      default: return 'bg-gray-500/20 text-gray-500 border-gray-500/30'
    }
  }

  const totalPrograms = programs.length
  const activePrograms = programs.filter(p => p.isActive).length
  const totalClasses = programs.reduce((sum, p) => sum + p.classCount, 0)
  const totalMembers = programs.reduce((sum, p) => sum + p.activeMembers, 0)

  return (
    <div className="space-y-8 bg-surface min-h-screen page-transition">
      {/* Professional Header */}
      <div className="bg-surface-light border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-gradient-to-br from-red-600 to-red-700 rounded-xl shadow-lg hover-lift">
                <AcademicCapIcon className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-primary-text mb-2">
                  Class Programs
                </h1>
                <p className="text-lg text-secondary-text max-w-2xl">
                  Manage fitness programs, categories, and class types
                </p>
                <div className="flex items-center space-x-6 mt-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-emerald-500 font-medium">Active Programs</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted">
                      {activePrograms} of {totalPrograms} programs active
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-6 lg:mt-0">
              <button 
                onClick={() => setIsCreateModalOpen(true)}
                className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg font-semibold hover:from-red-700 hover:to-red-800 transition-all duration-200 flex items-center btn-animate"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Create Program
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                      {[
              { label: 'Total Programs', value: totalPrograms, icon: AcademicCapIcon, color: 'text-red-500', bgColor: 'bg-red-500/10' },
              { label: 'Active Programs', value: activePrograms, icon: FireIcon, color: 'text-emerald-500', bgColor: 'bg-emerald-500/10' },
              { label: 'Total Classes', value: totalClasses, icon: ClockIcon, color: 'text-amber-500', bgColor: 'bg-amber-500/10' },
              { label: 'Active Members', value: totalMembers, icon: UsersIcon, color: 'text-blue-500', bgColor: 'bg-blue-500/10' }
            ].map((metric, index) => (
            <div key={index} className="group">
              <div className={`bg-surface-light border border-border rounded-xl p-6 hover:shadow-xl transition-all duration-300 relative overflow-hidden card-animate`}>
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-xl ${metric.bgColor}`}>
                    <metric.icon className={`h-6 w-6 ${metric.color}`} />
                  </div>
                </div>
                
                <div>
                  <h3 className={`text-3xl font-bold ${metric.color} mb-2 group-hover:scale-105 transition-transform`}>
                    {metric.value}
                  </h3>
                  <p className="text-sm text-secondary-text font-medium">{metric.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Programs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {programs.map((program) => (
            <div key={program.id} className="group">
              <div className="bg-surface-light border border-border rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 card-animate">
                {/* Program Header */}
                <div className="p-6 border-b border-border bg-surface/50">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-4 h-4 rounded-full shadow-lg"
                        style={{ backgroundColor: program.color }}
                      />
                      <div>
                        <h3 className="text-lg font-bold text-primary-text">{program.name}</h3>
                        <p className="text-sm text-muted">{program.category}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEditClick(program)}
                        className="p-2 rounded-lg bg-surface hover:bg-surface-light transition-colors text-muted hover:text-primary-text"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProgram(program.id)}
                        className="p-2 rounded-lg bg-surface hover:bg-red-500/20 transition-colors text-muted hover:text-red-500"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  <p className="text-sm text-secondary-text mb-4">{program.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className={`px-3 py-1 rounded-full text-xs font-bold border ${getDifficultyColor(program.difficulty)}`}>
                      {program.difficulty.charAt(0).toUpperCase() + program.difficulty.slice(1)}
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-muted">{program.duration}</span>
                      <div className={`w-2 h-2 rounded-full ${program.isActive ? 'bg-emerald-500' : 'bg-gray-500'}`} />
                    </div>
                  </div>
                </div>

                {/* Program Stats */}
                <div className="p-6">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary-text">{program.classCount}</div>
                      <div className="text-xs text-muted">Classes</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary-text">{program.activeMembers}</div>
                      <div className="text-xs text-muted">Members</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => handleToggleActive(program.id)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        program.isActive
                          ? 'bg-emerald-600/20 text-emerald-500 hover:bg-emerald-600 hover:text-white'
                          : 'bg-gray-600/20 text-gray-500 hover:bg-gray-600 hover:text-white'
                      }`}
                    >
                      {program.isActive ? 'Active' : 'Inactive'}
                    </button>
                    <button className="p-2 rounded-lg bg-surface hover:bg-surface-light transition-colors text-muted hover:text-primary-text">
                      <EyeIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create/Edit Program Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={handleCloseModal} />
          
          <div className="relative bg-surface-light border border-border rounded-xl shadow-2xl w-full max-w-md">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border bg-surface/50">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-red-600 to-red-700 rounded-lg">
                  <PlusIcon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-primary-text">
                    {editingProgram ? 'Edit Program' : 'Create Program'}
                  </h2>
                  <p className="text-sm text-secondary-text">
                    {editingProgram ? 'Update program details' : 'Add a new fitness program'}
                  </p>
                </div>
              </div>
              <button
                onClick={handleCloseModal}
                className="p-2 rounded-lg hover:bg-surface transition-colors text-muted hover:text-primary-text"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            {/* Form */}
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-primary-text mb-2">
                  Program Name *
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., HIIT Training"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-primary-text mb-2">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the program..."
                  rows={3}
                  className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-primary-text focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-primary-text mb-2">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-primary-text focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    <option value="">Select category</option>
                    <option value="Cardio">Cardio</option>
                    <option value="Strength">Strength</option>
                    <option value="Wellness">Wellness</option>
                    <option value="Martial Arts">Martial Arts</option>
                    <option value="Functional">Functional</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary-text mb-2">
                    Duration
                  </label>
                  <select
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-primary-text focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    <option value="30 min">30 min</option>
                    <option value="45 min">45 min</option>
                    <option value="60 min">60 min</option>
                    <option value="75 min">75 min</option>
                    <option value="90 min">90 min</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-primary-text mb-2">
                  Difficulty Level
                </label>
                                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as any })}
                    className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-primary-text focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-primary-text mb-2">
                  Program Color
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-12 h-12 rounded-lg border border-border cursor-pointer"
                  />
                  <span className="text-sm text-secondary-text">{formData.color}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-border">
                <Button
                  variant="outline"
                  onClick={handleCloseModal}
                  className="btn-animate"
                >
                  Cancel
                </Button>
                <Button
                  onClick={editingProgram ? handleEditProgram : handleCreateProgram}
                  className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white btn-animate"
                >
                  {editingProgram ? 'Update Program' : 'Create Program'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 