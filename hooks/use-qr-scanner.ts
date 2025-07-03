
'use client';

import { useState, useRef, useCallback } from 'react';
import { QRCodeData } from '@/lib/types';
import { QRService } from '@/lib/services/qr-service';

interface UseQRScannerReturn {
  isScanning: boolean;
  hasPermission: boolean;
  error: string | null;
  videoRef: React.RefObject<HTMLVideoElement>;
  startScanning: () => Promise<void>;
  stopScanning: () => void;
  scanQRCode: () => Promise<QRCodeData | null>;
  requestPermission: () => Promise<boolean>;
  processManualQR: (qrString: string) => Promise<QRCodeData | null>;
}

export function useQRScanner(): UseQRScannerReturn {
  const [isScanning, setIsScanning] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const requestPermission = async (): Promise<boolean> => {
    try {
      setError(null);
      const permission = await QRService.requestCameraPermission();
      setHasPermission(permission);
      return permission;
    } catch (err: any) {
      setError(err.message || 'Failed to request camera permission');
      return false;
    }
  };

  const startScanning = async (): Promise<void> => {
    try {
      setError(null);
      
      // Request permission if not already granted
      if (!hasPermission) {
        const permission = await requestPermission();
        if (!permission) {
          throw new Error('Camera permission not granted');
        }
      }

      // Start camera
      const stream = await QRService.startCamera();
      streamRef.current = stream;

      // Set video source
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setIsScanning(true);
    } catch (err: any) {
      setError(err.message || 'Failed to start camera');
      throw new Error(err.message);
    }
  };

  const stopScanning = useCallback((): void => {
    QRService.stopCamera();
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsScanning(false);
  }, []);

  const scanQRCode = async (): Promise<QRCodeData | null> => {
    if (!videoRef.current || !isScanning) {
      throw new Error('Scanner not active');
    }

    try {
      setError(null);
      const qrData = await QRService.scanQRCode(videoRef.current);
      return qrData;
    } catch (err: any) {
      setError(err.message || 'Failed to scan QR code');
      throw new Error(err.message);
    }
  };

  const processManualQR = async (qrString: string): Promise<QRCodeData | null> => {
    try {
      setError(null);
      const qrData = await QRService.processManualQR(qrString);
      return qrData;
    } catch (err: any) {
      setError(err.message || 'Invalid QR code');
      throw new Error(err.message);
    }
  };

  return {
    isScanning,
    hasPermission,
    error,
    videoRef,
    startScanning,
    stopScanning,
    scanQRCode,
    requestPermission,
    processManualQR,
  };
}
