import React from 'react'
import { cn } from '@/lib/utils'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { 
  CalendarIcon, 
  ChartBarIcon,
  PlusIcon,
  PlayIcon,
  UserPlusIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  FireIcon,
  BoltIcon,
  TrophyIcon,
  CurrencyDollarIcon,
  UsersIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import { mockDashboardStats } from '@/lib/mock-data'
import Link from 'next/link'

export interface DashboardProps extends React.HTMLAttributes<HTMLDivElement> {
  stats?: typeof mockDashboardStats
}

const Dashboard = React.forwardRef<HTMLDivElement, DashboardProps>(
  ({ 
    className, 
    ...props 
  }, ref) => {
    // Enhanced stats with trends and colors
    const enhancedStats = [
      {
        title: 'Active Members',
        value: '1,247',
        change: '+12%',
        trend: 'up',
        icon: UsersIcon,
        color: 'bg-primary',
        description: 'vs last month'
      },
      {
        title: 'Classes Today',
        value: '24',
        change: '+3',
        trend: 'up',
        icon: CalendarIcon,
        color: 'bg-info',
        description: 'scheduled sessions'
      },
      {
        title: 'Revenue',
        value: '$18,420',
        change: '+8.2%',
        trend: 'up',
        icon: CurrencyDollarIcon,
        color: 'bg-success',
        description: 'this month'
      },
      {
        title: 'Attendance Rate',
        value: '94%',
        change: '+2.1%',
        trend: 'up',
        icon: TrophyIcon,
        color: 'bg-warning',
        description: 'avg this week'
      }
    ]

    const quickActions = [
      {
        title: 'Schedule Class',
        description: 'Create new class session',
        icon: PlusIcon,
        href: '/classes/calendar',
        color: 'bg-primary',
        textColor: 'text-primary'
      },
      {
        title: 'Add Member',
        description: 'Register new client',
        icon: UserPlusIcon,
        href: '/people/clients',
        color: 'bg-success',
        textColor: 'text-success'
      },
      {
        title: 'Create Workout',
        description: 'Design training program',
        icon: PlayIcon,
        href: '/perform/workouts',
        color: 'bg-info',
        textColor: 'text-info'
      },
      {
        title: 'View Analytics',
        description: 'Check performance data',
        icon: ChartBarIcon,
        href: '/analytics',
        color: 'bg-warning',
        textColor: 'text-warning'
      }
    ]

    const recentActivity = [
      {
        id: '1',
        type: 'reservation',
        title: 'New Class Booking',
        message: 'John Smith booked HIIT Cardio for tomorrow',
        time: '2 min ago',
        status: 'success',
        icon: CheckCircleIcon
      },
      {
        id: '2',
        type: 'member',
        title: 'New Member Joined',
        message: 'Maria Garcia completed registration',
        time: '15 min ago',
        status: 'success',
        icon: UserPlusIcon
      },
      {
        id: '3',
        type: 'alert',
        title: 'Low Class Enrollment',
        message: 'Yoga Flow has only 3 bookings for today',
        time: '1 hour ago',
        status: 'warning',
        icon: ExclamationTriangleIcon
      },
      {
        id: '4',
        type: 'payment',
        title: 'Payment Received',
        message: 'Monthly membership fee from David Wilson',
        time: '2 hours ago',
        status: 'success',
        icon: CurrencyDollarIcon
      }
    ]

    const todaySchedule = [
      {
        id: '1',
        name: 'HIIT Cardio Blast',
        time: '6:00 AM',
        duration: '45 min',
        coach: 'Sarah Johnson',
        enrolled: 18,
        capacity: 20,
        status: 'high-demand',
        category: 'cardio'
      },
      {
        id: '2',
        name: 'Strength & Power',
        time: '7:00 AM',
        duration: '60 min',
        coach: 'Mike Chen',
        enrolled: 12,
        capacity: 15,
        status: 'available',
        category: 'strength'
      },
      {
        id: '3',
        name: 'Yoga Flow',
        time: '6:00 PM',
        duration: '60 min',
        coach: 'Emma Davis',
        enrolled: 8,
        capacity: 25,
        status: 'low-enrollment',
        category: 'wellness'
      }
    ]

    const performanceMetrics = [
      { label: 'Peak Hours', value: '6-8 AM', subtext: 'Highest attendance' },
      { label: 'Popular Class', value: 'HIIT Cardio', subtext: '89% avg attendance' },
      { label: 'Top Trainer', value: 'Sarah Johnson', subtext: '4.9⭐ rating' },
      { label: 'Retention Rate', value: '92%', subtext: 'Member retention' }
    ]

    return (
      <div
        ref={ref}
        className={cn('space-y-6', className)}
        {...props}
      >
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-h1 font-heading text-primary-text mb-2">
              Good morning, Admin 👋
            </h1>
            <p className="text-body text-secondary-text">
              Here&rsquo;s what&rsquo;s happening at your gym today
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="text-right hidden sm:block">
              <p className="text-body-sm text-secondary-text">Today</p>
              <p className="text-body font-medium text-primary-text">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </p>
            </div>
            <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
          </div>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {enhancedStats.map((stat, index) => (
            <Card key={index} className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl ${stat.color} flex items-center justify-center`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex items-center space-x-1">
                    {stat.trend === 'up' ? (
                      <ArrowUpIcon className="h-4 w-4 text-success" />
                    ) : (
                      <ArrowDownIcon className="h-4 w-4 text-danger" />
                    )}
                    <span className={`text-body-sm font-medium ${
                      stat.trend === 'up' ? 'text-success' : 'text-danger'
                    }`}>
                      {stat.change}
                    </span>
                  </div>
                </div>
                <div>
                  <h3 className="text-h2 font-heading text-primary-text mb-1">{stat.value}</h3>
                  <p className="text-body-sm font-medium text-secondary-text mb-1">{stat.title}</p>
                  <p className="text-caption text-muted">{stat.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BoltIcon className="h-5 w-5 text-primary" />
              <span>Quick Actions</span>
            </CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActions.map((action, index) => (
                <Link key={index} href={action.href}>
                  <div className="group p-4 rounded-xl border border-surface hover:border-primary/20 transition-all duration-200 cursor-pointer hover:shadow-md">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className={`p-2 rounded-lg ${action.color} flex items-center justify-center`}>
                        <action.icon className="h-5 w-5 text-white" />
                      </div>
                      <ArrowRightIcon className="h-4 w-4 text-secondary-text group-hover:text-primary transition-colors ml-auto" />
                    </div>
                    <h3 className="text-body font-medium text-primary-text group-hover:text-primary transition-colors mb-1">
                      {action.title}
                    </h3>
                    <p className="text-body-sm text-secondary-text">
                      {action.description}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Today's Schedule */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <CalendarIcon className="h-5 w-5 text-primary" />
                    <span>Today&rsquo;s Schedule</span>
                  </CardTitle>
                  <CardDescription>Upcoming classes and sessions</CardDescription>
                </div>
                <Link 
                  href="/classes/calendar" 
                  className="flex items-center space-x-1 text-body-sm text-primary hover:text-primary-light transition-colors"
                >
                  <span>View All</span>
                  <ArrowRightIcon className="h-4 w-4" />
                </Link>
              </CardHeader>
              <CardContent className="space-y-4">
                {todaySchedule.map((classItem) => (
                  <div 
                    key={classItem.id} 
                    className="flex items-center justify-between p-4 bg-accent rounded-xl hover:bg-secondary/30 transition-colors group"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="text-center">
                        <p className="text-body font-medium text-primary-text">{classItem.time}</p>
                        <p className="text-caption text-secondary-text">{classItem.duration}</p>
                      </div>
                      <div className="w-px h-12 bg-surface"></div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="text-body font-medium text-primary-text">{classItem.name}</h3>
                          <span className={`px-2 py-1 rounded-full text-caption font-medium ${
                            classItem.status === 'high-demand' 
                              ? 'bg-primary/20 text-primary' 
                              : classItem.status === 'low-enrollment'
                              ? 'bg-warning/20 text-warning'
                              : 'bg-success/20 text-success'
                          }`}>
                            {classItem.status === 'high-demand' ? 'High Demand' : 
                             classItem.status === 'low-enrollment' ? 'Low Enrollment' : 'Available'}
                          </span>
                        </div>
                        <p className="text-body-sm text-secondary-text">
                          Coach: {classItem.coach}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="flex items-center space-x-1 text-body-sm text-secondary-text mb-1">
                          <UsersIcon className="h-4 w-4" />
                          <span>{classItem.enrolled}/{classItem.capacity}</span>
                        </div>
                        <div className="w-20 bg-surface rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-300 ${
                              classItem.status === 'high-demand' ? 'bg-primary' :
                              classItem.status === 'low-enrollment' ? 'bg-warning' : 'bg-success'
                            }`}
                            style={{ width: `${(classItem.enrolled / classItem.capacity) * 100}%` }}
                          />
                        </div>
                      </div>
                      <ArrowRightIcon className="h-5 w-5 text-secondary-text group-hover:text-primary transition-colors" />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FireIcon className="h-5 w-5 text-primary" />
                  <span>Recent Activity</span>
                </CardTitle>
                <CardDescription>Latest updates and events</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className={`p-2 rounded-lg ${
                      activity.status === 'success' ? 'bg-success/10' : 'bg-warning/10'
                    } flex-shrink-0`}>
                      <activity.icon className={`h-4 w-4 ${
                        activity.status === 'success' ? 'text-success' : 'text-warning'
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-body-sm font-medium text-primary-text mb-1">
                        {activity.title}
                      </h4>
                      <p className="text-caption text-secondary-text mb-1">
                        {activity.message}
                      </p>
                      <p className="text-caption text-muted">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <ChartBarIcon className="h-5 w-5 text-primary" />
                  <span>Key Insights</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {performanceMetrics.map((metric, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <p className="text-body-sm font-medium text-primary-text">{metric.label}</p>
                      <p className="text-caption text-secondary-text">{metric.subtext}</p>
                    </div>
                    <p className="text-body font-medium text-primary">{metric.value}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }
)

Dashboard.displayName = 'Dashboard'

export { Dashboard } 