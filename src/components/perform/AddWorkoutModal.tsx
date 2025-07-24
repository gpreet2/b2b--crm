"use client";

import React, { useState, useEffect } from "react";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";
import WorkoutSidebar from "./WorkoutSidebar";

interface AddWorkoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (workoutData: Record<string, unknown>) => void;
  selectedDate?: Date | null;
}

export default function AddWorkoutModal({
  isOpen,
  onClose,
  onSave,
  selectedDate,
}: AddWorkoutModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startTime, setStartTime] = useState("07:00");

  const [isDragOver, setIsDragOver] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setTitle("");
      setDescription("");
      setStartTime("07:00");

      setShowSidebar(true); // Show sidebar when modal opens
    } else {
      setShowSidebar(false); // Hide sidebar when modal closes
    }
  }, [isOpen]);

  const handleSave = () => {
    const workoutData = {
      title,
      description,
      startTime,
      date: selectedDate || new Date(),
    };
    onSave(workoutData);

    // Reset form for next workout but keep modal open
    setTitle("");
    setDescription("");
    setStartTime("07:00");
  };

  const handleSaveAndClose = () => {
    const workoutData = {
      title,
      description,
      startTime,
      date: selectedDate || new Date(),
    };
    onSave(workoutData);
    onClose();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    try {
      const jsonData = e.dataTransfer.getData("application/json");
      if (!jsonData) {
        console.warn("No JSON data found in drag event");
        return;
      }

      const workoutData = JSON.parse(jsonData);

      // Auto-fill the form with the dropped workout data
      if (!title) {
        setTitle(workoutData.title || "");
      }
      if (!description) {
        setDescription(workoutData.description || "");
      }

      // Show success feedback
      console.log("Workout added successfully:", workoutData.title);
    } catch (error) {
      console.error("Error parsing dropped workout data:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Workout Sidebar */}
      <WorkoutSidebar
        isOpen={showSidebar}
        onClose={() => setShowSidebar(false)}
        onAddWorkout={(workout) => {
          // Handle workout selection for drag and drop
          console.log("Selected workout:", workout);
        }}
      />

      {/* Custom Modal Layout */}
      <div className="fixed inset-0 z-[60] flex">
        {/* Backdrop - only covers area to the right of sidebar */}
        <div
          className="fixed top-0 left-80 right-0 bottom-0 bg-black/50 backdrop-blur-sm z-[61]"
          onClick={onClose}
        />

        {/* Modal positioned to the right of sidebar */}
        <div className="relative ml-80 flex-1 flex items-center justify-center p-4 z-[62]">
          <div className="relative bg-surface rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border-0">
            {/* Header */}
            <div className="p-6 bg-gradient-to-r from-surface-light/50 to-surface-light/30">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-primary-text">
                    Add New Workout
                  </h2>
                  <p className="text-sm text-secondary-text">
                    {selectedDate
                      ? `Scheduled for ${selectedDate.toLocaleDateString(
                          "en-US",
                          {
                            weekday: "long",
                            month: "long",
                            day: "numeric",
                          }
                        )}`
                      : "Create a new workout session"}
                  </p>
                </div>
                <Button
                  onClick={onClose}
                  variant="outline"
                  size="sm"
                  className="border-border/50 text-primary-text hover:bg-surface/50"
                >
                  <XMarkIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-primary-text mb-2">
                    Workout Title *
                  </label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., CrossFit WOD, Morning Cardio"
                    className="w-full bg-surface border-border/50 text-primary-text placeholder:text-muted focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary-text mb-2">
                    Start Time *
                  </label>
                  <Input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full bg-surface border-border/50 text-primary-text"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary-text mb-2">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Brief description of the workout..."
                    className="w-full px-3 py-2 bg-surface border border-border/50 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none text-primary-text placeholder:text-muted"
                    rows={3}
                  />
                </div>
              </div>

              {/* Quick Add Zone */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-primary-text">
                  Quick Add Workout
                </h3>

                <div
                  className={`min-h-[120px] p-6 border-2 border-dashed rounded-lg transition-all duration-200 ${
                    isDragOver
                      ? "border-primary bg-primary/10"
                      : "border-border/50 bg-surface-light/20"
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <div className="text-center">
                    <PlusIcon className="h-8 w-8 text-secondary-text mx-auto mb-3" />
                    <p className="text-sm text-secondary-text mb-2">
                      {isDragOver
                        ? "Drop workout here to auto-fill form"
                        : "Drag a workout from the sidebar"}
                    </p>
                    <p className="text-xs text-muted">
                      This will automatically fill the title and description
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-6 bg-gradient-to-r from-accent/50 to-accent/30 border-t border-border">
              <div className="text-xs text-secondary-text">
                💡 Tip: Drag workouts from the sidebar to auto-fill the form
              </div>
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="px-6 py-2 border-border text-primary-text hover:bg-accent"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={!title.trim()}
                  variant="primary"
                  className="px-6 py-2"
                >
                  Save & Add Another
                </Button>
                <Button
                  onClick={handleSaveAndClose}
                  disabled={!title.trim()}
                  variant="primary"
                  className="px-6 py-2"
                >
                  Save & Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
