"use client";
import React from "react";
import Image from "next/image";

interface LocationSwitchLoaderProps {
  isVisible: boolean;
  locationName: string;
}

export const LocationSwitchLoader: React.FC<LocationSwitchLoaderProps> = ({
  isVisible,
  locationName,
}) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-gradient-to-br from-surface via-surface-light to-accent location-switch-overlay">
      <div className="flex h-screen">
        {/* Left Side - Image with Gradient Overlay */}
        <div className="w-1/3 bg-gradient-to-br from-primary via-primary-dark to-transparent relative overflow-hidden">
          {/* Background Image */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Image
              src="/images/LoadingImage.png"
              alt="Loading"
              fill
              className="object-contain opacity-60"
            />
          </div>

          {/* Gradient Overlay - matching auth page style */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/80 via-primary-dark/60 to-transparent"></div>

          {/* Content Overlay */}
          <div className="relative z-10 flex flex-col justify-center h-full p-8 text-white">
            <div className="max-w-sm">
              <div className="mb-6">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4 location-switch-icon">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
                <h2 className="text-h2 font-display mb-3">
                  Switching Location
                </h2>
                <p className="text-body opacity-90 leading-relaxed">
                  Refreshing your dashboard with location-specific data and settings.
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full location-switch-dot location-switch-dot-1"></div>
                  </div>
                  <span className="text-body-sm opacity-80">Loading member data</span>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full location-switch-dot location-switch-dot-2"></div>
                  </div>
                  <span className="text-body-sm opacity-80">Updating class schedules</span>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full location-switch-dot location-switch-dot-3"></div>
                  </div>
                  <span className="text-body-sm opacity-80">Syncing analytics</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Loading Animation */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center space-y-8 max-w-md">
            {/* Main Loading Icon with Rings */}
            <div className="relative mx-auto w-24 h-24">
              <div className="w-24 h-24 bg-gradient-to-br from-primary to-primary-dark rounded-2xl flex items-center justify-center location-switch-icon shadow-2xl">
                <svg
                  className="w-12 h-12 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              
              {/* Pulsing rings */}
              <div className="absolute inset-0 location-switch-ring-1"></div>
              <div className="absolute inset-0 location-switch-ring-2"></div>
              <div className="absolute inset-0 location-switch-ring-3"></div>
            </div>

            {/* Loading text */}
            <div className="space-y-3">
              <h3 className="text-h3 font-display text-primary-text">
                Almost Ready
              </h3>
              <p className="text-body text-secondary-text leading-relaxed">
                Loading data for{" "}
                <span className="font-semibold text-primary">{locationName}</span>
              </p>
            </div>

            {/* Progress bar */}
            <div className="w-80 mx-auto">
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                <div className="h-full bg-gradient-to-r from-primary to-primary-light location-switch-progress rounded-full"></div>
              </div>
            </div>

            {/* Status indicator */}
            <div className="flex items-center justify-center space-x-2 text-secondary-text">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
              <span className="text-body-sm font-medium">Refreshing dashboard...</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};