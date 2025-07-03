
import { QRCodeData } from '../types';
import { QR_CONFIG } from '../constants';
import { generateQRData, parseQRData, isValidQRCode } from '../utils';

export class QRService {
  private static stream: MediaStream | null = null;
  private static isScanning: boolean = false;

  static async requestCameraPermission(): Promise<boolean> {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        return false;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      
      // Stop the stream immediately as we just wanted to check permission
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch (error) {
      console.error('Camera permission error:', error);
      return false;
    }
  }

  static async startCamera(): Promise<MediaStream> {
    try {
      if (this.stream) {
        return this.stream;
      }

      this.stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      return this.stream;
    } catch (error: any) {
      console.error('Start camera error:', error);
      throw new Error('Failed to access camera');
    }
  }

  static stopCamera(): void {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    this.isScanning = false;
  }

  static async scanQRCode(videoElement: HTMLVideoElement): Promise<QRCodeData | null> {
    return new Promise((resolve, reject) => {
      if (this.isScanning) {
        reject(new Error('Already scanning'));
        return;
      }

      this.isScanning = true;

      // Create canvas for image processing
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      
      if (!context) {
        this.isScanning = false;
        reject(new Error('Canvas not supported'));
        return;
      }

      const scanInterval = setInterval(() => {
        if (videoElement.readyState === videoElement.HAVE_ENOUGH_DATA) {
          canvas.width = videoElement.videoWidth;
          canvas.height = videoElement.videoHeight;
          context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

          try {
            // Get image data for QR code detection
            const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
            
            // Here you would typically use a QR code library like jsQR
            // For now, we'll simulate QR code detection
            const qrData = this.detectQRCode(imageData);
            
            if (qrData) {
              clearInterval(scanInterval);
              this.isScanning = false;
              resolve(qrData);
            }
          } catch (error) {
            console.error('QR scan error:', error);
          }
        }
      }, 100);

      // Timeout after configured duration
      setTimeout(() => {
        clearInterval(scanInterval);
        this.isScanning = false;
        reject(new Error('QR scan timeout'));
      }, QR_CONFIG.scanTimeout);
    });
  }

  private static detectQRCode(imageData: ImageData): QRCodeData | null {
    // This is a placeholder for actual QR code detection
    // In a real implementation, you would use a library like jsQR
    // For demo purposes, we'll return null
    return null;
  }

  static generateStationQR(stationId: string, stationCode: string, type: 'entry' | 'exit'): string {
    return generateQRData(stationId, stationCode, type);
  }

  static parseQRCode(qrString: string): QRCodeData | null {
    const data = parseQRData(qrString);
    return isValidQRCode(data) ? data : null;
  }

  static isValidQR(qrData: any): boolean {
    return isValidQRCode(qrData);
  }

  static getIsScanning(): boolean {
    return this.isScanning;
  }

  // Manual QR code input for testing
  static async processManualQR(qrString: string): Promise<QRCodeData | null> {
    try {
      const qrData = this.parseQRCode(qrString);
      if (!qrData) {
        throw new Error('Invalid QR code format');
      }

      // Check if QR code is still valid (not expired)
      const now = Date.now();
      const qrAge = now - qrData.timestamp;
      
      if (qrAge > QR_CONFIG.validityDuration) {
        throw new Error('QR code has expired');
      }

      return qrData;
    } catch (error: any) {
      console.error('Process manual QR error:', error);
      throw new Error(error.message || 'Invalid QR code');
    }
  }
}
