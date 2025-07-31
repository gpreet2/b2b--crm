"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import {
  LightBulbIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

// Mock insights data
const insights = [
  {
    id: 1,
    type: "opportunity",
    title: "Multi-Location Members Generate 46% Higher Revenue",
    description:
      "Members with access to multiple locations spend $492/month on average vs $375 for home-only members. Consider promoting multi-location memberships.",
    impact: "high",
    metric: "+46% revenue per member",
    recommendation:
      "Launch a multi-location upgrade campaign targeting home members",
    icon: ArrowTrendingUpIcon,
    color: "green",
  },
  {
    id: 2,
    type: "concern",
    title: "Eastside Location Showing Declining Performance",
    description:
      "Eastside Athletic Club has seen a -2.1% decline in membership and 58% utilization rate, the lowest among all locations.",
    impact: "medium",
    metric: "-2.1% growth",
    recommendation: "Review class schedules and consider facility improvements",
    icon: ArrowTrendingDownIcon,
    color: "red",
  },
  {
    id: 3,
    type: "alert",
    title: "Peak Transfer Activity from Eastside to Downtown",
    description:
      '15 members transferred from Eastside to Downtown this month, citing "better facilities" as the primary reason.',
    impact: "medium",
    metric: "15 transfers",
    recommendation: "Investigate facility gaps at Eastside location",
    icon: ExclamationTriangleIcon,
    color: "yellow",
  },
  {
    id: 4,
    type: "success",
    title: "Downtown Location Exceeding Capacity Targets",
    description:
      "Downtown Fitness Center maintains 78% utilization with strong member satisfaction and 12.5% growth rate.",
    impact: "high",
    metric: "78% utilization",
    recommendation: "Use Downtown as a model for other locations",
    icon: CheckCircleIcon,
    color: "green",
  },
  {
    id: 5,
    type: "info",
    title: "Day Pass Revenue Opportunity",
    description:
      "Day passes generate $25 per visit but represent only 3.6% of total revenue. High conversion potential exists.",
    impact: "low",
    metric: "3.6% of revenue",
    recommendation: "Implement day pass to membership conversion campaigns",
    icon: InformationCircleIcon,
    color: "blue",
  },
];

const membershipConversionData = [
  { month: "Jan", dayPasses: 45, conversions: 8, rate: 17.8 },
  { month: "Feb", dayPasses: 52, conversions: 12, rate: 23.1 },
  { month: "Mar", dayPasses: 48, conversions: 9, rate: 18.8 },
  { month: "Apr", dayPasses: 61, conversions: 15, rate: 24.6 },
  { month: "May", dayPasses: 58, conversions: 11, rate: 19.0 },
  { month: "Jun", dayPasses: 64, conversions: 18, rate: 28.1 },
];

const locationUtilizationTrends = [
  { month: "Jan", downtown: 75, westside: 62, eastside: 68 },
  { month: "Feb", downtown: 76, westside: 63, eastside: 65 },
  { month: "Mar", downtown: 77, westside: 64, eastside: 62 },
  { month: "Apr", downtown: 78, westside: 65, eastside: 60 },
  { month: "May", downtown: 79, westside: 66, eastside: 59 },
  { month: "Jun", downtown: 78, westside: 65, eastside: 58 },
];

export default function InsightsPage() {
  const [selectedInsightType, setSelectedInsightType] = useState("all");

  const filteredInsights =
    selectedInsightType === "all"
      ? insights
      : insights.filter((insight) => insight.type === selectedInsightType);

  const getInsightIcon = (insight: (typeof insights)[0]) => {
    const Icon = insight.icon;
    return <Icon className="h-6 w-6" />;
  };

  const getInsightColor = (color: string) => {
    switch (color) {
      case "green":
        return "bg-green-100 text-green-800 border-green-200";
      case "red":
        return "bg-red-100 text-red-800 border-red-200";
      case "yellow":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "blue":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getImpactBadge = (impact: string) => {
    switch (impact) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Business Insights
          </h1>
          <p className="text-gray-600 mt-1">
            AI-powered recommendations and performance insights
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedInsightType}
            onChange={(e) => setSelectedInsightType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Insights</option>
            <option value="opportunity">Opportunities</option>
            <option value="concern">Concerns</option>
            <option value="alert">Alerts</option>
            <option value="success">Successes</option>
            <option value="info">Information</option>
          </select>
        </div>
      </div>

      {/* Insights Cards */}
      <div className="space-y-4">
        {filteredInsights.map((insight) => (
          <Card
            key={insight.id}
            className={`border-l-4 ${getInsightColor(insight.color)}`}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <div
                    className={`p-3 rounded-full ${getInsightColor(
                      insight.color
                    )}`}
                  >
                    {getInsightIcon(insight)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {insight.title}
                      </h3>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${getImpactBadge(
                          insight.impact
                        )}`}
                      >
                        {insight.impact.toUpperCase()} IMPACT
                      </span>
                    </div>
                    <p className="text-gray-600 mb-3">{insight.description}</p>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-700">
                          Key Metric:
                        </span>
                        <span className="text-sm font-bold text-gray-900">
                          {insight.metric}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-start space-x-2">
                  <LightBulbIcon className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-sm font-medium text-gray-700">
                      Recommendation:{" "}
                    </span>
                    <span className="text-sm text-gray-600">
                      {insight.recommendation}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Supporting Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Day Pass to Membership Conversion</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={membershipConversionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="dayPasses" fill="#06b6d4" name="Day Passes" />
                  <Bar
                    dataKey="conversions"
                    fill="#ef4444"
                    name="Conversions"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Location Utilization Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={locationUtilizationTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis domain={[50, 85]} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="downtown"
                    stroke="#ef4444"
                    strokeWidth={3}
                    name="Downtown"
                  />
                  <Line
                    type="monotone"
                    dataKey="westside"
                    stroke="#06b6d4"
                    strokeWidth={3}
                    name="Westside"
                  />
                  <Line
                    type="monotone"
                    dataKey="eastside"
                    stroke="#10b981"
                    strokeWidth={3}
                    name="Eastside"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Items */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CheckCircleIcon className="h-5 w-5" />
            <span>Recommended Actions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start space-x-4 p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="p-2 bg-green-100 rounded-full">
                <ArrowTrendingUpIcon className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <h4 className="font-medium text-green-900">
                  High Priority: Multi-Location Membership Campaign
                </h4>
                <p className="text-sm text-green-700 mt-1">
                  Target home members with multi-location upgrade offers.
                  Potential revenue increase: $15,000/month
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="p-2 bg-yellow-100 rounded-full">
                <ExclamationTriangleIcon className="h-4 w-4 text-yellow-600" />
              </div>
              <div>
                <h4 className="font-medium text-yellow-900">
                  Medium Priority: Eastside Location Review
                </h4>
                <p className="text-sm text-yellow-700 mt-1">
                  Conduct facility audit and member feedback survey to address
                  declining performance
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="p-2 bg-blue-100 rounded-full">
                <InformationCircleIcon className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium text-blue-900">
                  Low Priority: Day Pass Conversion Program
                </h4>
                <p className="text-sm text-blue-700 mt-1">
                  Implement follow-up campaigns for day pass users to increase
                  membership conversions
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
