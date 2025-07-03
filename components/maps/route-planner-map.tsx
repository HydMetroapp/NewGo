
'use client';

import React, { useState, useEffect } from 'react';
import { SimpleMap } from './simple-map';
import { METRO_STATIONS_DATA, METRO_LINES } from '@/lib/constants';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, MapPin, Clock, Route, Shuffle } from 'lucide-react';

interface RoutePlannerMapProps {
  fromStationId?: string;
  toStationId?: string;
  onRouteChange?: (fromStationId: string, toStationId: string) => void;
}

export const RoutePlannerMap: React.FC<RoutePlannerMapProps> = ({
  fromStationId: initialFromStationId,
  toStationId: initialToStationId,
  onRouteChange,
}) => {
  const [fromStationId, setFromStationId] = useState(initialFromStationId || '');
  const [toStationId, setToStationId] = useState(initialToStationId || '');
  const [routeInfo, setRouteInfo] = useState<any>(null);
  const [isPlanning, setIsPlanning] = useState(false);

  useEffect(() => {
    if (fromStationId && toStationId && fromStationId !== toStationId) {
      planRoute();
    } else {
      setRouteInfo(null);
    }
  }, [fromStationId, toStationId]);

  const planRoute = async () => {
    if (!fromStationId || !toStationId || fromStationId === toStationId) return;

    setIsPlanning(true);
    try {
      const fromStation = METRO_STATIONS_DATA.find(s => s.id === fromStationId);
      const toStation = METRO_STATIONS_DATA.find(s => s.id === toStationId);
      
      if (fromStation && toStation) {
        // Simple route calculation
        const route = {
          stations: [fromStation, toStation],
          totalDistance: 5000, // Mock distance
          estimatedTime: 15, // Mock time
          interchanges: fromStation.line !== toStation.line ? ['Ameerpet'] : [],
        };
        setRouteInfo(route);
        onRouteChange?.(fromStationId, toStationId);
      }
    } catch (error) {
      console.error('Failed to plan route:', error);
    } finally {
      setIsPlanning(false);
    }
  };

  const swapStations = () => {
    const temp = fromStationId;
    setFromStationId(toStationId);
    setToStationId(temp);
  };

  const formatDistance = (distance: number): string => {
    if (distance < 1000) {
      return `${Math.round(distance)}m`;
    }
    return `${(distance / 1000).toFixed(1)}km`;
  };

  const estimateJourneyTime = (distance: number): string => {
    // Rough estimate: 30 km/h average speed including stops
    const avgSpeed = 30; // km/h
    const timeInHours = (distance / 1000) / avgSpeed;
    const timeInMinutes = Math.round(timeInHours * 60);
    return `${Math.max(timeInMinutes, 5)} min`; // Minimum 5 minutes
  };

  const groupedStations = METRO_STATIONS_DATA.reduce((acc, station) => {
    const lineInfo = METRO_LINES[station.line as keyof typeof METRO_LINES];
    if (!acc[station.line]) {
      acc[station.line] = {
        name: lineInfo?.name || station.line,
        color: lineInfo?.color || '#2563EB',
        stations: [],
      };
    }
    acc[station.line].stations.push(station);
    return acc;
  }, {} as Record<string, { name: string; color: string; stations: typeof METRO_STATIONS_DATA }>);

  return (
    <div className="space-y-4">
      {/* Route Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Route className="h-5 w-5 mr-2 text-blue-600" />
            Plan Your Journey
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* From Station */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">From Station</label>
              <Select value={fromStationId} onValueChange={setFromStationId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select departure station" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(groupedStations).map(([lineKey, lineData]) => (
                    <div key={lineKey}>
                      <div className="flex items-center px-2 py-1 text-sm font-medium text-gray-500">
                        <div
                          className="w-3 h-3 rounded-full mr-2"
                          style={{ backgroundColor: lineData.color }}
                        />
                        {lineData.name}
                      </div>
                      {lineData.stations.map((station) => (
                        <SelectItem key={station.id} value={station.id}>
                          {station.name}
                        </SelectItem>
                      ))}
                    </div>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* To Station */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">To Station</label>
              <Select value={toStationId} onValueChange={setToStationId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select destination station" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(groupedStations).map(([lineKey, lineData]) => (
                    <div key={lineKey}>
                      <div className="flex items-center px-2 py-1 text-sm font-medium text-gray-500">
                        <div
                          className="w-3 h-3 rounded-full mr-2"
                          style={{ backgroundColor: lineData.color }}
                        />
                        {lineData.name}
                      </div>
                      {lineData.stations.map((station) => (
                        <SelectItem 
                          key={station.id} 
                          value={station.id}
                          disabled={station.id === fromStationId}
                        >
                          {station.name}
                        </SelectItem>
                      ))}
                    </div>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Swap Button */}
          <div className="flex justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={swapStations}
              disabled={!fromStationId || !toStationId}
            >
              <Shuffle className="h-4 w-4 mr-2" />
              Swap Stations
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Route Information */}
      {routeInfo && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPin className="h-5 w-5 mr-2 text-green-600" />
              Route Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Route Summary */}
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Distance</p>
                    <p className="font-semibold">{formatDistance(routeInfo.totalDistance)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Est. Time</p>
                    <p className="font-semibold">{estimateJourneyTime(routeInfo.totalDistance)}</p>
                  </div>
                  {routeInfo.interchanges.length > 0 && (
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Interchanges</p>
                      <p className="font-semibold">{routeInfo.interchanges.length}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Route Steps */}
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">Journey Steps</h4>
                <div className="space-y-2">
                  {routeInfo.stations.map((station, index) => {
                    const lineInfo = METRO_LINES[station.line as keyof typeof METRO_LINES];
                    const isInterchange = routeInfo.interchanges.includes(station.name);
                    
                    return (
                      <div key={`${station.id}-${index}`} className="flex items-center space-x-3">
                        <div className="flex flex-col items-center">
                          <div
                            className={`w-3 h-3 rounded-full ${
                              index === 0 ? 'bg-green-500' : 
                              index === routeInfo.stations.length - 1 ? 'bg-red-500' : 
                              'bg-gray-400'
                            }`}
                          />
                          {index < routeInfo.stations.length - 1 && (
                            <div className="w-0.5 h-6 bg-gray-300 mt-1" />
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{station.name}</span>
                            <div
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: lineInfo?.color }}
                            />
                            {isInterchange && (
                              <Badge variant="secondary" className="text-xs">
                                Interchange
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">{lineInfo?.name}</p>
                        </div>

                        {index === 0 && (
                          <Badge variant="outline" className="text-xs">Start</Badge>
                        )}
                        {index === routeInfo.stations.length - 1 && (
                          <Badge variant="outline" className="text-xs">End</Badge>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Interchange Information */}
              {routeInfo.interchanges.length > 0 && (
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <h4 className="font-medium text-yellow-800 mb-2">Interchange Required</h4>
                  <p className="text-sm text-yellow-700">
                    You'll need to change trains at: {routeInfo.interchanges.join(', ')}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Map */}
      <SimpleMap
        className="w-full"
        height="400px"
        selectedStationId={fromStationId || toStationId}
      />

      {/* Planning State */}
      {isPlanning && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2" />
          <p className="text-sm text-gray-600">Planning your route...</p>
        </div>
      )}
    </div>
  );
};
