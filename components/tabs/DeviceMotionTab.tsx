'use client';

import { ProcessedSensorData } from '@/types/sensor';
import SensorChart from '@/components/SensorChart';
import { Smartphone, Zap, Activity } from 'lucide-react';

interface DeviceMotionTabProps {
  data: ProcessedSensorData[];
  debug?: boolean;
}

export default function DeviceMotionTab({ data, debug = false }: DeviceMotionTabProps) {
  return (
    <div className="p-4 sm:p-6 space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
        <div className="flex items-center space-x-3">
          <div className="p-2 sm:p-3 bg-blue-100 rounded-lg">
            <Smartphone className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Device Motion</h2>
            <p className="text-sm sm:text-base text-gray-600">
              Accelerometer, gyroscope, and gravity sensor data
            </p>
          </div>
        </div>
        {debug && (
          <div className="sm:ml-auto bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">
            Debug Mode
          </div>
        )}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8">
        
        {/* Accelerometer & Gyroscope Combined */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <Activity className="w-4 sm:w-5 h-4 sm:h-5 text-red-600" />
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">Motion Sensors</h3>
            </div>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Combined accelerometer and gyroscope readings
            </p>
          </div>
          <div className="p-4 sm:p-6">
            <SensorChart
              data={data}
              title="Accelerometer & Gyroscope"
              sensors={[
                { key: 'accelerometer.x', name: 'Accel X', color: '#ef4444' },
                { key: 'accelerometer.y', name: 'Accel Y', color: '#22c55e' },
                { key: 'accelerometer.z', name: 'Accel Z', color: '#3b82f6' },
                { key: 'gyroscope.x', name: 'Gyro X', color: '#f97316', strokeDasharray: '5 5' },
                { key: 'gyroscope.y', name: 'Gyro Y', color: '#8b5cf6', strokeDasharray: '5 5' },
                { key: 'gyroscope.z', name: 'Gyro Z', color: '#06b6d4', strokeDasharray: '5 5' },
              ]}
              height={300}
              debug={debug}
            />
          </div>
        </div>

        {/* Gravity Vector */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <Activity className="w-4 sm:w-5 h-4 sm:h-5 text-blue-600" />
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">Gravity Vector</h3>
            </div>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Device gravity measurements
            </p>
          </div>
          <div className="p-4 sm:p-6">
            <SensorChart
              data={data}
              title="Gravity"
              sensors={[
                { key: 'gravity.x', name: 'Gravity X', color: '#6366f1' },
                { key: 'gravity.y', name: 'Gravity Y', color: '#8b5cf6' },
                { key: 'gravity.z', name: 'Gravity Z', color: '#06b6d4' },
              ]}
              height={300}
              debug={debug}
            />
          </div>
        </div>
      </div>

      {/* Detailed Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        
        {/* Accelerometer Only */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">Accelerometer Detail</h3>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Linear acceleration in m/s²
            </p>
          </div>
          <div className="p-4 sm:p-6">
            <SensorChart
              data={data}
              title="Accelerometer"
              sensors={[
                { key: 'accelerometer.x', name: 'X-axis', color: '#ef4444' },
                { key: 'accelerometer.y', name: 'Y-axis', color: '#22c55e' },
                { key: 'accelerometer.z', name: 'Z-axis', color: '#3b82f6' },
              ]}
              height={250}
              debug={debug}
            />
          </div>
        </div>

        {/* Gyroscope Only */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">Gyroscope Detail</h3>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Angular velocity in rad/s
            </p>
          </div>
          <div className="p-4 sm:p-6">
            <SensorChart
              data={data}
              title="Gyroscope"
              sensors={[
                { key: 'gyroscope.x', name: 'X-axis', color: '#f97316' },
                { key: 'gyroscope.y', name: 'Y-axis', color: '#8b5cf6' },
                { key: 'gyroscope.z', name: 'Z-axis', color: '#06b6d4' },
              ]}
              height={250}
              debug={debug}
            />
          </div>
        </div>
      </div>

      {/* Info Panel */}
      <div className="bg-blue-50 rounded-lg p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-blue-900 mb-3 sm:mb-4">About Device Motion</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 text-sm">
          <div>
            <h4 className="font-medium text-blue-900 mb-2">📱 Motion Sensors</h4>
            <p className="text-blue-700">
              Modern smartphones contain high-precision accelerometers and gyroscopes that 
              measure linear acceleration and angular velocity in three dimensions.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-blue-900 mb-2">🔬 Data Analysis</h4>
            <p className="text-blue-700">
              Combined accelerometer and gyroscope data enables motion detection, 
              gesture recognition, and device orientation tracking for various applications.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 