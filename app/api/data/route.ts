import { NextRequest, NextResponse } from 'next/server';
import { SensorMessage, ProcessedSensorData } from '@/types/sensor';

// Force dynamic route (prevent build-time execution)
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// In-memory storage for real-time data (serverless compatible)
let realtimeDataBuffer: ProcessedSensorData[] = [];
const MAX_BUFFER_SIZE = 1000;

// WebSocket clients (we'll implement WebSocket server separately)
let wsClients: Set<any> = new Set();

export async function POST(request: NextRequest) {
  try {
    // Dynamic import of Prisma (runtime only)
    const { prisma } = await import('@/lib/prisma');
    
    const rawData = await request.text();
    console.log('📡 RECEIVED RAW DATA:', rawData.substring(0, 500) + (rawData.length > 500 ? '...' : ''));
    
    // Parse the JSON data
    const sensorMessage: SensorMessage = JSON.parse(rawData);
    const { messageId, sessionId, deviceId, payload } = sensorMessage;

    console.log('📊 PARSED MESSAGE:', {
      messageId,
      sessionId,
      deviceId,
      payloadCount: payload.length,
      sensorTypes: Array.from(new Set(payload.map(p => p.name))),
      samplePayload: payload.slice(0, 2)
    });

    // Ensure device exists
    await prisma.device.upsert({
      where: { deviceId },
      update: { 
        lastSeen: new Date(),
      },
      create: {
        deviceId,
        deviceName: `Device ${deviceId}`,
        platform: 'Unknown',
        lastSeen: new Date(),
      },
    });

    // Ensure session exists
    const uniqueSensorTypes = Array.from(new Set(payload.map(p => p.name)));
    await prisma.sensorSession.upsert({
      where: { sessionId },
      update: {
        isActive: true,
        totalDataPoints: {
          increment: payload.length,
        },
        updatedAt: new Date(),
      },
      create: {
        sessionId,
        deviceId,
        startTime: new Date(),
        isActive: true,
        sensorTypes: uniqueSensorTypes.join(','), // Convert array to comma-separated string
        totalDataPoints: payload.length,
      },
    });

    // Save raw sensor readings to database
    const sensorReadings = payload.map(reading => ({
      deviceId,
      sessionId,
      messageId,
      sensorName: reading.name,
      timestamp: new Date(reading.time / 1e6), // Convert nanoseconds to milliseconds
      nanoseconds: BigInt(reading.time),
      accuracy: reading.accuracy || null,
      values: JSON.stringify(reading.values), // Convert values to JSON string
    }));

    await prisma.sensorReading.createMany({
      data: sensorReadings,
    });

    // Process sensor data for real-time display
    const processedData = processSensorData(sensorMessage);
    
    console.log('🔄 PROCESSED DATA:', {
      processedCount: processedData.length,
      sampleProcessed: processedData.length > 0 ? {
        timestamp: processedData[0].timestamp,
        hasSensors: {
          accelerometer: !!processedData[0].accelerometer,
          gyroscope: !!processedData[0].gyroscope,
          wristMotion: !!processedData[0].wristMotion,
          magnetometer: !!processedData[0].magnetometer,
          microphone: !!processedData[0].microphone,
          orientation: !!processedData[0].orientation,
        }
      } : null
    });
    
    // Save processed data to database for efficient dashboard queries
    const processedDataForDb = await Promise.all(
      processedData.map(async (data) => {
        return prisma.processedSensorData.create({
          data: {
            deviceId,
            sessionId,
            timestamp: data.timestamp,
            
            // Device Motion
            accelerometerX: data.accelerometer?.x,
            accelerometerY: data.accelerometer?.y,
            accelerometerZ: data.accelerometer?.z,
            gyroscopeX: data.gyroscope?.x,
            gyroscopeY: data.gyroscope?.y,
            gyroscopeZ: data.gyroscope?.z,
            gravityX: data.gravity?.x,
            gravityY: data.gravity?.y,
            gravityZ: data.gravity?.z,
            
            // Orientation
            orientationYaw: data.orientation?.yaw,
            orientationPitch: data.orientation?.pitch,
            orientationRoll: data.orientation?.roll,
            quaternionX: data.orientation?.qx,
            quaternionY: data.orientation?.qy,
            quaternionZ: data.orientation?.qz,
            quaternionW: data.orientation?.qw,
            
            // Environmental
            magneticBearing: data.magnetometer?.magneticBearing,
            compassBearing: data.compass?.magneticBearing,
            microphoneDbfs: data.microphone?.dBFS,
            
            // Wrist Motion
            wristRotationX: data.wristMotion?.rotationRateX,
            wristRotationY: data.wristMotion?.rotationRateY,
            wristRotationZ: data.wristMotion?.rotationRateZ,
            wristAccelX: data.wristMotion?.accelerationX,
            wristAccelY: data.wristMotion?.accelerationY,
            wristAccelZ: data.wristMotion?.accelerationZ,
            wristGravityX: data.wristMotion?.gravityX,
            wristGravityY: data.wristMotion?.gravityY,
            wristGravityZ: data.wristMotion?.gravityZ,
            wristQuaternionX: data.wristMotion?.quaternionX,
            wristQuaternionY: data.wristMotion?.quaternionY,
            wristQuaternionZ: data.wristMotion?.quaternionZ,
            wristQuaternionW: data.wristMotion?.quaternionW,
            
            // Watch Sensors
            heartRateBpm: data.heartRate?.bpm,
            heartRateConfidence: data.heartRate?.confidence,
            locationLat: data.location?.latitude,
            locationLng: data.location?.longitude,
            locationAlt: data.location?.altitude,
            locationAccuracy: data.location?.accuracy,
            locationSpeed: data.location?.speed,
            locationBearing: data.location?.bearing,
            barometerPressure: data.barometer?.pressure,
            barometerAltitude: data.barometer?.altitude,
            
            // Uncalibrated
            accelUncalX: data.accelerometerUncalibrated?.x,
            accelUncalY: data.accelerometerUncalibrated?.y,
            accelUncalZ: data.accelerometerUncalibrated?.z,
            gyroUncalX: data.gyroscopeUncalibrated?.x,
            gyroUncalY: data.gyroscopeUncalibrated?.y,
            gyroUncalZ: data.gyroscopeUncalibrated?.z,
            magnetUncalX: data.magnetometerUncalibrated?.x,
            magnetUncalY: data.magnetometerUncalibrated?.y,
            magnetUncalZ: data.magnetometerUncalibrated?.z,
          },
        });
      })
    );

    // Add to real-time buffer for immediate dashboard updates
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
    
    console.log(`✅ Processed ${processedData.length} data points - saved to DB and real-time buffer`);
    console.log(`📋 Buffer status: ${realtimeDataBuffer.length} items, DB saved: ${processedDataForDb.length}`);
    
    return NextResponse.json({ 
      success: true, 
      processed: processedData.length,
      savedToDb: processedDataForDb.length,
      bufferSize: realtimeDataBuffer.length,
      rawReadings: sensorReadings.length,
      sensorTypes: uniqueSensorTypes,
      timestamp: Date.now()
    });
    
  } catch (error) {
    console.error('❌ Error processing sensor data:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to process sensor data',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now()
      }, 
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve recent data (now from database with fallback to memory)
export async function GET(request: NextRequest) {
  try {
    // Dynamic import of Prisma (runtime only)
    const { prisma } = await import('@/lib/prisma');
    
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '100');
    const sessionId = url.searchParams.get('sessionId');
    const deviceId = url.searchParams.get('deviceId');
    
    // Try to get data from database first
    let dbData: any[] = [];
    try {
      dbData = await prisma.processedSensorData.findMany({
        where: {
          ...(sessionId && { sessionId }),
          ...(deviceId && { deviceId }),
        },
        orderBy: { timestamp: 'desc' },
        take: limit,
      });
      
      // Convert database format back to ProcessedSensorData format
      const processedDbData = dbData.map(item => ({
        timestamp: item.timestamp,
        ...(item.accelerometerX !== null && {
          accelerometer: {
            x: item.accelerometerX,
            y: item.accelerometerY,
            z: item.accelerometerZ,
          }
        }),
        ...(item.gyroscopeX !== null && {
          gyroscope: {
            x: item.gyroscopeX,
            y: item.gyroscopeY,
            z: item.gyroscopeZ,
          }
        }),
        ...(item.gravityX !== null && {
          gravity: {
            x: item.gravityX,
            y: item.gravityY,
            z: item.gravityZ,
          }
        }),
        ...(item.orientationYaw !== null && {
          orientation: {
            yaw: item.orientationYaw,
            pitch: item.orientationPitch,
            roll: item.orientationRoll,
            qx: item.quaternionX,
            qy: item.quaternionY,
            qz: item.quaternionZ,
            qw: item.quaternionW,
          }
        }),
        ...(item.magneticBearing !== null && {
          magnetometer: { magneticBearing: item.magneticBearing }
        }),
        ...(item.compassBearing !== null && {
          compass: { magneticBearing: item.compassBearing }
        }),
        ...(item.microphoneDbfs !== null && {
          microphone: { dBFS: item.microphoneDbfs }
        }),
        ...(item.wristRotationX !== null && {
          wristMotion: {
            rotationRateX: item.wristRotationX,
            rotationRateY: item.wristRotationY,
            rotationRateZ: item.wristRotationZ,
            accelerationX: item.wristAccelX,
            accelerationY: item.wristAccelY,
            accelerationZ: item.wristAccelZ,
            gravityX: item.wristGravityX,
            gravityY: item.wristGravityY,
            gravityZ: item.wristGravityZ,
            quaternionX: item.wristQuaternionX,
            quaternionY: item.wristQuaternionY,
            quaternionZ: item.wristQuaternionZ,
            quaternionW: item.wristQuaternionW,
          }
        }),
        ...(item.heartRateBpm !== null && {
          heartRate: {
            bpm: item.heartRateBpm,
            confidence: item.heartRateConfidence,
          }
        }),
        ...(item.locationLat !== null && {
          location: {
            latitude: item.locationLat,
            longitude: item.locationLng,
            altitude: item.locationAlt,
            accuracy: item.locationAccuracy,
            speed: item.locationSpeed,
            bearing: item.locationBearing,
          }
        }),
        ...(item.barometerPressure !== null && {
          barometer: {
            pressure: item.barometerPressure,
            altitude: item.barometerAltitude,
          }
        }),
        ...(item.accelUncalX !== null && {
          accelerometerUncalibrated: {
            x: item.accelUncalX,
            y: item.accelUncalY,
            z: item.accelUncalZ,
          }
        }),
        ...(item.gyroUncalX !== null && {
          gyroscopeUncalibrated: {
            x: item.gyroUncalX,
            y: item.gyroUncalY,
            z: item.gyroUncalZ,
          }
        }),
        ...(item.magnetUncalX !== null && {
          magnetometerUncalibrated: {
            x: item.magnetUncalX,
            y: item.magnetUncalY,
            z: item.magnetUncalZ,
          }
        }),
      }));

      return NextResponse.json({
        success: true,
        data: processedDbData.reverse(), // Reverse to get chronological order
        total: await prisma.processedSensorData.count({
          where: {
            ...(sessionId && { sessionId }),
            ...(deviceId && { deviceId }),
          },
        }),
        source: 'database',
        timestamp: Date.now()
      });
      
    } catch (dbError) {
      console.warn('Database query failed, falling back to memory buffer:', dbError);
      
      // Fallback to in-memory buffer
      return NextResponse.json({
        success: true,
        data: realtimeDataBuffer.slice(-limit),
        total: realtimeDataBuffer.length,
        source: 'memory',
        timestamp: Date.now()
      });
    }
    
  } catch (error) {
    console.error('Error retrieving sensor data:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to retrieve sensor data',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now()
      }, 
      { status: 500 }
    );
  }
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