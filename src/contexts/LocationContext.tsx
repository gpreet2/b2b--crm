"use client";
import React, { createContext, useContext, useState, useCallback } from "react";

interface LocationContextType {
  selectedLocation: string;
  isLocationSwitching: boolean;
  switchLocation: (location: string) => Promise<void>;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error("useLocation must be used within a LocationProvider");
  }
  return context;
};

interface LocationProviderProps {
  children: React.ReactNode;
}

export const LocationProvider: React.FC<LocationProviderProps> = ({ children }) => {
  const [selectedLocation, setSelectedLocation] = useState("Bakersfield, CA");
  const [isLocationSwitching, setIsLocationSwitching] = useState(false);

  const switchLocation = useCallback(async (location: string) => {
    if (location === selectedLocation) return;
    
    setIsLocationSwitching(true);
    
    // Simulate loading time for location switch
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setSelectedLocation(location);
    setIsLocationSwitching(false);
  }, [selectedLocation]);

  const value = {
    selectedLocation,
    isLocationSwitching,
    switchLocation,
  };

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
};