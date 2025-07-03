
import { Location, GeofenceRegion, Station } from '../types';
import { GEOFENCE_CONFIG, METRO_STATIONS_DATA } from '../constants';
import { isWithinGeofence, findNearestStation } from '../utils';
import { calculateDistance } from '../google-maps';

export class LocationService {
  private static watchId: number | null = null;
  private static currentLocation: Location | null = null;
  private static geofenceRegions: GeofenceRegion[] = [];
  private static callbacks: ((location: Location) => void)[] = [];
  private static geofenceCallbacks: ((stationId: string, event: 'enter' | 'exit') => void)[] = [];

  static async requestCurrentLocation(): Promise<Location> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location: Location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp,
          };
          this.currentLocation = location;
          resolve(location);
        },
        (error) => {
          console.error('Location error:', error);
          reject(new Error('Failed to get current location'));
        },
        {
          enableHighAccuracy: true,
          timeout: GEOFENCE_CONFIG.timeoutDuration,
          maximumAge: 60000, // 1 minute
        }
      );
    });
  }

  static startWatchingLocation(): void {
    if (!navigator.geolocation || this.watchId !== null) return;

    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        const location: Location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
        };

        const previousLocation = this.currentLocation;
        this.currentLocation = location;

        // Notify location callbacks
        this.callbacks.forEach(callback => callback(location));

        // Check geofences
        this.checkGeofences(location, previousLocation);
      },
      (error) => {
        console.error('Location watch error:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: GEOFENCE_CONFIG.timeoutDuration,
        maximumAge: 30000, // 30 seconds
      }
    );
  }

  static stopWatchingLocation(): void {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }

  static addLocationCallback(callback: (location: Location) => void): void {
    this.callbacks.push(callback);
  }

  static removeLocationCallback(callback: (location: Location) => void): void {
    const index = this.callbacks.indexOf(callback);
    if (index > -1) {
      this.callbacks.splice(index, 1);
    }
  }

  static addGeofenceCallback(callback: (stationId: string, event: 'enter' | 'exit') => void): void {
    this.geofenceCallbacks.push(callback);
  }

  static removeGeofenceCallback(callback: (stationId: string, event: 'enter' | 'exit') => void): void {
    const index = this.geofenceCallbacks.indexOf(callback);
    if (index > -1) {
      this.geofenceCallbacks.splice(index, 1);
    }
  }

  static setGeofenceRegions(stations: Station[]): void {
    this.geofenceRegions = stations.map(station => ({
      id: station.id,
      latitude: station.latitude,
      longitude: station.longitude,
      radius: GEOFENCE_CONFIG.stationRadius,
      stationId: station.id,
    }));
  }

  private static checkGeofences(currentLocation: Location, previousLocation: Location | null): void {
    if (!previousLocation) return;

    this.geofenceRegions.forEach(region => {
      const wasInside = isWithinGeofence(previousLocation, region, region.radius);
      const isInside = isWithinGeofence(currentLocation, region, region.radius);

      if (!wasInside && isInside) {
        // Entered geofence
        this.geofenceCallbacks.forEach(callback => callback(region.stationId, 'enter'));
      } else if (wasInside && !isInside) {
        // Exited geofence
        this.geofenceCallbacks.forEach(callback => callback(region.stationId, 'exit'));
      }
    });
  }

  static async requestPermission(): Promise<boolean> {
    if (!navigator.geolocation) {
      return false;
    }

    try {
      const permission = await navigator.permissions.query({ name: 'geolocation' });
      return permission.state === 'granted';
    } catch (error) {
      // Fallback: try to get location to check permission
      try {
        await this.getCurrentLocation();
        return true;
      } catch {
        return false;
      }
    }
  }

  static findNearestStation(stations?: Station[]): Station | null {
    if (!this.currentLocation) return null;
    const stationsToSearch = stations || METRO_STATIONS_DATA;
    return findNearestStation(this.currentLocation, stationsToSearch);
  }

  static async findNearestStationWithDistance(): Promise<{ station: Station; distance: number } | null> {
    if (!this.currentLocation) return null;
    
    let nearestStation: Station | null = null;
    let minDistance = Infinity;
    
    for (const station of METRO_STATIONS_DATA) {
      try {
        const distance = await calculateDistance(
          { lat: this.currentLocation.latitude, lng: this.currentLocation.longitude },
          { lat: station.latitude, lng: station.longitude }
        );
        
        if (distance < minDistance) {
          minDistance = distance;
          nearestStation = station;
        }
      } catch (error) {
        console.error(`Failed to calculate distance to ${station.name}:`, error);
      }
    }
    
    return nearestStation ? { station: nearestStation, distance: minDistance } : null;
  }

  static getCurrentLocation(): Location | null {
    return this.currentLocation;
  }

  static isLocationAccurate(location: Location): boolean {
    return (location.accuracy || 0) <= GEOFENCE_CONFIG.accuracyThreshold;
  }
}
