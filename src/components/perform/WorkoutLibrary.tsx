'use client';

import {
  FireIcon,
  BoltIcon,
  HeartIcon,
  UserGroupIcon,
  ClockIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
} from '@heroicons/react/24/outline';
import React, { useState } from 'react';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';

interface WorkoutTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedDuration: number;
  exercises: Array<{
    name: string;
    sets: number;
    reps?: number;
    duration?: number;
  }>;
  color: string;
}

interface WorkoutLibraryProps {
  onSelectWorkout: (workout: WorkoutTemplate) => void;
  onClose: () => void;
}

// Predefined workout templates
const workoutTemplates: WorkoutTemplate[] = [
  {
    id: '1',
    name: 'CrossFit WOD',
    description: 'High-intensity functional fitness workout',
    category: 'crossfit',
    difficulty: 'intermediate',
    estimatedDuration: 20,
    exercises: [
      { name: 'Burpees', sets: 3, reps: 10 },
      { name: 'Box Jumps', sets: 3, reps: 15 },
      { name: 'Wall Balls', sets: 3, reps: 20 },
      { name: 'Row', sets: 3, duration: 500 },
    ],
    color: '#ef4444',
  },
  {
    id: '2',
    name: 'Burn40 Circuit',
    description: '40-minute fat burning circuit training',
    category: 'burn40',
    difficulty: 'intermediate',
    estimatedDuration: 40,
    exercises: [
      { name: 'Mountain Climbers', sets: 4, duration: 45 },
      { name: 'Jump Squats', sets: 4, reps: 15 },
      { name: 'Push-ups', sets: 4, reps: 12 },
      { name: 'Plank Hold', sets: 4, duration: 60 },
      { name: 'High Knees', sets: 4, duration: 30 },
    ],
    color: '#f97316',
  },
  {
    id: '3',
    name: 'Strength Training',
    description: 'Traditional strength building workout',
    category: 'strength',
    difficulty: 'intermediate',
    estimatedDuration: 45,
    exercises: [
      { name: 'Squats', sets: 4, reps: 8 },
      { name: 'Deadlifts', sets: 4, reps: 6 },
      { name: 'Bench Press', sets: 4, reps: 8 },
      { name: 'Overhead Press', sets: 3, reps: 10 },
      { name: 'Rows', sets: 3, reps: 12 },
    ],
    color: '#10b981',
  },
  {
    id: '4',
    name: 'Cardio Blast',
    description: 'High-energy cardiovascular workout',
    category: 'cardio',
    difficulty: 'beginner',
    estimatedDuration: 30,
    exercises: [
      { name: 'Jumping Jacks', sets: 3, duration: 60 },
      { name: 'High Knees', sets: 3, duration: 45 },
      { name: 'Butt Kicks', sets: 3, duration: 45 },
      { name: 'Mountain Climbers', sets: 3, duration: 30 },
      { name: 'Burpees', sets: 3, reps: 8 },
    ],
    color: '#3b82f6',
  },
  {
    id: '5',
    name: 'Core Crusher',
    description: 'Intensive core strengthening session',
    category: 'core',
    difficulty: 'intermediate',
    estimatedDuration: 25,
    exercises: [
      { name: 'Plank Hold', sets: 3, duration: 60 },
      { name: 'Crunches', sets: 3, reps: 20 },
      { name: 'Russian Twists', sets: 3, reps: 30 },
      { name: 'Leg Raises', sets: 3, reps: 15 },
      { name: 'Bicycle Crunches', sets: 3, reps: 20 },
    ],
    color: '#8b5cf6',
  },
  {
    id: '6',
    name: 'Yoga Flow',
    description: 'Mindful movement and flexibility',
    category: 'yoga',
    difficulty: 'beginner',
    estimatedDuration: 60,
    exercises: [
      { name: 'Sun Salutation A', sets: 3, duration: 120 },
      { name: 'Sun Salutation B', sets: 3, duration: 180 },
      { name: 'Warrior Sequence', sets: 2, duration: 300 },
      { name: 'Balancing Poses', sets: 2, duration: 240 },
      { name: 'Cool Down', sets: 1, duration: 300 },
    ],
    color: '#14b8a6',
  },
  {
    id: '7',
    name: 'Recovery Session',
    description: 'Light recovery and mobility work',
    category: 'recovery',
    difficulty: 'beginner',
    estimatedDuration: 30,
    exercises: [
      { name: 'Foam Rolling', sets: 1, duration: 300 },
      { name: 'Static Stretches', sets: 1, duration: 600 },
      { name: 'Mobility Drills', sets: 1, duration: 300 },
      { name: 'Breathing Exercises', sets: 1, duration: 300 },
    ],
    color: '#6b7280',
  },
  {
    id: '8',
    name: 'Boxing Workout',
    description: 'Boxing skills and conditioning',
    category: 'boxing',
    difficulty: 'intermediate',
    estimatedDuration: 45,
    exercises: [
      { name: 'Shadow Boxing', sets: 3, duration: 180 },
      { name: 'Heavy Bag Work', sets: 3, duration: 180 },
      { name: 'Speed Bag', sets: 2, duration: 120 },
      { name: 'Footwork Drills', sets: 2, duration: 120 },
      { name: 'Conditioning Rounds', sets: 3, duration: 180 },
    ],
    color: '#dc2626',
  },
];

