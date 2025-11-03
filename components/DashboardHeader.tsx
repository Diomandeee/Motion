'use client';

import { useState, useEffect } from 'react';
import { Wifi, WifiOff, Database, Clock, Activity, ChevronDown, ChevronUp } from 'lucide-react';
import { format } from 'date-fns';
import { SensorStatus } from '@/types/sensor';

interface DashboardHeaderProps {
  isConnected: boolean;
  lastUpdate: Date;
  totalDataPoints: number;
  sensorStatuses: SensorStatus[];
}

export default function DashboardHeader({ 
  isConnected, 
  lastUpdate, 
  totalDataPoints,
  sensorStatuses 
}: DashboardHeaderProps) {
  const [mounted, setMounted] = useState(false);
  const [showMobileDetails, setShowMobileDetails] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent hydration mismatch by only showing time after client mount
  const displayTime = mounted ? format(lastUpdate, 'HH:mm:ss') : '--:--:--';
  const displaySession = mounted ? format(lastUpdate, 'MMM dd, HH:mm') : 'Loading...';

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and title */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-lg">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-bold text-gray-900 truncate">
                Sensor Dashboard
              </h1>
              <p className="text-sm text-gray-500 hidden sm:block">
                Real-time monitoring & visualization
              </p>
            </div>
          </div>

          {/* Desktop Status indicators */}
          <div className="hidden lg:flex items-center space-x-6">
            
            {/* Connection Status */}
            <div className="flex items-center space-x-2">
              {isConnected ? (
                <>
                  <div className="flex items-center space-x-1">
                    <Wifi className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-700">Connected</span>
                  </div>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                </>
              ) : (
                <>
                  <div className="flex items-center space-x-1">
                    <WifiOff className="w-4 h-4 text-red-500" />
                    <span className="text-sm font-medium text-red-600">Disconnected</span>
                  </div>
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                </>
              )}
            </div>

            {/* Data Points */}
            <div className="flex items-center space-x-2 text-gray-600">
              <Database className="w-4 h-4" />
              <div className="text-sm">
                <span className="font-medium">{totalDataPoints.toLocaleString()}</span>
                <span className="text-gray-500 ml-1">points</span>
              </div>
            </div>

            {/* Last Update */}
            <div className="flex items-center space-x-2 text-gray-600">
              <Clock className="w-4 h-4" />
              <div className="text-sm">
                <span className="text-gray-500">Updated:</span>
                <span className="font-medium ml-1" suppressHydrationWarning>
                  {displayTime}
                </span>
              </div>
            </div>

            {/* Live indicator */}
            {isConnected && (
              <div className="flex items-center space-x-2 px-3 py-1 bg-green-50 rounded-full border border-green-200">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-green-700">LIVE</span>
              </div>
            )}
          </div>

          {/* Mobile Status Toggle */}
          <div className="lg:hidden flex items-center space-x-2">
            {/* Connection Status - Compact */}
            <div className="flex items-center space-x-1">
              {isConnected ? (
                <>
                  <Wifi className="w-4 h-4 text-green-600" />
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                </>
              ) : (
                <>
                  <WifiOff className="w-4 h-4 text-red-500" />
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                </>
              )}
            </div>

            {/* Toggle Button */}
            <button
              onClick={() => setShowMobileDetails(!showMobileDetails)}
              className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              {showMobileDetails ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Details Panel */}
        {showMobileDetails && (
          <div className="lg:hidden pb-4 border-t border-gray-100 mt-2 pt-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center space-x-2 text-gray-600">
                <Database className="w-4 h-4" />
                <div>
                  <span className="font-medium">{totalDataPoints.toLocaleString()}</span>
                  <span className="text-gray-500 ml-1">points</span>
                </div>
              </div>

              <div className="flex items-center space-x-2 text-gray-600">
                <Clock className="w-4 h-4" />
                <div>
                  <span className="text-gray-500">Updated:</span>
                  <span className="font-medium ml-1" suppressHydrationWarning>
                    {displayTime}
                  </span>
                </div>
              </div>
            </div>

            {/* Connection Status Full */}
            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {isConnected ? (
                  <>
                    <div className="flex items-center space-x-1">
                      <Wifi className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-green-700">Connected</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center space-x-1">
                      <WifiOff className="w-4 h-4 text-red-500" />
                      <span className="text-sm font-medium text-red-600">Disconnected</span>
                    </div>
                  </>
                )}
              </div>

              {/* Live indicator */}
              {isConnected && (
                <div className="flex items-center space-x-2 px-3 py-1 bg-green-50 rounded-full border border-green-200">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-green-700">LIVE</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Sub-header with quick stats - Desktop only */}
      <div className="bg-gray-50 border-t border-gray-200 hidden sm:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center space-x-4 lg:space-x-6 text-xs text-gray-600 overflow-x-auto">
              <span className="whitespace-nowrap">📱 Device Motion</span>
              <span className="whitespace-nowrap">⌚ Wrist Sensors</span>
              <span className="whitespace-nowrap">🧭 Orientation</span>
              <span className="whitespace-nowrap">🎤 Audio</span>
              <span className="whitespace-nowrap">🧲 Magnetic Field</span>
            </div>
            
            <div className="text-xs text-gray-500 whitespace-nowrap ml-4" suppressHydrationWarning>
              Update Rate: ~10Hz | Session: {displaySession}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
} 