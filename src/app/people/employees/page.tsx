"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  User,
  Calendar,
  TrendingUp,
  Users,
  Clock,
  Star,
  Award,
  MoreVertical,
  ChevronRight,
  BarChart3,
  Target,
  CheckCircle,
} from "lucide-react";
import { mockCoaches, mockClasses, mockReservations } from "@/lib/mock-data";
import { Coach } from "@/lib/types";

interface TrainerStats {
  id: string;
  totalClassesTaught: number;
  totalStudents: number;
  averageAttendance: number;
  attendanceRate: number;
  rating: number;
  totalRevenue: number;
  upcomingClasses: number;
  completedClassesThisMonth: number;
  specialtyPrograms: string[];
  recentClasses: ClassWithAttendance[];
}

interface ClassWithAttendance {
  id: string;
  name: string;
  date: Date;
  startTime: string;
  endTime: string;
  capacity: number;
  enrolled: number;
  attended: number;
  attendanceRate: number;
  program: string;
  location: string;
}

export default function EmployeesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTrainer, setSelectedTrainer] = useState<Coach | null>(null);
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "performance">("list");
  // const [showAddEmployeeModal, setShowAddEmployeeModal] = useState(false);

  // Calculate trainer statistics
  const getTrainerStats = (trainerId: string): TrainerStats => {
    const trainerClasses = mockClasses.filter(
      (cls) => cls.coachId === trainerId
    );
    const completedClasses = trainerClasses.filter(
      (cls) => cls.status === "completed"
    );
    const upcomingClasses = trainerClasses.filter(
      (cls) => cls.status === "scheduled" || cls.status === "confirmed"
    );

    // Calculate attendance data
    const classesWithAttendance: ClassWithAttendance[] = completedClasses.map(
      (cls) => {
        const reservations = mockReservations.filter(
          (res) => res.classId === cls.id
        );
        const attended = reservations.filter(
          (res) => res.status === "confirmed"
        ).length;

        return {
          id: cls.id,
          name: cls.name,
          date: cls.date,
          startTime: cls.startTime,
          endTime: cls.endTime,
          capacity: cls.capacity,
          enrolled: cls.enrolled,
          attended: attended,
          attendanceRate:
            cls.enrolled > 0 ? (attended / cls.enrolled) * 100 : 0,
          program: cls.name.includes("Burn40")
            ? "Burn40"
            : cls.name.includes("CrossFit")
            ? "CrossFit"
            : "BurnDumbells",
          location: cls.location,
        };
      }
    );

    const totalAttended = classesWithAttendance.reduce(
      (sum, cls) => sum + cls.attended,
      0
    );
    const totalEnrolled = classesWithAttendance.reduce(
      (sum, cls) => sum + cls.enrolled,
      0
    );
    const averageAttendance =
      classesWithAttendance.length > 0
        ? classesWithAttendance.reduce(
            (sum, cls) => sum + cls.attendanceRate,
            0
          ) / classesWithAttendance.length
        : 0;

    const thisMonth = new Date();
    const completedThisMonth = completedClasses.filter(
      (cls) =>
        cls.date.getMonth() === thisMonth.getMonth() &&
        cls.date.getFullYear() === thisMonth.getFullYear()
    ).length;

    const trainer = mockCoaches.find((c) => c.id === trainerId);

    return {
      id: trainerId,
      totalClassesTaught: completedClasses.length,
      totalStudents: totalEnrolled,
      averageAttendance: Math.round(averageAttendance),
      attendanceRate:
        totalEnrolled > 0
          ? Math.round((totalAttended / totalEnrolled) * 100)
          : 0,
      rating: 4.2 + Math.random() * 0.6, // Mock rating between 4.2-4.8
      totalRevenue: completedClasses.length * 45, // Mock revenue calculation
      upcomingClasses: upcomingClasses.length,
      completedClassesThisMonth: completedThisMonth,
      specialtyPrograms: trainer?.specialties || [],
      recentClasses: classesWithAttendance.slice(-5).reverse(),
    };
  };

  const trainersWithStats = useMemo(() => {
    return mockCoaches.map((coach) => ({
      ...coach,
      stats: getTrainerStats(coach.id),
    }));
  }, []);

  const filteredTrainers = useMemo(() => {
    if (!searchQuery) return trainersWithStats;

    const query = searchQuery.toLowerCase();
    return trainersWithStats.filter(
      (trainer) =>
        trainer.name.toLowerCase().includes(query) ||
        trainer.email.toLowerCase().includes(query) ||
        trainer.specialties.some((specialty) =>
          specialty.toLowerCase().includes(query)
        )
    );
  }, [searchQuery, trainersWithStats]);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };

  const getPerformanceColor = (percentage: number) => {
    if (percentage >= 90) return "text-green-600 bg-green-100";
    if (percentage >= 75) return "text-blue-600 bg-blue-100";
    if (percentage >= 60) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  const handleViewPerformance = (trainer: Coach) => {
    setSelectedTrainer(trainer);
    setViewMode("performance");
    setActiveDropdownId(null);
  };

  const handleBackToList = () => {
    setSelectedTrainer(null);
    setViewMode("list");
  };

  if (viewMode === "performance" && selectedTrainer) {
    const trainerStats = getTrainerStats(selectedTrainer.id);

    return (
      <div className="min-h-screen bg-white">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBackToList}
                className="text-gray-400 hover:text-gray-600"
              >
                <ChevronRight className="h-5 w-5 rotate-180" />
              </button>
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 rounded-full bg-gray-300 flex items-center justify-center">
                  <User className="h-6 w-6 text-gray-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-semibold text-gray-900">
                    {selectedTrainer.name}
                  </h1>
                  <p className="text-sm text-gray-500">
                    Trainer Performance Dashboard
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                <span className="text-sm font-medium text-gray-900">
                  {trainerStats.rating.toFixed(1)}
                </span>
              </div>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  selectedTrainer.isActive
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {selectedTrainer.isActive ? "Active" : "Inactive"}
              </span>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="px-6 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Classes Taught
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {trainerStats.totalClassesTaught}
                  </p>
                  <p className="text-sm text-gray-500">
                    {trainerStats.completedClassesThisMonth} this month
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-blue-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Students
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {trainerStats.totalStudents}
                  </p>
                  <p className="text-sm text-gray-500">Across all classes</p>
                </div>
                <Users className="h-8 w-8 text-green-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Attendance Rate
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {trainerStats.attendanceRate}%
                  </p>
                  <p
                    className={`text-sm ${
                      getPerformanceColor(trainerStats.attendanceRate).split(
                        " "
                      )[0]
                    }`}
                  >
                    {trainerStats.attendanceRate >= 85
                      ? "Excellent"
                      : trainerStats.attendanceRate >= 70
                      ? "Good"
                      : "Needs Improvement"}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Revenue Generated
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${trainerStats.totalRevenue.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500">Estimated total</p>
                </div>
                <Award className="h-8 w-8 text-yellow-600" />
              </div>
            </div>
          </div>

          {/* Specialties */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Specialties & Programs
            </h3>
            <div className="flex flex-wrap gap-2">
              {trainerStats.specialtyPrograms.map((specialty, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-full border"
                  style={{
                    backgroundColor: specialty.includes("Burn40")
                      ? "#fef2f2"
                      : specialty.includes("CrossFit")
                      ? "#ecfeff"
                      : specialty.includes("BurnDumbells")
                      ? "#f0fdf4"
                      : "#f9fafb",
                    color: specialty.includes("Burn40")
                      ? "#dc2626"
                      : specialty.includes("CrossFit")
                      ? "#0891b2"
                      : specialty.includes("BurnDumbells")
                      ? "#16a34a"
                      : "#6b7280",
                    borderColor: specialty.includes("Burn40")
                      ? "#fecaca"
                      : specialty.includes("CrossFit")
                      ? "#a5f3fc"
                      : specialty.includes("BurnDumbells")
                      ? "#bbf7d0"
                      : "#e5e7eb",
                  }}
                >
                  <div
                    className="w-2 h-2 rounded-full mr-2"
                    style={{
                      backgroundColor: specialty.includes("Burn40")
                        ? "#ef4444"
                        : specialty.includes("CrossFit")
                        ? "#06b6d4"
                        : specialty.includes("BurnDumbells")
                        ? "#10b981"
                        : "#6b7280",
                    }}
                  />
                  {specialty}
                </span>
              ))}
            </div>
          </div>

          {/* Recent Classes Performance */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-gray-900">
                Recent Classes Performance
              </h3>
              <BarChart3 className="h-5 w-5 text-gray-400" />
            </div>

            <div className="space-y-4">
              {trainerStats.recentClasses.map((cls) => (
                <div
                  key={cls.id}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-gray-900">{cls.name}</h4>
                      <p className="text-sm text-gray-500">
                        {formatDate(cls.date)} • {cls.startTime} - {cls.endTime}{" "}
                        • {cls.location}
                      </p>
                    </div>
                    <span
                      className="inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full border"
                      style={{
                        backgroundColor:
                          cls.program === "Burn40"
                            ? "#fef2f2"
                            : cls.program === "CrossFit"
                            ? "#ecfeff"
                            : "#f0fdf4",
                        color:
                          cls.program === "Burn40"
                            ? "#dc2626"
                            : cls.program === "CrossFit"
                            ? "#0891b2"
                            : "#16a34a",
                        borderColor:
                          cls.program === "Burn40"
                            ? "#fecaca"
                            : cls.program === "CrossFit"
                            ? "#a5f3fc"
                            : "#bbf7d0",
                      }}
                    >
                      <div
                        className="w-1.5 h-1.5 rounded-full mr-1.5"
                        style={{
                          backgroundColor:
                            cls.program === "Burn40"
                              ? "#ef4444"
                              : cls.program === "CrossFit"
                              ? "#06b6d4"
                              : "#10b981",
                        }}
                      />
                      {cls.program}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-500">Capacity</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {cls.capacity}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-500">Enrolled</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {cls.enrolled}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-500">Attended</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {cls.attended}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">
                        Attendance Rate
                      </span>
                      <span
                        className={`text-sm font-medium ${
                          getPerformanceColor(cls.attendanceRate).split(" ")[0]
                        }`}
                      >
                        {Math.round(cls.attendanceRate)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${cls.attendanceRate}%`,
                          backgroundColor:
                            cls.attendanceRate >= 90
                              ? "#10b981"
                              : cls.attendanceRate >= 75
                              ? "#3b82f6"
                              : cls.attendanceRate >= 60
                              ? "#f59e0b"
                              : "#ef4444",
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Employees</h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage trainers and staff performance
            </p>
          </div>

          <button
            onClick={() => {
              // TODO: Implement add employee modal
              console.log("Add employee clicked");
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <User className="h-4 w-4" />
            <span>Add Employee</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-6 py-4 bg-white border-b border-gray-200">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search trainers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Trainers Table */}
      <div className="px-6 py-4">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trainer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Specialties
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Classes Taught
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Attendance Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rating
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTrainers.map((trainer) => (
                <tr key={trainer.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                          <User className="h-5 w-5 text-gray-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {trainer.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {trainer.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {trainer.specialties
                        .slice(0, 2)
                        .map((specialty, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full border"
                            style={{
                              backgroundColor: specialty.includes("Burn40")
                                ? "#fef2f2"
                                : specialty.includes("CrossFit")
                                ? "#ecfeff"
                                : specialty.includes("BurnDumbells")
                                ? "#f0fdf4"
                                : "#f9fafb",
                              color: specialty.includes("Burn40")
                                ? "#dc2626"
                                : specialty.includes("CrossFit")
                                ? "#0891b2"
                                : specialty.includes("BurnDumbells")
                                ? "#16a34a"
                                : "#6b7280",
                              borderColor: specialty.includes("Burn40")
                                ? "#fecaca"
                                : specialty.includes("CrossFit")
                                ? "#a5f3fc"
                                : specialty.includes("BurnDumbells")
                                ? "#bbf7d0"
                                : "#e5e7eb",
                            }}
                          >
                            <div
                              className="w-1.5 h-1.5 rounded-full mr-1.5"
                              style={{
                                backgroundColor: specialty.includes("Burn40")
                                  ? "#ef4444"
                                  : specialty.includes("CrossFit")
                                  ? "#06b6d4"
                                  : specialty.includes("BurnDumbells")
                                  ? "#10b981"
                                  : "#6b7280",
                              }}
                            />
                            {specialty}
                          </span>
                        ))}
                      {trainer.specialties.length > 2 && (
                        <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-gray-50 text-gray-500 border border-gray-200">
                          +{trainer.specialties.length - 2}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {trainer.stats.totalClassesTaught}
                    </div>
                    <div className="text-sm text-gray-500">
                      {trainer.stats.completedClassesThisMonth} this month
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="text-sm font-medium text-gray-900">
                        {trainer.stats.attendanceRate}%
                      </div>
                      <div className="ml-2">
                        {trainer.stats.attendanceRate >= 85 ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : trainer.stats.attendanceRate >= 70 ? (
                          <Target className="h-4 w-4 text-yellow-500" />
                        ) : (
                          <Clock className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                      <span className="text-sm text-gray-900">
                        {trainer.stats.rating.toFixed(1)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        trainer.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {trainer.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="relative">
                      <button
                        onClick={() =>
                          setActiveDropdownId(
                            activeDropdownId === trainer.id ? null : trainer.id
                          )
                        }
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <MoreVertical className="h-5 w-5" />
                      </button>

                      {activeDropdownId === trainer.id && (
                        <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                          <div className="py-1">
                            <button
                              onClick={() => handleViewPerformance(trainer)}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                            >
                              <BarChart3 className="h-4 w-4" />
                              <span>View Performance</span>
                            </button>
                            <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2">
                              <Calendar className="h-4 w-4" />
                              <span>View Schedule</span>
                            </button>
                            <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2">
                              <User className="h-4 w-4" />
                              <span>Edit Profile</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
