import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { 
  Cog6ToothIcon,
  UsersIcon,
  CalendarIcon,
  BellIcon,
  ShieldCheckIcon,
  AdjustmentsHorizontalIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline'

export default function ClassesSettingsPage() {
  const settingsCategories = [
    {
      title: 'Class Scheduling',
      description: 'Configure default class times, durations, and booking windows',
      icon: CalendarIcon,
      color: 'bg-primary',
      settings: [
        { name: 'Default Class Duration', value: '60 minutes', status: 'configured' },
        { name: 'Booking Window', value: '7 days advance', status: 'configured' },
        { name: 'Cancellation Policy', value: '24 hours', status: 'configured' }
      ]
    },
    {
      title: 'Capacity & Limits',
      description: 'Set maximum participants and waitlist configurations',
      icon: UsersIcon,
      color: 'bg-success',
      settings: [
        { name: 'Default Max Capacity', value: '20 participants', status: 'configured' },
        { name: 'Waitlist Enabled', value: 'Yes', status: 'configured' },
        { name: 'Overbooking Allowed', value: 'No', status: 'needs-attention' }
      ]
    },
    {
      title: 'Notifications',
      description: 'Manage class reminders and booking confirmations',
      icon: BellIcon,
      color: 'bg-info',
      settings: [
        { name: 'Booking Confirmations', value: 'Email + SMS', status: 'configured' },
        { name: 'Class Reminders', value: '2 hours before', status: 'configured' },
        { name: 'Cancellation Alerts', value: 'Enabled', status: 'configured' }
      ]
    },
    {
      title: 'Access Control',
      description: 'Set permissions and instructor access levels',
      icon: ShieldCheckIcon,
      color: 'bg-warning',
      settings: [
        { name: 'Instructor Permissions', value: 'Manage own classes', status: 'configured' },
        { name: 'Member Self-Booking', value: 'Enabled', status: 'configured' },
        { name: 'Admin Approval Required', value: 'Special events only', status: 'needs-attention' }
      ]
    }
  ]

  const quickSettings = [
    { label: 'Active Class Types', value: '12', icon: AdjustmentsHorizontalIcon, color: 'bg-primary' },
    { label: 'Configured Instructors', value: '8', icon: UsersIcon, color: 'bg-success' },
    { label: 'Notification Rules', value: '6', icon: BellIcon, color: 'bg-info' },
    { label: 'Custom Templates', value: '4', icon: DocumentTextIcon, color: 'bg-warning' }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-h1 font-heading text-primary-text mb-2">Classes Settings</h1>
          <p className="text-body text-secondary-text">
            Configure class settings, policies, and system preferences
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm">
            <DocumentTextIcon className="h-4 w-4 mr-2" />
            Export Config
          </Button>
          <Button variant="primary" size="sm">
            <Cog6ToothIcon className="h-4 w-4 mr-2" />
            Advanced Settings
          </Button>
        </div>
      </div>

      {/* Quick Settings Stats - Compact */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {quickSettings.map((setting, index) => (
          <Card key={index} className="group hover:shadow-md transition-all duration-300">
            <CardContent className="p-3">
              <div className="flex items-center space-x-2">
                <div className={`p-2 rounded-lg ${setting.color} flex items-center justify-center flex-shrink-0`}>
                  <setting.icon className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-body-sm font-semibold text-primary-text">{setting.value}</h3>
                  <p className="text-xs text-secondary-text truncate">{setting.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Settings Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {settingsCategories.map((category, index) => (
          <Card key={index} className="group hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center space-x-2">
                <div className={`p-2 rounded-lg ${category.color} flex items-center justify-center`}>
                  <category.icon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <span className="text-body font-medium text-primary-text">{category.title}</span>
                  <p className="text-body-sm text-secondary-text font-normal mt-1">
                    {category.description}
                  </p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {category.settings.map((setting, settingIndex) => (
                  <div key={settingIndex} className="flex items-center justify-between p-3 bg-accent rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-body-sm font-medium text-primary-text">
                          {setting.name}
                        </span>
                        {setting.status === 'configured' ? (
                          <CheckCircleIcon className="h-4 w-4 text-success" />
                        ) : (
                          <XCircleIcon className="h-4 w-4 text-warning" />
                        )}
                      </div>
                      <p className="text-caption text-secondary-text mt-1">
                        {setting.value}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm">
                      Edit
                    </Button>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-surface">
                <Button variant="outline" size="sm" className="w-full">
                  Configure {category.title}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ShieldCheckIcon className="h-5 w-5 text-primary" />
            <span>System Status</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3 p-3 bg-success/10 rounded-lg">
              <CheckCircleIcon className="h-5 w-5 text-success flex-shrink-0" />
              <div>
                <p className="text-body-sm font-medium text-primary-text">Classes System</p>
                <p className="text-caption text-success">Operational</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-success/10 rounded-lg">
              <CheckCircleIcon className="h-5 w-5 text-success flex-shrink-0" />
              <div>
                <p className="text-body-sm font-medium text-primary-text">Booking Engine</p>
                <p className="text-caption text-success">Online</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-success/10 rounded-lg">
              <CheckCircleIcon className="h-5 w-5 text-success flex-shrink-0" />
              <div>
                <p className="text-body-sm font-medium text-primary-text">Notifications</p>
                <p className="text-caption text-success">Active</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 