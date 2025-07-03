
'use client';

import React, { useState } from 'react';
import { StationFinderMap } from '@/components/maps/station-finder-map';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { MapPin, Search, Train, Clock, Zap } from 'lucide-react';
import { METRO_STATIONS_DATA, METRO_LINES } from '@/lib/constants';

export default function StationsPage() {
  const [selectedStationId, setSelectedStationId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLine, setSelectedLine] = useState<string>('all');

  const filteredStations = METRO_STATIONS_DATA.filter(station => {
    const matchesSearch = station.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLine = selectedLine === 'all' || station.line === selectedLine;
    return matchesSearch && matchesLine;
  });

  const selectedStation = METRO_STATIONS_DATA.find(s => s.id === selectedStationId);

  const handleStationSelect = (stationId: string) => {
    setSelectedStationId(stationId);
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Metro Stations</h1>
        <p className="text-gray-600">Find and explore Hyderabad Metro stations with interactive maps</p>
      </div>

      <Tabs defaultValue="map" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="map" className="flex items-center">
            <MapPin className="h-4 w-4 mr-2" />
            Interactive Map
          </TabsTrigger>
          <TabsTrigger value="list" className="flex items-center">
            <Train className="h-4 w-4 mr-2" />
            Station List
          </TabsTrigger>
        </TabsList>

        <TabsContent value="map" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Map Section */}
            <div className="lg:col-span-2">
              <StationFinderMap
                onStationSelect={handleStationSelect}
                selectedStationId={selectedStationId}
              />
            </div>

            {/* Station Details Sidebar */}
            <div className="space-y-4">
              {selectedStation ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Train className="h-5 w-5 mr-2 text-blue-600" />
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
                      <h4 className="font-medium text-gray-900 mb-2">Location</h4>
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

                    <div className="pt-2 border-t">
                      <Button className="w-full" size="sm">
                        <Clock className="h-4 w-4 mr-2" />
                        View Schedule
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
                      Click on a station marker on the map or select from the nearest stations list to view details.
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Zap className="h-5 w-5 mr-2 text-yellow-600" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" className="w-full justify-start" size="sm">
                    <Train className="h-4 w-4 mr-2" />
                    Plan Journey
                  </Button>
                  <Button variant="outline" className="w-full justify-start" size="sm">
                    <Clock className="h-4 w-4 mr-2" />
                    Live Timings
                  </Button>
                  <Button variant="outline" className="w-full justify-start" size="sm">
                    <MapPin className="h-4 w-4 mr-2" />
                    Nearby Places
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="list" className="space-y-6">
          {/* Search and Filter */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search stations..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={selectedLine === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedLine('all')}
                  >
                    All Lines
                  </Button>
                  {Object.entries(METRO_LINES).map(([lineKey, lineData]) => (
                    <Button
                      key={lineKey}
                      variant={selectedLine === lineKey ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedLine(lineKey)}
                      className="flex items-center"
                    >
                      <div
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: lineData.color }}
                      />
                      {lineData.name.split(' ')[0]}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stations Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredStations.map((station) => {
              const lineInfo = METRO_LINES[station.line as keyof typeof METRO_LINES];
              const isSelected = selectedStationId === station.id;
              
              return (
                <Card
                  key={station.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                  }`}
                  onClick={() => handleStationSelect(station.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{station.name}</h3>
                        <div className="flex items-center">
                          <div
                            className="w-3 h-3 rounded-full mr-2"
                            style={{ backgroundColor: lineInfo?.color }}
                          />
                          <span className="text-sm text-gray-600">{lineInfo?.name}</span>
                        </div>
                      </div>
                      {isSelected && (
                        <Badge variant="default" className="text-xs">
                          Selected
                        </Badge>
                      )}
                    </div>

                    {station.facilities && station.facilities.length > 0 && (
                      <div className="mb-3">
                        <div className="flex flex-wrap gap-1">
                          {station.facilities.slice(0, 3).map((facility) => (
                            <Badge key={facility} variant="outline" className="text-xs">
                              {facility}
                            </Badge>
                          ))}
                          {station.facilities.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{station.facilities.length - 3}
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <span>Lat: {station.latitude.toFixed(3)}</span>
                      <span>Lng: {station.longitude.toFixed(3)}</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {filteredStations.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <Search className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <h3 className="font-medium text-gray-900 mb-2">No stations found</h3>
                <p className="text-sm text-gray-600">
                  Try adjusting your search query or filter criteria.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
