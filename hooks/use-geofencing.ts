
'use client';

import { useState, useEffect, useCallback } from 'react';
import { GeofencingService, GeofenceEvent } from '@/lib/services/geofencing-service';
import { Station, Location } from '@/lib/types';

interface UseGeofencingReturn {
  isMonitoring: boolean;
  currentLocation: Location | null;
  nearbyStations: Station[];
  currentGeofences: Station[];
  hasLocationPermission: boolean;
  startMonitoring: (stations: Station[]) => Promise<boolean>;
  stopMonitoring: () => void;
  requestPermission: () => Promise<boolean>;
  onGeofenceEvent: (callback: (event: GeofenceEvent) => void) => void;
  removeGeofenceCallback: (callback: (event: GeofenceEvent) => void) => void;
}

export function useGeofencing(): UseGeofencingReturn {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [nearbyStations, setNearbyStations] = useState<Station[]>([]);
  const [currentGeofences, setCurrentGeofences] = useState<Station[]>([]);
  const [hasLocationPermission, setHasLocationPermission] = useState(false);

  useEffect(() => {
    // Check initial permission status
    checkLocationPermission();
  }, []);

  const checkLocationPermission = async () => {
    try {
      const hasPermission = await GeofencingService.requestLocationPermission();
      setHasLocationPermission(hasPermission);
    } catch (error) {
      console.error('Error checking location permission:', error);
      setHasLocationPermission(false);
    }
  };

  const requestPermission = async (): Promise<boolean> => {
    try {
      const granted = await GeofencingService.requestLocationPermission();
      setHasLocationPermission(granted);
      return granted;
    } catch (error) {
      console.error('Error requesting location permission:', error);
      setHasLocationPermission(false);
      return false;
    }
  };

  const startMonitoring = async (stations: Station[]): Promise<boolean> => {
    try {
      if (!hasLocationPermission) {
        const granted = await requestPermission();
        if (!granted) {
          return false;
        }
      }

      const success = await GeofencingService.startGeofenceMonitoring(stations);
      setIsMonitoring(success);

      if (success) {
        // Set up location updates
        const updateLocation = () => {
          const location = GeofencingService.getCurrentLocation();
          setCurrentLocation(location);
          
          const geofences = GeofencingService.getCurrentGeofences();
          setCurrentGeofences(geofences);
        };

        // Update immediately and then periodically
        updateLocation();
        const interval = setInterval(updateLocation, 5000); // Update every 5 seconds

        // Clean up interval when monitoring stops
        const cleanup = () => clearInterval(interval);
        // Store cleanup function for later use
        (window as any).__geofenceCleanup = cleanup;
      }

      return success;
    } catch (error) {
      console.error('Error starting geofence monitoring:', error);
      setIsMonitoring(false);
      return false;
    }
  };

  const stopMonitoring = useCallback(() => {
    GeofencingService.stopGeofenceMonitoring();
    setIsMonitoring(false);
    setCurrentLocation(null);
    setCurrentGeofences([]);
    setNearbyStations([]);
  }, []);

  const onGeofenceEvent = useCallback((callback: (event: GeofenceEvent) => void) => {
    GeofencingService.addEventCallback(callback);
  }, []);

  const removeGeofenceCallback = useCallback((callback: (event: GeofenceEvent) => void) => {
    GeofencingService.removeEventCallback(callback);
  }, []);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (isMonitoring) {
        stopMonitoring();
      }
    };
  }, [isMonitoring, stopMonitoring]);

  return {
    isMonitoring,
    currentLocation,
    nearbyStations,
    currentGeofences,
    hasLocationPermission,
    startMonitoring,
    stopMonitoring,
    requestPermission,
    onGeofenceEvent,
    removeGeofenceCallback,
  };
}
