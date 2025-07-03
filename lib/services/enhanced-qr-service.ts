
import { QRCodeData } from '../types';
import { QR_CONFIG } from '../constants';
import { generateQRData, parseQRData, isValidQRCode } from '../utils';

export interface QRValidationResult {
  isValid: boolean;
  data?: QRCodeData;
  error?: string;
  action?: 'entry' | 'exit' | 'invalid';
}

export interface StationQRData extends QRCodeData {
  token: string;
  userId: string;
  validUntil: number;
}

export class EnhancedQRService {
  private static stream: MediaStream | null = null;
  private static isScanning: boolean = false;
  private static activeQRCodes: Map<string, StationQRData> = new Map();

  // Camera and scanning methods (inherited from original QRService)
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

  // Enhanced QR generation for metro station gates
  static async generateStationEntryQR(
    stationId: string, 
    stationCode: string, 
    userId: string
  ): Promise<string> {
    try {
      const timestamp = Date.now();
      const token = await this.generateSecureToken(stationId, userId, timestamp);
      
      const qrData: StationQRData = {
        stationId,
        stationCode,
        timestamp,
        type: 'entry',
        token,
        userId,
        validUntil: timestamp + QR_CONFIG.validityDuration
      };

      const qrString = JSON.stringify(qrData);
      
      // Store active QR code for validation
      this.activeQRCodes.set(token, qrData);
      
      // Clean up expired QR codes
      this.cleanupExpiredQRCodes();
      
      return qrString;
    } catch (error) {
      console.error('Error generating station entry QR:', error);
      throw error;
    }
  }

  static async generateStationExitQR(
    stationId: string, 
    stationCode: string, 
    userId: string,
    journeyId: string
  ): Promise<string> {
    try {
      const timestamp = Date.now();
      const token = await this.generateSecureToken(stationId, userId, timestamp);
      
      const qrData: StationQRData = {
        stationId,
        stationCode,
        timestamp,
        type: 'exit',
        token,
        userId,
        validUntil: timestamp + QR_CONFIG.validityDuration,
        journeyId
      };

      const qrString = JSON.stringify(qrData);
      
      // Store active QR code for validation
      this.activeQRCodes.set(token, qrData);
      
      // Clean up expired QR codes
      this.cleanupExpiredQRCodes();
      
      return qrString;
    } catch (error) {
      console.error('Error generating station exit QR:', error);
      throw error;
    }
  }

  // QR validation for metro station scanners
  static async validateStationQR(qrString: string, scannerId: string): Promise<QRValidationResult> {
    try {
      const qrData = this.parseStationQR(qrString);
      
      if (!qrData) {
        return {
          isValid: false,
          error: 'Invalid QR code format',
          action: 'invalid'
        };
      }

      // Check if QR code is expired
      if (Date.now() > qrData.validUntil) {
        return {
          isValid: false,
          error: 'QR code has expired',
          action: 'invalid'
        };
      }

      // Check if QR code exists in active codes
      if (!this.activeQRCodes.has(qrData.token)) {
        return {
          isValid: false,
          error: 'QR code not found or already used',
          action: 'invalid'
        };
      }

      // Validate against station scanner
      const isValidForStation = await this.validateQRForStation(qrData, scannerId);
      
      if (!isValidForStation) {
        return {
          isValid: false,
          error: 'QR code not valid for this station',
          action: 'invalid'
        };
      }

      // Mark QR code as used (remove from active codes)
      this.activeQRCodes.delete(qrData.token);

      return {
        isValid: true,
        data: qrData,
        action: qrData.type
      };

    } catch (error) {
      console.error('Error validating station QR:', error);
      return {
        isValid: false,
        error: 'QR validation failed',
        action: 'invalid'
      };
    }
  }

  // Parse station QR code
  private static parseStationQR(qrString: string): StationQRData | null {
    try {
      const data = JSON.parse(qrString);
      
      // Validate required fields for station QR
      if (!data.stationId || !data.stationCode || !data.timestamp || 
          !data.type || !data.token || !data.userId || !data.validUntil) {
        return null;
      }

      return data as StationQRData;
    } catch (error) {
      console.error('Error parsing station QR:', error);
      return null;
    }
  }

  // Validate QR code for specific station
  private static async validateQRForStation(qrData: StationQRData, scannerId: string): Promise<boolean> {
    try {
      // This would typically validate against your station/scanner database
      // For now, we'll do a simple check
      const response = await fetch(`/api/stations/validate-scanner`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          stationId: qrData.stationId,
          scannerId,
          qrType: qrData.type
        })
      });

      return response.ok;
    } catch (error) {
      console.error('Error validating QR for station:', error);
      return false;
    }
  }

  // Generate secure token
  private static async generateSecureToken(stationId: string, userId: string, timestamp: number): Promise<string> {
    const data = `${stationId}_${userId}_${timestamp}`;
    
    // Use Web Crypto API for secure hashing
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    return hashHex.substring(0, 32); // Use first 32 characters
  }

  // Clean up expired QR codes
  private static cleanupExpiredQRCodes(): void {
    const now = Date.now();
    
    this.activeQRCodes.forEach((qrData, token) => {
      if (now > qrData.validUntil) {
        this.activeQRCodes.delete(token);
      }
    });
  }

  // Get active QR codes count (for debugging)
  static getActiveQRCodesCount(): number {
    this.cleanupExpiredQRCodes();
    return this.activeQRCodes.size;
  }

  // Manual QR processing (for testing)
  static async processManualQR(qrString: string): Promise<QRCodeData | null> {
    try {
      const qrData = this.parseStationQR(qrString);
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

  // Legacy methods for backward compatibility
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
}
