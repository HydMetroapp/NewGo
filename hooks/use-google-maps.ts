
'use client';

import { useState, useEffect, useCallback } from 'react';
import { MapsService, StationWithDistance } from '@/lib/services/maps-service';
import { Location } from '@/lib/types';
import { METRO_STATIONS_DATA } from '@/lib/constants';

export interface UseGoogleMapsReturn {
  isLoaded: boolean;
  error: string | null;
  map: google.maps.Map | null;
  nearestStations: StationWithDistance[];
  selectedStationId: string | null;
  isLoadingStations: boolean;
  initializeMap: (container: HTMLElement) => Promise<void>;
  selectStation: (stationId: string) => void;
  findNearestStations: (location: Location, limit?: number) => Promise<void>;
  showDirectionsToStation: (stationId: string, userLocation?: Location) => Promise<void>;
  clearDirections: () => void;
  centerOnStation: (stationId: string) => void;
  updateUserLocation: (location: Location) => void;
}

export const useGoogleMaps = (): UseGoogleMapsReturn => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [nearestStations, setNearestStations] = useState<StationWithDistance[]>([]);
  const [selectedStationId, setSelectedStationId] = useState<string | null>(null);
  const [isLoadingStations, setIsLoadingStations] = useState(false);

  const initializeMap = useCallback(async (container: HTMLElement) => {
    try {
      setError(null);
      const mapInstance = await MapsService.initializeMap(container);
      setMap(mapInstance);
      setIsLoaded(true);
    } catch (err) {
      console.error('Failed to initialize map:', err);
      setError(err instanceof Error ? err.message : 'Failed to load map');
    }
  }, []);

  const selectStation = useCallback((stationId: string) => {
    setSelectedStationId(stationId);
  }, []);

  const findNearestStations = useCallback(async (location: Location, limit: number = 5) => {
    setIsLoadingStations(true);
    try {
      const stations = await MapsService.findNearestStations(location, limit);
      setNearestStations(stations);
    } catch (err) {
      console.error('Failed to find nearest stations:', err);
      setError('Failed to find nearest stations');
    } finally {
      setIsLoadingStations(false);
    }
  }, []);

  const showDirectionsToStation = useCallback(async (stationId: string, userLocation?: Location) => {
    try {
      await MapsService.showDirectionsToStation(stationId, userLocation);
    } catch (err) {
      console.error('Failed to show directions:', err);
      setError('Failed to show directions');
    }
  }, []);

  const clearDirections = useCallback(() => {
    MapsService.clearDirections();
  }, []);

  const centerOnStation = useCallback((stationId: string) => {
    MapsService.centerOnStation(stationId);
    setSelectedStationId(stationId);
  }, []);

  const updateUserLocation = useCallback((location: Location) => {
    MapsService.updateUserLocation(location);
  }, []);

  return {
    isLoaded,
    error,
    map,
    nearestStations,
    selectedStationId,
    isLoadingStations,
    initializeMap,
    selectStation,
    findNearestStations,
    showDirectionsToStation,
    clearDirections,
    centerOnStation,
    updateUserLocation,
  };
};
