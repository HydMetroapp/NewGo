
import { METRO_STATIONS_DATA, METRO_LINES, HYDERABAD_CENTER } from '../constants';
import { Station, Location } from '../types';
import {
  initializeGoogleMaps,
  createMap,
  createMarker,
  createInfoWindow,
  calculateDistance,
  getDirections,
  renderDirections,
  getCurrentPosition
} from '../google-maps';

export interface StationWithDistance extends Station {
  distance?: number;
}

export interface RouteInfo {
  stations: Station[];
  totalDistance: number;
  estimatedTime: number;
  interchanges: string[];
}

export class MapsService {
  private static map: google.maps.Map | null = null;
  private static markers: Map<string, google.maps.Marker> = new Map();
  private static infoWindows: Map<string, google.maps.InfoWindow> = new Map();
  private static directionsRenderer: google.maps.DirectionsRenderer | null = null;
  private static userLocationMarker: google.maps.Marker | null = null;

  static async initializeMap(container: HTMLElement): Promise<google.maps.Map> {
    try {
      this.map = await createMap(container, {
        center: { lat: HYDERABAD_CENTER.latitude, lng: HYDERABAD_CENTER.longitude },
        zoom: 11,
      });

      // Add all metro stations to the map
      await this.addStationMarkers();
      
      return this.map;
    } catch (error) {
      console.error('Failed to initialize map:', error);
      throw error;
    }
  }

  static async addStationMarkers(): Promise<void> {
    if (!this.map) return;

    for (const station of METRO_STATIONS_DATA) {
      await this.addStationMarker(station);
    }
  }

