'use client';

import { ProcessedSensorData } from '@/types/sensor';
import SensorChart from '@/components/SensorChart';
import { Headphones, Compass, Mic } from 'lucide-react';

interface EnvironmentalTabProps {
  data: ProcessedSensorData[];
}

export default function EnvironmentalTab({ data }: EnvironmentalTabProps) {
  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <div className="p-3 bg-purple-100 rounded-lg">
          <Headphones className="w-8 h-8 text-purple-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Environmental Sensors</h2>
          <p className="text-gray-600">
            Magnetometer, compass, and audio sensor readings
          </p>
        </div>
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        
        {/* Magnetic Field */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <Compass className="w-5 h-5 text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-900">Magnetic Field</h3>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Magnetometer and compass bearing measurements
            </p>
          </div>
          <div className="p-6">
            <SensorChart
              data={data}
              title="Magnetic Bearing"
              sensors={[
                { key: 'magnetometer.magneticBearing', name: 'Magnetometer', color: '#8b5cf6' },
                { key: 'compass.magneticBearing', name: 'Compass', color: '#06b6d4', strokeDasharray: '5 5' },
              ]}
              height={400}
            />
          </div>
        </div>

        {/* Audio Level */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <Mic className="w-5 h-5 text-amber-600" />
              <h3 className="text-lg font-semibold text-gray-900">Audio Level</h3>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Microphone audio level in dBFS
            </p>
          </div>
          <div className="p-6">
            <SensorChart
              data={data}
              title="Audio dBFS"
              sensors={[
                { key: 'microphone.dBFS', name: 'Audio Level', color: '#f59e0b' },
              ]}
              height={400}
            />
          </div>
        </div>
      </div>

      {/* Info Panel */}
      <div className="bg-purple-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-purple-900 mb-4">About Environmental Sensors</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div>
            <h4 className="font-medium text-purple-900 mb-2">🧲 Magnetic Field</h4>
            <p className="text-purple-700">
              Magnetometer measures the magnetic field strength and direction, 
              useful for compass functionality and orientation reference.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-purple-900 mb-2">🎤 Audio Monitoring</h4>
            <p className="text-purple-700">
              Microphone provides ambient audio level measurements in dBFS, 
              useful for environmental monitoring and voice activity detection.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 