'use client'

import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts'
import { 
  DollarSign, 
  Users, 
  Building2, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight,
  MapPin,
  Calendar
} from 'lucide-react'
import { mockLocations } from '@/lib/mock-data'

// Mock analytics data
const revenueByMemberType = [
  { type: 'Home Members', revenue: 45000, members: 120, avgRevenue: 375 },
  { type: 'Multi-Location', revenue: 32000, members: 65, avgRevenue: 492 },
  { type: 'Visiting Members', revenue: 8500, members: 25, avgRevenue: 340 },
  { type: 'Day Passes', revenue: 3200, members: 128, avgRevenue: 25 },
]

const locationPerformance = [
  { 
    location: 'Downtown Fitness Center', 
    revenue: 38500, 
    members: 145, 
    utilization: 78, 
    growth: 12.5,
    classes: 156,
    avgClassSize: 14.2
  },
  { 
    location: 'Westside Gym', 
    revenue: 29200, 
    members: 98, 
    utilization: 65, 
    growth: 8.3,
    classes: 124,
    avgClassSize: 12.8
  },
  { 
    location: 'Eastside Athletic Club', 
    revenue: 21800, 
    members: 75, 
    utilization: 58, 
    growth: -2.1,
    classes: 98,
    avgClassSize: 11.5
  },
]

const memberMovementData = [
  { month: 'Jan', downtown: 145, westside: 98, eastside: 75, transfers: 8 },
  { month: 'Feb', downtown: 148, westside: 102, eastside: 73, transfers: 12 },
  { month: 'Mar', downtown: 152, westside: 105, eastside: 71, transfers: 15 },
  { month: 'Apr', downtown: 155, westside: 108, eastside: 74, transfers: 18 },
  { month: 'May', downtown: 158, westside: 112, eastside: 76, transfers: 22 },
  { month: 'Jun', downtown: 162, westside: 115, eastside: 78, transfers: 25 },
]

const memberTransfers = [
  { from: 'Downtown', to: 'Westside', count: 12, reason: 'Relocation' },
  { from: 'Westside', to: 'Downtown', count: 8, reason: 'Work proximity' },
  { from: 'Eastside', to: 'Downtown', count: 15, reason: 'Better facilities' },
  { from: 'Downtown', to: 'Eastside', count: 5, reason: 'Class schedule' },
  { from: 'Westside', to: 'Eastside', count: 7, reason: 'Convenience' },
  { from: 'Eastside', to: 'Westside', count: 3, reason: 'Program availability' },
]

const COLORS = ['#ef4444', '#06b6d4', '#10b981', '#f59e0b', '#8b5cf6']

export default function AnalyticsPage() {
  const [selectedTimeframe, setSelectedTimeframe] = useState('6months')
  const [selectedLocation, setSelectedLocation] = useState('all')

  const totalRevenue = revenueByMemberType.reduce((sum, item) => sum + item.revenue, 0)
  const totalMembers = revenueByMemberType.reduce((sum, item) => sum + item.members, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">Multi-location performance insights and member analytics</p>
        </div>
        
        <div className="flex items-center gap-3">
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="1month">Last Month</option>
            <option value="3months">Last 3 Months</option>
            <option value="6months">Last 6 Months</option>
            <option value="1year">Last Year</option>
          </select>
          
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Locations</option>
            {mockLocations.filter(loc => loc.isActive).map(location => (
              <option key={location.id} value={location.id}>{location.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">${totalRevenue.toLocaleString()}</p>
                <div className="flex items-center mt-1">
                  <ArrowUpRight className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-600">+12.5%</span>
                </div>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Members</p>
                <p className="text-2xl font-bold text-gray-900">{totalMembers}</p>
                <div className="flex items-center mt-1">
                  <ArrowUpRight className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-600">+8.3%</span>
                </div>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Locations</p>
                <p className="text-2xl font-bold text-gray-900">{mockLocations.filter(l => l.isActive).length}</p>
                <div className="flex items-center mt-1">
                  <span className="text-sm text-gray-500">Avg Utilization: 67%</span>
                </div>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Building2 className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Member Transfers</p>
                <p className="text-2xl font-bold text-gray-900">50</p>
                <div className="flex items-center mt-1">
                  <ArrowUpRight className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-600">This month</span>
                </div>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <MapPin className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Breakdown by Member Type */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5" />
              <span>Revenue by Member Type</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueByMemberType}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="type" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => [
                      name === 'revenue' ? `$${value.toLocaleString()}` : value,
                      name === 'revenue' ? 'Revenue' : 'Members'
                    ]}
                  />
                  <Bar dataKey="revenue" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Member Distribution</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={revenueByMemberType}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ type, percent }) => `${type}: ${((percent || 0) * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="members"
                  >
                    {revenueByMemberType.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Location Performance Comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Building2 className="h-5 w-5" />
            <span>Location Performance Comparison</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Location</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-900">Revenue</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-900">Members</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-900">Utilization</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-900">Growth</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-900">Classes</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-900">Avg Class Size</th>
                </tr>
              </thead>
              <tbody>
                {locationPerformance.map((location, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        <Building2 className="h-4 w-4 text-gray-400" />
                        <span className="font-medium text-gray-900">{location.location}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right font-medium text-gray-900">
                      ${location.revenue.toLocaleString()}
                    </td>
                    <td className="py-4 px-4 text-right text-gray-600">{location.members}</td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${location.utilization}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600">{location.utilization}%</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className={`flex items-center justify-end space-x-1 ${
                        location.growth >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {location.growth >= 0 ? (
                          <ArrowUpRight className="h-4 w-4" />
                        ) : (
                          <ArrowDownRight className="h-4 w-4" />
                        )}
                        <span className="font-medium">{Math.abs(location.growth)}%</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right text-gray-600">{location.classes}</td>
                    <td className="py-4 px-4 text-right text-gray-600">{location.avgClassSize}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Member Movement Patterns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Member Growth by Location</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={memberMovementData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="downtown" stackId="1" stroke="#ef4444" fill="#ef4444" />
                  <Area type="monotone" dataKey="westside" stackId="1" stroke="#06b6d4" fill="#06b6d4" />
                  <Area type="monotone" dataKey="eastside" stackId="1" stroke="#10b981" fill="#10b981" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="h-5 w-5" />
              <span>Member Transfer Patterns</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {memberTransfers.map((transfer, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-900">{transfer.from}</span>
                      <ArrowUpRight className="h-4 w-4 text-gray-400 rotate-90" />
                      <span className="text-sm font-medium text-gray-900">{transfer.to}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-gray-600">{transfer.reason}</span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                      {transfer.count} members
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Transfer Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Monthly Transfer Activity</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={memberMovementData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="transfers" 
                  stroke="#f59e0b" 
                  strokeWidth={3}
                  dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 