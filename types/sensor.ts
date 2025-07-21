// Core sensor data types based on the JSON structure we've been working with
export interface SensorReading {
  name: string;
  time: number; // nanoseconds
  values: Record<string, number>;
  accuracy?: number;
}

export interface SensorMessage {
  messageId: number;
  sessionId: string;
  deviceId: string;
  payload: SensorReading[];
}

// Specific sensor value types
export interface AccelerometerValues {
  x: number;
  y: number;
  z: number;
}

export interface GyroscopeValues {
  x: number;
  y: number;
  z: number;
}

export interface OrientationValues {
  yaw: number;
  pitch: number;
  roll: number;
  qx: number; // quaternion x
  qy: number; // quaternion y
  qz: number; // quaternion z
  qw: number; // quaternion w
}

export interface WristMotionValues {
  rotationRateX: number;
  rotationRateY: number;
  rotationRateZ: number;
  gravityX: number;
  gravityY: number;
  gravityZ: number;
  accelerationX: number;
  accelerationY: number;
  accelerationZ: number;
  quaternionW: number;
  quaternionX: number;
  quaternionY: number;
  quaternionZ: number;
}

export interface MagnetometerValues {
  magneticBearing: number;
}

export interface MicrophoneValues {
  dBFS: number;
}

// Watch-specific sensor types
export interface HeartRateValues {
  bpm: number;
  confidence: number;
}

export interface WatchMotionValues {
  x: number;
  y: number;
  z: number;
  intensity: number;
}

export interface LocationValues {
  latitude: number;
  longitude: number;
  altitude: number;
  accuracy: number;
  speed: number;
  bearing: number;
}

export interface BarometerValues {
  pressure: number;
  altitude: number;
}

// Processed sensor data for charts
export interface ProcessedSensorData {
  timestamp: Date;
  accelerometer?: AccelerometerValues;
  gyroscope?: GyroscopeValues;
  orientation?: OrientationValues;
  wristMotion?: WristMotionValues;
  magnetometer?: MagnetometerValues;
  compass?: MagnetometerValues;
  microphone?: MicrophoneValues;
  gravity?: AccelerometerValues;
  // Uncalibrated variants
  accelerometerUncalibrated?: AccelerometerValues;
  gyroscopeUncalibrated?: GyroscopeValues;
  magnetometerUncalibrated?: AccelerometerValues;
  // Watch-specific sensors
  heartRate?: HeartRateValues;
  watchMotion?: WatchMotionValues;
  location?: LocationValues;
  barometer?: BarometerValues;
}

// Chart data point type
export interface ChartDataPoint {
  time: number;
  [key: string]: number;
}

// Sensor status for dashboard
export interface SensorStatus {
  name: string;
  isActive: boolean;
  lastUpdate: Date;
  dataPointsReceived: number;
  frequency?: number; // Hz
  color: string;
}

// Dashboard state
export interface DashboardState {
  isConnected: boolean;
  currentSession: string | null;
  sensorStatuses: SensorStatus[];
  realtimeData: ProcessedSensorData[];
  maxDataPoints: number;
}

// WebSocket message types
export interface WebSocketMessage {
  type: 'sensor_data' | 'status_update' | 'session_start' | 'session_end';
  data: any;
  timestamp: number;
}

// API response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: number;
} 