export default function WorkoutLibrary({ onSelectWorkout, onClose }: WorkoutLibraryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');

  const categories = [
    { id: 'all', name: 'All Categories' },
    { id: 'crossfit', name: 'CrossFit' },
    { id: 'burn40', name: 'Burn40' },
    { id: 'strength', name: 'Strength' },
    { id: 'cardio', name: 'Cardio' },
    { id: 'core', name: 'Core' },
    { id: 'yoga', name: 'Yoga' },
    { id: 'recovery', name: 'Recovery' },
    { id: 'boxing', name: 'Boxing' },
  ];

  const difficulties = [
    { id: 'all', name: 'All Levels' },
    { id: 'beginner', name: 'Beginner' },
    { id: 'intermediate', name: 'Intermediate' },
    { id: 'advanced', name: 'Advanced' },
  ];

  const filteredWorkouts = workoutTemplates.filter(workout => {
    const matchesSearch =
      workout.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      workout.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || workout.category === selectedCategory;
    const matchesDifficulty =
      selectedDifficulty === 'all' || workout.difficulty === selectedDifficulty;

    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'crossfit':
        return <FireIcon className='h-4 w-4' />;
      case 'burn40':
        return <BoltIcon className='h-4 w-4' />;
      case 'strength':
        return <UserGroupIcon className='h-4 w-4' />;
      case 'cardio':
        return <HeartIcon className='h-4 w-4' />;
      default:
        return <ClockIcon className='h-4 w-4' />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
      <div className='bg-surface rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden border border-border'>
        {/* Header */}
        <div className='p-6 bg-gradient-to-r from-accent to-accent/80 border-b border-border'>
          <div className='flex items-center justify-between'>
            <div>
              <h2 className='text-2xl font-semibold text-primary-text'>Workout Library</h2>
              <p className='text-sm text-secondary-text mt-1'>
                Browse and select from our collection of workout templates
              </p>
            </div>
            <Button
              onClick={onClose}
              variant='outline'
              className='border-border text-primary-text hover:bg-accent'
            >
              Close
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className='p-6 bg-accent/50 border-b border-border'>
          <div className='flex flex-col lg:flex-row gap-4'>
            {/* Search */}
            <div className='flex-1'>
              <div className='relative'>
                <MagnifyingGlassIcon className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-secondary-text' />
                <Input
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  placeholder='Search workouts...'
                  className='pl-10 bg-surface border-border text-primary-text placeholder:text-muted'
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className='flex items-center space-x-2'>
              <AdjustmentsHorizontalIcon className='h-4 w-4 text-secondary-text' />
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className='px-3 py-2 bg-surface border border-border rounded-lg text-primary-text text-sm focus:ring-2 focus:ring-primary focus:border-primary'
              >
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Difficulty Filter */}
            <div className='flex items-center space-x-2'>
              <select
                value={selectedDifficulty}
                onChange={e => setSelectedDifficulty(e.target.value)}
                className='px-3 py-2 bg-surface border border-border rounded-lg text-primary-text text-sm focus:ring-2 focus:ring-primary focus:border-primary'
              >
                {difficulties.map(difficulty => (
                  <option key={difficulty.id} value={difficulty.id}>
                    {difficulty.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Workout Grid */}
        <div className='p-6 overflow-y-auto max-h-[60vh]'>
          {filteredWorkouts.length === 0 ? (
            <div className='text-center py-12'>
              <ClockIcon className='h-12 w-12 text-secondary-text mx-auto mb-4' />
              <h3 className='text-lg font-medium text-primary-text mb-2'>No workouts found</h3>
              <p className='text-sm text-secondary-text'>Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
              {filteredWorkouts.map(workout => (
                <Card
                  key={workout.id}
                  className='cursor-pointer hover:shadow-lg transition-all duration-200 hover-lift border-border bg-surface hover:bg-accent'
                  onClick={() => onSelectWorkout(workout)}
                >
                  <CardHeader className='pb-3'>
                    <div className='flex items-start justify-between'>
                      <div className='flex items-center space-x-2'>
                        <div
                          className='w-3 h-3 rounded-full'
                          style={{ backgroundColor: workout.color }}
                        />
                        <CardTitle className='text-lg font-medium text-primary-text'>
                          {workout.name}
                        </CardTitle>
                      </div>
                      <Badge
                        className={`${getDifficultyColor(workout.difficulty)} border border-border-light`}
                      >
                        {workout.difficulty}
                      </Badge>
                    </div>
                    <p className='text-sm text-secondary-text mt-2'>{workout.description}</p>
                  </CardHeader>

                  <CardContent className='pt-0'>
                    <div className='space-y-3'>
                      {/* Workout Details */}
                      <div className='flex items-center justify-between text-sm'>
                        <div className='flex items-center space-x-1 text-secondary-text'>
                          <ClockIcon className='h-4 w-4' />
                          <span>{workout.estimatedDuration}m</span>
                        </div>
                        <div className='flex items-center space-x-1 text-secondary-text'>
                          {getCategoryIcon(workout.category)}
                          <span className='capitalize'>{workout.category}</span>
                        </div>
                      </div>

                      {/* Exercise Preview */}
                      <div className='space-y-2'>
                        <h4 className='text-xs font-medium text-secondary-text uppercase tracking-wider'>
                          Exercises ({workout.exercises.length})
                        </h4>
                        <div className='space-y-1'>
                          {workout.exercises.slice(0, 3).map((exercise, index) => (
                            <div key={index} className='flex items-center justify-between text-xs'>
                              <span className='text-primary-text truncate flex-1'>
                                {exercise.name}
                              </span>
                              <span className='text-secondary-text ml-2'>
                                {exercise.sets}×{exercise.reps || exercise.duration}
                              </span>
                            </div>
                          ))}
                          {workout.exercises.length > 3 && (
                            <div className='text-xs text-secondary-text'>
                              +{workout.exercises.length - 3} more exercises
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Add Button */}
                      <Button
                        className='w-full mt-4 bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-white'
                        onClick={e => {
                          e.stopPropagation();
                          onSelectWorkout(workout);
                        }}
                      >
                        <PlusIcon className='h-4 w-4 mr-2' />
                        Add to Workout
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
