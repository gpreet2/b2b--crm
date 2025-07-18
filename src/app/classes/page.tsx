import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import {
  CalendarIcon,
  PlusIcon,
  UsersIcon,
  ClockIcon,
  ChartBarIcon,
  PlayIcon,
  Cog6ToothIcon,
  ArrowRightIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";

export default function ClassesPage() {
  // Mock data for demonstration
  const upcomingClasses = [
    {
      id: 1,
      name: "Morning Yoga",
      time: "7:00 AM",
      date: "Today",
      instructor: "Sarah Johnson",
      capacity: 20,
      enrolled: 15,
      status: "confirmed",
    },
    {
      id: 2,
      name: "HIIT Training",
      time: "6:00 PM",
      date: "Today",
      instructor: "Mike Chen",
      capacity: 15,
      enrolled: 12,
      status: "confirmed",
    },
    {
      id: 3,
      name: "Pilates",
      time: "9:00 AM",
      date: "Tomorrow",
      instructor: "Emma Davis",
      capacity: 18,
      enrolled: 8,
      status: "low-enrollment",
    },
  ];

  const stats = [
    { label: "Active Classes", value: "24", change: "+3", trend: "up" },
    { label: "Total Bookings", value: "156", change: "+12", trend: "up" },
    { label: "Avg. Attendance", value: "85%", change: "+5%", trend: "up" },
    { label: "Revenue", value: "$2,340", change: "+8%", trend: "up" },
  ];

  const quickActions = [
    {
      title: "Schedule Class",
      description: "Create a new class session",
      icon: PlusIcon,
      href: "/classes/calendar",
      color: "bg-primary",
    },
    {
      title: "View Calendar",
      description: "See all scheduled classes",
      icon: CalendarIcon,
      href: "/classes/calendar",
      color: "bg-info",
    },
    {
      title: "Manage Programs",
      description: "Edit class programs",
      icon: PlayIcon,
      href: "/classes/programs",
      color: "bg-success",
    },
    {
      title: "Class Settings",
      description: "Configure class options",
      icon: Cog6ToothIcon,
      href: "/classes/settings",
      color: "bg-warning",
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <h1 className="text-h2 sm:text-h1 font-heading text-primary-text mb-1 sm:mb-2">
          Classes
        </h1>
        <p className="text-body-sm sm:text-body text-secondary-text">
          Manage your fitness classes and schedules
        </p>
      </div>

      {/* Stats Grid - Compact */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {stats.map((stat, index) => {
          const icons = [
            CalendarIcon,
            UsersIcon,
            ChartBarIcon,
            CurrencyDollarIcon,
          ];
          const colors = ["bg-primary", "bg-success", "bg-info", "bg-warning"];
          const StatIcon = icons[index];
          const color = colors[index];

          return (
            <Card
              key={index}
              className="group hover:shadow-md transition-all duration-300"
            >
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center space-x-3">
                  <div
                    className={`p-2 rounded-lg ${color} flex items-center justify-center flex-shrink-0`}
                  >
                    <StatIcon className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-h4 sm:text-h3 font-heading text-primary-text">
                        {stat.value}
                      </span>
                      <span className="text-caption sm:text-body-sm text-success font-medium">
                        {stat.change}
                      </span>
                    </div>
                    <p className="text-caption sm:text-body-sm text-secondary-text font-medium truncate">
                      {stat.label}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-h4 sm:text-h3 font-heading text-primary-text mb-3 sm:mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {quickActions.map((action, index) => (
            <Link key={index} href={action.href}>
              <Card className="p-4 sm:p-5 hover:shadow-lg transition-all duration-200 cursor-pointer group border-surface hover:border-primary/20">
                <div className="flex items-start space-x-3 sm:space-x-4">
                  <div
                    className={`p-2 sm:p-3 rounded-lg ${action.color} bg-opacity-10 group-hover:bg-opacity-20 transition-colors`}
                  >
                    <action.icon
                      className={`h-5 w-5 sm:h-6 sm:w-6 ${action.color.replace(
                        "bg-",
                        "text-"
                      )}`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-body sm:text-body-lg font-medium text-primary-text group-hover:text-primary transition-colors">
                      {action.title}
                    </h3>
                    <p className="text-caption sm:text-body-sm text-secondary-text mt-1">
                      {action.description}
                    </p>
                  </div>
                  <ArrowRightIcon className="h-4 w-4 sm:h-5 sm:w-5 text-secondary-text group-hover:text-primary transition-colors flex-shrink-0" />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Upcoming Classes */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <ClockIcon className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                  <span>Upcoming Classes</span>
                </div>
                <Link
                  href="/classes/calendar"
                  className="text-body-sm text-primary hover:text-primary-light transition-colors"
                >
                  View All
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              {upcomingClasses.map((classItem) => (
                <div
                  key={classItem.id}
                  className="flex items-center justify-between p-3 sm:p-4 bg-accent rounded-lg hover:bg-secondary/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 sm:space-x-3 mb-1 sm:mb-2">
                      <h3 className="text-body sm:text-body-lg font-medium text-primary-text truncate">
                        {classItem.name}
                      </h3>
                      <span
                        className={`px-2 py-1 rounded-full text-caption font-medium ${
                          classItem.status === "confirmed"
                            ? "bg-success/20 text-success"
                            : "bg-warning/20 text-warning"
                        }`}
                      >
                        {classItem.status === "confirmed"
                          ? "Confirmed"
                          : "Low Enrollment"}
                      </span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-1 sm:space-y-0">
                      <p className="text-body-sm text-secondary-text">
                        {classItem.date} at {classItem.time}
                      </p>
                      <p className="text-body-sm text-secondary-text">
                        Instructor: {classItem.instructor}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 sm:space-x-4 ml-3 sm:ml-4">
                    <div className="text-right">
                      <div className="flex items-center space-x-1 text-body-sm text-secondary-text">
                        <UsersIcon className="h-4 w-4" />
                        <span>
                          {classItem.enrolled}/{classItem.capacity}
                        </span>
                      </div>
                      <div className="w-16 sm:w-20 bg-surface rounded-full h-2 mt-1">
                        <div
                          className="bg-primary h-2 rounded-full transition-all duration-300"
                          style={{
                            width: `${
                              (classItem.enrolled / classItem.capacity) * 100
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                    <ArrowRightIcon className="h-4 w-4 sm:h-5 sm:w-5 text-secondary-text flex-shrink-0" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Class Analytics */}
        <div className="space-y-4 sm:space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ChartBarIcon className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                <span>This Week</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-body-sm text-secondary-text">
                    Classes Scheduled
                  </span>
                  <span className="text-body font-medium text-primary-text">
                    32
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-body-sm text-secondary-text">
                    Total Bookings
                  </span>
                  <span className="text-body font-medium text-primary-text">
                    284
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-body-sm text-secondary-text">
                    Attendance Rate
                  </span>
                  <span className="text-body font-medium text-success">
                    92%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-body-sm text-secondary-text">
                    Revenue
                  </span>
                  <span className="text-body font-medium text-primary-text">
                    $4,280
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Popular Classes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { name: "HIIT Training", bookings: 45, trend: "up" },
                { name: "Yoga Flow", bookings: 38, trend: "up" },
                { name: "Strength Training", bookings: 32, trend: "down" },
                { name: "Pilates", bookings: 28, trend: "up" },
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="text-body-sm font-medium text-primary-text">
                      {item.name}
                    </p>
                    <p className="text-caption text-secondary-text">
                      {item.bookings} bookings
                    </p>
                  </div>
                  <div
                    className={`text-caption font-medium ${
                      item.trend === "up" ? "text-success" : "text-warning"
                    }`}
                  >
                    {item.trend === "up" ? "↗" : "↘"}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
