import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { 
  CalendarIcon,
  PlusIcon,
  UsersIcon,
  ClockIcon,
  MapPinIcon,
  StarIcon,
  TagIcon,
  EyeIcon,
  PencilIcon,
  MegaphoneIcon,
  AcademicCapIcon,
  TrophyIcon,
  HeartIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline'

export default function EventsPage() {
  const upcomingEvents = [
    {
      id: 1,
      title: 'Summer Fitness Challenge',
      description: '30-day transformation challenge with prizes and community support',
      date: '2024-07-15',
      time: '6:00 AM',
      duration: '30 days',
      location: 'Main Gym Floor',
      instructor: 'Sarah Johnson & Team',
      category: 'Challenge',
      participants: 45,
      maxParticipants: 50,
      price: '$99',
      status: 'open',
      featured: true,
      image: '/api/placeholder/400/200'
    },
    {
      id: 2,
      title: 'Nutrition Workshop: Meal Prep Mastery',
      description: 'Learn professional meal prep techniques and nutrition fundamentals',
      date: '2024-07-20',
      time: '2:00 PM',
      duration: '3 hours',
      location: 'Conference Room A',
      instructor: 'Dr. Maria Rodriguez',
      category: 'Workshop',
      participants: 18,
      maxParticipants: 25,
      price: '$45',
      status: 'open',
      featured: false
    },
    {
      id: 3,
      title: 'Charity Fitness Marathon',
      description: 'Join us for a 12-hour fitness marathon to raise funds for local charities',
      date: '2024-08-05',
      time: '8:00 AM',
      duration: '12 hours',
      location: 'Outdoor Area',
      instructor: 'All Trainers',
      category: 'Charity',
      participants: 120,
      maxParticipants: 150,
      price: 'Free',
      status: 'open',
      featured: true
    },
    {
      id: 4,
      title: 'Advanced Yoga Retreat',
      description: 'Weekend intensive yoga retreat with meditation and mindfulness practices',
      date: '2024-08-12',
      time: '9:00 AM',
      duration: '2 days',
      location: 'Studio 2',
      instructor: 'Emma Davis',
      category: 'Retreat',
      participants: 12,
      maxParticipants: 15,
      price: '$199',
      status: 'filling-fast',
      featured: false
    }
  ]

  const eventCategories = [
    { name: 'Challenges', count: 3, icon: TrophyIcon, color: 'bg-primary' },
    { name: 'Workshops', count: 5, icon: AcademicCapIcon, color: 'bg-info' },
    { name: 'Charity Events', count: 2, icon: HeartIcon, color: 'bg-success' },
    { name: 'Retreats', count: 1, icon: StarIcon, color: 'bg-warning' }
  ]

  const eventStats = [
    { label: 'Active Events', value: '11', change: '+3', trend: 'up' },
    { label: 'Total Participants', value: '195', change: '+24', trend: 'up' },
    { label: 'Revenue This Month', value: '$3,240', change: '+18%', trend: 'up' },
    { label: 'Avg Rating', value: '4.8', change: '+0.2', trend: 'up' }
  ]

  return (
    <div className="space-y-8">
      {/* Professional Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-warning/5"></div>
        <div className="relative bg-gradient-surface border border-surface rounded-2xl p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl">
                <MegaphoneIcon className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="text-display-2 font-display text-primary-text mb-2">
                  Special Events
                </h1>
                <p className="text-body-lg text-secondary-text max-w-2xl">
                  Workshops, challenges, and special fitness events to engage your community
                </p>
                <div className="flex items-center space-x-6 mt-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                    <span className="text-body-sm text-success font-medium">Active Events</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-body-sm text-secondary-text">
                      {upcomingEvents.length} upcoming events
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-6 lg:mt-0 flex flex-col sm:flex-row gap-3">
              <button className="px-6 py-3 bg-surface border border-surface text-primary-text rounded-lg font-semibold hover:bg-accent transition-all duration-200 flex items-center">
                <TagIcon className="h-5 w-5 mr-2" />
                Filter Events
              </button>
              <button className="btn-gym-primary px-6 py-3 rounded-lg font-semibold flex items-center">
                <PlusIcon className="h-5 w-5 mr-2" />
                Create Event
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats - Compact */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {eventStats.map((stat, index) => {
          const icons = [MegaphoneIcon, UsersIcon, CurrencyDollarIcon, StarIcon]
          const colors = ['bg-primary', 'bg-success', 'bg-info', 'bg-warning']
          const StatIcon = icons[index]
          const color = colors[index]
          
          return (
            <Card key={index} className="group hover:shadow-md transition-all duration-300">
              <CardContent className="p-3">
                <div className="flex items-center space-x-2">
                  <div className={`p-2 rounded-lg ${color} flex items-center justify-center flex-shrink-0`}>
                    <StatIcon className="h-4 w-4 text-white" />
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
          )
        })}
      </div>

      {/* Event Categories */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TagIcon className="h-5 w-5 text-primary" />
            <span>Event Categories</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {eventCategories.map((category, index) => (
              <div 
                key={index}
                className="flex items-center space-x-3 p-4 bg-accent rounded-lg hover:bg-secondary/30 transition-colors cursor-pointer group"
              >
                <div className={`p-2 rounded-lg ${category.color} flex items-center justify-center`}>
                  <category.icon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-body font-medium text-primary-text">{category.name}</h3>
                  <p className="text-body-sm text-secondary-text">{category.count} events</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Events */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MegaphoneIcon className="h-5 w-5 text-primary" />
            <span>Upcoming Events</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {upcomingEvents.map((event) => (
              <div 
                key={event.id} 
                className={`relative p-6 rounded-xl border transition-all duration-300 hover:shadow-lg ${
                  event.featured 
                    ? 'border-primary/30 bg-primary/5' 
                    : 'border-surface bg-accent hover:bg-secondary/30'
                }`}
              >
                {event.featured && (
                  <div className="absolute -top-2 -right-2">
                    <div className="bg-primary text-white px-3 py-1 rounded-full text-caption font-medium">
                      Featured
                    </div>
                  </div>
                )}
                
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-body-lg font-medium text-primary-text mb-1">
                          {event.title}
                        </h3>
                        <p className="text-body-sm text-secondary-text mb-3">
                          {event.description}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <span className={`px-3 py-1 rounded-full text-caption font-medium ${
                          event.status === 'open' 
                            ? 'bg-success/20 text-success' 
                            : event.status === 'filling-fast'
                            ? 'bg-warning/20 text-warning'
                            : 'bg-primary/20 text-primary'
                        }`}>
                          {event.status === 'open' ? 'Open' : 
                           event.status === 'filling-fast' ? 'Filling Fast' : 'Full'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-body-sm text-secondary-text">
                      <div className="flex items-center space-x-2">
                        <CalendarIcon className="h-4 w-4" />
                        <span>{new Date(event.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <ClockIcon className="h-4 w-4" />
                        <span>{event.time} ({event.duration})</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPinIcon className="h-4 w-4" />
                        <span>{event.location}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <UsersIcon className="h-4 w-4" />
                        <span>{event.participants}/{event.maxParticipants} participants</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center space-x-4">
                        <span className="text-body-sm text-secondary-text">
                          Instructor: <span className="font-medium text-primary-text">{event.instructor}</span>
                        </span>
                        <span className="text-body font-medium text-primary">
                          {event.price}
                        </span>
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-surface rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-300 ${
                              event.status === 'filling-fast' ? 'bg-warning' : 'bg-primary'
                            }`}
                            style={{ width: `${(event.participants / event.maxParticipants) * 100}%` }}
                          />
                        </div>
                        <span className="text-caption text-secondary-text">
                          {Math.round((event.participants / event.maxParticipants) * 100)}%
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 lg:ml-6">
                    <Button variant="ghost" size="sm">
                      <EyeIcon className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <PencilIcon className="h-4 w-4" />
                    </Button>
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