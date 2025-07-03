
'use client';

import { useEffect, useState } from 'react';
import { Camera, X, Flashlight, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useQRScanner } from '@/hooks/use-qr-scanner';
import { QRCodeData } from '@/lib/types';

interface QRScannerProps {
  onScanSuccess: (data: QRCodeData) => void;
  onClose: () => void;
  isOpen: boolean;
}

export function QRScanner({ onScanSuccess, onClose, isOpen }: QRScannerProps) {
  const {
    isScanning,
    hasPermission,
    error,
    videoRef,
    startScanning,
    stopScanning,
    scanQRCode,
    requestPermission,
  } = useQRScanner();

  const [scanInterval, setScanInterval] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isOpen && !isScanning) {
      initializeScanner();
    }

    return () => {
      if (scanInterval) {
        clearInterval(scanInterval);
      }
      stopScanning();
    };
  }, [isOpen]);

  const initializeScanner = async () => {
    try {
      if (!hasPermission) {
        const granted = await requestPermission();
        if (!granted) {
          return;
        }
      }

      await startScanning();
      startScanLoop();
    } catch (error) {
      console.error('Failed to initialize scanner:', error);
    }
  };

  const startScanLoop = () => {
    const interval = setInterval(async () => {
      try {
        const qrData = await scanQRCode();
        if (qrData) {
          clearInterval(interval);
          setScanInterval(null);
          onScanSuccess(qrData);
        }
      } catch (error) {
        // Continue scanning on error
      }
    }, 500);

    setScanInterval(interval);
  };

  const handleRetry = () => {
    if (scanInterval) {
      clearInterval(scanInterval);
      setScanInterval(null);
    }
    stopScanning();
    setTimeout(() => {
      initializeScanner();
    }, 100);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-black/50 p-4">
        <div className="flex items-center justify-between text-white">
          <h2 className="text-lg font-semibold">Scan QR Code</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-white hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Scanner Area */}
      <div className="relative h-full w-full">
        {isScanning ? (
          <>
            <video
              ref={videoRef}
              className="h-full w-full object-cover"
              playsInline
              muted
            />
            
            {/* Scan Overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                {/* Scan Frame */}
                <div className="h-64 w-64 border-2 border-white rounded-lg relative">
                  <div className="absolute top-0 left-0 h-8 w-8 border-t-4 border-l-4 border-blue-500 rounded-tl-lg" />
                  <div className="absolute top-0 right-0 h-8 w-8 border-t-4 border-r-4 border-blue-500 rounded-tr-lg" />
                  <div className="absolute bottom-0 left-0 h-8 w-8 border-b-4 border-l-4 border-blue-500 rounded-bl-lg" />
                  <div className="absolute bottom-0 right-0 h-8 w-8 border-b-4 border-r-4 border-blue-500 rounded-br-lg" />
                  
                  {/* Scanning Line */}
                  <div className="absolute inset-x-0 top-1/2 h-0.5 bg-blue-500 animate-pulse" />
                </div>
                
                <p className="text-white text-center mt-4">
                  Position QR code within the frame
                </p>
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full p-4">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5" />
                  Camera Access
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {error && (
                  <Alert>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                
                {!hasPermission ? (
                  <div className="text-center space-y-4">
                    <p className="text-muted-foreground">
                      Camera access is required to scan QR codes
                    </p>
                    <Button onClick={requestPermission} className="w-full">
                      Grant Camera Permission
                    </Button>
                  </div>
                ) : (
                  <div className="text-center space-y-4">
                    <p className="text-muted-foreground">
                      Initializing camera...
                    </p>
                    <Button onClick={handleRetry} variant="outline" className="w-full">
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Retry
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Bottom Controls */}
      {isScanning && (
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-black/50">
          <div className="flex justify-center gap-4">
            <Button
              variant="outline"
              size="icon"
              className="bg-white/20 border-white/30 text-white hover:bg-white/30"
            >
              <Flashlight className="h-5 w-5" />
            </Button>
            
            <Button
              variant="outline"
              onClick={handleRetry}
              className="bg-white/20 border-white/30 text-white hover:bg-white/30"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
