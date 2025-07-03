
'use client';

import { useState } from 'react';

interface UseLocationReturn {
  location: any | null;
  isLoading: boolean;
  error: string | null;
  hasPermission: boolean;
  requestPermission: () => Promise<boolean>;
  requestLocation: () => Promise<any>;
  getCurrentLocation: () => Promise<any>;
  startWatching: () => void;
  stopWatching: () => void;
  isWatching: boolean;
  nearestStation: any | null;
}

export function useLocation(stations: any[] = []): UseLocationReturn {
  const [location, setLocation] = useState<any | null>({
    latitude: 17.4485,
    longitude: 78.3908,
    accuracy: 10,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState(true);
  const [isWatching, setIsWatching] = useState(false);
  const [nearestStation, setNearestStation] = useState<any | null>({
    id: '1',
    name: 'Ameerpet',
    code: 'AMP',
    line: 'RED_LINE',
    address: 'Ameerpet, Hyderabad',
  });

  const requestPermission = async () => {
    return true;
  };

  const requestLocation = async () => {
    setIsLoading(true);
    try {
      // Simulate location request
      await new Promise(resolve => setTimeout(resolve, 1000));
      setLocation({
        latitude: 17.4485,
        longitude: 78.3908,
        accuracy: 10,
      });
      return location;
    } catch (err) {
      setError('Failed to get location');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentLocation = async () => {
    return location;
  };

  const startWatching = () => {
    setIsWatching(true);
  };

  const stopWatching = () => {
    setIsWatching(false);
  };

  return {
    location,
    isLoading,
    error,
    hasPermission,
    requestPermission,
    requestLocation,
    getCurrentLocation,
    startWatching,
    stopWatching,
    isWatching,
    nearestStation,
  };
}
