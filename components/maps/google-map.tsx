
'use client';

import React, { useEffect, useRef, useState } from 'react';
import { MapsService } from '@/lib/services/maps-service';
import { Location } from '@/lib/types';
import { Loader2 } from 'lucide-react';

interface GoogleMapProps {
  className?: string;
  onMapReady?: (map: google.maps.Map) => void;
  userLocation?: Location;
  selectedStationId?: string;
  showDirections?: boolean;
  height?: string;
}

export const GoogleMap: React.FC<GoogleMapProps> = ({
  className = '',
  onMapReady,
  userLocation,
  selectedStationId,
  showDirections = false,
  height = '400px',
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);

  useEffect(() => {
    const initializeMap = async () => {
      if (!mapRef.current) return;

      try {
        setIsLoading(true);
        setError(null);

        const mapInstance = await MapsService.initializeMap(mapRef.current);
        setMap(mapInstance);
        onMapReady?.(mapInstance);
      } catch (err) {
        console.error('Failed to initialize map:', err);
        setError('Failed to load map. Please check your internet connection.');
      } finally {
        setIsLoading(false);
      }
    };

    initializeMap();
  }, [onMapReady]);

  useEffect(() => {
    if (map && userLocation) {
      MapsService.updateUserLocation(userLocation);
    }
  }, [map, userLocation]);

  useEffect(() => {
    if (map && selectedStationId) {
      MapsService.centerOnStation(selectedStationId);
      
      if (showDirections && userLocation) {
        MapsService.showDirectionsToStation(selectedStationId, userLocation)
          .catch(err => console.error('Failed to show directions:', err));
      }
    }
  }, [map, selectedStationId, showDirections, userLocation]);

  if (error) {
    return (
      <div 
        className={`flex items-center justify-center bg-gray-100 rounded-lg ${className}`}
        style={{ height }}
      >
        <div className="text-center p-4">
          <p className="text-red-600 mb-2">⚠️ Map Error</p>
          <p className="text-sm text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} style={{ height }}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg z-10">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Loading map...</p>
          </div>
        </div>
      )}
      <div
        ref={mapRef}
        className="w-full h-full rounded-lg"
        style={{ minHeight: height }}
      />
    </div>
  );
};
