'use client';

import { ProcessedSensorData } from '@/types/sensor';
import SensorChart from '@/components/SensorChart';
import { Settings, Wrench } from 'lucide-react';

interface RawDataTabProps {
  data: ProcessedSensorData[];
}

export default function RawDataTab({ data }: RawDataTabProps) {
  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <div className="p-3 bg-gray-100 rounded-lg">
          <Settings className="w-8 h-8 text-gray-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Raw Sensor Data</h2>
          <p className="text-gray-600">
            Uncalibrated sensor readings directly from hardware
          </p>
        </div>
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        
        {/* Raw Motion */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <Wrench className="w-5 h-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">Uncalibrated Motion</h3>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Raw accelerometer and gyroscope data
            </p>
          </div>
          <div className="p-6">
            <SensorChart
              data={data}
              title="Raw Motion Sensors"
              sensors={[
                { key: 'accelerometerUncalibrated.x', name: 'Raw Accel X', color: '#ef4444' },
                { key: 'accelerometerUncalibrated.y', name: 'Raw Accel Y', color: '#22c55e' },
                { key: 'accelerometerUncalibrated.z', name: 'Raw Accel Z', color: '#3b82f6' },
                { key: 'gyroscopeUncalibrated.x', name: 'Raw Gyro X', color: '#f97316', strokeDasharray: '5 5' },
                { key: 'gyroscopeUncalibrated.y', name: 'Raw Gyro Y', color: '#8b5cf6', strokeDasharray: '5 5' },
                { key: 'gyroscopeUncalibrated.z', name: 'Raw Gyro Z', color: '#06b6d4', strokeDasharray: '5 5' },
              ]}
              height={400}
            />
          </div>
        </div>

        {/* Raw Magnetic */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <Settings className="w-5 h-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">Uncalibrated Magnetometer</h3>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Raw magnetic field measurements
            </p>
          </div>
          <div className="p-6">
            <SensorChart
              data={data}
              title="Raw Magnetometer"
              sensors={[
                { key: 'magnetometerUncalibrated.x', name: 'Raw Mag X', color: '#8b5cf6' },
                { key: 'magnetometerUncalibrated.y', name: 'Raw Mag Y', color: '#06b6d4' },
                { key: 'magnetometerUncalibrated.z', name: 'Raw Mag Z', color: '#f59e0b' },
              ]}
              height={400}
            />
          </div>
        </div>
      </div>

      {/* Info Panel */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">About Raw Sensor Data</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">🔧 Uncalibrated Data</h4>
            <p className="text-gray-600">
              Raw sensor readings without calibration, bias removal, or filtering. 
              These values reflect the direct hardware output.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">⚙️ Use Cases</h4>
            <p className="text-gray-600">
              Useful for sensor calibration, bias analysis, noise characterization, 
              and understanding sensor behavior at the hardware level.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 