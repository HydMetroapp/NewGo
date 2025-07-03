
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { Station, Location, MetroLine } from './types';
import { FARE_CONFIG, METRO_LINES } from './constants';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Distance calculation using Haversine formula
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

// Check if user is within geofence radius of a station
export function isWithinGeofence(
  userLocation: Location,
  stationLocation: { latitude: number; longitude: number },
  radius: number = 100
): boolean {
  const distance = calculateDistance(
    userLocation.latitude,
    userLocation.longitude,
    stationLocation.latitude,
    stationLocation.longitude
  );
  return distance * 1000 <= radius; // Convert km to meters
}

// Find nearest station to user location
export function findNearestStation(
  userLocation: Location,
  stations: Station[]
): Station | null {
  if (!stations.length) return null;

  let nearestStation = stations[0];
  let minDistance = calculateDistance(
    userLocation.latitude,
    userLocation.longitude,
    nearestStation.latitude,
    nearestStation.longitude
  );

  for (let i = 1; i < stations.length; i++) {
    const distance = calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      stations[i].latitude,
      stations[i].longitude
    );
    if (distance < minDistance) {
      minDistance = distance;
      nearestStation = stations[i];
    }
  }

  return nearestStation;
}

// Calculate fare between two stations
export function calculateFare(
  fromStation: Station,
  toStation: Station,
  cardType: string = 'REGULAR'
): number {
  const distance = calculateDistance(
    fromStation.latitude,
    fromStation.longitude,
    toStation.latitude,
    toStation.longitude
  );

  let fare = FARE_CONFIG.baseFare + (distance * FARE_CONFIG.perKmRate);
  fare = Math.min(fare, FARE_CONFIG.maxFare);
  fare = Math.max(fare, FARE_CONFIG.baseFare);

  // Apply discounts
  switch (cardType) {
    case 'STUDENT':
      fare *= FARE_CONFIG.studentDiscount;
      break;
    case 'SENIOR_CITIZEN':
      fare *= FARE_CONFIG.seniorCitizenDiscount;
      break;
    case 'DISABLED':
      fare *= FARE_CONFIG.disabledDiscount;
      break;
  }

  return Math.round(fare);
}

// Format currency
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

// Format date and time
export function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function formatTime(date: Date): string {
  return new Intl.DateTimeFormat('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

// Calculate journey duration
export function calculateDuration(startTime: Date, endTime: Date): number {
  return Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60)); // in minutes
}

// Format duration
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}m`;
}

// Generate unique card number
export function generateCardNumber(): string {
  const prefix = '6011';
  const randomDigits = Math.random().toString().slice(2, 14);
  return prefix + randomDigits;
}

// Validate email
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validate phone number (Indian format)
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^[6-9]\d{9}$/;
  return phoneRegex.test(phone.replace(/\D/g, ''));
}

// Format phone number
export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
  }
  return phone;
}

// Get line color
export function getLineColor(line: any): string {
  if (typeof line === 'string') {
    switch (line) {
      case 'RED_LINE':
        return METRO_LINES.RED_LINE.color;
      case 'GREEN_LINE':
        return METRO_LINES.GREEN_LINE.color;
      case 'BLUE_LINE':
        return METRO_LINES.BLUE_LINE.color;
      default:
        return '#6B7280';
    }
  }
  return '#6B7280';
}

// Get line name
export function getLineName(line: any): string {
  if (typeof line === 'string') {
    switch (line) {
      case 'RED_LINE':
        return METRO_LINES.RED_LINE.name;
      case 'GREEN_LINE':
        return METRO_LINES.GREEN_LINE.name;
      case 'BLUE_LINE':
        return METRO_LINES.BLUE_LINE.name;
      default:
        return 'Unknown Line';
    }
  }
}

// Debounce function
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Throttle function
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// Local storage helpers
export function setLocalStorage(key: string, value: any): void {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }
}

export function getLocalStorage<T>(key: string, defaultValue: T): T {
  if (typeof window !== 'undefined') {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return defaultValue;
    }
  }
  return defaultValue;
}

export function removeLocalStorage(key: string): void {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  }
}

// Session storage helpers
export function setSessionStorage(key: string, value: any): void {
  if (typeof window !== 'undefined') {
    try {
      sessionStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error saving to sessionStorage:', error);
    }
  }
}

export function getSessionStorage<T>(key: string, defaultValue: T): T {
  if (typeof window !== 'undefined') {
    try {
      const item = sessionStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error('Error reading from sessionStorage:', error);
      return defaultValue;
    }
  }
  return defaultValue;
}

// Check if device is mobile
export function isMobile(): boolean {
  if (typeof window === 'undefined') return false;
  return window.innerWidth <= 768;
}

// Check if device supports PWA installation
export function isPWAInstallable(): boolean {
  if (typeof window === 'undefined') return false;
  return 'serviceWorker' in navigator && 'PushManager' in window;
}

// Generate QR code data
export function generateQRData(stationId: string, stationCode: string, type: 'entry' | 'exit'): string {
  const data = {
    stationId,
    stationCode,
    timestamp: Date.now(),
    type,
  };
  return JSON.stringify(data);
}

// Parse QR code data
export function parseQRData(qrString: string): any {
  try {
    return JSON.parse(qrString);
  } catch (error) {
    console.error('Invalid QR code data:', error);
    return null;
  }
}

// Check if QR code is valid
export function isValidQRCode(qrData: any): boolean {
  return (
    qrData &&
    typeof qrData === 'object' &&
    qrData.stationId &&
    qrData.stationCode &&
    qrData.timestamp &&
    qrData.type &&
    ['entry', 'exit'].includes(qrData.type) &&
    Date.now() - qrData.timestamp < 300000 // 5 minutes validity
  );
}

// Error handling
export function handleError(error: any): string {
  console.error('Error:', error);
  
  if (error?.message) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  return 'An unexpected error occurred';
}

// Network status
export function isOnline(): boolean {
  if (typeof navigator === 'undefined') return true;
  return navigator.onLine;
}

// Device capabilities
export function getDeviceCapabilities() {
  if (typeof navigator === 'undefined') {
    return {
      geolocation: false,
      camera: false,
      notifications: false,
      serviceWorker: false,
    };
  }

  return {
    geolocation: 'geolocation' in navigator,
    camera: 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices,
    notifications: 'Notification' in window,
    serviceWorker: 'serviceWorker' in navigator,
  };
}
