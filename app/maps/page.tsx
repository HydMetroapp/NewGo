
'use client';

import React, { useState } from 'react';
import { SimpleMap } from '@/components/maps/simple-map';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { MapPin, Search, Navigation, Train } from 'lucide-react';
import { METRO_STATIONS_DATA, METRO_LINES } from '@/lib/constants';

export default function MapsPage() {
  const [selectedStationId, setSelectedStationId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredStations = METRO_STATIONS_DATA.filter(station =>
    station.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedStation = METRO_STATIONS_DATA.find(s => s.id === selectedStationId);

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Metro Map</h1>
        <p className="text-gray-600">Interactive map of all Hyderabad Metro stations</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Section */}
        <div className="lg:col-span-2 space-y-4">
          <SimpleMap
            className="w-full"
            height="500px"
            selectedStationId={selectedStationId}
            onStationSelect={setSelectedStationId}
          />
          
          {/* Map Legend */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Metro Lines</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                {Object.entries(METRO_LINES).map(([lineKey, lineData]) => (
                  <div key={lineKey} className="flex items-center space-x-2">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: lineData.color }}
                    />
                    <span className="text-sm font-medium">{lineData.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {lineData.stations.length} stations
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Search */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center">
                <Search className="h-4 w-4 mr-2" />
                Find Station
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Input
                  placeholder="Search stations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                
                <div className="max-h-48 overflow-y-auto space-y-1">
                  {filteredStations.slice(0, 10).map((station) => {
                    const lineInfo = METRO_LINES[station.line as keyof typeof METRO_LINES];
                    const isSelected = selectedStationId === station.id;
                    
                    return (
                      <div
                        key={station.id}
                        className={`p-2 rounded cursor-pointer transition-colors ${
                          isSelected ? 'bg-blue-100 border border-blue-300' : 'hover:bg-gray-50'
                        }`}
                        onClick={() => setSelectedStationId(station.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-sm">{station.name}</p>
                            <div className="flex items-center mt-1">
                              <div
                                className="w-2 h-2 rounded-full mr-2"
                                style={{ backgroundColor: lineInfo?.color }}
                              />
                              <span className="text-xs text-gray-600">{lineInfo?.name}</span>
                            </div>
                          </div>
                          {isSelected && (
                            <Badge variant="default" className="text-xs">Selected</Badge>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Selected Station Details */}
          {selectedStation ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center">
                  <Train className="h-4 w-4 mr-2" />
                  Station Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">{selectedStation.name}</h3>
                  <div className="flex items-center mt-1">
                    <div
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ 
                        backgroundColor: METRO_LINES[selectedStation.line as keyof typeof METRO_LINES]?.color 
                      }}
                    />
                    <span className="text-sm text-gray-600">
                      {METRO_LINES[selectedStation.line as keyof typeof METRO_LINES]?.name}
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Coordinates</h4>
                  <p className="text-sm text-gray-600">
                    {selectedStation.latitude.toFixed(4)}, {selectedStation.longitude.toFixed(4)}
                  </p>
                </div>

                {selectedStation.facilities && selectedStation.facilities.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Facilities</h4>
                    <div className="flex flex-wrap gap-1">
                      {selectedStation.facilities.map((facility) => (
                        <Badge key={facility} variant="secondary" className="text-xs">
                          {facility}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-2 pt-2 border-t">
                  <Button className="w-full" size="sm">
                    <Navigation className="h-4 w-4 mr-2" />
                    Get Directions
                  </Button>
                  <Button variant="outline" className="w-full" size="sm">
                    <Train className="h-4 w-4 mr-2" />
                    Plan Journey
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <h3 className="font-medium text-gray-900 mb-2">Select a Station</h3>
                <p className="text-sm text-gray-600">
                  Click on a station marker on the map or search for a station to view details.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Network Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-blue-600">{METRO_STATIONS_DATA.length}</p>
                  <p className="text-xs text-gray-600">Total Stations</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">3</p>
                  <p className="text-xs text-gray-600">Metro Lines</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
