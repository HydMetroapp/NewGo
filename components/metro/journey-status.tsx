
'use client';

import { useState, useEffect } from 'react';
import { Play, Square, MapPin, Clock, CreditCard, Navigation } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { QRDisplay } from './qr-display';
import { useJourney } from '@/hooks/use-journey';
import { useAuth } from '@/hooks/use-auth';
import { formatTime, formatCurrency } from '@/lib/utils';

interface JourneyStatusProps {
  stationId?: string;
  stationName?: string;
  onJourneyUpdate?: (journey: any) => void;
}

export function JourneyStatus({ stationId, stationName, onJourneyUpdate }: JourneyStatusProps) {
  const { user } = useAuth();
  const { activeJourney, startJourney, endJourney } = useJourney();
  const [showQR, setShowQR] = useState(false);
  const [journeyDuration, setJourneyDuration] = useState(0);

  useEffect(() => {
    if (activeJourney) {
      const interval = setInterval(() => {
        const duration = Date.now() - new Date(activeJourney.entryTime).getTime();
        setJourneyDuration(duration);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [activeJourney]);

  const formatDuration = (ms: number): string => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleStartJourney = () => {
    if (stationId && user) {
      setShowQR(true);
    }
  };

  const handleEndJourney = () => {
    if (activeJourney && stationId && user) {
      setShowQR(true);
    }
  };

  const handleQRGenerated = (qrCode: string) => {
    // QR code generated successfully
    console.log('QR code generated:', qrCode);
  };

  const handleQRError = (error: string) => {
    console.error('QR generation error:', error);
    setShowQR(false);
  };

  // No active journey - show start journey option
  if (!activeJourney) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5 text-green-600" />
            Start Journey
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {stationId && stationName ? (
            <>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                Starting from {stationName}
              </div>
              
              {showQR ? (
                <QRDisplay
                  stationId={stationId}
                  stationName={stationName}
                  userId={user?.id || ''}
                  type="entry"
                  onQRGenerated={handleQRGenerated}
                  onError={handleQRError}
                />
              ) : (
                <Button onClick={handleStartJourney} className="w-full">
                  <Play className="h-4 w-4 mr-2" />
                  Generate Entry QR Code
                </Button>
              )}
            </>
          ) : (
            <div className="text-center text-muted-foreground">
              <p>Enter a station geofence area to start your journey</p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Active journey - show journey status and exit option
  return (
    <div className="space-y-4">
      {/* Active Journey Status */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Navigation className="h-5 w-5 text-blue-600" />
            Journey in Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Journey Info */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-green-600" />
                <span className="text-sm">From: {activeJourney.fromStation?.name}</span>
              </div>
              <Badge variant="outline" className="text-green-600">
                Entry: {formatTime(new Date(activeJourney.entryTime))}
              </Badge>
            </div>

            {stationId && stationName && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-red-600" />
                <span className="text-sm">To: {stationName}</span>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span className="text-sm">Duration: {formatDuration(journeyDuration)}</span>
              </div>
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                <span className="text-sm">Card: {activeJourney.metroCard?.cardNumber}</span>
              </div>
            </div>
          </div>

          {/* Journey Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Journey Progress</span>
              <span>{formatDuration(journeyDuration)}</span>
            </div>
            <Progress value={Math.min((journeyDuration / (60 * 60 * 1000)) * 100, 100)} />
          </div>
        </CardContent>
      </Card>

      {/* Exit Journey */}
      {stationId && stationName && (
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Square className="h-5 w-5 text-red-600" />
              End Journey
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              Ending at {stationName}
            </div>
            
            {showQR ? (
              <QRDisplay
                stationId={stationId}
                stationName={stationName}
                userId={user?.id || ''}
                type="exit"
                journeyId={activeJourney.id}
                onQRGenerated={handleQRGenerated}
                onError={handleQRError}
              />
            ) : (
              <Button onClick={handleEndJourney} variant="destructive" className="w-full">
                <Square className="h-4 w-4 mr-2" />
                Generate Exit QR Code
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
