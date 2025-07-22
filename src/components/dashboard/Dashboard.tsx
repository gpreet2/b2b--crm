import React from 'react'
import { cn } from '@/lib/utils'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { 
  CalendarIcon, 
  UserPlusIcon,
  ArrowUpIcon,
  TrophyIcon,
  CurrencyDollarIcon,
  UsersIcon,
  ArrowRightIcon,
  ExclamationTriangleIcon,
  UserIcon,
  ClockIcon,
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
    // Gym staff profile data
    const staffProfile = {
      name: 'Sarah Johnson',
      email: 'sarah@fitnesspro.com',
      role: 'Head Trainer',
      experience: '5 years',
      speciality: 'HIIT &amp; Strength'
    }

    // Gym metrics data
    const gymMetrics = [
      {
        title: 'Active Members',
        value: '1,247',
        percentage: 85,
        color: 'bg-success',
        icon: UsersIcon,
        change: '+12%'
      },
      {
        title: 'Classes Today',
        value: '24',
        percentage: 92,
        color: 'bg-primary',
        icon: CalendarIcon,
        change: '+3'
      },
      {
        title: 'Revenue',
        value: '$18,420',
        percentage: 78,
        color: 'bg-info',
        icon: CurrencyDollarIcon,
        change: '+8.2%'
      },
      {
        title: 'Attendance Rate',
        value: '94%',
        percentage: 94,
        color: 'bg-warning',
        icon: TrophyIcon,
        change: '+2.1%'
      }
    ]

    // Today's goals/tasks
    const todaysTasks = [
      {
        title: 'New Member Orientation',
        time: 'Today, 10:00 AM',
        badge: 'High Priority'
      },
      {
        title: 'Equipment Maintenance',
        time: 'Today, 2:00 PM',
        badge: 'Scheduled'
      }
    ]

    // Today's classes
    const todaysClasses = [
      {
        name: 'HIIT Cardio Blast',
        time: '6:00 AM',
        trainer: 'Sarah Johnson',
        enrolled: 18,
        capacity: 20,
        status: 'high-demand'
      },
      {
        name: 'Strength &amp; Power',
        time: '7:00 AM',
        trainer: 'Mike Chen',
        enrolled: 12,
        capacity: 15,
        status: 'available'
      },
      {
        name: 'Yoga Flow',
        time: '6:00 PM',
        trainer: 'Emma Davis',
        enrolled: 8,
        capacity: 25,
        status: 'low-enrollment'
      }
    ]

    // Recent activities
    const recentActivities = [
      {
        type: 'member',
        title: 'New Member Joined',
        message: 'John Smith completed registration',
        time: '15 min ago',
        status: 'success'
      },
      {
        type: 'class',
        title: 'Class Booking',
        message: 'Maria Garcia booked HIIT Cardio',
        time: '2 hours ago',
        status: 'success'
      },
      {
        type: 'alert',
        title: 'Low Enrollment',
        message: 'Yoga Flow has only 3 bookings',
        time: '1 hour ago',
        status: 'warning'
      }
    ]

    // Activity data for the graph
    const activityData = [
      { day: 'S', hours: 2.5 },
      { day: 'M', hours: 4.2 },
      { day: 'T', hours: 3.8 },
      { day: 'W', hours: 4.5 },
      { day: 'T', hours: 3.2 },
      { day: 'F', hours: 4.8 },
      { day: 'S', hours: 3.5 }
    ]

    return (
      <div
        ref={ref}
        className={cn('p-6 space-y-6 bg-background min-h-screen', className)}
        {...props}
      >
        {/* Minimal Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-primary-text">
              Dashboard
            </h1>
            <p className="text-secondary-text">
              Welcome back, {staffProfile.name}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <p className="text-sm text-secondary-text">Today</p>
              <p className="text-primary-text font-medium">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-8 space-y-6">
            {/* Gym Metrics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {gymMetrics.map((metric, index) => (
                <Card key={index} className="bg-surface border-surface">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className={`p-2 rounded-lg ${metric.color} flex items-center justify-center`}>
                        <metric.icon className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex items-center space-x-1">
                        <ArrowUpIcon className="h-4 w-4 text-success" />
                        <span className="text-xs text-success font-medium">{metric.change}</span>
                      </div>
                    </div>
                    <div className="mb-3">
                      <h3 className="text-lg font-semibold text-primary-text mb-1">{metric.value}</h3>
                      <p className="text-sm text-secondary-text">{metric.title}</p>
                    </div>
                    <div className="w-full bg-surface-light rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${metric.color}`}
                        style={{ width: `${metric.percentage}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted mt-2">{metric.percentage}%</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Today's Tasks */}
            <Card className="bg-surface border-surface">
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                <CardTitle className="text-primary-text">Today&apos;s Tasks</CardTitle>
                <Link href="/tasks" className="text-secondary-text hover:text-primary transition-colors">
                  View all
                </Link>
              </CardHeader>
              <CardContent className="space-y-4">
                {todaysTasks.map((task, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-accent rounded-lg">
                    <div>
                      <h4 className="text-primary-text font-medium mb-1">{task.title}</h4>
                      <p className="text-sm text-secondary-text">{task.time}</p>
                    </div>
                    <span className="px-3 py-1 bg-surface text-primary-text text-sm rounded-full">
                      {task.badge}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Today's Classes */}
            <Card className="bg-surface border-surface">
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                <CardTitle className="text-primary-text">Today&apos;s Classes</CardTitle>
                <Link href="/classes/calendar" className="text-secondary-text hover:text-primary transition-colors">
                  View all
                </Link>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {todaysClasses.map((classItem, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-accent rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="text-center">
                          <p className="text-primary-text font-medium">{classItem.time}</p>
                          <p className="text-xs text-secondary-text">45 min</p>
                        </div>
                        <div className="w-px h-12 bg-surface"></div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="text-primary-text font-medium">{classItem.name}</h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
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
                          <p className="text-sm text-secondary-text">
                            Trainer: {classItem.trainer}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="flex items-center space-x-1 text-sm text-secondary-text mb-1">
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
                        <ArrowRightIcon className="h-5 w-5 text-secondary-text" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-4 space-y-6">
            {/* Staff Profile Card */}
            <Card className="bg-surface border-surface">
              <CardContent className="p-6 text-center">
                <div className="w-20 h-20 bg-primary rounded-full mx-auto mb-4 flex items-center justify-center">
                  <UserIcon className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-primary-text mb-1">{staffProfile.name}</h3>
                <p className="text-sm text-secondary-text mb-2">{staffProfile.email}</p>
                <p className="text-sm text-primary mb-6">{staffProfile.role}</p>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="w-8 h-8 bg-accent rounded-lg mx-auto mb-2 flex items-center justify-center">
                      <ClockIcon className="h-4 w-4 text-secondary-text" />
                    </div>
                    <p className="text-sm text-secondary-text">Experience</p>
                    <p className="text-primary-text font-semibold">{staffProfile.experience}</p>
                  </div>
                  <div className="text-center">
                    <div className="w-8 h-8 bg-accent rounded-lg mx-auto mb-2 flex items-center justify-center">
                      <TrophyIcon className="h-4 w-4 text-secondary-text" />
                    </div>
                    <p className="text-sm text-secondary-text">Speciality</p>
                    <p className="text-primary-text font-semibold text-xs">{staffProfile.speciality}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="bg-surface border-surface">
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                <CardTitle className="text-primary-text">Recent Activity</CardTitle>
                <Link href="/activity" className="text-secondary-text hover:text-primary transition-colors">
                  View all
                </Link>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className={`p-2 rounded-lg ${
                      activity.status === 'success' ? 'bg-success/10' : 'bg-warning/10'
                    } flex-shrink-0`}>
                      {activity.type === 'member' && <UserPlusIcon className="h-4 w-4 text-success" />}
                      {activity.type === 'class' && <CalendarIcon className="h-4 w-4 text-success" />}
                      {activity.type === 'alert' && <ExclamationTriangleIcon className="h-4 w-4 text-warning" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-primary-text mb-1">
                        {activity.title}
                      </h4>
                      <p className="text-xs text-secondary-text mb-1">
                        {activity.message}
                      </p>
                      <p className="text-xs text-muted">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Calendar */}
            <Card className="bg-surface border-surface">
              <CardHeader>
                <CardTitle className="text-primary-text">May 2024</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, index) => (
                    <div key={index} className="text-center text-sm text-secondary-text font-medium py-2">
                      {day}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((date) => (
                    <div 
                      key={date} 
                      className={cn(
                        "text-center text-sm py-2 rounded-lg cursor-pointer transition-colors",
                        date === 2 
                          ? "bg-primary text-white" 
                          : "text-secondary-text hover:bg-accent"
                      )}
                    >
                      {date}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Gym Activity Graph */}
            <Card className="bg-surface border-surface">
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                <CardTitle className="text-primary-text">Gym Activity</CardTitle>
                <select className="text-sm text-secondary-text bg-accent border-none rounded px-2 py-1">
                  <option>Weekly</option>
                </select>
              </CardHeader>
              <CardContent>
                <div className="flex items-end justify-between h-32 space-x-1">
                  {activityData.map((item, index) => (
                    <div key={index} className="flex flex-col items-center flex-1">
                      <div 
                        className={cn(
                          "w-full rounded-t transition-all duration-300",
                          item.day === 'M' ? "bg-success" : "bg-accent"
                        )}
                        style={{ height: `${(item.hours / 5) * 100}%` }}
                      />
                      <span className="text-xs text-secondary-text mt-2">{item.day}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between text-xs text-secondary-text mt-2">
                  <span>0h</span>
                  <span>5h</span>
                </div>
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