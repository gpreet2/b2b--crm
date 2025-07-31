'use client'

import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { 
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  ArrowPathIcon,
  DocumentArrowDownIcon
} from '@heroicons/react/24/outline'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  AreaChart
} from 'recharts'

// Mock report data
const membershipRevenueReport = [
  { 
    memberType: 'Home Members',
    jan: 42000, feb: 43500, mar: 45000, apr: 46200, may: 47800, jun: 49000,
    totalRevenue: 273500,
    avgMonthly: 45583,
    growth: 16.7
  },
  { 
    memberType: 'Multi-Location',
    jan: 28000, feb: 29200, mar: 30500, apr: 31800, may: 32900, jun: 34200,
    totalRevenue: 186600,
    avgMonthly: 31100,
    growth: 22.1
  },
  { 
    memberType: 'Visiting Members',
    jan: 7200, feb: 7800, mar: 8100, apr: 8400, may: 8700, jun: 9000,
    totalRevenue: 49200,
    avgMonthly: 8200,
    growth: 25.0
  },
  { 
    memberType: 'Day Passes',
    jan: 2800, feb: 3100, mar: 3200, apr: 3400, may: 3600, jun: 3800,
    totalRevenue: 19900,
    avgMonthly: 3317,
    growth: 35.7
  }
]

const locationComparisonReport = [
  {
    location: 'Downtown Fitness Center',
    members: { home: 95, multiLocation: 35, visiting: 15 },
    revenue: { membership: 35000, dayPass: 2500, personal: 1000 },
    utilization: 78,
    classesOffered: 156,
    avgClassSize: 14.2,
    memberSatisfaction: 4.6,
    retentionRate: 89
  },
  {
    location: 'Westside Gym',
    members: { home: 68, multiLocation: 22, visiting: 8 },
    revenue: { membership: 26500, dayPass: 1800, personal: 900 },
    utilization: 65,
    classesOffered: 124,
    avgClassSize: 12.8,
    memberSatisfaction: 4.3,
    retentionRate: 85
  },
  {
    location: 'Eastside Athletic Club',
    members: { home: 52, multiLocation: 15, visiting: 8 },
    revenue: { membership: 19800, dayPass: 1200, personal: 800 },
    utilization: 58,
    classesOffered: 98,
    avgClassSize: 11.5,
    memberSatisfaction: 4.1,
    retentionRate: 78
  }
]

const memberMovementReport = [
  { month: 'Jan', newMembers: 12, transfers: 5, cancellations: 3, netGrowth: 14 },
  { month: 'Feb', newMembers: 15, transfers: 8, cancellations: 4, netGrowth: 19 },
  { month: 'Mar', newMembers: 18, transfers: 12, cancellations: 2, netGrowth: 28 },
  { month: 'Apr', newMembers: 14, transfers: 15, cancellations: 5, netGrowth: 24 },
  { month: 'May', newMembers: 16, transfers: 18, cancellations: 3, netGrowth: 31 },
  { month: 'Jun', newMembers: 20, transfers: 22, cancellations: 4, netGrowth: 38 }
]

