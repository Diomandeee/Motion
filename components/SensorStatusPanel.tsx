'use client';

import { SensorStatus } from '@/types/sensor';
import { CheckCircle, XCircle, Clock, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';

interface SensorStatusPanelProps {
  statuses: SensorStatus[];
}

function StatusIndicator({ isActive }: { isActive: boolean }) {
  return isActive ? (
    <CheckCircle className="w-4 h-4 text-green-500" />
  ) : (
    <XCircle className="w-4 h-4 text-gray-400" />
  );
}

function SensorCard({ status }: { status: SensorStatus }) {
  const { name, isActive, lastUpdate, dataPointsReceived, frequency, color } = status;
  
  return (
    <div className={`
      relative p-4 rounded-lg border transition-all duration-200
      ${isActive 
        ? 'bg-white border-gray-200 shadow-sm hover:shadow-md' 
        : 'bg-gray-50 border-gray-100'
      }
    `}>
      {/* Color indicator */}
      <div 
        className="absolute top-0 left-0 w-1 h-full rounded-l-lg"
        style={{ backgroundColor: isActive ? color : '#d1d5db' }}
      />
      
      <div className="ml-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <StatusIndicator isActive={isActive} />
            <h4 className={`font-medium ${isActive ? 'text-gray-900' : 'text-gray-500'}`}>
              {name}
            </h4>
          </div>
          
          {isActive && (
            <div className="flex items-center space-x-1 text-xs text-gray-500">
              <TrendingUp className="w-3 h-3" />
              <span>{frequency ? `${frequency.toFixed(1)}Hz` : 'Active'}</span>
            </div>
          )}
        </div>
        
        <div className="mt-2 grid grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-gray-500">Data Points:</span>
            <div className={`font-medium ${isActive ? 'text-gray-900' : 'text-gray-500'}`}>
              {dataPointsReceived.toLocaleString()}
            </div>
          </div>
          
          <div>
            <span className="text-gray-500">Last Update:</span>
            <div className={`font-medium ${isActive ? 'text-gray-900' : 'text-gray-500'}`}>
              {format(lastUpdate, 'HH:mm:ss')}
            </div>
          </div>
        </div>
        
        {isActive && (
          <div className="mt-2">
            <div className="w-full bg-gray-200 rounded-full h-1">
              <div 
                className="h-1 rounded-full transition-all duration-300"
                style={{ 
                  backgroundColor: color,
                  width: `${Math.min(100, (dataPointsReceived / 100) * 100)}%` 
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SensorStatusPanel({ statuses }: SensorStatusPanelProps) {
  const activeSensors = statuses.filter(s => s.isActive);
  const totalDataPoints = statuses.reduce((sum, s) => sum + s.dataPointsReceived, 0);
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Sensor Status</h2>
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-gray-600">{activeSensors.length} Active</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">{totalDataPoints.toLocaleString()} Total Points</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="p-6">
        {statuses.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 text-4xl mb-2">📱</div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No Sensor Data</h3>
            <p className="text-gray-500">Start sending data from your sensor logger to see status here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {statuses.map((status) => (
              <SensorCard key={status.name} status={status} />
            ))}
          </div>
        )}
        
        {activeSensors.length > 0 && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-blue-900">
                Real-time monitoring active
              </span>
            </div>
            <p className="text-xs text-blue-700 mt-1">
              Receiving data from {activeSensors.length} sensor{activeSensors.length !== 1 ? 's' : ''} 
              at ~10Hz update rate
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 