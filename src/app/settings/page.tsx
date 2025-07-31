"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Separator } from "@/components/ui/Separator";
import { Switch } from "@/components/ui/Switch";
import {
  Key,
  Settings,
  Shield,
  Clock,
  DollarSign,
  Globe,
  CheckCircle,
  AlertTriangle,
  Download,
  Save,
  Eye,
  EyeOff,
  Activity,
  Building,
  Users,
} from "lucide-react";

type TabType = "door-access" | "business-rules";

const tabs = [
  {
    id: "door-access" as TabType,
    name: "Door Access",
    icon: Key,
    description: "Manage door controls and access permissions",
  },
  {
    id: "business-rules" as TabType,
    name: "Business Rules",
    icon: Settings,
    description: "Configure policies and operating hours",
  },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabType>("door-access");

  const renderTabContent = () => {
    switch (activeTab) {
      case "door-access":
        return <DoorAccessSettings />;
      case "business-rules":
        return <BusinessRulesSettings />;
      default:
        return <DoorAccessSettings />;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-slate-900 tracking-tight">
              Settings
            </h1>
            <p className="text-lg text-slate-600">
              Manage your gym&apos;s configuration and access controls
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              className="gap-2 bg-white hover:bg-slate-50"
            >
              <Download className="h-4 w-4" />
              Export Config
            </Button>
            <Button className="gap-2 bg-red-600 hover:bg-red-700 text-white shadow-lg">
              <Save className="h-4 w-4" />
              Save Changes
            </Button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    relative p-6 rounded-xl text-left transition-all duration-200
                    ${
                      isActive
                        ? "bg-red-50 border-2 border-red-200 shadow-sm"
                        : "hover:bg-slate-50 border-2 border-transparent"
                    }
                  `}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`
                        p-3 rounded-xl transition-colors
                        ${
                          isActive
                            ? "bg-red-100 text-red-600"
                            : "bg-slate-100 text-slate-600"
                        }
                      `}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3
                        className={`
                          font-semibold text-lg mb-1
                          ${isActive ? "text-red-900" : "text-slate-900"}
                        `}
                      >
                        {tab.name}
                      </h3>
                      <p
                        className={`
                          text-sm leading-relaxed
                          ${isActive ? "text-red-700" : "text-slate-600"}
                        `}
                      >
                        {tab.description}
                      </p>
                    </div>
                  </div>
                  {isActive && (
                    <div className="absolute inset-x-0 bottom-0 h-1 bg-red-500 rounded-b-xl" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-8">{renderTabContent()}</div>
      </div>
    </div>
  );
}

function DoorAccessSettings() {
  const [doorApiKeys, setDoorApiKeys] = useState<Record<string, string>>({});
  const [showApiKey, setShowApiKey] = useState(false);
  const [selectedDoors, setSelectedDoors] = useState<string[]>([]);
  const [membershipMapping, setMembershipMapping] = useState<
    Record<string, string[]>
  >({});
  const [testDoor, setTestDoor] = useState("");

  const mockDoors = [
    {
      id: "1",
      name: "Front Door",
      location: "Main Entrance",
      status: "online",
    },
  ];

  const mockMembershipTypes = [
    { name: "Basic", color: "bg-blue-100 text-blue-800" },
    { name: "Premium", color: "bg-purple-100 text-purple-800" },
    { name: "VIP", color: "bg-amber-100 text-amber-800" },
    { name: "Staff", color: "bg-green-100 text-green-800" },
    { name: "Trial", color: "bg-gray-100 text-gray-800" },
  ];

  return (
    <div className="space-y-8">
      {/* API Configuration */}
      <Card className="bg-white shadow-sm border-slate-200">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-100 rounded-xl">
              <Key className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <CardTitle className="text-2xl text-slate-900">
                Kisi API Configuration
              </CardTitle>
              <p className="text-slate-600 mt-1">
                Connect your Kisi account for door control
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {mockDoors.map((door) => (
            <div key={door.id} className="space-y-3">
              <label className="text-sm font-medium text-slate-700">
                {door.name} - Kisi API Key
              </label>
              <div className="relative">
                <Input
                  type={showApiKey ? "text" : "password"}
                  value={doorApiKeys[door.id] || ""}
                  onChange={(e) =>
                    setDoorApiKeys({
                      ...doorApiKeys,
                      [door.id]: e.target.value,
                    })
                  }
                  placeholder={`Enter API key for ${door.name}`}
                  className="pr-12 bg-slate-50 border-slate-200 focus:border-red-300 focus:ring-red-200"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showApiKey ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              <p className="text-sm text-slate-500">
                API key for controlling {door.name}
              </p>
            </div>
          ))}

          <div className="p-6 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center gap-3 mb-3">
              <div
                className={`p-2 rounded-lg ${
                  Object.values(doorApiKeys).some((key) => key)
                    ? "bg-green-100"
                    : "bg-amber-100"
                }`}
              >
                {Object.values(doorApiKeys).some((key) => key) ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                )}
              </div>
              <div>
                <h4 className="font-semibold text-slate-900">
                  Connection Status
                </h4>
                <p
                  className={`text-sm ${
                    Object.values(doorApiKeys).some((key) => key)
                      ? "text-green-600"
                      : "text-amber-600"
                  }`}
                >
                  {Object.values(doorApiKeys).some((key) => key)
                    ? "API keys configured"
                    : "API keys required"}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Door Selection */}
      <Card className="bg-white shadow-sm border-slate-200">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Building className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-2xl text-slate-900">
                Door Selection
              </CardTitle>
              <p className="text-slate-600 mt-1">
                Choose which doors to control
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mockDoors.map((door) => (
              <div
                key={door.id}
                className="p-6 bg-slate-50 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-900 mb-1">
                      {door.name}
                    </h4>
                    <p className="text-sm text-slate-600 mb-2">
                      {door.location}
                    </p>
                    <Badge
                      variant={
                        door.status === "online" ? "default" : "secondary"
                      }
                      className={
                        door.status === "online"
                          ? "bg-green-100 text-green-800 hover:bg-green-100"
                          : "bg-red-100 text-red-800 hover:bg-red-100"
                      }
                    >
                      <Activity className="h-3 w-3 mr-1" />
                      {door.status}
                    </Badge>
                  </div>
                  <Switch
                    checked={selectedDoors.includes(door.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedDoors([...selectedDoors, door.id]);
                      } else {
                        setSelectedDoors(
                          selectedDoors.filter((id) => id !== door.id)
                        );
                      }
                    }}
                    className="data-[state=checked]:bg-red-600 data-[state=unchecked]:bg-slate-300"
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Membership Mapping */}
      <Card className="bg-white shadow-sm border-slate-200">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-xl">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <CardTitle className="text-2xl text-slate-900">
                Membership Access Control
              </CardTitle>
              <p className="text-slate-600 mt-1">
                Map doors to membership types
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {mockMembershipTypes.map((membership) => (
            <div key={membership.name} className="space-y-4">
              <div className="flex items-center gap-3">
                <Badge className={membership.color}>
                  {membership.name} Members
                </Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 pl-4">
                {mockDoors.map((door) => (
                  <label
                    key={door.id}
                    className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    <Switch
                      checked={
                        membershipMapping[membership.name]?.includes(door.id) ||
                        false
                      }
                      onCheckedChange={(checked) => {
                        const current =
                          membershipMapping[membership.name] || [];
                        if (checked) {
                          setMembershipMapping({
                            ...membershipMapping,
                            [membership.name]: [...current, door.id],
                          });
                        } else {
                          setMembershipMapping({
                            ...membershipMapping,
                            [membership.name]: current.filter(
                              (id) => id !== door.id
                            ),
                          });
                        }
                      }}
                      className="data-[state=checked]:bg-red-600 data-[state=unchecked]:bg-slate-300"
                    />
                    <span className="text-sm font-medium text-slate-700">
                      {door.name}
                    </span>
                  </label>
                ))}
              </div>
              <Separator />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Test Unlock */}
      <Card className="bg-white shadow-sm border-slate-200">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-100 rounded-xl">
              <AlertTriangle className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <CardTitle className="text-2xl text-slate-900">
                Test Unlock
              </CardTitle>
              <p className="text-slate-600 mt-1">
                Test door unlock functionality
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <select
              value={testDoor}
              onChange={(e) => setTestDoor(e.target.value)}
              className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-red-300 focus:ring-red-200 text-slate-900"
            >
              <option value="">Select door to test</option>
              {mockDoors.map((door) => (
                <option key={door.id} value={door.id}>
                  {door.name} - {door.location}
                </option>
              ))}
            </select>
            <Button
              disabled={!testDoor}
              className="bg-red-600 hover:bg-red-700 text-white px-8"
            >
              Test Unlock
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function BusinessRulesSettings() {
  const [cancellationWindow, setCancellationWindow] = useState(24);
  const [lateFee, setLateFee] = useState(10);
  const [noShowFee, setNoShowFee] = useState(15);
  const [jurisdiction, setJurisdiction] = useState("US");
  const [operatingHours, setOperatingHours] = useState({
    monday: { open: "06:00", close: "22:00", closed: false },
    tuesday: { open: "06:00", close: "22:00", closed: false },
    wednesday: { open: "06:00", close: "22:00", closed: false },
    thursday: { open: "06:00", close: "22:00", closed: false },
    friday: { open: "06:00", close: "22:00", closed: false },
    saturday: { open: "08:00", close: "20:00", closed: false },
    sunday: { open: "08:00", close: "18:00", closed: false },
  });

  const days = [
    { key: "monday", label: "Monday" },
    { key: "tuesday", label: "Tuesday" },
    { key: "wednesday", label: "Wednesday" },
    { key: "thursday", label: "Thursday" },
    { key: "friday", label: "Friday" },
    { key: "saturday", label: "Saturday" },
    { key: "sunday", label: "Sunday" },
  ];

  return (
    <div className="space-y-8">
      {/* Cancellation Policy */}
      <Card className="bg-white shadow-sm border-slate-200">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-100 rounded-xl">
              <Clock className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <CardTitle className="text-2xl text-slate-900">
                Cancellation Policy
              </CardTitle>
              <p className="text-slate-600 mt-1">
                Set cancellation rules and timing
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <label className="text-sm font-medium text-slate-700">
              Cancellation Window (Hours)
            </label>
            <Input
              type="number"
              value={cancellationWindow}
              onChange={(e) =>
                setCancellationWindow(Number.parseFloat(e.target.value) || 0)
              }
              className="bg-slate-50 border-slate-200 focus:border-red-300 focus:ring-red-200"
            />
            <p className="text-sm text-slate-500">
              Classes must be cancelled at least {cancellationWindow} hours in
              advance
            </p>
          </div>

          <div className="p-6 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center gap-3 mb-3">
              <Clock className="h-5 w-5 text-slate-600" />
              <h4 className="font-semibold text-slate-900">Policy Summary</h4>
            </div>
            <p className="text-slate-600">
              Members must cancel at least{" "}
              <span className="font-semibold text-slate-900">
                {cancellationWindow} hours
              </span>{" "}
              before class starts to avoid fees
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Fee Configuration */}
      <Card className="bg-white shadow-sm border-slate-200">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-xl">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <CardTitle className="text-2xl text-slate-900">
                Fee Configuration
              </CardTitle>
              <p className="text-slate-600 mt-1">
                Set pricing for cancellations and no-shows
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="text-sm font-medium text-slate-700">
                Late Cancellation Fee ($)
              </label>
              <Input
                type="number"
                value={lateFee}
                onChange={(e) =>
                  setLateFee(Number.parseFloat(e.target.value) || 0)
                }
                className="bg-slate-50 border-slate-200 focus:border-red-300 focus:ring-red-200"
              />
              <p className="text-sm text-slate-500">
                Fee charged for late cancellations
              </p>
            </div>
            <div className="space-y-3">
              <label className="text-sm font-medium text-slate-700">
                No-Show Fee ($)
              </label>
              <Input
                type="number"
                value={noShowFee}
                onChange={(e) =>
                  setNoShowFee(Number.parseFloat(e.target.value) || 0)
                }
                className="bg-slate-50 border-slate-200 focus:border-red-300 focus:ring-red-200"
              />
              <p className="text-sm text-slate-500">Fee charged for no-shows</p>
            </div>
          </div>

          <div className="p-6 bg-slate-50 rounded-xl border border-slate-200">
            <h4 className="font-semibold text-slate-900 mb-4">Fee Summary</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Late Cancellation:</span>
                <span className="font-semibold text-slate-900">
                  ${lateFee.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">No-Show Fee:</span>
                <span className="font-semibold text-slate-900">
                  ${noShowFee.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Operating Hours */}
      <Card className="bg-white shadow-sm border-slate-200">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Clock className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-2xl text-slate-900">
                Operating Hours
              </CardTitle>
              <p className="text-slate-600 mt-1">
                Define your gym&apos;s daily operating schedule
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {days.map((day) => (
            <div
              key={day.key}
              className="flex items-center gap-6 p-4 bg-slate-50 rounded-xl border border-slate-200"
            >
              <div className="w-24">
                <span className="font-medium text-slate-900">{day.label}</span>
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <Switch
                    checked={
                      operatingHours[day.key as keyof typeof operatingHours]
                        .closed
                    }
                    onCheckedChange={(checked) =>
                      setOperatingHours({
                        ...operatingHours,
                        [day.key]: {
                          ...operatingHours[
                            day.key as keyof typeof operatingHours
                          ],
                          closed: checked,
                        },
                      })
                    }
                    className="data-[state=checked]:bg-red-600 data-[state=unchecked]:bg-slate-300"
                  />
                  <span className="text-sm text-slate-600">Closed</span>
                </label>
                {!operatingHours[day.key as keyof typeof operatingHours]
                  .closed && (
                  <>
                    <input
                      type="time"
                      value={
                        operatingHours[day.key as keyof typeof operatingHours]
                          .open
                      }
                      onChange={(e) =>
                        setOperatingHours({
                          ...operatingHours,
                          [day.key]: {
                            ...operatingHours[
                              day.key as keyof typeof operatingHours
                            ],
                            open: e.target.value,
                          },
                        })
                      }
                      className="px-3 py-2 bg-white border border-slate-200 rounded-lg focus:border-red-300 focus:ring-red-200 text-slate-900"
                    />
                    <span className="text-slate-600">to</span>
                    <input
                      type="time"
                      value={
                        operatingHours[day.key as keyof typeof operatingHours]
                          .close
                      }
                      onChange={(e) =>
                        setOperatingHours({
                          ...operatingHours,
                          [day.key]: {
                            ...operatingHours[
                              day.key as keyof typeof operatingHours
                            ],
                            close: e.target.value,
                          },
                        })
                      }
                      className="px-3 py-2 bg-white border border-slate-200 rounded-lg focus:border-red-300 focus:ring-red-200 text-slate-900"
                    />
                  </>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Compliance Jurisdiction */}
      <Card className="bg-white shadow-sm border-slate-200">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-xl">
              <Globe className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <CardTitle className="text-2xl text-slate-900">
                Compliance Jurisdiction
              </CardTitle>
              <p className="text-slate-600 mt-1">
                Select your jurisdiction for compliance rules
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <label className="text-sm font-medium text-slate-700">
              Jurisdiction
            </label>
            <select
              value={jurisdiction}
              onChange={(e) => setJurisdiction(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-red-300 focus:ring-red-200 text-slate-900"
            >
              <option value="US">United States</option>
              <option value="CA">Canada</option>
              <option value="UK">United Kingdom</option>
              <option value="AU">Australia</option>
              <option value="EU">European Union</option>
            </select>
          </div>

          <div className="p-6 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center gap-3 mb-3">
              <Shield className="h-5 w-5 text-slate-600" />
              <h4 className="font-semibold text-slate-900">
                Compliance Impact
              </h4>
            </div>
            <p className="text-slate-600">
              This affects cancellation policies, data handling, and fee
              structures
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
