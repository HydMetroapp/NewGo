
export const APP_CONFIG = {
  name: 'Hyderabad Metro',
  version: '1.0.0',
  description: 'Official Hyderabad Metro Rail ticketing and navigation app',
  author: 'Hyderabad Metro Rail Limited',
  website: 'https://hmrl.co.in',
  supportEmail: 'support@hmrl.co.in',
  privacyPolicy: '/privacy-policy',
  termsOfService: '/terms-of-service',
};

export const METRO_STATIONS_DATA = [
  // Red Line Stations
  { id: 'miyapur', name: 'Miyapur', line: 'RED_LINE', latitude: 17.4967, longitude: 78.3875, facilities: ['Parking', 'ATM', 'Restroom'] },
  { id: 'jntu-college', name: 'JNTU College', line: 'RED_LINE', latitude: 17.4925, longitude: 78.3911, facilities: ['ATM', 'Restroom'] },
  { id: 'kphb-colony', name: 'KPHB Colony', line: 'RED_LINE', latitude: 17.4889, longitude: 78.3947, facilities: ['Parking', 'ATM'] },
  { id: 'kukatpally', name: 'Kukatpally', line: 'RED_LINE', latitude: 17.4851, longitude: 78.4075, facilities: ['Parking', 'ATM', 'Restroom', 'Food Court'] },
  { id: 'balanagar', name: 'Balanagar', line: 'RED_LINE', latitude: 17.4833, longitude: 78.4194, facilities: ['ATM', 'Restroom'] },
  { id: 'moosapet', name: 'Moosapet', line: 'RED_LINE', latitude: 17.4794, longitude: 78.4281, facilities: ['Parking', 'ATM'] },
  { id: 'bharatnagar', name: 'Bharatnagar', line: 'RED_LINE', latitude: 17.4756, longitude: 78.4367, facilities: ['ATM', 'Restroom'] },
  { id: 'erragadda', name: 'Erragadda', line: 'RED_LINE', latitude: 17.4719, longitude: 78.4453, facilities: ['Parking', 'ATM', 'Restroom'] },
  { id: 'esi-hospital', name: 'ESI Hospital', line: 'RED_LINE', latitude: 17.4681, longitude: 78.4539, facilities: ['ATM', 'Restroom'] },
  { id: 'sr-nagar', name: 'S.R.Nagar', line: 'RED_LINE', latitude: 17.4644, longitude: 78.4625, facilities: ['Parking', 'ATM'] },
  { id: 'ameerpet', name: 'Ameerpet', line: 'RED_LINE', latitude: 17.4375, longitude: 78.4483, facilities: ['Parking', 'ATM', 'Restroom', 'Food Court', 'Shopping'] },
  { id: 'punjagutta', name: 'Punjagutta', line: 'RED_LINE', latitude: 17.4306, longitude: 78.4569, facilities: ['ATM', 'Restroom', 'Shopping'] },
  { id: 'irrum-manzil', name: 'Irrum Manzil', line: 'RED_LINE', latitude: 17.4236, longitude: 78.4656, facilities: ['ATM', 'Restroom'] },
  { id: 'khairatabad', name: 'Khairatabad', line: 'RED_LINE', latitude: 17.4167, longitude: 78.4742, facilities: ['Parking', 'ATM', 'Restroom'] },
  { id: 'lakdikapul', name: 'Lakdikapul', line: 'RED_LINE', latitude: 17.4097, longitude: 78.4828, facilities: ['ATM', 'Restroom'] },
  { id: 'assembly', name: 'Assembly', line: 'RED_LINE', latitude: 17.4028, longitude: 78.4914, facilities: ['ATM', 'Restroom'] },
  { id: 'nampally', name: 'Nampally', line: 'RED_LINE', latitude: 17.3958, longitude: 78.5000, facilities: ['Parking', 'ATM', 'Restroom', 'Food Court'] },
  { id: 'gandhi-bhavan', name: 'Gandhi Bhavan', line: 'RED_LINE', latitude: 17.3889, longitude: 78.5086, facilities: ['ATM', 'Restroom'] },
  { id: 'osmania-medical', name: 'Osmania Medical College', line: 'RED_LINE', latitude: 17.3819, longitude: 78.5172, facilities: ['ATM', 'Restroom'] },
  { id: 'mg-bus-station', name: 'MG Bus Station', line: 'RED_LINE', latitude: 17.3750, longitude: 78.5258, facilities: ['Parking', 'ATM', 'Restroom', 'Food Court'] },
  { id: 'malakpet', name: 'Malakpet', line: 'RED_LINE', latitude: 17.3681, longitude: 78.5344, facilities: ['ATM', 'Restroom'] },
  { id: 'new-market', name: 'New Market', line: 'RED_LINE', latitude: 17.3611, longitude: 78.5431, facilities: ['ATM', 'Restroom', 'Shopping'] },
  { id: 'musarambagh', name: 'Musarambagh', line: 'RED_LINE', latitude: 17.3542, longitude: 78.5517, facilities: ['ATM', 'Restroom'] },
  { id: 'dilsukhnagar', name: 'Dilsukhnagar', line: 'RED_LINE', latitude: 17.3472, longitude: 78.5603, facilities: ['Parking', 'ATM', 'Restroom', 'Shopping'] },
  { id: 'chaitanyapuri', name: 'Chaitanyapuri', line: 'RED_LINE', latitude: 17.3403, longitude: 78.5689, facilities: ['ATM', 'Restroom'] },
  { id: 'victoria-memorial', name: 'Victoria Memorial', line: 'RED_LINE', latitude: 17.3333, longitude: 78.5775, facilities: ['ATM', 'Restroom'] },
  { id: 'lb-nagar', name: 'L.B.Nagar', line: 'RED_LINE', latitude: 17.3264, longitude: 78.5861, facilities: ['Parking', 'ATM', 'Restroom', 'Food Court'] },

  // Green Line Stations
  { id: 'nagole', name: 'Nagole', line: 'GREEN_LINE', latitude: 17.3708, longitude: 78.5708, facilities: ['Parking', 'ATM', 'Restroom'] },
  { id: 'uppal', name: 'Uppal', line: 'GREEN_LINE', latitude: 17.4056, longitude: 78.5556, facilities: ['Parking', 'ATM', 'Restroom', 'Shopping'] },
  { id: 'stadium', name: 'Stadium', line: 'GREEN_LINE', latitude: 17.4139, longitude: 78.5472, facilities: ['ATM', 'Restroom'] },
  { id: 'ngri', name: 'NGRI', line: 'GREEN_LINE', latitude: 17.4222, longitude: 78.5389, facilities: ['ATM', 'Restroom'] },
  { id: 'habsiguda', name: 'Habsiguda', line: 'GREEN_LINE', latitude: 17.4306, longitude: 78.5306, facilities: ['Parking', 'ATM', 'Restroom'] },
  { id: 'tarnaka', name: 'Tarnaka', line: 'GREEN_LINE', latitude: 17.4389, longitude: 78.5222, facilities: ['ATM', 'Restroom'] },
  { id: 'mettuguda', name: 'Mettuguda', line: 'GREEN_LINE', latitude: 17.4472, longitude: 78.5139, facilities: ['ATM', 'Restroom'] },
  { id: 'secunderabad-east', name: 'Secunderabad East', line: 'GREEN_LINE', latitude: 17.4556, longitude: 78.5056, facilities: ['Parking', 'ATM', 'Restroom'] },
  { id: 'parade-ground', name: 'Parade Ground', line: 'GREEN_LINE', latitude: 17.4639, longitude: 78.4972, facilities: ['ATM', 'Restroom'] },
  { id: 'secunderabad-west', name: 'Secunderabad West', line: 'GREEN_LINE', latitude: 17.4722, longitude: 78.4889, facilities: ['Parking', 'ATM', 'Restroom', 'Food Court'] },
  { id: 'gandhi-hospital', name: 'Gandhi Hospital', line: 'GREEN_LINE', latitude: 17.4806, longitude: 78.4806, facilities: ['ATM', 'Restroom'] },
  { id: 'musheerabad', name: 'Musheerabad', line: 'GREEN_LINE', latitude: 17.4889, longitude: 78.4722, facilities: ['ATM', 'Restroom'] },
  { id: 'rtc-x-roads', name: 'RTC X Roads', line: 'GREEN_LINE', latitude: 17.4972, longitude: 78.4639, facilities: ['Parking', 'ATM', 'Restroom'] },
  { id: 'chikkadpally', name: 'Chikkadpally', line: 'GREEN_LINE', latitude: 17.5056, longitude: 78.4556, facilities: ['ATM', 'Restroom'] },
  { id: 'narayanguda', name: 'Narayanguda', line: 'GREEN_LINE', latitude: 17.5139, longitude: 78.4472, facilities: ['ATM', 'Restroom'] },
  { id: 'sultan-bazar', name: 'Sultan Bazar', line: 'GREEN_LINE', latitude: 17.5222, longitude: 78.4389, facilities: ['ATM', 'Restroom', 'Shopping'] },

  // Blue Line Stations
  { id: 'raidurg', name: 'Raidurg', line: 'BLUE_LINE', latitude: 17.4347, longitude: 78.3481, facilities: ['Parking', 'ATM', 'Restroom'] },
  { id: 'hitec-city', name: 'Hitec City', line: 'BLUE_LINE', latitude: 17.4486, longitude: 78.3811, facilities: ['Parking', 'ATM', 'Restroom', 'Food Court', 'Shopping'] },
  { id: 'durgam-cheruvu', name: 'Durgam Cheruvu', line: 'BLUE_LINE', latitude: 17.4375, longitude: 78.3875, facilities: ['ATM', 'Restroom'] },
  { id: 'madhapur', name: 'Madhapur', line: 'BLUE_LINE', latitude: 17.4486, longitude: 78.3917, facilities: ['Parking', 'ATM', 'Restroom', 'Shopping'] },
  { id: 'peddamma-gudi', name: 'Peddamma Gudi', line: 'BLUE_LINE', latitude: 17.4431, longitude: 78.4000, facilities: ['ATM', 'Restroom'] },
  { id: 'jubilee-hills-checkpost', name: 'Jubilee Hills Checkpost', line: 'BLUE_LINE', latitude: 17.4375, longitude: 78.4083, facilities: ['ATM', 'Restroom'] },
  { id: 'jubilee-hills', name: 'Jubilee Hills', line: 'BLUE_LINE', latitude: 17.4319, longitude: 78.4167, facilities: ['Parking', 'ATM', 'Restroom', 'Shopping'] },
  { id: 'yusufguda', name: 'Yusufguda', line: 'BLUE_LINE', latitude: 17.4264, longitude: 78.4250, facilities: ['ATM', 'Restroom'] },
  { id: 'madhura-nagar', name: 'Madhura Nagar', line: 'BLUE_LINE', latitude: 17.4208, longitude: 78.4333, facilities: ['ATM', 'Restroom'] }
];

