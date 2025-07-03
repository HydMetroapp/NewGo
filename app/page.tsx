
'use client';

import { useEffect, useState } from 'react';
import { Play, MapPin, CreditCard, Clock, QrCode, Navigation } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MainLayout } from '@/components/layout/main-layout';
import { MetroCardDisplay } from '@/components/metro/metro-card-display';
import { JourneyCard } from '@/components/metro/journey-card';
import { useAuth } from '@/hooks/use-auth';
import { useJourney } from '@/hooks/use-journey';
import { useMetroCard } from '@/hooks/use-metro-card';
import { useLocation } from '@/hooks/use-location';
import { useGeofencing } from '@/hooks/use-geofencing';
import { formatCurrency } from '@/lib/utils';
import { JourneyStatus } from '@/components/metro/journey-status';
import Link from 'next/link';

export default function HomePage() {
  const { user, isAuthenticated } = useAuth();
  const { activeJourney, journeyHistory } = useJourney();
  const { metroCards, rechargeCard } = useMetroCard();
  const { location, nearestStation } = useLocation();
  const { 
    isMonitoring, 
    currentGeofences, 
    startMonitoring, 
    onGeofenceEvent,
    hasLocationPermission 
  } = useGeofencing();
  const [stations, setStations] = useState([]);

  useEffect(() => {
    // Fetch stations for location service
    fetch('/api/stations')
      .then(res => res.json())
      .then(data => {
        const stationData = data.stations || [];
        setStations(stationData);
        
        // Start geofencing monitoring if user is authenticated
        if (isAuthenticated && hasLocationPermission && stationData.length > 0) {
          startMonitoring(stationData);
        }
      })
      .catch(console.error);
  }, [isAuthenticated, hasLocationPermission]);

  useEffect(() => {
    // Set up geofence event handler
    const handleGeofenceEvent = (event) => {
      console.log('Geofence event:', event);
      // Handle geofence entry/exit events here
    };

    onGeofenceEvent(handleGeofenceEvent);
  }, [onGeofenceEvent]);

  if (!isAuthenticated) {
    return (
      <MainLayout>
        <div className="min-h-[80vh] flex items-center justify-center">
          <div className="text-center space-y-6 max-w-md mx-auto">
            <div className="h-24 w-24 mx-auto rounded-full bg-blue-100 flex items-center justify-center">
              <div className="h-12 w-12 rounded-lg bg-blue-600 flex items-center justify-center">
                <span className="text-white font-bold text-lg">HM</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <h1 className="text-3xl font-bold">Welcome to Hyderabad Metro</h1>
              <p className="text-muted-foreground">
                Your digital companion for seamless metro travel across Hyderabad
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <QrCode className="h-4 w-4 text-blue-600" />
                <span>QR Scanning</span>
              </div>
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-blue-600" />
                <span>Digital Wallet</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-blue-600" />
                <span>Live Tracking</span>
              </div>
              <div className="flex items-center gap-2">
                <Navigation className="h-4 w-4 text-blue-600" />
                <span>Route Planning</span>
              </div>
            </div>

            <div className="space-y-3">
              <Link href="/auth/signup">
                <Button size="lg" className="w-full">
                  Get Started
                </Button>
              </Link>
              <Link href="/auth/signin">
                <Button variant="outline" size="lg" className="w-full">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  const primaryCard = metroCards.find(card => card.isActive) || metroCards[0];
  const recentJourneys = journeyHistory.slice(0, 3);

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Welcome back, {user?.name?.split(' ')[0]}!</h1>
          <p className="text-muted-foreground">
            {nearestStation 
              ? `You're near ${nearestStation.name} station`
              : 'Ready for your next journey?'
            }
          </p>
        </div>

        {/* Journey Status with QR Integration */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Play className="h-5 w-5 text-blue-600" />
            Journey Status
          </h2>
          <JourneyStatus 
            stationId={currentGeofences.length > 0 ? currentGeofences[0].id : undefined}
            stationName={currentGeofences.length > 0 ? currentGeofences[0].name : undefined}
            onJourneyUpdate={(journey) => {
              console.log('Journey updated:', journey);
            }}
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/scanner">
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-4 text-center space-y-2">
                <QrCode className="h-8 w-8 mx-auto text-blue-600" />
                <p className="font-medium">Scan QR</p>
                <p className="text-xs text-muted-foreground">Entry/Exit</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/card">
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-4 text-center space-y-2">
                <CreditCard className="h-8 w-8 mx-auto text-green-600" />
                <p className="font-medium">Metro Card</p>
                <p className="text-xs text-muted-foreground">
                  {primaryCard ? formatCurrency(primaryCard.balance) : 'No card'}
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/maps">
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-4 text-center space-y-2">
                <MapPin className="h-8 w-8 mx-auto text-purple-600" />
                <p className="font-medium">Maps</p>
                <p className="text-xs text-muted-foreground">Find stations</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/journey">
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-4 text-center space-y-2">
                <Navigation className="h-8 w-8 mx-auto text-orange-600" />
                <p className="font-medium">Journey</p>
                <p className="text-xs text-muted-foreground">Plan route</p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Metro Card */}
        {primaryCard && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold">Your Metro Card</h2>
            <MetroCardDisplay 
              card={primaryCard} 
              onRecharge={(cardId) => {
                // Navigate to recharge page
                window.location.href = `/recharge?cardId=${cardId}`;
              }}
            />
          </div>
        )}

        {/* Recent Journeys */}
        {recentJourneys.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Recent Journeys</h2>
              <Link href="/history">
                <Button variant="ghost" size="sm">View All</Button>
              </Link>
            </div>
            <div className="space-y-3">
              {recentJourneys.map((journey) => (
                <JourneyCard key={journey.id} journey={journey} />
              ))}
            </div>
          </div>
        )}

        {/* Location Info */}
        {nearestStation && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Nearest Station
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{nearestStation.name}</p>
                  <p className="text-sm text-muted-foreground">{nearestStation.address}</p>
                </div>
                <Badge variant="outline">
                  {nearestStation.line.replace('_', ' ')}
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}
