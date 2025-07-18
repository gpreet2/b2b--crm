import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { 
  PlayIcon, 
  PlusIcon, 
  AcademicCapIcon,
  ClockIcon,
  UsersIcon,
  ChartBarIcon,
  BookOpenIcon,
  FireIcon,
  TrophyIcon
} from '@heroicons/react/24/outline'

export default function ProgramsPage() {
  const programStats = [
    { label: 'Active Programs', value: '8', change: '+2', icon: AcademicCapIcon, color: 'bg-primary' },
    { label: 'Total Participants', value: '124', change: '+18', icon: UsersIcon, color: 'bg-success' },
    { label: 'Avg Duration', value: '6 weeks', change: '+1', icon: ClockIcon, color: 'bg-info' },
    { label: 'Completion Rate', value: '89%', change: '+5%', icon: TrophyIcon, color: 'bg-warning' }
  ]

  const featuredPrograms = [
    {
      id: 1,
      name: 'Beginner Strength Builder',
      description: '8-week progressive strength training program for newcomers',
      duration: '8 weeks',
      sessions: '3x/week',
      participants: 24,
      maxParticipants: 30,
      difficulty: 'Beginner',
      category: 'Strength'
    },
    {
      id: 2,
      name: 'HIIT Transformation',
      description: 'High-intensity interval training for rapid fitness improvement',
      duration: '6 weeks',
      sessions: '4x/week',
      participants: 18,
      maxParticipants: 20,
      difficulty: 'Intermediate',
      category: 'Cardio'
    },
    {
      id: 3,
      name: 'Yoga Flow Journey',
      description: 'Mindful movement and flexibility program for all levels',
      duration: '12 weeks',
      sessions: '2x/week',
      participants: 32,
      maxParticipants: 35,
      difficulty: 'All Levels',
      category: 'Wellness'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-h1 font-heading text-primary-text mb-2">Training Programs</h1>
          <p className="text-body text-secondary-text">
            Manage fitness programs and structured training plans
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm">
            <BookOpenIcon className="h-4 w-4 mr-2" />
            Templates
          </Button>
          <Button variant="primary" size="sm">
            <PlusIcon className="h-4 w-4 mr-2" />
            Create Program
          </Button>
        </div>
      </div>

      {/* Stats - Compact */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {programStats.map((stat, index) => (
          <Card key={index} className="group hover:shadow-md transition-all duration-300">
            <CardContent className="p-3">
              <div className="flex items-center space-x-2">
                <div className={`p-2 rounded-lg ${stat.color} flex items-center justify-center flex-shrink-0`}>
                  <stat.icon className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline space-x-1">
                    <h3 className="text-body-sm font-semibold text-primary-text">{stat.value}</h3>
                    <span className="text-xs font-medium text-success">
                      {stat.change}
                    </span>
                  </div>
                  <p className="text-xs text-secondary-text truncate">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Featured Programs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FireIcon className="h-5 w-5 text-primary" />
            <span>Featured Programs</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {featuredPrograms.map((program) => (
              <div 
                key={program.id}
                className="p-4 bg-accent rounded-lg hover:bg-secondary/30 transition-colors group"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-body font-medium text-primary-text">{program.name}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        program.difficulty === 'Beginner' ? 'bg-success/20 text-success' :
                        program.difficulty === 'Intermediate' ? 'bg-warning/20 text-warning' :
                        'bg-info/20 text-info'
                      }`}>
                        {program.difficulty}
                      </span>
                    </div>
                    <p className="text-body-sm text-secondary-text mb-3">
                      {program.description}
                    </p>
                    <div className="flex flex-wrap items-center gap-4 text-caption text-secondary-text">
                      <div className="flex items-center space-x-1">
                        <ClockIcon className="h-3 w-3" />
                        <span>{program.duration}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <PlayIcon className="h-3 w-3" />
                        <span>{program.sessions}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <UsersIcon className="h-3 w-3" />
                        <span>{program.participants}/{program.maxParticipants}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <AcademicCapIcon className="h-3 w-3" />
                        <span>{program.category}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <div className="w-20 bg-surface rounded-full h-2 mb-1">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(program.participants / program.maxParticipants) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-secondary-text">
                        {Math.round((program.participants / program.maxParticipants) * 100)}% full
                      </span>
                    </div>
                    <Button variant="outline" size="sm">
                      Manage
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 