export const METRO_LINES = {
  RED_LINE: {
    name: 'Red Line',
    color: '#DC2626',
    stations: METRO_STATIONS_DATA.filter(station => station.line === 'RED_LINE').map(station => station.name)
  },
  GREEN_LINE: {
    name: 'Green Line',
    color: '#16A34A',
    stations: METRO_STATIONS_DATA.filter(station => station.line === 'GREEN_LINE').map(station => station.name)
  },
  BLUE_LINE: {
    name: 'Blue Line',
    color: '#2563EB',
    stations: METRO_STATIONS_DATA.filter(station => station.line === 'BLUE_LINE').map(station => station.name)
  }
};

export const HYDERABAD_CENTER = {
  latitude: 17.3850,
  longitude: 78.4867
};

export const GOOGLE_MAPS_CONFIG = {
  apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
  defaultCenter: { lat: HYDERABAD_CENTER.latitude, lng: HYDERABAD_CENTER.longitude },
  defaultZoom: 11,
  libraries: ['places', 'geometry', 'directions'],
  mapOptions: {
    disableDefaultUI: false,
    zoomControl: true,
    mapTypeControl: false,
    scaleControl: true,
    streetViewControl: false,
    rotateControl: false,
    fullscreenControl: true,
    gestureHandling: 'greedy' as any,
    styles: [
      {
        featureType: 'transit.station.rail',
        elementType: 'labels.icon',
        stylers: [{ visibility: 'on' }]
      }
    ]
  }
};

