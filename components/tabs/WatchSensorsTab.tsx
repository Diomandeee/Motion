'use client';

import { ProcessedSensorData } from '@/types/sensor';
import SensorChart from '@/components/SensorChart';
import { Heart, MapPin, Gauge, Activity } from 'lucide-react';

interface WatchSensorsTabProps {
  data: ProcessedSensorData[];
}

export default function WatchSensorsTab({ data }: WatchSensorsTabProps) {
  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <div className="p-3 bg-red-100 rounded-lg">
          <Heart className="w-8 h-8 text-red-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Watch Sensors</h2>
          <p className="text-gray-600">
            Apple Watch health and motion data
          </p>
        </div>
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        
        {/* Heart Rate */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <Heart className="w-5 h-5 text-red-600" />
              <h3 className="text-lg font-semibold text-gray-900">Heart Rate</h3>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Heart rate in beats per minute (BPM)
            </p>
          </div>
          <div className="p-6">
            <SensorChart
              data={data}
              title="Heart Rate"
              sensors={[
                { key: 'heartRate.bpm', name: 'BPM', color: '#ef4444' },
                { key: 'heartRate.confidence', name: 'Confidence', color: '#f97316' },
              ]}
              height={400}
            />
          </div>
        </div>

        {/* Location */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <MapPin className="w-5 h-5 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900">Location</h3>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              GPS coordinates and movement data
            </p>
          </div>
          <div className="p-6">
            <SensorChart
              data={data}
              title="Location Data"
              sensors={[
                { key: 'location.latitude', name: 'Latitude', color: '#22c55e' },
                { key: 'location.longitude', name: 'Longitude', color: '#3b82f6' },
                { key: 'location.altitude', name: 'Altitude', color: '#8b5cf6' },
                { key: 'location.speed', name: 'Speed', color: '#f59e0b', strokeDasharray: '3 3' },
              ]}
              height={400}
            />
          </div>
        </div>
      </div>

      {/* Secondary Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        
        {/* Barometer */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <Gauge className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Barometer</h3>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Atmospheric pressure and altitude
            </p>
          </div>
          <div className="p-6">
            <SensorChart
              data={data}
              title="Atmospheric Pressure"
              sensors={[
                { key: 'barometer.pressure', name: 'Pressure', color: '#3b82f6' },
                { key: 'barometer.altitude', name: 'Altitude', color: '#06b6d4', strokeDasharray: '2 2' },
              ]}
              height={300}
            />
          </div>
        </div>

        {/* Watch Motion */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-900">Watch Motion</h3>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Watch movement and activity detection
            </p>
          </div>
          <div className="p-6">
            <SensorChart
              data={data}
              title="Motion Activity"
              sensors={[
                { key: 'watchMotion.x', name: 'X-axis', color: '#ef4444' },
                { key: 'watchMotion.y', name: 'Y-axis', color: '#22c55e' },
                { key: 'watchMotion.z', name: 'Z-axis', color: '#3b82f6' },
                { key: 'watchMotion.intensity', name: 'Intensity', color: '#8b5cf6', strokeDasharray: '5 5' },
              ]}
              height={300}
            />
          </div>
        </div>
      </div>

      {/* Info Panel */}
      <div className="bg-red-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-red-900 mb-4">About Watch Sensors</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div>
            <h4 className="font-medium text-red-900 mb-2">❤️ Health Monitoring</h4>
            <p className="text-red-700">
              Apple Watch provides continuous heart rate monitoring and health metrics
              with confidence levels indicating measurement reliability.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-red-900 mb-2">📍 Location Tracking</h4>
            <p className="text-red-700">
              GPS data includes precise coordinates, altitude, speed, and bearing
              for comprehensive location and movement analysis.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-red-900 mb-2">🌡️ Environmental</h4>
            <p className="text-red-700">
              Barometric pressure sensor provides altitude and weather data
              for environmental monitoring and activity context.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-red-900 mb-2">🏃 Activity Detection</h4>
            <p className="text-red-700">
              Watch motion sensors detect movement patterns and activity intensity
              for fitness and gesture recognition.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 