export default function ReportsPage() {
  const [selectedReport, setSelectedReport] = useState('revenue')
  const [dateRange, setDateRange] = useState('6months')

  const generateReport = () => {
    // Mock report generation
    alert('Report generated successfully! Download will begin shortly.')
  }

  const renderRevenueReport = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Revenue Breakdown by Member Type</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Member Type</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-900">Total Revenue</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-900">Avg Monthly</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-900">Growth Rate</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-900">% of Total</th>
                </tr>
              </thead>
              <tbody>
                {membershipRevenueReport.map((item, index) => {
                  const totalRevenue = membershipRevenueReport.reduce((sum, i) => sum + i.totalRevenue, 0)
                  const percentage = ((item.totalRevenue / totalRevenue) * 100).toFixed(1)
                  return (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4 font-medium text-gray-900">{item.memberType}</td>
                      <td className="py-4 px-4 text-right font-medium text-gray-900">
                        ${item.totalRevenue.toLocaleString()}
                      </td>
                      <td className="py-4 px-4 text-right text-gray-600">
                        ${item.avgMonthly.toLocaleString()}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span className="text-green-600 font-medium">+{item.growth}%</span>
                      </td>
                      <td className="py-4 px-4 text-right text-gray-600">{percentage}%</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Monthly Revenue Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={[
                { month: 'Jan', home: 42000, multiLocation: 28000, visiting: 7200, dayPass: 2800 },
                { month: 'Feb', home: 43500, multiLocation: 29200, visiting: 7800, dayPass: 3100 },
                { month: 'Mar', home: 45000, multiLocation: 30500, visiting: 8100, dayPass: 3200 },
                { month: 'Apr', home: 46200, multiLocation: 31800, visiting: 8400, dayPass: 3400 },
                { month: 'May', home: 47800, multiLocation: 32900, visiting: 8700, dayPass: 3600 },
                { month: 'Jun', home: 49000, multiLocation: 34200, visiting: 9000, dayPass: 3800 }
              ]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, '']} />
                <Area type="monotone" dataKey="home" stackId="1" stroke="#ef4444" fill="#ef4444" />
                <Area type="monotone" dataKey="multiLocation" stackId="1" stroke="#06b6d4" fill="#06b6d4" />
                <Area type="monotone" dataKey="visiting" stackId="1" stroke="#10b981" fill="#10b981" />
                <Area type="monotone" dataKey="dayPass" stackId="1" stroke="#f59e0b" fill="#f59e0b" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderLocationReport = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Location Performance Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Location</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-900">Total Members</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-900">Revenue</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-900">Utilization</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-900">Satisfaction</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-900">Retention</th>
                </tr>
              </thead>
              <tbody>
                {locationComparisonReport.map((location, index) => {
                  const totalMembers = location.members.home + location.members.multiLocation + location.members.visiting
                  const totalRevenue = location.revenue.membership + location.revenue.dayPass + location.revenue.personal
                  return (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4 font-medium text-gray-900">{location.location}</td>
                      <td className="py-4 px-4 text-right text-gray-600">{totalMembers}</td>
                      <td className="py-4 px-4 text-right font-medium text-gray-900">
                        ${totalRevenue.toLocaleString()}
                      </td>
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
                        <span className="text-yellow-600 font-medium">★ {location.memberSatisfaction}</span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span className="text-green-600 font-medium">{location.retentionRate}%</span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Member Distribution by Location</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={locationComparisonReport.map(loc => ({
                  location: loc.location.split(' ')[0],
                  home: loc.members.home,
                  multiLocation: loc.members.multiLocation,
                  visiting: loc.members.visiting
                }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="location" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="home" stackId="a" fill="#ef4444" name="Home Members" />
                  <Bar dataKey="multiLocation" stackId="a" fill="#06b6d4" name="Multi-Location" />
                  <Bar dataKey="visiting" stackId="a" fill="#10b981" name="Visiting" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue Sources by Location</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={locationComparisonReport.map(loc => ({
                  location: loc.location.split(' ')[0],
                  membership: loc.revenue.membership,
                  dayPass: loc.revenue.dayPass,
                  personal: loc.revenue.personal
                }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="location" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, '']} />
                  <Bar dataKey="membership" stackId="a" fill="#ef4444" name="Memberships" />
                  <Bar dataKey="dayPass" stackId="a" fill="#06b6d4" name="Day Passes" />
                  <Bar dataKey="personal" stackId="a" fill="#10b981" name="Personal Training" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  const renderMovementReport = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Member Movement Patterns</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={memberMovementReport}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="newMembers" fill="#10b981" name="New Members" />
                <Bar dataKey="transfers" fill="#06b6d4" name="Transfers" />
                <Bar dataKey="cancellations" fill="#ef4444" name="Cancellations" />
                <Line type="monotone" dataKey="netGrowth" stroke="#f59e0b" strokeWidth={3} name="Net Growth" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">154</div>
              <div className="text-sm text-gray-600">Total New Members</div>
              <div className="text-xs text-green-600 mt-1">+28% vs last period</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">80</div>
              <div className="text-sm text-gray-600">Location Transfers</div>
              <div className="text-xs text-blue-600 mt-1">+45% vs last period</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600 mb-2">21</div>
              <div className="text-sm text-gray-600">Cancellations</div>
              <div className="text-xs text-red-600 mt-1">-12% vs last period</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Reports</h1>
          <p className="text-gray-600 mt-1">Detailed performance reports and data analysis</p>
        </div>
        
        <div className="flex items-center gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="1month">Last Month</option>
            <option value="3months">Last 3 Months</option>
            <option value="6months">Last 6 Months</option>
            <option value="1year">Last Year</option>
          </select>
          
          <button
            onClick={generateReport}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <DocumentArrowDownIcon className="h-4 w-4" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Report Type Selector */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <button
            onClick={() => setSelectedReport('revenue')}
            className={`p-4 rounded-lg text-left transition-all duration-200 ${
              selectedReport === 'revenue'
                ? 'bg-red-50 border-2 border-red-200 shadow-sm'
                : 'hover:bg-gray-50 border-2 border-transparent'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${
                selectedReport === 'revenue' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'
              }`}>
                <CurrencyDollarIcon className="h-5 w-5" />
              </div>
              <div>
                <h3 className={`font-medium ${
                  selectedReport === 'revenue' ? 'text-red-900' : 'text-gray-900'
                }`}>
                  Revenue Analysis
                </h3>
                <p className={`text-sm ${
                  selectedReport === 'revenue' ? 'text-red-700' : 'text-gray-600'
                }`}>
                  Member type revenue breakdown
                </p>
              </div>
            </div>
          </button>

          <button
            onClick={() => setSelectedReport('location')}
            className={`p-4 rounded-lg text-left transition-all duration-200 ${
              selectedReport === 'location'
                ? 'bg-red-50 border-2 border-red-200 shadow-sm'
                : 'hover:bg-gray-50 border-2 border-transparent'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${
                selectedReport === 'location' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'
              }`}>
                <BuildingOfficeIcon className="h-5 w-5" />
              </div>
              <div>
                <h3 className={`font-medium ${
                  selectedReport === 'location' ? 'text-red-900' : 'text-gray-900'
                }`}>
                  Location Performance
                </h3>
                <p className={`text-sm ${
                  selectedReport === 'location' ? 'text-red-700' : 'text-gray-600'
                }`}>
                  Multi-location comparison
                </p>
              </div>
            </div>
          </button>

          <button
            onClick={() => setSelectedReport('movement')}
            className={`p-4 rounded-lg text-left transition-all duration-200 ${
              selectedReport === 'movement'
                ? 'bg-red-50 border-2 border-red-200 shadow-sm'
                : 'hover:bg-gray-50 border-2 border-transparent'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${
                selectedReport === 'movement' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'
              }`}>
                <ArrowPathIcon className="h-5 w-5" />
              </div>
              <div>
                <h3 className={`font-medium ${
                  selectedReport === 'movement' ? 'text-red-900' : 'text-gray-900'
                }`}>
                  Member Movement
                </h3>
                <p className={`text-sm ${
                  selectedReport === 'movement' ? 'text-red-700' : 'text-gray-600'
                }`}>
                  Transfer and growth patterns
                </p>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Report Content */}
      <div>
        {selectedReport === 'revenue' && renderRevenueReport()}
        {selectedReport === 'location' && renderLocationReport()}
        {selectedReport === 'movement' && renderMovementReport()}
      </div>
    </div>
  )
} 