export const FARE_CONFIG = {
  baseFare: 10,
  maxFare: 60,
  perKmRate: 2,
  studentDiscount: 0.5,
  seniorCitizenDiscount: 0.5,
  disabledDiscount: 0.75,
};

export const GEOFENCE_CONFIG = {
  stationRadius: 100, // meters
  accuracyThreshold: 50, // meters
  timeoutDuration: 30000, // 30 seconds
};

export const PAYMENT_CONFIG = {
  razorpay: {
    currency: 'INR',
    theme: {
      color: '#2563EB',
    },
  },
  minRechargeAmount: 50,
  maxRechargeAmount: 5000,
  rechargeAmounts: [50, 100, 200, 500, 1000, 2000],
};

export const NOTIFICATION_CONFIG = {
  vapidPublicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
  swPath: '/sw.js',
};

export const QR_CONFIG = {
  scanTimeout: 10000, // 10 seconds
  validityDuration: 300000, // 5 minutes
};

export const CACHE_CONFIG = {
  stationsKey: 'metro_stations',
  userDataKey: 'user_data',
  journeyHistoryKey: 'journey_history',
  offlineQueueKey: 'offline_queue',
  ttl: 24 * 60 * 60 * 1000, // 24 hours
};

export const API_ENDPOINTS = {
  auth: '/api/auth',
  user: '/api/user',
  stations: '/api/stations',
  journeys: '/api/journeys',
  transactions: '/api/transactions',
  notifications: '/api/notifications',
  fare: '/api/fare',
  qr: '/api/qr',
};

