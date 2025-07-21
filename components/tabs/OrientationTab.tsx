'use client';

import { ProcessedSensorData } from '@/types/sensor';
import SensorChart from '@/components/SensorChart';
import { Compass, RotateCcw } from 'lucide-react';

interface OrientationTabProps {
  data: ProcessedSensorData[];
}

export default function OrientationTab({ data }: OrientationTabProps) {
  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <div className="p-3 bg-cyan-100 rounded-lg">
          <Compass className="w-8 h-8 text-cyan-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Orientation & Attitude</h2>
          <p className="text-gray-600">
            Device orientation in Euler angles and quaternion representation
          </p>
        </div>
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        
        {/* Euler Angles */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <RotateCcw className="w-5 h-5 text-cyan-600" />
              <h3 className="text-lg font-semibold text-gray-900">Euler Angles</h3>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Yaw, pitch, and roll rotation angles in radians
            </p>
          </div>
          <div className="p-6">
            <SensorChart
              data={data}
              title="Euler Angles"
              sensors={[
                { key: 'orientation.yaw', name: 'Yaw', color: '#ef4444' },
                { key: 'orientation.pitch', name: 'Pitch', color: '#22c55e' },
                { key: 'orientation.roll', name: 'Roll', color: '#3b82f6' },
              ]}
              height={400}
            />
          </div>
        </div>

        {/* Quaternion */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <Compass className="w-5 h-5 text-cyan-600" />
              <h3 className="text-lg font-semibold text-gray-900">Quaternion</h3>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Quaternion components (w, x, y, z) for rotation representation
            </p>
          </div>
          <div className="p-6">
            <SensorChart
              data={data}
              title="Quaternion Components"
              sensors={[
                { key: 'orientation.qw', name: 'Qw', color: '#ef4444' },
                { key: 'orientation.qx', name: 'Qx', color: '#22c55e' },
                { key: 'orientation.qy', name: 'Qy', color: '#3b82f6' },
                { key: 'orientation.qz', name: 'Qz', color: '#f97316' },
              ]}
              height={400}
            />
          </div>
        </div>
      </div>

      {/* Info Panel */}
      <div className="bg-cyan-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-cyan-900 mb-4">About Orientation</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div>
            <h4 className="font-medium text-cyan-900 mb-2">📐 Euler Angles</h4>
            <p className="text-cyan-700">
              Yaw (rotation around Z), Pitch (rotation around Y), and Roll (rotation around X) 
              provide an intuitive way to understand device orientation.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-cyan-900 mb-2">🔄 Quaternion</h4>
            <p className="text-cyan-700">
              Quaternions provide a mathematically robust representation of rotation 
              without gimbal lock issues, ideal for 3D orientation tracking.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 