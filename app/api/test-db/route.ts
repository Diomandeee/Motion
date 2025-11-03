import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Test database connectivity
    const deviceCount = await prisma.device.count();
    const sessionCount = await prisma.sensorSession.count();
    const readingCount = await prisma.sensorReading.count();
    const processedCount = await prisma.processedSensorData.count();

    // Get recent devices
    const recentDevices = await prisma.device.findMany({
      take: 5,
      orderBy: { lastSeen: 'desc' },
    });

    // Get recent sessions
    const recentSessions = await prisma.sensorSession.findMany({
      take: 5,
      orderBy: { startTime: 'desc' },
      include: {
        device: true,
      },
    });

    return NextResponse.json({
      success: true,
      database: 'connected',
      counts: {
        devices: deviceCount,
        sessions: sessionCount,
        rawReadings: readingCount,
        processedData: processedCount,
      },
      recentDevices,
      recentSessions,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Database test failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Database test failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Test creating a device and session
    const testDeviceId = `test-device-${Date.now()}`;
    const testSessionId = `test-session-${Date.now()}`;

    // Create test device
    const device = await prisma.device.create({
      data: {
        deviceId: testDeviceId,
        deviceName: 'Test Device',
        platform: 'Test Platform',
      },
    });

    // Create test session
    const session = await prisma.sensorSession.create({
      data: {
        sessionId: testSessionId,
        deviceId: testDeviceId,
        startTime: new Date(),
        sensorTypes: 'accelerometer,gyroscope',
        totalDataPoints: 0,
      },
    });

    // Create test sensor reading
    const reading = await prisma.sensorReading.create({
      data: {
        deviceId: testDeviceId,
        sessionId: testSessionId,
        messageId: 1,
        sensorName: 'accelerometer',
        timestamp: new Date(),
        nanoseconds: BigInt(Date.now() * 1000000),
        values: JSON.stringify({ x: 1.23, y: 4.56, z: 7.89 }),
      },
    });

    // Create test processed data
    const processed = await prisma.processedSensorData.create({
      data: {
        deviceId: testDeviceId,
        sessionId: testSessionId,
        timestamp: new Date(),
        accelerometerX: 1.23,
        accelerometerY: 4.56,
        accelerometerZ: 7.89,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Test data created successfully',
      testData: {
        device,
        session,
        reading: {
          ...reading,
          nanoseconds: reading.nanoseconds.toString(), // Convert BigInt to string for JSON
        },
        processed,
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Database write test failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Database write test failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
} 