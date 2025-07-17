import React from 'react'
import { cn } from '@/lib/utils'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { 
  UserIcon, 
  CalendarIcon, 
  ClockIcon, 
  ChartBarIcon,
  PlusIcon,
  PlayIcon,
  UserPlusIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline'
import { mockDashboardStats } from '@/lib/mock-data'

export interface DashboardProps extends React.HTMLAttributes<HTMLDivElement> {
  stats?: typeof mockDashboardStats
}

const Dashboard = React.forwardRef<HTMLDivElement, DashboardProps>(
  ({ 
    className, 
    stats = mockDashboardStats,
    ...props 
  }, ref) => {
    const quickActions = [
      {
        title: 'Add New Class',
        description: 'Schedule a new class',
        icon: <PlusIcon className="h-6 w-6" />,
        variant: 'primary' as const,
        onClick: () => console.log('Add class')
      },
      {
        title: 'Create Workout',
        description: 'Design a new workout',
        icon: <PlayIcon className="h-6 w-6" />,
        variant: 'secondary' as const,
        onClick: () => console.log('Create workout')
      },
      {
        title: 'Add Client',
        description: 'Register new member',
        icon: <UserPlusIcon className="h-6 w-6" />,
        variant: 'outline' as const,
        onClick: () => console.log('Add client')
      },
      {
        title: 'Quick Reservation',
        description: 'Book a class spot',
        icon: <CalendarDaysIcon className="h-6 w-6" />,
        variant: 'ghost' as const,
        onClick: () => console.log('Quick reservation')
      }
    ]

    const recentActivity = [
      {
        id: '1',
        type: 'reservation',
        message: 'John Smith reserved HIIT Cardio',
        time: '2 minutes ago',
        status: 'confirmed'
      },
      {
        id: '2',
        type: 'new_member',
        message: 'Maria Garcia joined the gym',
        time: '15 minutes ago',
        status: 'success'
      },
      {
        id: '3',
        type: 'class_cancelled',
        message: 'Yoga Flow cancelled for today',
        time: '1 hour ago',
        status: 'warning'
      },
      {
        id: '4',
        type: 'payment',
        message: 'Payment received from David Wilson',
        time: '2 hours ago',
        status: 'success'
      }
    ]

    const todaySchedule = [
      {
        id: '1',
        name: 'HIIT Cardio',
        time: '6:00 AM - 6:45 AM',
        coach: 'Sarah Johnson',
        enrolled: 15,
        capacity: 20,
        status: 'upcoming'
      },
      {
        id: '2',
        name: 'Strength Training',
        time: '7:00 AM - 8:00 AM',
        coach: 'Mike Chen',
        enrolled: 12,
        capacity: 15,
        status: 'upcoming'
      },
      {
        id: '3',
        name: 'Yoga Flow',
        time: '6:00 PM - 7:00 PM',
        coach: 'Emma Davis',
        enrolled: 20,
        capacity: 25,
        status: 'upcoming'
      }
    ]

    return (
      <div
        ref={ref}
        className={cn('space-y-6', className)}
        {...props}
      >
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-primary rounded-lg">
                  <UserIcon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-body-sm font-medium text-secondary-text">Total Members</p>
                  <p className="text-h2 font-heading text-primary-text">{stats.totalMembers}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-secondary rounded-lg">
                  <CalendarIcon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-body-sm font-medium text-secondary-text">Classes Today</p>
                  <p className="text-h2 font-heading text-primary-text">{stats.activeClassesToday}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-500 rounded-lg">
                  <ChartBarIcon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-body-sm font-medium text-secondary-text">Revenue</p>
                  <p className="text-h2 font-heading text-primary-text">${stats.revenueThisMonth.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-500 rounded-lg">
                  <ClockIcon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-body-sm font-medium text-secondary-text">Pending</p>
                  <p className="text-h2 font-heading text-primary-text">{stats.pendingReservations}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-h4 font-heading">Quick Actions</CardTitle>
              <CardDescription className="text-body-sm">Common tasks and shortcuts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {quickActions.map((action, index) => (
                  <Button
                    key={index}
                    variant={action.variant}
                    className="w-full justify-start"
                    onClick={action.onClick}
                  >
                    <span className="mr-3">{action.icon}</span>
                    <div className="text-left">
                      <div className="font-medium">{action.title}</div>
                      <div className="text-xs opacity-80">{action.description}</div>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-h4 font-heading">Recent Activity</CardTitle>
              <CardDescription className="text-body-sm">Latest updates and events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      <div className={cn(
                        'w-2 h-2 rounded-full',
                        activity.status === 'success' && 'bg-green-500',
                        activity.status === 'warning' && 'bg-yellow-500',
                        activity.status === 'confirmed' && 'bg-blue-500'
                      )} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-body-sm text-primary-text">{activity.message}</p>
                      <p className="text-caption text-secondary-text">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Today's Schedule */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-h4 font-heading">Today's Schedule</CardTitle>
              <CardDescription className="text-body-sm">Upcoming classes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {todaySchedule.map((classItem) => (
                  <div key={classItem.id} className="border-b border-surface pb-3 last:border-b-0">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-body-sm font-medium text-primary-text">{classItem.name}</h4>
                      <Badge variant="success" size="sm">Active</Badge>
                    </div>
                    <p className="text-caption text-secondary-text mb-1">{classItem.time}</p>
                    <p className="text-caption text-secondary-text mb-2">Coach: {classItem.coach}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-caption text-secondary-text">
                        {classItem.enrolled}/{classItem.capacity} enrolled
                      </span>
                      <div className="w-16 bg-accent rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full"
                          style={{ width: `${(classItem.enrolled / classItem.capacity) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }
)

Dashboard.displayName = 'Dashboard'

export { Dashboard } 