export const STORAGE_KEYS = {
  theme: 'metro_theme',
  user: 'metro_user',
  fcmToken: 'metro_fcm_token',
  installPrompt: 'metro_install_prompt',
  onboardingComplete: 'metro_onboarding_complete',
};

export const ERROR_MESSAGES = {
  networkError: 'Network connection error. Please check your internet connection.',
  locationError: 'Unable to access location. Please enable location services.',
  cameraError: 'Unable to access camera. Please grant camera permissions.',
  paymentError: 'Payment failed. Please try again.',
  qrError: 'Invalid QR code. Please scan a valid metro station QR code.',
  authError: 'Authentication failed. Please login again.',
  genericError: 'Something went wrong. Please try again.',
};

export const SUCCESS_MESSAGES = {
  loginSuccess: 'Login successful!',
  paymentSuccess: 'Payment completed successfully!',
  rechargeSuccess: 'Metro card recharged successfully!',
  journeyStart: 'Journey started successfully!',
  journeyEnd: 'Journey completed successfully!',
  profileUpdate: 'Profile updated successfully!',
};

export const PERMISSIONS = {
  location: 'geolocation',
  camera: 'camera',
  notifications: 'notifications',
};

export const PWA_CONFIG = {
  name: APP_CONFIG.name,
  shortName: 'HydMetro',
  description: APP_CONFIG.description,
  themeColor: '#2563EB',
  backgroundColor: '#FFFFFF',
  display: 'standalone',
  orientation: 'portrait',
  scope: '/',
  startUrl: '/',
  icons: [
    {
      src: '/icons/icon-72x72.png',
      sizes: '72x72',
      type: 'image/png',
    },
    {
      src: '/icons/icon-96x96.png',
      sizes: '96x96',
      type: 'image/png',
    },
    {
      src: '/icons/icon-128x128.png',
      sizes: '128x128',
      type: 'image/png',
    },
    {
      src: '/icons/icon-144x144.png',
      sizes: '144x144',
      type: 'image/png',
    },
    {
      src: '/icons/icon-152x152.png',
      sizes: '152x152',
      type: 'image/png',
    },
    {
      src: '/icons/icon-192x192.png',
      sizes: '192x192',
      type: 'image/png',
    },
    {
      src: '/icons/icon-384x384.png',
      sizes: '384x384',
      type: 'image/png',
    },
    {
      src: '/icons/icon-512x512.png',
      sizes: '512x512',
      type: 'image/png',
    },
  ],
};
