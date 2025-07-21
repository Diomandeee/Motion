'use client';

import { ProcessedSensorData } from '@/types/sensor';
import SensorChart from '@/components/SensorChart';
import { Watch, Zap, RotateCcw } from 'lucide-react';

interface WristMotionTabProps {
  data: ProcessedSensorData[];
}

export default function WristMotionTab({ data }: WristMotionTabProps) {
  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <div className="p-3 bg-emerald-100 rounded-lg">
          <Watch className="w-8 h-8 text-emerald-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Wrist Motion</h2>
          <p className="text-gray-600">
            Apple Watch and WearOS sensor data from wrist-worn devices
          </p>
        </div>
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        
        {/* Wrist Rotation & Acceleration */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <RotateCcw className="w-5 h-5 text-emerald-600" />
              <h3 className="text-lg font-semibold text-gray-900">Wrist Movement</h3>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Rotation rate and acceleration at the wrist
            </p>
          </div>
          <div className="p-6">
            <SensorChart
              data={data}
              title="Wrist Rotation & Acceleration"
              sensors={[
                { key: 'wristMotion.rotationRateX', name: 'Rotation X', color: '#ef4444' },
                { key: 'wristMotion.rotationRateY', name: 'Rotation Y', color: '#22c55e' },
                { key: 'wristMotion.rotationRateZ', name: 'Rotation Z', color: '#3b82f6' },
                { key: 'wristMotion.accelerationX', name: 'Accel X', color: '#f97316', strokeDasharray: '3 3' },
                { key: 'wristMotion.accelerationY', name: 'Accel Y', color: '#8b5cf6', strokeDasharray: '3 3' },
                { key: 'wristMotion.accelerationZ', name: 'Accel Z', color: '#06b6d4', strokeDasharray: '3 3' },
              ]}
              height={400}
            />
          </div>
        </div>

        {/* Wrist Quaternion & Gravity */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <Zap className="w-5 h-5 text-emerald-600" />
              <h3 className="text-lg font-semibold text-gray-900">Orientation & Gravity</h3>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Wrist orientation quaternion and gravity components
            </p>
          </div>
          <div className="p-6">
            <SensorChart
              data={data}
              title="Wrist Quaternion & Gravity"
              sensors={[
                { key: 'wristMotion.quaternionW', name: 'Qw', color: '#ef4444' },
                { key: 'wristMotion.quaternionX', name: 'Qx', color: '#22c55e' },
                { key: 'wristMotion.quaternionY', name: 'Qy', color: '#3b82f6' },
                { key: 'wristMotion.quaternionZ', name: 'Qz', color: '#f97316' },
                { key: 'wristMotion.gravityX', name: 'Grav X', color: '#8b5cf6', strokeDasharray: '2 2' },
                { key: 'wristMotion.gravityY', name: 'Grav Y', color: '#06b6d4', strokeDasharray: '2 2' },
                { key: 'wristMotion.gravityZ', name: 'Grav Z', color: '#f59e0b', strokeDasharray: '2 2' },
              ]}
              height={400}
            />
          </div>
        </div>
      </div>

      {/* Detailed Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Rotation Rate Detail */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Rotation Rate</h3>
            <p className="text-sm text-gray-500 mt-1">Angular velocity in rad/s</p>
          </div>
          <div className="p-6">
            <SensorChart
              data={data}
              title="Wrist Rotation"
              sensors={[
                { key: 'wristMotion.rotationRateX', name: 'X-axis', color: '#ef4444' },
                { key: 'wristMotion.rotationRateY', name: 'Y-axis', color: '#22c55e' },
                { key: 'wristMotion.rotationRateZ', name: 'Z-axis', color: '#3b82f6' },
              ]}
              height={300}
            />
          </div>
        </div>

        {/* Acceleration Detail */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Acceleration</h3>
            <p className="text-sm text-gray-500 mt-1">Linear acceleration in m/s²</p>
          </div>
          <div className="p-6">
            <SensorChart
              data={data}
              title="Wrist Acceleration"
              sensors={[
                { key: 'wristMotion.accelerationX', name: 'X-axis', color: '#f97316' },
                { key: 'wristMotion.accelerationY', name: 'Y-axis', color: '#8b5cf6' },
                { key: 'wristMotion.accelerationZ', name: 'Z-axis', color: '#06b6d4' },
              ]}
              height={300}
            />
          </div>
        </div>

        {/* Gravity Detail */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Gravity Vector</h3>
            <p className="text-sm text-gray-500 mt-1">Gravity components in m/s²</p>
          </div>
          <div className="p-6">
            <SensorChart
              data={data}
              title="Wrist Gravity"
              sensors={[
                { key: 'wristMotion.gravityX', name: 'X-axis', color: '#8b5cf6' },
                { key: 'wristMotion.gravityY', name: 'Y-axis', color: '#06b6d4' },
                { key: 'wristMotion.gravityZ', name: 'Z-axis', color: '#f59e0b' },
              ]}
              height={300}
            />
          </div>
        </div>
      </div>

      {/* Info Panel */}
      <div className="bg-emerald-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-emerald-900 mb-4">About Wrist Motion</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div>
            <h4 className="font-medium text-emerald-900 mb-2">⌚ Wearable Sensors</h4>
            <p className="text-emerald-700">
              Wrist-worn devices like Apple Watch and WearOS provide high-frequency motion data 
              optimized for gesture recognition, activity tracking, and health monitoring.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-emerald-900 mb-2">🔄 Motion Analysis</h4>
            <p className="text-emerald-700">
              The combination of rotation rate, acceleration, and orientation data enables 
              detailed analysis of hand movements, gestures, and physical activities.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 