import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

// Helper function to convert data to CSV
function arrayToCSV(data: any[], headers: string[]): string {
  if (data.length === 0) {
    return headers.join(',') + '\n';
  }

  const csvRows = [headers.join(',')];

  for (const row of data) {
    const values = headers.map(header => {
      const value = row[header];
      if (value === null || value === undefined) {
        return '';
      }
      // Escape quotes and wrap in quotes if contains comma or newline
      const stringValue = String(value);
      if (stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    });
    csvRows.push(values.join(','));
  }

  return csvRows.join('\n');
}

async function exportToCSV() {
  const outputDir = path.join(process.cwd(), 'exported_data');

  // Create output directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log('Starting database export...\n');

  try {
    // 1. Export Devices
    console.log('Exporting devices...');
    const devices = await prisma.device.findMany();
    const devicesCSV = arrayToCSV(devices, [
      'id', 'deviceId', 'deviceName', 'platform', 'model',
      'osVersion', 'appVersion', 'lastSeen', 'createdAt', 'updatedAt'
    ]);
    fs.writeFileSync(path.join(outputDir, 'devices.csv'), devicesCSV);
    console.log(`✓ Exported ${devices.length} devices`);

    // 2. Export Sensor Sessions
    console.log('Exporting sensor sessions...');
    const sessions = await prisma.sensorSession.findMany();
    const sessionsCSV = arrayToCSV(sessions, [
      'id', 'sessionId', 'deviceId', 'startTime', 'endTime',
      'isActive', 'sensorTypes', 'totalDataPoints', 'dataFrequencyHz',
      'summary', 'createdAt', 'updatedAt'
    ]);
    fs.writeFileSync(path.join(outputDir, 'sessions.csv'), sessionsCSV);
    console.log(`✓ Exported ${sessions.length} sessions`);

    // 3. Export Sensor Readings (raw data)
    console.log('Exporting sensor readings...');
    const readings = await prisma.sensorReading.findMany({
      orderBy: { timestamp: 'asc' }
    });

    // Parse values JSON and flatten for CSV
    const readingsFlattened = readings.map(reading => {
      let parsedValues: any = {};
      try {
        parsedValues = JSON.parse(reading.values);
      } catch (e) {
        parsedValues = { raw: reading.values };
      }

      return {
        id: reading.id,
        deviceId: reading.deviceId,
        sessionId: reading.sessionId,
        messageId: reading.messageId,
        sensorName: reading.sensorName,
        timestamp: reading.timestamp,
        nanoseconds: reading.nanoseconds.toString(),
        accuracy: reading.accuracy,
        ...parsedValues,
        createdAt: reading.createdAt
      };
    });

    // Get all unique keys from all readings
    const allKeys = new Set<string>();
    readingsFlattened.forEach(reading => {
      Object.keys(reading).forEach(key => allKeys.add(key));
    });
    const readingHeaders = Array.from(allKeys);

    const readingsCSV = arrayToCSV(readingsFlattened, readingHeaders);
    fs.writeFileSync(path.join(outputDir, 'sensor_readings.csv'), readingsCSV);
    console.log(`✓ Exported ${readings.length} sensor readings`);

    // 4. Export Processed Sensor Data
    console.log('Exporting processed sensor data...');
    const processedData = await prisma.processedSensorData.findMany({
      orderBy: { timestamp: 'asc' }
    });

    if (processedData.length > 0) {
      const processedHeaders = [
        'id', 'deviceId', 'sessionId', 'timestamp',
        'accelerometerX', 'accelerometerY', 'accelerometerZ',
        'gyroscopeX', 'gyroscopeY', 'gyroscopeZ',
        'gravityX', 'gravityY', 'gravityZ',
        'orientationYaw', 'orientationPitch', 'orientationRoll',
        'quaternionX', 'quaternionY', 'quaternionZ', 'quaternionW',
        'magneticBearing', 'compassBearing', 'microphoneDbfs',
        'wristRotationX', 'wristRotationY', 'wristRotationZ',
        'wristAccelX', 'wristAccelY', 'wristAccelZ',
        'wristGravityX', 'wristGravityY', 'wristGravityZ',
        'wristQuaternionX', 'wristQuaternionY', 'wristQuaternionZ', 'wristQuaternionW',
        'heartRateBpm', 'heartRateConfidence',
        'locationLat', 'locationLng', 'locationAlt', 'locationAccuracy',
        'locationSpeed', 'locationBearing',
        'barometerPressure', 'barometerAltitude',
        'accelUncalX', 'accelUncalY', 'accelUncalZ',
        'gyroUncalX', 'gyroUncalY', 'gyroUncalZ',
        'magnetUncalX', 'magnetUncalY', 'magnetUncalZ',
        'createdAt'
      ];

      const processedCSV = arrayToCSV(processedData, processedHeaders);
      fs.writeFileSync(path.join(outputDir, 'processed_sensor_data.csv'), processedCSV);
      console.log(`✓ Exported ${processedData.length} processed sensor data points`);
    } else {
      console.log('⚠ No processed sensor data found');
    }

    // 5. Export Annotations
    console.log('Exporting annotations...');
    const annotations = await prisma.annotation.findMany();
    if (annotations.length > 0) {
      const annotationsCSV = arrayToCSV(annotations, [
        'id', 'sessionId', 'timestamp', 'text', 'category', 'tags', 'createdAt'
      ]);
      fs.writeFileSync(path.join(outputDir, 'annotations.csv'), annotationsCSV);
      console.log(`✓ Exported ${annotations.length} annotations`);
    } else {
      console.log('⚠ No annotations found');
    }

    console.log('\n✅ Export completed successfully!');
    console.log(`📁 Files saved to: ${outputDir}`);

  } catch (error) {
    console.error('❌ Export failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the export
exportToCSV()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
