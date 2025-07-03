
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useLocation } from './use-location';
import { useGoogleMaps } from './use-google-maps';
import { MapsService, RouteInfo } from '@/lib/services/maps-service';
import { METRO_STATIONS_DATA } from '@/lib/constants';

export interface UseMapsIntegrationReturn {
  // Location data
  userLocation: any;
  isLocationLoading: boolean;
  locationError: string | null;
  
  // Maps data
  isMapLoaded: boolean;
  mapError: string | null;
  nearestStations: any[];
  selectedStationId: string | null;
  
  // Route planning
  routeInfo: RouteInfo | null;
  isPlanning: boolean;
  
  // Actions
  requestLocation: () => void;
  selectStation: (stationId: string) => void;
  findNearestStations: () => Promise<void>;
  planRoute: (fromStationId: string, toStationId: string) => Promise<void>;
  showDirectionsToStation: (stationId: string) => Promise<void>;
  clearDirections: () => void;
  centerOnStation: (stationId: string) => void;
}

export const useMapsIntegration = (): UseMapsIntegrationReturn => {
  const {
    location: userLocation,
    isLoading: isLocationLoading,
    error: locationError,
    requestLocation,
  } = useLocation();

  const {
    isLoaded: isMapLoaded,
    error: mapError,
    nearestStations,
    selectedStationId,
    selectStation,
    findNearestStations: findNearestStationsBase,
    showDirectionsToStation: showDirectionsToStationBase,
    clearDirections,
    centerOnStation,
    updateUserLocation,
  } = useGoogleMaps();

  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [isPlanning, setIsPlanning] = useState(false);

  // Update user location on map when location changes
  useEffect(() => {
    if (userLocation && isMapLoaded) {
      updateUserLocation(userLocation);
    }
  }, [userLocation, isMapLoaded, updateUserLocation]);

  // Auto-find nearest stations when location is available
  useEffect(() => {
    if (userLocation && isMapLoaded) {
      findNearestStations();
    }
  }, [userLocation, isMapLoaded]);

  const findNearestStations = useCallback(async () => {
    if (!userLocation) return;
    await findNearestStationsBase(userLocation, 5);
  }, [userLocation, findNearestStationsBase]);

  const planRoute = useCallback(async (fromStationId: string, toStationId: string) => {
    if (!fromStationId || !toStationId || fromStationId === toStationId) {
      setRouteInfo(null);
      return;
    }

    setIsPlanning(true);
    try {
      const route = await MapsService.planRoute(fromStationId, toStationId);
      setRouteInfo(route);
      
      // Fit map to show both stations
      await MapsService.fitBoundsToStations([fromStationId, toStationId]);
    } catch (error) {
      console.error('Failed to plan route:', error);
    } finally {
      setIsPlanning(false);
    }
  }, []);

  const showDirectionsToStation = useCallback(async (stationId: string) => {
    if (!userLocation) {
      throw new Error('User location not available');
    }
    await showDirectionsToStationBase(stationId, userLocation);
  }, [userLocation, showDirectionsToStationBase]);

  return {
    // Location data
    userLocation,
    isLocationLoading,
    locationError,
    
    // Maps data
    isMapLoaded,
    mapError,
    nearestStations,
    selectedStationId,
    
    // Route planning
    routeInfo,
    isPlanning,
    
    // Actions
    requestLocation,
    selectStation,
    findNearestStations,
    planRoute,
    showDirectionsToStation,
    clearDirections,
    centerOnStation,
  };
};
