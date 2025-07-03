
export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  profileImage?: string;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  fcmToken?: string;
}

export interface MetroCard {
  id: string;
  cardNumber: string;
  balance: number;
  isActive: boolean;
  cardType: CardType;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Station {
  id: string;
  name: string;
  code?: string;
  line: MetroLine | string;
  latitude: number;
  longitude: number;
  address?: string;
  facilities?: string[];
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Journey {
  id: string;
  userId: string;
  metroCardId: string;
  fromStationId: string;
  toStationId?: string;
  fromStation: Station;
  toStation?: Station;
  entryTime: Date;
  exitTime?: Date;
  fare?: number;
  distance?: number;
  duration?: number;
  status: JourneyStatus;
  entryMethod: EntryMethod;
  exitMethod?: EntryMethod;
  entryLatitude?: number;
  entryLongitude?: number;
  exitLatitude?: number;
  exitLongitude?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  status: PaymentStatus;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  metroCardId?: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  data?: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface FareRule {
  id: string;
  fromLine: MetroLine;
  toLine: MetroLine;
  minFare: number;
  maxFare: number;
  perKmRate: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Enums
export enum CardType {
  REGULAR = 'REGULAR',
  STUDENT = 'STUDENT',
  SENIOR_CITIZEN = 'SENIOR_CITIZEN',
  DISABLED = 'DISABLED',
}

export enum MetroLine {
  RED_LINE = 'RED_LINE',
  GREEN_LINE = 'GREEN_LINE',
  BLUE_LINE = 'BLUE_LINE',
}

export enum JourneyStatus {
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum EntryMethod {
  QR_SCAN = 'QR_SCAN',
  GEOFENCING = 'GEOFENCING',
  MANUAL = 'MANUAL',
}

export enum TransactionType {
  CARD_RECHARGE = 'CARD_RECHARGE',
  JOURNEY_PAYMENT = 'JOURNEY_PAYMENT',
  REFUND = 'REFUND',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

export enum NotificationType {
  INFO = 'INFO',
  WARNING = 'WARNING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
  JOURNEY_UPDATE = 'JOURNEY_UPDATE',
  PAYMENT_UPDATE = 'PAYMENT_UPDATE',
}

// Location and Geofencing
export interface Location {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp?: number;
}

export interface GeofenceRegion {
  id: string;
  latitude: number;
  longitude: number;
  radius: number; // in meters
  stationId: string;
}

// Payment
export interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  theme: {
    color: string;
  };
}

export interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

// QR Code
export interface QRCodeData {
  stationId: string;
  stationCode: string;
  timestamp: number;
  type: 'entry' | 'exit';
  token?: string;
  userId?: string;
  validUntil?: number;
  journeyId?: string;
}

// PWA
export interface PWAInstallPrompt {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

// Theme
export interface ThemeConfig {
  mode: 'light' | 'dark' | 'system';
  primaryColor: string;
  accentColor: string;
}

// App State
export interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  currentLocation: Location | null;
  activeJourney: Journey | null;
  metroCards: MetroCard[];
  notifications: Notification[];
  theme: ThemeConfig;
  isOnline: boolean;
  isLoading: boolean;
}
