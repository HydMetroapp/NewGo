
'use client';

import { useState } from 'react';
import { QrCode, MapPin, Clock, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MainLayout } from '@/components/layout/main-layout';
import { QRScanner } from '@/components/metro/qr-scanner';
import { useAuth } from '@/hooks/use-auth';
import { useJourney } from '@/hooks/use-journey';
import { useMetroCard } from '@/hooks/use-metro-card';
import { useToast } from '@/hooks/use-toast';
import { QRCodeData, EntryMethod } from '@/lib/types';

export default function ScannerPage() {
  const [isScanning, setIsScanning] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const { user } = useAuth();
  const { activeJourney, startJourney, endJourney } = useJourney();
  const { metroCards } = useMetroCard();
  const { toast } = useToast();

  const primaryCard = metroCards.find(card => card.isActive) || metroCards[0];

  const handleScanSuccess = async (qrData: QRCodeData) => {
    setIsScanning(false);
    setIsProcessing(true);

    try {
      if (!primaryCard) {
        throw new Error('No active metro card found. Please add a metro card first.');
      }

      if (qrData.type === 'entry') {
        if (activeJourney) {
          throw new Error('You already have an active journey. Please complete it first.');
        }

        await startJourney(
          primaryCard.id,
          qrData.stationId,
          EntryMethod.QR_SCAN
        );

        toast({
          title: 'Journey Started',
          description: 'Your metro journey has begun successfully.',
        });
      } else if (qrData.type === 'exit') {
        if (!activeJourney) {
          throw new Error('No active journey found. Please start a journey first.');
        }

        await endJourney(
          qrData.stationId,
          EntryMethod.QR_SCAN
        );

        toast({
          title: 'Journey Completed',
          description: 'Your metro journey has been completed successfully.',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to process QR code',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleScanError = (error: string) => {
    setIsScanning(false);
    toast({
      title: 'Scan Failed',
      description: error,
      variant: 'destructive',
    });
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">QR Code Scanner</h1>
          <p className="text-muted-foreground">
            Scan QR codes at metro stations for entry and exit
          </p>
        </div>

        {/* Current Status */}
        {activeJourney ? (
          <Alert>
            <Clock className="h-4 w-4" />
            <AlertDescription>
              <strong>Active Journey:</strong> From {activeJourney.fromStation.name}
              <br />
              <span className="text-sm text-muted-foreground">
                Started at {new Date(activeJourney.entryTime).toLocaleTimeString()}
              </span>
            </AlertDescription>
          </Alert>
        ) : (
          <Alert>
            <MapPin className="h-4 w-4" />
            <AlertDescription>
              Ready to start your journey. Scan the entry QR code at any metro station.
            </AlertDescription>
          </Alert>
        )}

        {/* Metro Card Info */}
        {primaryCard && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Active Metro Card
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Card: {primaryCard.cardNumber.slice(-4)}</p>
                  <p className="text-sm text-muted-foreground">
                    Balance: ₹{primaryCard.balance.toFixed(2)}
                  </p>
                </div>
                {primaryCard.balance < 50 && (
                  <Alert className="w-auto">
                    <AlertDescription className="text-xs">
                      Low balance
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Scanner Button */}
        <div className="text-center space-y-4">
          <Button
            size="lg"
            onClick={() => setIsScanning(true)}
            disabled={isProcessing || !primaryCard}
            className="w-full max-w-sm h-16 text-lg"
          >
            {isProcessing ? (
              'Processing...'
            ) : (
              <>
                <QrCode className="h-6 w-6 mr-2" />
                {activeJourney ? 'Scan Exit QR Code' : 'Scan Entry QR Code'}
              </>
            )}
          </Button>

          {!primaryCard && (
            <Alert variant="destructive">
              <AlertDescription>
                No metro card found. Please add a metro card to start your journey.
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">How to Use</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-sm font-medium">
                1
              </div>
              <div>
                <p className="font-medium">Entry</p>
                <p className="text-sm text-muted-foreground">
                  Scan the QR code at the entry gate to start your journey
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-sm font-medium">
                2
              </div>
              <div>
                <p className="font-medium">Travel</p>
                <p className="text-sm text-muted-foreground">
                  Enjoy your metro ride to your destination
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-sm font-medium">
                3
              </div>
              <div>
                <p className="font-medium">Exit</p>
                <p className="text-sm text-muted-foreground">
                  Scan the QR code at the exit gate to complete your journey
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* QR Scanner Modal */}
      <QRScanner
        isOpen={isScanning}
        onScanSuccess={handleScanSuccess}
        onClose={() => setIsScanning(false)}
      />
    </MainLayout>
  );
}
