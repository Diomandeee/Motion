import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Get the most recent raw sensor readings to see what's actually coming in
    const recentReadings = await prisma.sensorReading.findMany({
      orderBy: { timestamp: 'desc' },
      take: 10,
    });

    // Get the most recent processed data
    const recentProcessed = await prisma.processedSensorData.findMany({
      orderBy: { timestamp: 'desc' },
      take: 5,
    });

    // Parse the raw sensor values to see the actual structure
    const sensorAnalysis = recentReadings.map(reading => {
      let parsedValues;
      try {
        parsedValues = JSON.parse(reading.values);
      } catch (e) {
        parsedValues = { error: 'Failed to parse JSON', raw: reading.values };
      }
      
      return {
        id: reading.id,
        sensorName: reading.sensorName,
        timestamp: reading.timestamp,
        messageId: reading.messageId,
        sessionId: reading.sessionId,
        deviceId: reading.deviceId,
        parsedValues,
        rawValues: reading.values,
      };
    });

    // Group by sensor type to see what sensors are being received
    const sensorTypes = [...new Set(recentReadings.map(r => r.sensorName))];
    const sensorCounts = sensorTypes.map(type => ({
      name: type,
      count: recentReadings.filter(r => r.sensorName === type).length,
      latestValues: (() => {
        const latest = recentReadings.find(r => r.sensorName === type);
        if (latest) {
          try {
            return JSON.parse(latest.values);
          } catch (e) {
            return latest.values;
          }
        }
        return null;
      })(),
    }));

    // Check what fields are null in processed data
    const processedDataAnalysis = recentProcessed.length > 0 ? {
      total: recentProcessed.length,
      fieldAnalysis: {
        accelerometer: {
          x: recentProcessed.filter(p => p.accelerometerX !== null).length,
          y: recentProcessed.filter(p => p.accelerometerY !== null).length,
          z: recentProcessed.filter(p => p.accelerometerZ !== null).length,
        },
        gyroscope: {
          x: recentProcessed.filter(p => p.gyroscopeX !== null).length,
          y: recentProcessed.filter(p => p.gyroscopeY !== null).length,
          z: recentProcessed.filter(p => p.gyroscopeZ !== null).length,
        },
        orientation: {
          yaw: recentProcessed.filter(p => p.orientationYaw !== null).length,
          pitch: recentProcessed.filter(p => p.orientationPitch !== null).length,
          roll: recentProcessed.filter(p => p.orientationRoll !== null).length,
        },
        wristMotion: {
          rotationX: recentProcessed.filter(p => p.wristRotationX !== null).length,
        },
        magnetometer: {
          bearing: recentProcessed.filter(p => p.magneticBearing !== null).length,
        },
        microphone: {
          dbfs: recentProcessed.filter(p => p.microphoneDbfs !== null).length,
        },
      },
      latestProcessed: recentProcessed[0],
    } : null;

    return NextResponse.json({
      success: true,
      analysis: {
        totalRawReadings: recentReadings.length,
        totalProcessedData: recentProcessed.length,
        uniqueSensorTypes: sensorTypes.length,
        sensorTypes,
        sensorCounts,
        processedDataAnalysis,
      },
      recentRawReadings: sensorAnalysis,
      recentProcessedData: recentProcessed,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Debug sensor analysis failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Debug analysis failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
} 