  static async addStationMarker(station: Station): Promise<void> {
    if (!this.map) return;

    try {
      const lineColor = METRO_LINES[station.line as keyof typeof METRO_LINES]?.color || '#2563EB';
      
      const marker = await createMarker(this.map, {
        lat: station.latitude,
        lng: station.longitude,
      }, {
        title: station.name,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: lineColor,
          fillOpacity: 1,
          strokeColor: '#FFFFFF',
          strokeWeight: 2,
        },
      });

      const infoWindowContent = this.createStationInfoContent(station);
      const infoWindow = await createInfoWindow(infoWindowContent);

      marker.addListener('click', () => {
        // Close all other info windows
        this.infoWindows.forEach(iw => iw.close());
        infoWindow.open(this.map!, marker);
      });

      this.markers.set(station.id, marker);
      this.infoWindows.set(station.id, infoWindow);
    } catch (error) {
      console.error(`Failed to add marker for station ${station.name}:`, error);
    }
  }

  static createStationInfoContent(station: Station): string {
    const lineInfo = METRO_LINES[station.line as keyof typeof METRO_LINES];
    const facilitiesHtml = station.facilities?.map(facility => 
      `<span class="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mr-1 mb-1">${facility}</span>`
    ).join('') || '';

    return `
      <div class="p-3 max-w-xs">
        <h3 class="font-bold text-lg text-gray-900 mb-2">${station.name}</h3>
        <div class="flex items-center mb-2">
          <div class="w-3 h-3 rounded-full mr-2" style="background-color: ${lineInfo?.color}"></div>
          <span class="text-sm text-gray-600">${lineInfo?.name}</span>
        </div>
        ${station.facilities && station.facilities.length > 0 ? `
          <div class="mb-3">
            <p class="text-sm font-medium text-gray-700 mb-1">Facilities:</p>
            <div class="flex flex-wrap">${facilitiesHtml}</div>
          </div>
        ` : ''}
        <div class="flex space-x-2">
          <button 
            onclick="window.mapsService?.showDirections('${station.id}')"
            class="bg-blue-500 text-white text-xs px-3 py-1 rounded hover:bg-blue-600"
          >
            Directions
          </button>
          <button 
            onclick="window.mapsService?.selectStation('${station.id}')"
            class="bg-green-500 text-white text-xs px-3 py-1 rounded hover:bg-green-600"
          >
            Select
          </button>
        </div>
      </div>
    `;
  }

  static async updateUserLocation(location: Location): Promise<void> {
    if (!this.map) return;

    try {
      const position = { lat: location.latitude, lng: location.longitude };

      if (this.userLocationMarker) {
        this.userLocationMarker.setPosition(position);
      } else {
        this.userLocationMarker = await createMarker(this.map, position, {
          title: 'Your Location',
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: '#4285F4',
            fillOpacity: 1,
            strokeColor: '#FFFFFF',
            strokeWeight: 3,
          },
          zIndex: 1000,
        });
      }

      // Optionally center the map on user location
      this.map.panTo(position);
    } catch (error) {
      console.error('Failed to update user location:', error);
    }
  }

  static async findNearestStations(location: Location, limit: number = 5): Promise<StationWithDistance[]> {
    const stationsWithDistance: StationWithDistance[] = [];

    for (const station of METRO_STATIONS_DATA) {
      try {
        const distance = await calculateDistance(
          { lat: location.latitude, lng: location.longitude },
          { lat: station.latitude, lng: station.longitude }
        );

        stationsWithDistance.push({
          ...station,
          distance,
        });
      } catch (error) {
        console.error(`Failed to calculate distance to ${station.name}:`, error);
      }
    }

    return stationsWithDistance
      .sort((a, b) => (a.distance || 0) - (b.distance || 0))
      .slice(0, limit);
  }

  static async showDirectionsToStation(stationId: string, userLocation?: Location): Promise<void> {
    if (!this.map) return;

    const station = METRO_STATIONS_DATA.find(s => s.id === stationId);
    if (!station) return;

    try {
      let origin: google.maps.LatLngLiteral;

      if (userLocation) {
        origin = { lat: userLocation.latitude, lng: userLocation.longitude };
      } else {
        const position = await getCurrentPosition();
        origin = { lat: position.coords.latitude, lng: position.coords.longitude };
        await this.updateUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
        });
      }

      const destination = { lat: station.latitude, lng: station.longitude };
      const directionsResult = await getDirections(origin, destination, google.maps.TravelMode.WALKING);

      // Clear previous directions
      if (this.directionsRenderer) {
        this.directionsRenderer.setMap(null);
      }

      this.directionsRenderer = await renderDirections(this.map, directionsResult);
    } catch (error) {
      console.error('Failed to show directions:', error);
      throw error;
    }
  }

  static clearDirections(): void {
    if (this.directionsRenderer) {
      this.directionsRenderer.setMap(null);
      this.directionsRenderer = null;
    }
  }

  static async centerOnStation(stationId: string): Promise<void> {
    if (!this.map) return;

    const station = METRO_STATIONS_DATA.find(s => s.id === stationId);
    if (!station) return;

    this.map.panTo({ lat: station.latitude, lng: station.longitude });
    this.map.setZoom(15);

    // Open the station's info window
    const infoWindow = this.infoWindows.get(stationId);
    const marker = this.markers.get(stationId);
    if (infoWindow && marker) {
      this.infoWindows.forEach(iw => iw.close());
      infoWindow.open(this.map, marker);
    }
  }

  static async planRoute(fromStationId: string, toStationId: string): Promise<RouteInfo | null> {
    const fromStation = METRO_STATIONS_DATA.find(s => s.id === fromStationId);
    const toStation = METRO_STATIONS_DATA.find(s => s.id === toStationId);

    if (!fromStation || !toStation) return null;

    // Simple route planning - this is a basic implementation
    // In a real app, you'd have more sophisticated route planning logic
    const route: RouteInfo = {
      stations: [fromStation, toStation],
      totalDistance: await calculateDistance(
        { lat: fromStation.latitude, lng: fromStation.longitude },
        { lat: toStation.latitude, lng: toStation.longitude }
      ),
      estimatedTime: 0, // Calculate based on metro schedule
      interchanges: [],
    };

    // Check if stations are on different lines (requiring interchange)
    if (fromStation.line !== toStation.line) {
      // Find interchange stations (simplified logic)
      const interchangeStations = METRO_STATIONS_DATA.filter(station => 
        station.name === 'Ameerpet' || station.name === 'MG Bus Station'
      );
      
      if (interchangeStations.length > 0) {
        route.interchanges = interchangeStations.map(s => s.name);
        route.stations = [fromStation, ...interchangeStations, toStation];
      }
    }

    return route;
  }

  static getMap(): google.maps.Map | null {
    return this.map;
  }

  static getStationMarker(stationId: string): google.maps.Marker | undefined {
    return this.markers.get(stationId);
  }

  static async fitBoundsToStations(stationIds: string[]): Promise<void> {
    if (!this.map || stationIds.length === 0) return;

    const bounds = new google.maps.LatLngBounds();
    
    stationIds.forEach(stationId => {
      const station = METRO_STATIONS_DATA.find(s => s.id === stationId);
      if (station) {
        bounds.extend({ lat: station.latitude, lng: station.longitude });
      }
    });

    this.map.fitBounds(bounds);
  }
}

// Make MapsService available globally for info window callbacks
declare global {
  interface Window {
    mapsService: typeof MapsService;
  }
}

if (typeof window !== 'undefined') {
  window.mapsService = MapsService;
}
