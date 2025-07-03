
'use client';

import React, { useState } from 'react';
import { RoutePlannerMap } from '@/components/maps/route-planner-map';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Route, Clock, CreditCard, MapPin, ArrowRight, Train } from 'lucide-react';
import { useMapsIntegration } from '@/hooks/use-maps-integration';

export default function JourneyPage() {
  const [fromStationId, setFromStationId] = useState('');
  const [toStationId, setToStationId] = useState('');
  const [activeTab, setActiveTab] = useState('plan');
  
  const {
    routeInfo,
    isPlanning,
    userLocation,
    nearestStations,
  } = useMapsIntegration();

  const handleRouteChange = (from: string, to: string) => {
    setFromStationId(from);
    setToStationId(to);
  };

  const calculateFare = (distance: number): number => {
    // Basic fare calculation - ₹10 base + ₹2 per km
    const baseFare = 10;
    const perKmRate = 2;
    const distanceInKm = distance / 1000;
    return Math.min(Math.max(baseFare + Math.round(distanceInKm * perKmRate), baseFare), 60);
  };

  const formatDistance = (distance: number): string => {
    if (distance < 1000) {
      return `${Math.round(distance)}m`;
    }
    return `${(distance / 1000).toFixed(1)}km`;
  };

  const estimateJourneyTime = (distance: number): string => {
    const avgSpeed = 30; // km/h
    const timeInHours = (distance / 1000) / avgSpeed;
    const timeInMinutes = Math.round(timeInHours * 60);
    return `${Math.max(timeInMinutes, 5)} min`;
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Journey Planner</h1>
        <p className="text-gray-600">Plan your metro journey with real-time directions and fare information</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="plan" className="flex items-center">
            <Route className="h-4 w-4 mr-2" />
            Plan Route
          </TabsTrigger>
          <TabsTrigger value="live" className="flex items-center">
            <Clock className="h-4 w-4 mr-2" />
            Live Tracking
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center">
            <Train className="h-4 w-4 mr-2" />
            Journey History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="plan" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Route Planner */}
            <div className="lg:col-span-2">
              <RoutePlannerMap
                fromStationId={fromStationId}
                toStationId={toStationId}
                onRouteChange={handleRouteChange}
              />
            </div>

            {/* Journey Summary Sidebar */}
            <div className="space-y-4">
              {routeInfo ? (
                <>
                  {/* Fare Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <CreditCard className="h-5 w-5 mr-2 text-green-600" />
                        Fare Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-green-600 mb-2">
                          ₹{calculateFare(routeInfo.totalDistance)}
                        </div>
                        <p className="text-sm text-gray-600 mb-4">Total Fare</p>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="text-center">
                            <p className="text-gray-600">Distance</p>
                            <p className="font-semibold">{formatDistance(routeInfo.totalDistance)}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-gray-600">Duration</p>
                            <p className="font-semibold">{estimateJourneyTime(routeInfo.totalDistance)}</p>
                          </div>
                        </div>

                        <Button className="w-full mt-4">
                          <CreditCard className="h-4 w-4 mr-2" />
                          Book Journey
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Quick Journey Info */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Route className="h-5 w-5 mr-2 text-blue-600" />
                        Journey Summary
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Stations</span>
                        <span className="font-medium">{routeInfo.stations.length}</span>
                      </div>
                      
                      {routeInfo.interchanges.length > 0 && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Interchanges</span>
                          <Badge variant="secondary">{routeInfo.interchanges.length}</Badge>
                        </div>
                      )}

                      <div className="pt-2 border-t">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">From</span>
                          <span className="font-medium">{routeInfo.stations[0]?.name}</span>
                        </div>
                        <div className="flex items-center justify-center py-2">
                          <ArrowRight className="h-4 w-4 text-gray-400" />
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">To</span>
                          <span className="font-medium">{routeInfo.stations[routeInfo.stations.length - 1]?.name}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <Card>
                  <CardContent className="p-6 text-center">
                    <Route className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <h3 className="font-medium text-gray-900 mb-2">Plan Your Journey</h3>
                    <p className="text-sm text-gray-600">
                      Select departure and destination stations to see route details and fare information.
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Nearby Stations */}
              {nearestStations.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <MapPin className="h-5 w-5 mr-2 text-orange-600" />
                      Nearby Stations
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {nearestStations.slice(0, 3).map((station, index) => (
                      <div
                        key={station.id}
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                        onClick={() => setFromStationId(station.id)}
                      >
                        <div>
                          <p className="font-medium text-sm">{station.name}</p>
                          <p className="text-xs text-gray-600">
                            {station.distance ? formatDistance(station.distance) : 'N/A'} away
                          </p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          #{index + 1}
                        </Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="live" className="space-y-6">
          <Card>
            <CardContent className="p-8 text-center">
              <Clock className="h-16 w-16 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Live Journey Tracking</h3>
              <p className="text-gray-600 mb-6">
                Start a journey to see real-time tracking and navigation assistance.
              </p>
              <Button size="lg">
                <Train className="h-5 w-5 mr-2" />
                Start Journey
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardContent className="p-8 text-center">
              <Train className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Journey History</h3>
              <p className="text-gray-600 mb-6">
                Your recent journeys will appear here once you start using the metro.
              </p>
              <Button variant="outline">
                <Route className="h-5 w-5 mr-2" />
                Plan New Journey
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {isPlanning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Planning your route...</p>
          </div>
        </div>
      )}
    </div>
  );
}
