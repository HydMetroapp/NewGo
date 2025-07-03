
import { Location, Station, QRCodeData } from '../types';
import { isWithinGeofence, findNearestStation } from '../utils';
import { GEOFENCE_CONFIG } from '../constants';
import { QRService } from './qr-service';
import { NotificationService } from './notification-service';

export interface GeofenceEvent {
  type: 'enter' | 'exit';
  station: Station;
  timestamp: number;
  qrCode?: string;
}

export class GeofencingService {
  private static watchId: number | null = null;
  private static currentGeofences: Map<string, Station> = new Map();
  private static lastKnownLocation: Location | null = null;
  private static eventCallbacks: ((event: GeofenceEvent) => void)[] = [];

  static async startGeofenceMonitoring(stations: Station[]): Promise<boolean> {
    try {
      if (!navigator.geolocation) {
        throw new Error('Geolocation not supported');
      }

      // Request high accuracy location
      const options: PositionOptions = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5000
      };

      this.watchId = navigator.geolocation.watchPosition(
        (position) => this.handleLocationUpdate(position, stations),
        (error) => this.handleLocationError(error),
        options
      );

      return true;
    } catch (error) {
      console.error('Failed to start geofence monitoring:', error);
      return false;
    }
  }

  static stopGeofenceMonitoring(): void {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
    this.currentGeofences.clear();
    this.lastKnownLocation = null;
  }

  static addEventCallback(callback: (event: GeofenceEvent) => void): void {
    this.eventCallbacks.push(callback);
  }

  static removeEventCallback(callback: (event: GeofenceEvent) => void): void {
    const index = this.eventCallbacks.indexOf(callback);
    if (index > -1) {
      this.eventCallbacks.splice(index, 1);
    }
  }

  private static handleLocationUpdate(position: GeolocationPosition, stations: Station[]): void {
    const currentLocation: Location = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy,
      timestamp: Date.now()
    };

    this.lastKnownLocation = currentLocation;

    // Check for geofence entries and exits
    this.checkGeofenceEvents(currentLocation, stations);
  }

  private static handleLocationError(error: GeolocationPositionError): void {
    console.error('Geolocation error:', error);
    
    // Notify callbacks about location error
    this.eventCallbacks.forEach(callback => {
      // Could add error event type if needed
    });
  }

  private static checkGeofenceEvents(location: Location, stations: Station[]): void {
    const newGeofences = new Map<string, Station>();

    // Check which stations user is currently within
    stations.forEach(station => {
      const isInside = isWithinGeofence(
        location,
        { latitude: station.latitude, longitude: station.longitude },
        GEOFENCE_CONFIG.stationRadius
      );

      if (isInside) {
        newGeofences.set(station.id, station);

        // Check if this is a new entry
        if (!this.currentGeofences.has(station.id)) {
          this.handleGeofenceEntry(station);
        }
      }
    });

    // Check for exits
    this.currentGeofences.forEach((station, stationId) => {
      if (!newGeofences.has(stationId)) {
        this.handleGeofenceExit(station);
      }
    });

    this.currentGeofences = newGeofences;
  }

  private static async handleGeofenceEntry(station: Station): Promise<void> {
    try {
      console.log(`Entered geofence for station: ${station.name}`);

      // Generate entry QR code
      const qrCode = await this.generateEntryQRCode(station);

      const event: GeofenceEvent = {
        type: 'enter',
        station,
        timestamp: Date.now(),
        qrCode
      };

      // Notify all callbacks
      this.eventCallbacks.forEach(callback => callback(event));

      // Send push notification
      await NotificationService.notifyGeofenceEntry(station.name);

    } catch (error) {
      console.error('Error handling geofence entry:', error);
    }
  }

  private static async handleGeofenceExit(station: Station): Promise<void> {
    try {
      console.log(`Exited geofence for station: ${station.name}`);

      const event: GeofenceEvent = {
        type: 'exit',
        station,
        timestamp: Date.now()
      };

      // Notify all callbacks
      this.eventCallbacks.forEach(callback => callback(event));

      // Send push notification
      await NotificationService.notifyGeofenceExit(station.name);

    } catch (error) {
      console.error('Error handling geofence exit:', error);
    }
  }

  private static async generateEntryQRCode(station: Station): Promise<string> {
    try {
      // Generate secure token for this entry
      const token = await this.generateSecureToken(station.id);
      
      const qrData: QRCodeData = {
        stationId: station.id,
        stationCode: station.code || station.name.substring(0, 3).toUpperCase(),
        timestamp: Date.now(),
        type: 'entry',
        token,
        userId: await this.getCurrentUserId() // You'll need to implement this
      };

      return JSON.stringify(qrData);
    } catch (error) {
      console.error('Error generating entry QR code:', error);
      throw error;
    }
  }

  private static async generateSecureToken(stationId: string): Promise<string> {
    // Generate a secure token for validation
    const timestamp = Date.now();
    const randomBytes = new Uint8Array(16);
    crypto.getRandomValues(randomBytes);
    const randomString = Array.from(randomBytes, byte => byte.toString(16).padStart(2, '0')).join('');
    
    return `${stationId}_${timestamp}_${randomString}`;
  }

  private static async getCurrentUserId(): Promise<string> {
    // This should get the current user ID from your auth system
    // For now, return a placeholder
    return 'current_user_id';
  }

  static getCurrentLocation(): Location | null {
    return this.lastKnownLocation;
  }

  static getCurrentGeofences(): Station[] {
    return Array.from(this.currentGeofences.values());
  }

  static isInStationGeofence(stationId: string): boolean {
    return this.currentGeofences.has(stationId);
  }

  static async validateLocationForEntry(stationId: string, userLocation: Location): Promise<boolean> {
    try {
      // This would typically validate against your station database
      // For now, we'll use a simple distance check
      const response = await fetch(`/api/stations/${stationId}`);
      if (!response.ok) return false;
      
      const { station } = await response.json();
      
      return isWithinGeofence(
        userLocation,
        { latitude: station.latitude, longitude: station.longitude },
        GEOFENCE_CONFIG.stationRadius
      );
    } catch (error) {
      console.error('Error validating location for entry:', error);
      return false;
    }
  }

  static async requestLocationPermission(): Promise<boolean> {
    try {
      if (!navigator.geolocation) {
        return false;
      }

      return new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition(
          () => resolve(true),
          () => resolve(false),
          { timeout: 5000 }
        );
      });
    } catch (error) {
      console.error('Error requesting location permission:', error);
      return false;
    }
  }
}
