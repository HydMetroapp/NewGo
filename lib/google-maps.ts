
import { Loader } from '@googlemaps/js-api-loader';
import { GOOGLE_MAPS_CONFIG } from './constants';

let loader: Loader | null = null;
let isLoaded = false;

export const initializeGoogleMaps = async (): Promise<typeof google.maps> => {
  if (isLoaded && window.google?.maps) {
    return window.google.maps;
  }

  if (!loader) {
    if (!GOOGLE_MAPS_CONFIG.apiKey) {
      throw new Error('Google Maps API key is not configured');
    }

    loader = new Loader({
      apiKey: GOOGLE_MAPS_CONFIG.apiKey!,
      version: 'weekly',
      libraries: GOOGLE_MAPS_CONFIG.libraries as any,
    });
  }

  try {
    await loader.load();
    isLoaded = true;
    return window.google.maps;
  } catch (error) {
    console.error('Failed to load Google Maps:', error);
    throw new Error('Failed to load Google Maps');
  }
};

export const createMap = async (
  container: HTMLElement,
  options?: Partial<google.maps.MapOptions>
): Promise<google.maps.Map> => {
  const maps = await initializeGoogleMaps();
  
  const mapOptions: google.maps.MapOptions = {
    ...GOOGLE_MAPS_CONFIG.mapOptions,
    center: GOOGLE_MAPS_CONFIG.defaultCenter,
    zoom: GOOGLE_MAPS_CONFIG.defaultZoom,
    ...options,
  };

  return new maps.Map(container, mapOptions);
};

export const createMarker = async (
  map: google.maps.Map,
  position: google.maps.LatLngLiteral,
  options?: Partial<google.maps.MarkerOptions>
): Promise<google.maps.Marker> => {
  const maps = await initializeGoogleMaps();
  
  return new maps.Marker({
    position,
    map,
    ...options,
  });
};

export const createInfoWindow = async (
  content: string | HTMLElement,
  options?: Partial<google.maps.InfoWindowOptions>
): Promise<google.maps.InfoWindow> => {
  const maps = await initializeGoogleMaps();
  
  return new maps.InfoWindow({
    content,
    ...options,
  });
};

export const calculateDistance = async (
  from: google.maps.LatLngLiteral,
  to: google.maps.LatLngLiteral
): Promise<number> => {
  const maps = await initializeGoogleMaps();
  
  const fromLatLng = new maps.LatLng(from.lat, from.lng);
  const toLatLng = new maps.LatLng(to.lat, to.lng);
  
  return maps.geometry.spherical.computeDistanceBetween(fromLatLng, toLatLng);
};

export const getDirections = async (
  origin: google.maps.LatLngLiteral,
  destination: google.maps.LatLngLiteral,
  travelMode: google.maps.TravelMode = google.maps.TravelMode.WALKING
): Promise<google.maps.DirectionsResult> => {
  const maps = await initializeGoogleMaps();
  
  const directionsService = new maps.DirectionsService();
  
  return new Promise((resolve, reject) => {
    directionsService.route(
      {
        origin,
        destination,
        travelMode,
      },
      (result, status) => {
        if (status === maps.DirectionsStatus.OK && result) {
          resolve(result);
        } else {
          reject(new Error(`Directions request failed: ${status}`));
        }
      }
    );
  });
};

export const renderDirections = async (
  map: google.maps.Map,
  directionsResult: google.maps.DirectionsResult
): Promise<google.maps.DirectionsRenderer> => {
  const maps = await initializeGoogleMaps();
  
  const directionsRenderer = new maps.DirectionsRenderer({
    suppressMarkers: false,
    polylineOptions: {
      strokeColor: '#2563EB',
      strokeWeight: 4,
    },
  });
  
  directionsRenderer.setMap(map);
  directionsRenderer.setDirections(directionsResult);
  
  return directionsRenderer;
};

export const getCurrentPosition = (): Promise<GeolocationPosition> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      resolve,
      reject,
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  });
};

export const watchPosition = (
  callback: (position: GeolocationPosition) => void,
  errorCallback?: (error: GeolocationPositionError) => void
): number => {
  if (!navigator.geolocation) {
    throw new Error('Geolocation is not supported');
  }

  return navigator.geolocation.watchPosition(
    callback,
    errorCallback,
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 30000,
    }
  );
};

export const clearWatch = (watchId: number): void => {
  navigator.geolocation.clearWatch(watchId);
};
