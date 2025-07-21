import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { SensorMessage, ProcessedSensorData } from '@/types/sensor';

// In-memory storage for real-time data (you could also use Redis)
let realtimeDataBuffer: ProcessedSensorData[] = [];
const MAX_BUFFER_SIZE = 1000;

// WebSocket clients (we'll implement WebSocket server separately)
let wsClients: Set<any> = new Set();

export async function POST(request: NextRequest) {
  try {
    const rawData = await request.text();
    console.log('Received sensor data:', rawData.substring(0, 200) + '...');
    
    // Parse the JSON data
    const sensorMessage: SensorMessage = JSON.parse(rawData);
    const { messageId, sessionId, deviceId, payload } = sensorMessage;
    
    // Save raw data to file (same as Python version)
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const dataDir = path.join(process.cwd(), 'data');
    
    // Ensure data directory exists
    try {
      await fs.access(dataDir);
    } catch {
      await fs.mkdir(dataDir, { recursive: true });
    }
    
    // Save raw data
    const filename = path.join(dataDir, `data_${timestamp}.json`);
    await fs.writeFile(filename, rawData);
    
    // Process sensor data for real-time display
    const processedData = processSensorData(sensorMessage);
    
    // Add to real-time buffer
    realtimeDataBuffer.push(...processedData);
    
    // Keep buffer size manageable
    if (realtimeDataBuffer.length > MAX_BUFFER_SIZE) {
      realtimeDataBuffer = realtimeDataBuffer.slice(-MAX_BUFFER_SIZE);
    }
    
    // Broadcast to WebSocket clients (if any are connected)
    broadcastToClients({
      type: 'sensor_data',
      data: processedData,
      timestamp: Date.now()
    });
    
    return NextResponse.json({ 
      success: true, 
      processed: processedData.length,
      timestamp: Date.now()
    });
    
  } catch (error) {
    console.error('Error processing sensor data:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to process sensor data',
        timestamp: Date.now()
      }, 
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve recent data
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const limit = parseInt(url.searchParams.get('limit') || '100');
  
  return NextResponse.json({
    success: true,
    data: realtimeDataBuffer.slice(-limit),
    total: realtimeDataBuffer.length,
    timestamp: Date.now()
  });
}

function processSensorData(sensorMessage: SensorMessage): ProcessedSensorData[] {
  const processed: ProcessedSensorData[] = [];
  
  // Group by timestamp to combine multiple sensors from same time
  const timeGroups: Map<number, ProcessedSensorData> = new Map();
  
  for (const reading of sensorMessage.payload) {
    const timestamp = new Date(reading.time / 1e6); // Convert nanoseconds to milliseconds
    const timeKey = reading.time;
    
    // Debug logging to see what sensors are coming in
    console.log(`Processing sensor: ${reading.name}, values:`, reading.values);
    
    if (!timeGroups.has(timeKey)) {
      timeGroups.set(timeKey, { timestamp });
    }
    
    const dataPoint = timeGroups.get(timeKey)!;
    
    // Process each sensor type
    switch (reading.name) {
      case 'accelerometer':
        dataPoint.accelerometer = {
          x: reading.values.x || 0,
          y: reading.values.y || 0,
          z: reading.values.z || 0,
        };
        break;
        
      case 'gyroscope':
        dataPoint.gyroscope = {
          x: reading.values.x || 0,
          y: reading.values.y || 0,
          z: reading.values.z || 0,
        };
        break;
        
      case 'gravity':
        dataPoint.gravity = {
          x: reading.values.x || 0,
          y: reading.values.y || 0,
          z: reading.values.z || 0,
        };
        break;
        
      case 'orientation':
        dataPoint.orientation = {
          yaw: reading.values.yaw || 0,
          pitch: reading.values.pitch || 0,
          roll: reading.values.roll || 0,
          qx: reading.values.qx || 0,
          qy: reading.values.qy || 0,
          qz: reading.values.qz || 0,
          qw: reading.values.qw || 0,
        };
        break;
        
      case 'wrist motion':
        dataPoint.wristMotion = {
          rotationRateX: reading.values.rotationRateX || 0,
          rotationRateY: reading.values.rotationRateY || 0,
          rotationRateZ: reading.values.rotationRateZ || 0,
          gravityX: reading.values.gravityX || 0,
          gravityY: reading.values.gravityY || 0,
          gravityZ: reading.values.gravityZ || 0,
          accelerationX: reading.values.accelerationX || 0,
          accelerationY: reading.values.accelerationY || 0,
          accelerationZ: reading.values.accelerationZ || 0,
          quaternionW: reading.values.quaternionW || 0,
          quaternionX: reading.values.quaternionX || 0,
          quaternionY: reading.values.quaternionY || 0,
          quaternionZ: reading.values.quaternionZ || 0,
        };
        break;
        
      case 'magnetometer':
        dataPoint.magnetometer = {
          magneticBearing: reading.values.magneticBearing || 0,
        };
        break;
        
      case 'compass':
        dataPoint.compass = {
          magneticBearing: reading.values.magneticBearing || 0,
        };
        break;
        
      case 'microphone':
        dataPoint.microphone = {
          dBFS: reading.values.dBFS || 0,
        };
        break;
        
      // Uncalibrated sensors
      case 'accelerometeruncalibrated':
        dataPoint.accelerometerUncalibrated = {
          x: reading.values.x || 0,
          y: reading.values.y || 0,
          z: reading.values.z || 0,
        };
        break;
        
      case 'gyroscopeuncalibrated':
        dataPoint.gyroscopeUncalibrated = {
          x: reading.values.x || 0,
          y: reading.values.y || 0,
          z: reading.values.z || 0,
        };
        break;
        
      case 'magnetometeruncalibrated':
        dataPoint.magnetometerUncalibrated = {
          x: reading.values.x || 0,
          y: reading.values.y || 0,
          z: reading.values.z || 0,
        };
        break;
        
      // Watch-specific sensors
      case 'heart rate':
      case 'heartrate':
        dataPoint.heartRate = {
          bpm: reading.values.bpm || reading.values.heartRate || 0,
          confidence: reading.values.confidence || 0,
        };
        break;
        
      case 'motion':
        // Watch motion might have different structure than phone sensors
        dataPoint.watchMotion = {
          x: reading.values.x || 0,
          y: reading.values.y || 0,
          z: reading.values.z || 0,
          intensity: reading.values.intensity || 0,
        };
        break;
        
      case 'location':
      case 'gps':
        dataPoint.location = {
          latitude: reading.values.latitude || reading.values.lat || 0,
          longitude: reading.values.longitude || reading.values.lng || reading.values.lon || 0,
          altitude: reading.values.altitude || reading.values.alt || 0,
          accuracy: reading.values.accuracy || 0,
          speed: reading.values.speed || 0,
          bearing: reading.values.bearing || 0,
        };
        break;
        
      case 'barometer':
      case 'pressure':
        dataPoint.barometer = {
          pressure: reading.values.pressure || reading.values.hPa || 0,
          altitude: reading.values.altitude || 0,
        };
        break;
        
      default:
        console.log(`🚨 UNRECOGNIZED SENSOR: "${reading.name}" with values:`, reading.values);
        break;
    }
  }
  
  const processedData = Array.from(timeGroups.values());
  console.log(`📊 Processed ${processedData.length} data points from ${sensorMessage.payload.length} sensor readings`);
  
  if (processedData.length > 0) {
    console.log(`📋 Sample processed data:`, processedData[0]);
  }
  
  return processedData;
}

function broadcastToClients(message: any) {
  // This will be implemented when we add WebSocket support
  // For now, we just log it
  if (wsClients.size > 0) {
    console.log(`Broadcasting to ${wsClients.size} clients:`, message.type);
  }
} 