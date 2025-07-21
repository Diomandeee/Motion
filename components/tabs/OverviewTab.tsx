'use client';

import { ProcessedSensorData, SensorStatus } from '@/types/sensor';
import { Activity, TrendingUp, Zap } from 'lucide-react';

interface OverviewTabProps {
  data: ProcessedSensorData[];
  sensorStatuses: SensorStatus[];
}

function MetricCard({ 
  title, 
  value, 
  unit, 
  color, 
  icon: Icon, 
  trend 
}: {
  title: string;
  value: number;
  unit: string;
  color: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: 'up' | 'down' | 'stable';
}) {
  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold mt-1" style={{ color }}>
            {value.toFixed(3)}
            <span className="text-sm font-normal text-gray-500 ml-1">{unit}</span>
          </p>
        </div>
        <div className="p-3 rounded-full" style={{ backgroundColor: `${color}20` }}>
          <div style={{ color: color }}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </div>
      
      {trend && (
        <div className="mt-4 flex items-center text-xs">
          <TrendingUp className={`w-4 h-4 mr-1 ${
            trend === 'up' ? 'text-green-500' : 
            trend === 'down' ? 'text-red-500' : 
            'text-gray-400'
          }`} />
          <span className="text-gray-600">
            {trend === 'up' ? 'Increasing' : 
             trend === 'down' ? 'Decreasing' : 
             'Stable'}
          </span>
        </div>
      )}
    </div>
  );
}

function SensorStatusGrid({ statuses }: { statuses: SensorStatus[] }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {statuses.map((status) => (
        <div
          key={status.name}
          className={`p-4 rounded-lg border transition-all duration-200 ${
            status.isActive
              ? 'bg-white border-green-200 shadow-sm'
              : 'bg-gray-50 border-gray-200'
          }`}
        >
          <div className="flex items-center space-x-2">
            <div
              className={`w-3 h-3 rounded-full ${
                status.isActive ? 'bg-green-500 animate-pulse' : 'bg-gray-300'
              }`}
            />
            <span className={`text-sm font-medium ${
              status.isActive ? 'text-gray-900' : 'text-gray-500'
            }`}>
              {status.name}
            </span>
          </div>
          <div className="mt-2 text-xs text-gray-600">
            {status.dataPointsReceived.toLocaleString()} points
          </div>
        </div>
      ))}
    </div>
  );
}

export default function OverviewTab({ data, sensorStatuses }: OverviewTabProps) {
  const latestData = data.length > 0 ? data[data.length - 1] : null;
  const activeSensors = sensorStatuses.filter(s => s.isActive);
  const totalDataPoints = sensorStatuses.reduce((sum, s) => sum + s.dataPointsReceived, 0);

  // Calculate some interesting metrics from the latest data
  const metrics = latestData ? [
    {
      title: 'Total Acceleration',
      value: latestData.accelerometer 
        ? Math.sqrt(
            Math.pow(latestData.accelerometer.x, 2) + 
            Math.pow(latestData.accelerometer.y, 2) + 
            Math.pow(latestData.accelerometer.z, 2)
          )
        : 0,
      unit: 'm/s²',
      color: '#ef4444',
      icon: Activity,
    },
    {
      title: 'Angular Velocity',
      value: latestData.gyroscope
        ? Math.sqrt(
            Math.pow(latestData.gyroscope.x, 2) + 
            Math.pow(latestData.gyroscope.y, 2) + 
            Math.pow(latestData.gyroscope.z, 2)
          )
        : 0,
      unit: 'rad/s',
      color: '#f97316',
      icon: Zap,
    },
    {
      title: 'Magnetic Bearing',
      value: latestData.magnetometer?.magneticBearing || 0,
      unit: '°',
      color: '#8b5cf6',
      icon: Activity,
    },
    {
      title: 'Audio Level',
      value: latestData.microphone?.dBFS || 0,
      unit: 'dBFS',
      color: '#f59e0b',
      icon: Activity,
    }
  ] : [];

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Sensor Overview</h2>
        <p className="text-gray-600">
          Real-time summary of all sensor data and system status
        </p>
      </div>

      {/* Key Metrics */}
      {latestData && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Readings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {metrics.map((metric, index) => (
              <MetricCard key={index} {...metric} />
            ))}
          </div>
        </div>
      )}

      {/* System Status */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{activeSensors.length}</div>
              <div className="text-sm text-gray-500 mt-1">Active Sensors</div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{totalDataPoints.toLocaleString()}</div>
              <div className="text-sm text-gray-500 mt-1">Total Data Points</div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">10Hz</div>
              <div className="text-sm text-gray-500 mt-1">Update Rate</div>
            </div>
          </div>
        </div>
      </div>

      {/* Sensor Status Grid */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Sensor Status</h3>
        <SensorStatusGrid statuses={sensorStatuses} />
      </div>

      {/* Session Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">Session Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-blue-700">Data Points:</span>
            <div className="font-medium text-blue-900">{data.length}</div>
          </div>
          <div>
            <span className="text-blue-700">Active Duration:</span>
            <div className="font-medium text-blue-900">
              {data.length > 0 ? `${Math.round(data.length / 10)}s` : 'N/A'}
            </div>
          </div>
          <div>
            <span className="text-blue-700">Memory Usage:</span>
            <div className="font-medium text-blue-900">
              {Math.round((data.length * 0.5) / 1024)}KB
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 