
'use client';

import { useState, useEffect } from 'react';
import { QrCode, RefreshCw, Clock, MapPin, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';

interface QRDisplayProps {
  stationId: string;
  stationName: string;
  userId: string;
  type: 'entry' | 'exit';
  journeyId?: string;
  onQRGenerated?: (qrCode: string) => void;
  onError?: (error: string) => void;
}

interface QRData {
  qrCode: string;
  validUntil: number;
  generatedAt: number;
  station: {
    id: string;
    name: string;
    code: string;
  };
}

export function QRDisplay({ 
  stationId, 
  stationName, 
  userId, 
  type, 
  journeyId,
  onQRGenerated,
  onError 
}: QRDisplayProps) {
  const [qrData, setQrData] = useState<QRData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isExpired, setIsExpired] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    generateQRCode();
  }, [stationId, userId, type, journeyId]);

  useEffect(() => {
    if (!qrData) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const remaining = Math.max(0, qrData.validUntil - now);
      setTimeRemaining(remaining);
      
      if (remaining === 0) {
        setIsExpired(true);
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [qrData]);

  const generateQRCode = async () => {
    setIsLoading(true);
    setIsExpired(false);

    try {
      const response = await fetch('/api/qr/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          stationId,
          userId,
          type,
          journeyId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate QR code');
      }

      const data = await response.json();
      setQrData(data);
      setTimeRemaining(data.validUntil - Date.now());
      
      onQRGenerated?.(data.qrCode);

      toast({
        title: "QR Code Generated",
        description: `${type === 'entry' ? 'Entry' : 'Exit'} QR code ready for scanning`,
      });

    } catch (error: any) {
      console.error('QR generation error:', error);
      const errorMessage = error.message || 'Failed to generate QR code';
      onError?.(errorMessage);
      
      toast({
        title: "QR Generation Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const refreshQRCode = () => {
    generateQRCode();
  };

  const formatTimeRemaining = (ms: number): string => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = (): number => {
    if (!qrData) return 0;
    const totalDuration = 5 * 60 * 1000; // 5 minutes
    return Math.max(0, (timeRemaining / totalDuration) * 100);
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <RefreshCw className="h-5 w-5 animate-spin" />
            Generating QR Code
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <div className="h-48 flex items-center justify-center">
            <div className="animate-pulse bg-gray-200 rounded-lg w-40 h-40"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!qrData) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-red-600">
            <XCircle className="h-5 w-5" />
            QR Generation Failed
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-muted-foreground mb-4">
            Unable to generate QR code. Please try again.
          </p>
          <Button onClick={refreshQRCode} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <QrCode className="h-5 w-5" />
          {type === 'entry' ? 'Entry' : 'Exit'} QR Code
        </CardTitle>
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          {qrData.station.name}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* QR Code Display */}
        <div className="relative">
          <div className="bg-white p-4 rounded-lg border-2 border-dashed border-gray-300">
            <div className="aspect-square bg-black text-white flex items-center justify-center text-xs font-mono break-all p-2">
              {qrData.qrCode}
            </div>
          </div>
          
          {isExpired && (
            <div className="absolute inset-0 bg-red-500/20 rounded-lg flex items-center justify-center">
              <Badge variant="destructive" className="text-lg px-4 py-2">
                EXPIRED
              </Badge>
            </div>
          )}
        </div>

        {/* Status and Timer */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              {isExpired ? 'Expired' : 'Valid for'}
            </span>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span className={`font-mono ${isExpired ? 'text-red-600' : timeRemaining < 60000 ? 'text-orange-600' : 'text-green-600'}`}>
                {isExpired ? '0:00' : formatTimeRemaining(timeRemaining)}
              </span>
            </div>
          </div>
          
          <Progress 
            value={getProgressPercentage()} 
            className={`h-2 ${isExpired ? 'bg-red-100' : timeRemaining < 60000 ? 'bg-orange-100' : 'bg-green-100'}`}
          />
        </div>

        {/* Instructions */}
        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            {type === 'entry' 
              ? 'Scan this QR code at the station entry gate'
              : 'Scan this QR code at the station exit gate'
            }
          </p>
          
          {isExpired ? (
            <Button onClick={refreshQRCode} className="w-full">
              <RefreshCw className="h-4 w-4 mr-2" />
              Generate New QR Code
            </Button>
          ) : (
            <Button onClick={refreshQRCode} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          )}
        </div>

        {/* Station Info */}
        <div className="text-xs text-muted-foreground text-center space-y-1">
          <div>Station Code: {qrData.station.code}</div>
          <div>Generated: {new Date(qrData.generatedAt).toLocaleTimeString()}</div>
        </div>
      </CardContent>
    </Card>
  );
}
