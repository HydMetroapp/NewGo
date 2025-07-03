
'use client';

import React, { useEffect, useRef, useState } from 'react';
import { METRO_STATIONS_DATA, HYDERABAD_CENTER, GOOGLE_MAPS_CONFIG } from '@/lib/constants';
import { Loader2, MapPin } from 'lucide-react';

interface SimpleMapProps {
  className?: string;
  height?: string;
  selectedStationId?: string;
  onStationSelect?: (stationId: string) => void;
}

export const SimpleMap: React.FC<SimpleMapProps> = ({
  className = '',
  height = '400px',
  selectedStationId,
  onStationSelect,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);

  useEffect(() => {
    const initMap = async () => {
      if (!mapRef.current) return;

      try {
        setIsLoading(true);
        setError(null);

        // Load Google Maps script
        if (!window.google) {
          const script = document.createElement('script');
          script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_CONFIG.apiKey}&libraries=places,geometry`;
          script.async = true;
          script.defer = true;
          
          await new Promise((resolve, reject) => {
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
          });
        }

        // Initialize map
        const mapInstance = new google.maps.Map(mapRef.current, {
          center: { lat: HYDERABAD_CENTER.latitude, lng: HYDERABAD_CENTER.longitude },
          zoom: 11,
          ...GOOGLE_MAPS_CONFIG.mapOptions,
        });

        // Add station markers
        METRO_STATIONS_DATA.forEach(station => {
          const marker = new google.maps.Marker({
            position: { lat: station.latitude, lng: station.longitude },
            map: mapInstance,
            title: station.name,
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: station.line === 'RED_LINE' ? '#DC2626' : 
                        station.line === 'GREEN_LINE' ? '#16A34A' : '#2563EB',
              fillOpacity: 1,
              strokeColor: '#FFFFFF',
              strokeWeight: 2,
            },
          });

          const infoWindow = new google.maps.InfoWindow({
            content: `
              <div style="padding: 8px; max-width: 200px;">
                <h3 style="margin: 0 0 8px 0; font-weight: bold;">${station.name}</h3>
                <p style="margin: 0 0 8px 0; color: #666; font-size: 14px;">
                  ${station.line.replace('_', ' ')}
                </p>
                ${station.facilities ? `
                  <div style="margin-bottom: 8px;">
                    ${station.facilities.slice(0, 3).map(f => 
                      `<span style="background: #e5e7eb; padding: 2px 6px; border-radius: 12px; font-size: 12px; margin-right: 4px;">${f}</span>`
                    ).join('')}
                  </div>
                ` : ''}
                <button 
                  onclick="window.selectStation?.('${station.id}')"
                  style="background: #2563eb; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 12px;"
                >
                  Select Station
                </button>
              </div>
            `,
          });

          marker.addListener('click', () => {
            infoWindow.open(mapInstance, marker);
          });
        });

        setMap(mapInstance);
      } catch (err) {
        console.error('Failed to load map:', err);
        setError('Failed to load map. Please check your internet connection.');
      } finally {
        setIsLoading(false);
      }
    };

    initMap();

    // Global function for info window callbacks
    (window as any).selectStation = (stationId: string) => {
      onStationSelect?.(stationId);
    };

    return () => {
      delete (window as any).selectStation;
    };
  }, [onStationSelect]);

  useEffect(() => {
    if (map && selectedStationId) {
      const station = METRO_STATIONS_DATA.find(s => s.id === selectedStationId);
      if (station) {
        map.panTo({ lat: station.latitude, lng: station.longitude });
        map.setZoom(15);
      }
    }
  }, [map, selectedStationId]);

  if (error) {
    return (
      <div 
        className={`flex items-center justify-center bg-gray-100 rounded-lg ${className}`}
        style={{ height }}
      >
        <div className="text-center p-4">
          <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-red-600 mb-2">Map Error</p>
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
