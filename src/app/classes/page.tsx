import React from "react";
import {
  CalendarIcon,
  PlusIcon,
  UsersIcon,
  ClockIcon,
  PlayIcon,
  ArrowRightIcon,
  ChartBarIcon,
  FireIcon,
  TrophyIcon,
  BoltIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  CalendarDaysIcon,
  ListBulletIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";

export default function ClassesPage() {
  // Enhanced mock data with better status indicators - Only the three programs
  const upcomingClasses = [
    {
      id: 1,
      name: "Burn40",
      time: "7:00 AM",
      date: "Today",
      instructor: "Sarah Johnson",
      capacity: 20,
      enrolled: 18,
      status: "high-demand",
      category: "Cardio",
      duration: "40 min",
      location: "Studio A",
    },
    {
      id: 2,
      name: "CrossFit",
      time: "6:00 PM",
      date: "Today",
      instructor: "Mike Chen",
      capacity: 15,
      enrolled: 12,
      status: "available",
      category: "Strength",
      duration: "60 min",
      location: "Weight Room",
    },
    {
      id: 3,
      name: "BurnDumbells",
      time: "9:00 AM",
      date: "Tomorrow",
      instructor: "Emma Davis",
      capacity: 20,
      enrolled: 16,
      status: "available",
      category: "Strength",
      duration: "60 min",
      location: "Weight Room",
    },
  ];

  const quickActions = [
    {
      title: "Schedule Class",
      description: "Create a new class session",
      icon: PlusIcon,
      href: "/classes/calendar",
      gradient: "from-red-600 to-red-700",
      hoverGradient: "from-red-700 to-red-800",
    },
    {
      title: "Calendar View",
      description: "See all scheduled classes",
      icon: CalendarDaysIcon,
      href: "/classes/calendar",
      gradient: "from-emerald-600 to-emerald-700",
      hoverGradient: "from-emerald-700 to-emerald-800",
    },
    {
      title: "Class List",
      description: "Detailed class management",
      icon: ListBulletIcon,
      href: "/classes/list",
      gradient: "from-amber-600 to-amber-700",
      hoverGradient: "from-amber-700 to-amber-800",
    },
    {
      title: "Programs",
      description: "Manage class programs",
      icon: PlayIcon,
      href: "/classes/programs",
      gradient: "from-purple-600 to-purple-700",
      hoverGradient: "from-purple-700 to-purple-800",
    },
  ];

  // Key metrics for dashboard overview
  const keyMetrics = [
    {
      label: "Today's Classes",
      value: "12",
      change: "+2",
      trend: "up",
      icon: CalendarIcon,
      color: "text-red-500",
      bgColor: "bg-red-500/10",
      accentColor: "border-red-500/30",
    },
    {
      label: "Active Members",
      value: "284",
      change: "+18",
      trend: "up",
      icon: UsersIcon,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
      accentColor: "border-emerald-500/30",
    },
    {
      label: "Capacity Used",
      value: "87%",
      change: "+5%",
      trend: "up",
      icon: ChartBarIcon,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
      accentColor: "border-amber-500/30",
    },
    {
      label: "Revenue Today",
      value: "$1,240",
      change: "+12%",
      trend: "up",
      icon: TrophyIcon,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      accentColor: "border-purple-500/30",
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "high-demand":
        return <FireIcon className="h-4 w-4 text-red-500" />;
      case "available":
        return <CheckCircleIcon className="h-4 w-4 text-emerald-500" />;
      case "low-enrollment":
        return <ExclamationTriangleIcon className="h-4 w-4 text-amber-500" />;
      default:
        return <ClockIcon className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "high-demand":
        return "High Demand";
      case "available":
        return "Available";
      case "low-enrollment":
        return "Low Enrollment";
      default:
        return "Scheduled";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "high-demand":
        return "bg-red-500/20 text-red-500 border-red-500/30";
      case "available":
        return "bg-emerald-500/20 text-emerald-500 border-emerald-500/30";
      case "low-enrollment":
        return "bg-amber-500/20 text-amber-500 border-amber-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 page-transition">
      {/* Professional Header */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 shadow-xl">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl shadow-lg hover-lift">
                <FireIcon className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">
                  Class Management
                </h1>
                <p className="text-lg text-red-100 max-w-2xl">
                  Professional fitness class scheduling and member management
                </p>
                <div className="flex items-center space-x-6 mt-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                    <span className="text-sm text-emerald-100 font-medium">Live Updates</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CalendarIcon className="h-4 w-4 text-red-200" />
                    <span className="text-sm text-red-200">
                      {new Date().toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-6 lg:mt-0 flex flex-col sm:flex-row gap-3">
              <Link href="/classes/list">
                <button className="px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-lg font-semibold hover:bg-white/30 transition-all duration-200 flex items-center btn-animate border border-white/30">
                  <CalendarIcon className="h-5 w-5 mr-2" />
                  View Schedule
                </button>
              </Link>
              <Link href="/classes/calendar">
                <button className="px-6 py-3 bg-white text-red-600 rounded-lg font-semibold hover:bg-red-50 transition-all duration-200 flex items-center btn-animate">
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Schedule Class
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content with Background */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
          <div className="p-8">
            {/* Enhanced Key Metrics Dashboard */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {keyMetrics.map((metric, index) => (
                <div key={index} className="group">
                  <div className={`bg-gray-50 border ${metric.accentColor} rounded-xl p-6 hover:shadow-xl hover:shadow-${metric.color.split('-')[1]}-500/20 transition-all duration-300 relative overflow-hidden card-animate`}>
                    {/* Accent bar */}
                    <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${metric.color === 'text-red-500' ? 'from-red-600 to-red-700' : 
                      metric.color === 'text-emerald-500' ? 'from-emerald-600 to-emerald-700' :
                      metric.color === 'text-amber-500' ? 'from-amber-600 to-amber-700' :
                      'from-purple-600 to-purple-700'}`}></div>
                    
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-3 rounded-xl ${metric.bgColor}`}>
                        <metric.icon className={`h-6 w-6 ${metric.color}`} />
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                        metric.trend === 'up' ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30' : 'bg-red-500/20 text-red-500 border border-red-500/30'
                      }`}>
                        {metric.change}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className={`text-3xl font-bold ${metric.color} mb-2 group-hover:scale-105 transition-transform`}>
                        {metric.value}
                      </h3>
                      <p className="text-sm text-gray-600 font-medium">{metric.label}</p>
                    </div>
                    
                    {/* Subtle background pattern */}
                    <div className="absolute -bottom-2 -right-2 opacity-5">
                      <metric.icon className="h-16 w-16 text-red-500" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Professional Quick Actions */}
            <div className="mb-8">
              <div className="flex items-center space-x-3 mb-6">
                <BoltIcon className="h-6 w-6 text-amber-500" />
                <h2 className="text-2xl font-bold text-gray-900">
                  Quick Actions
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {quickActions.map((action, index) => (
                  <Link key={index} href={action.href}>
                    <div className="group cursor-pointer">
                      <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 hover:shadow-xl hover:border-gray-300 transition-all duration-300 relative overflow-hidden card-animate">
                        {/* Gradient background */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                        
                        <div className="relative">
                          <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 rounded-xl bg-gradient-to-br ${action.gradient} shadow-lg group-hover:shadow-xl transition-shadow duration-300`}>
                              <action.icon className="h-6 w-6 text-white" />
                            </div>
                            <ArrowRightIcon className="h-5 w-5 text-gray-400 group-hover:text-gray-600 transition-colors duration-300 transform group-hover:translate-x-1" />
                          </div>
                          
                          <div>
                            <h3 className="text-lg font-bold text-gray-900 group-hover:text-gray-900 transition-colors duration-300 mb-2">
                              {action.title}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {action.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Enhanced Upcoming Classes */}
              <div className="lg:col-span-2">
                <div className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden card-animate">
                  <div className="p-6 border-b border-gray-200 bg-white/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-gradient-to-r from-red-600 to-red-700 rounded-lg">
                          <ClockIcon className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">Upcoming Classes</h3>
                          <p className="text-sm text-gray-600">Next 24 hours</p>
                        </div>
                      </div>
                      <Link
                        href="/classes/list"
                        className="px-4 py-2 bg-emerald-600/20 text-emerald-600 rounded-lg hover:bg-emerald-600 hover:text-white transition-colors font-medium text-sm btn-animate"
                      >
                        View All
                      </Link>
                    </div>
                  </div>
                  
                  <div className="p-6 space-y-4">
                    {upcomingClasses.map((classItem, index) => (
                      <div
                        key={classItem.id}
                        className={`group p-4 bg-white/50 rounded-xl hover:bg-white transition-all duration-300 border border-border hover:border-border-light card-animate ${
                          index < upcomingClasses.length - 1 ? 'border-b border-border' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-3 mb-3">
                              <h4 className="text-lg font-bold text-primary-text group-hover:text-primary-text transition-colors">
                                {classItem.name}
                              </h4>
                              <div className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(classItem.status)} flex items-center space-x-1`}>
                                {getStatusIcon(classItem.status)}
                                <span>{getStatusText(classItem.status)}</span>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-secondary-text mb-3">
                              <div className="flex items-center space-x-2">
                                <CalendarIcon className="h-4 w-4 text-amber-500" />
                                <span className="font-medium text-primary-text">{classItem.date}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <ClockIcon className="h-4 w-4 text-blue-500" />
                                <span>{classItem.time} ({classItem.duration})</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <UsersIcon className="h-4 w-4 text-emerald-500" />
                                <span>{classItem.instructor}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="text-xs bg-accent px-2 py-1 rounded-full text-secondary-text border border-border-light">
                                  {classItem.location}
                                </span>
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <span className="text-sm font-medium text-primary-text">
                                  {classItem.enrolled}/{classItem.capacity} enrolled
                                </span>
                                <div className="w-24 bg-accent rounded-full h-2 border border-border-light">
                                  <div
                                    className={`h-2 rounded-full transition-all duration-500 ${
                                      classItem.status === 'high-demand' ? 'bg-gradient-to-r from-red-500 to-red-600' :
                                      classItem.status === 'available' ? 'bg-gradient-to-r from-emerald-500 to-emerald-600' :
                                      'bg-gradient-to-r from-amber-500 to-amber-600'
                                    }`}
                                    style={{
                                      width: `${(classItem.enrolled / classItem.capacity) * 100}%`,
                                    }}
                                  />
                                </div>
                                <span className="text-xs text-muted">
                                  {Math.round((classItem.enrolled / classItem.capacity) * 100)}%
                                </span>
                              </div>
                              
                              <button className="p-2 rounded-lg bg-red-600/20 text-red-600 hover:bg-red-600 hover:text-white transition-all duration-200 group-hover:scale-110 btn-animate">
                                <ArrowRightIcon className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Enhanced Analytics Sidebar */}
              <div className="space-y-6">
                {/* Weekly Performance */}
                <div className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden card-animate">
                  <div className="p-6 border-b border-gray-200 bg-white/50">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-500/20 rounded-lg">
                        <ChartBarIcon className="h-5 w-5 text-blue-500" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">This Week</h3>
                        <p className="text-sm text-gray-600">Performance metrics</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6 space-y-4">
                    {[
                      { label: "Classes Scheduled", value: "32", change: "+4", color: "text-indigo-500" },
                      { label: "Total Bookings", value: "284", change: "+18", color: "text-emerald-500" },
                      { label: "Attendance Rate", value: "92%", change: "+3%", color: "text-emerald-500" },
                      { label: "Revenue", value: "$4,280", change: "+12%", color: "text-amber-500" },
                    ].map((metric, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-white/50 rounded-lg hover:bg-white transition-colors">
                        <div>
                          <p className="text-sm text-gray-600 mb-1">{metric.label}</p>
                          <p className={`text-lg font-bold ${metric.color}`}>{metric.value}</p>
                        </div>
                        <div className={`px-2 py-1 rounded-full text-xs font-bold ${
                          metric.change.startsWith('+') ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30' : 'bg-red-500/20 text-red-500 border border-red-500/30'
                        }`}>
                          {metric.change}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Popular Classes */}
                <div className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden card-animate">
                  <div className="p-6 border-b border-gray-200 bg-white/50">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-amber-500/20 rounded-lg">
                        <TrophyIcon className="h-5 w-5 text-amber-500" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">Popular Classes</h3>
                        <p className="text-sm text-gray-600">Top performers</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6 space-y-3">
                    {[
                      { name: "Burn40", bookings: 45, trend: "up", color: "#ef4444" },
                      { name: "CrossFit", bookings: 38, trend: "up", color: "#06b6d4" },
                      { name: "BurnDumbells", bookings: 32, trend: "up", color: "#10b981" },
                    ].map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-white/50 rounded-lg hover:bg-white transition-colors group">
                        <div className="flex items-center space-x-3">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: item.color }}
                          />
                          <div>
                            <p className="text-sm font-medium text-gray-900 group-hover:text-gray-900 transition-colors">
                              {item.name}
                            </p>
                            <p className="text-xs text-gray-600">
                              {item.bookings} bookings
                            </p>
                          </div>
                        </div>
                        <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-bold ${
                          item.trend === "up" ? "bg-emerald-500/20 text-emerald-500 border border-emerald-500/30" : "bg-red-500/20 text-red-500 border border-red-500/30"
                        }`}>
                          <span>{item.trend === "up" ? "↗" : "↘"}</span>
                          <span>{item.trend === "up" ? "+5%" : "-2%"}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 card-animate">
                  <div className="text-center">
                    <div className="p-4 bg-gradient-to-br from-red-600 to-red-700 rounded-xl mb-4 inline-block hover-lift">
                      <FireIcon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-3xl font-bold text-red-600 mb-2">98.5%</h3>
                    <p className="text-sm text-gray-600 mb-4">Member Satisfaction</p>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-gradient-to-r from-red-500 to-red-600 h-2 rounded-full" style={{ width: '98.5%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
