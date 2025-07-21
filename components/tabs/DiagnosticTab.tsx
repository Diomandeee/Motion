'use client';

import { ProcessedSensorData } from '@/types/sensor';
import { Bug, Database, Activity } from 'lucide-react';

interface DiagnosticTabProps {
  data: ProcessedSensorData[];
}

export default function DiagnosticTab({ data }: DiagnosticTabProps) {
  const latestData = data.length > 0 ? data[data.length - 1] : null;
  
  // Analyze what sensors have data
  const sensorAnalysis = data.length > 0 ? {
    accelerometer: data.filter(d => d.accelerometer).length,
    gyroscope: data.filter(d => d.gyroscope).length,
    orientation: data.filter(d => d.orientation).length,
    wristMotion: data.filter(d => d.wristMotion).length,
    magnetometer: data.filter(d => d.magnetometer).length,
    microphone: data.filter(d => d.microphone).length,
    gravity: data.filter(d => d.gravity).length,
    heartRate: data.filter(d => d.heartRate).length,
    location: data.filter(d => d.location).length,
    barometer: data.filter(d => d.barometer).length,
    watchMotion: data.filter(d => d.watchMotion).length,
    accelerometerUncalibrated: data.filter(d => d.accelerometerUncalibrated).length,
    gyroscopeUncalibrated: data.filter(d => d.gyroscopeUncalibrated).length,
    magnetometerUncalibrated: data.filter(d => d.magnetometerUncalibrated).length,
    compass: data.filter(d => d.compass).length,
  } : {};

  // Detailed sensor field analysis
  const getNestedValue = (obj: any, path: string): number | null => {
    const keys = path.split('.');
    let value = obj;
    
    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        return null;
      }
    }
    
    return typeof value === 'number' ? value : null;
  };

  const sensorFieldAnalysis = latestData ? {
    'accelerometer.x': getNestedValue(latestData, 'accelerometer.x'),
    'accelerometer.y': getNestedValue(latestData, 'accelerometer.y'),
    'accelerometer.z': getNestedValue(latestData, 'accelerometer.z'),
    'gyroscope.x': getNestedValue(latestData, 'gyroscope.x'),
    'gyroscope.y': getNestedValue(latestData, 'gyroscope.y'),
    'gyroscope.z': getNestedValue(latestData, 'gyroscope.z'),
    'gravity.x': getNestedValue(latestData, 'gravity.x'),
    'gravity.y': getNestedValue(latestData, 'gravity.y'),
    'gravity.z': getNestedValue(latestData, 'gravity.z'),
    'wristMotion.rotationRateX': getNestedValue(latestData, 'wristMotion.rotationRateX'),
    'magnetometer.magneticBearing': getNestedValue(latestData, 'magnetometer.magneticBearing'),
    'microphone.dBFS': getNestedValue(latestData, 'microphone.dBFS'),
  } : {};

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <div className="p-3 bg-blue-100 rounded-lg">
          <Activity className="w-8 h-8 text-blue-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">System Diagnostics</h2>
          <p className="text-gray-600">
            Sensor data analysis and troubleshooting information
          </p>
        </div>
      </div>

      {/* Quick Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center space-x-2 mb-4">
            <Activity className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Data Status</h3>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Total Points:</span>
              <span className="font-medium">{data.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Latest:</span>
              <span className={`font-medium ${latestData ? 'text-green-600' : 'text-red-500'}`}>
                {latestData ? new Date(latestData.timestamp).toLocaleTimeString() : 'No Data'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Active Sensors:</span>
              <span className="font-medium text-blue-600">
                {Object.values(sensorAnalysis).filter(count => count > 0).length}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center space-x-2 mb-4">
            <Activity className="w-5 h-5 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">Sensor Count</h3>
          </div>
          <div className="space-y-2 text-sm">
            {Object.entries(sensorAnalysis).slice(0, 6).map(([sensor, count]) => (
              <div key={sensor} className="flex justify-between">
                <span className="capitalize">{sensor}:</span>
                <span className={`font-medium ${count > 0 ? 'text-green-600' : 'text-red-500'}`}>
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Sensors</h3>
          <div className="space-y-2">
            {Object.entries(sensorAnalysis)
              .filter(([_, count]) => count > 0)
              .map(([sensor, count]) => (
                <div key={sensor} className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm capitalize">{sensor}</span>
                  <span className="text-xs text-gray-500">({count})</span>
                </div>
              ))
            }
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Chart Data Status</h3>
          <div className="space-y-2 text-xs">
            {Object.entries(sensorFieldAnalysis).map(([field, value]) => (
              <div key={field} className="flex justify-between">
                <span className="text-gray-600">{field}:</span>
                <span className={`font-medium ${value !== null ? 'text-green-600' : 'text-red-500'}`}>
                  {value !== null ? value.toFixed(3) : 'null'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Data Structure Analysis */}
      {latestData && (
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Latest Data Structure</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Available Sensor Objects:</h4>
              <div className="bg-gray-50 p-3 rounded text-sm">
                {Object.keys(latestData).filter(key => key !== 'timestamp').map(key => (
                  <div key={key} className="flex justify-between mb-1">
                    <span>{key}:</span>
                    <span className={latestData[key as keyof typeof latestData] ? 'text-green-600' : 'text-red-500'}>
                      {latestData[key as keyof typeof latestData] ? '✓' : '✗'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Raw JSON Sample:</h4>
              <div className="bg-gray-50 p-3 rounded overflow-auto max-h-48">
                <pre className="text-xs text-gray-700">
                  {JSON.stringify(latestData, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Troubleshooting Guide */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-amber-900 mb-4">🔧 Troubleshooting Guide</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-amber-800">
          <div>
            <h4 className="font-medium mb-2">Common Issues:</h4>
            <ul className="space-y-1 list-disc list-inside">
              <li>Charts not showing: Check if sensor data fields match expected keys</li>
              <li>Partial data: Some sensors may not be available on your device</li>
              <li>No data: Ensure sensor data is being sent to /api/data endpoint</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">Expected Sensor Fields:</h4>
            <ul className="space-y-1 list-disc list-inside">
              <li>accelerometer: x, y, z</li>
              <li>gyroscope: x, y, z</li>
              <li>wristMotion: rotationRateX, rotationRateY, etc.</li>
              <li>magnetometer: magneticBearing</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 