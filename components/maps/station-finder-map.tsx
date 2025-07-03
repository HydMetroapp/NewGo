
'use client';

import React, { useState, useEffect } from 'react';
import { SimpleMap } from './simple-map';
import { useLocation } from '@/hooks/use-location';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Navigation, Clock, Zap } from 'lucide-react';
import { METRO_LINES, METRO_STATIONS_DATA } from '@/lib/constants';

interface StationFinderMapProps {
  onStationSelect?: (stationId: string) => void;
  selectedStationId?: string;
}

export const StationFinderMap: React.FC<StationFinderMapProps> = ({
  onStationSelect,
  selectedStationId,
}) => {
  const { location, isLoading: locationLoading, requestLocation } = useLocation();
  const [nearestStations, setNearestStations] = useState<any[]>([]);
  const [showDirections, setShowDirections] = useState(false);

  useEffect(() => {
    if (location) {
      findNearestStations();
    }
  }, [location]);

  const findNearestStations = async () => {
    if (!location) return;

    try {
      // Simple nearest stations calculation
      const stations = METRO_STATIONS_DATA.slice(0, 5).map((station, index) => ({
        ...station,
        distance: (index + 1) * 500 // Mock distance
      }));
      setNearestStations(stations);
    } catch (error) {
      console.error('Failed to find nearest stations:', error);
    }
  };

  const handleStationSelect = (stationId: string) => {
    onStationSelect?.(stationId);
    setShowDirections(false);
  };

  const handleShowDirections = (stationId: string) => {
    onStationSelect?.(stationId);
    setShowDirections(true);
  };

  const formatDistance = (distance: number): string => {
    if (distance < 1000) {
      return `${Math.round(distance)}m`;
    }
    return `${(distance / 1000).toFixed(1)}km`;
  };

  const getWalkingTime = (distance: number): string => {
    const walkingSpeed = 5; // km/h
    const timeInHours = (distance / 1000) / walkingSpeed;
    const timeInMinutes = Math.round(timeInHours * 60);
    return `${timeInMinutes} min`;
  };

  return (
    <div className="space-y-4">
      {/* Location Request */}
      {!location && (
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <MapPin className="h-12 w-12 text-blue-600 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Find Nearest Stations</h3>
              <p className="text-sm text-gray-600 mb-4">
                Allow location access to find metro stations near you
              </p>
              <Button 
                onClick={requestLocation} 
                disabled={locationLoading}
                className="w-full"
              >
                {locationLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Getting Location...
                  </>
                ) : (
                  <>
                    <Navigation className="h-4 w-4 mr-2" />
                    Enable Location
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Map */}
      <SimpleMap
        className="w-full"
        height="400px"
        selectedStationId={selectedStationId}
        onStationSelect={onStationSelect}
      />

      {/* Nearest Stations List */}
      {nearestStations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Zap className="h-5 w-5 mr-2 text-blue-600" />
              Nearest Stations
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-0">
              {nearestStations.map((station, index) => {
                const lineInfo = METRO_LINES[station.line as keyof typeof METRO_LINES];
                const isSelected = selectedStationId === station.id;
                
                return (
                  <div
                    key={station.id}
                    className={`p-4 border-b last:border-b-0 transition-colors ${
                      isSelected ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <div
                            className="w-3 h-3 rounded-full mr-2"
                            style={{ backgroundColor: lineInfo?.color }}
                          />
                          <h4 className="font-medium">{station.name}</h4>
                          <Badge variant="secondary" className="ml-2 text-xs">
                            #{index + 1}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span className="flex items-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            {station.distance ? formatDistance(station.distance) : 'N/A'}
                          </span>
                          <span className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {station.distance ? getWalkingTime(station.distance) : 'N/A'}
                          </span>
                        </div>

                        {station.facilities && station.facilities.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {station.facilities.slice(0, 3).map((facility) => (
                              <Badge key={facility} variant="outline" className="text-xs">
                                {facility}
                              </Badge>
                            ))}
                            {station.facilities.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{station.facilities.length - 3} more
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col space-y-2 ml-4">
                        <Button
                          size="sm"
                          variant={isSelected ? "default" : "outline"}
                          onClick={() => handleStationSelect(station.id)}
                        >
                          {isSelected ? 'Selected' : 'Select'}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleShowDirections(station.id)}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Navigation className="h-3 w-3 mr-1" />
                          Directions
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Clear Directions */}
      {showDirections && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={() => {
              setShowDirections(false);
            }}
          >
            Clear Directions
          </Button>
        </div>
      )}
    </div>
  );
};
