'use client';

import { useState, useEffect } from 'react';
import { ProcessedSensorData, SensorStatus, DashboardState } from '@/types/sensor';
import DashboardHeader from '@/components/DashboardHeader';
import TabNavigation, { SENSOR_TABS } from '@/components/TabNavigation';
import { hasRecentData } from '@/components/SensorChart';

// Import tab components
import OverviewTab from '@/components/tabs/OverviewTab';
import WatchSensorsTab from '@/components/tabs/WatchSensorsTab';
import DeviceMotionTab from '@/components/tabs/DeviceMotionTab';
import WristMotionTab from '@/components/tabs/WristMotionTab';
import OrientationTab from '@/components/tabs/OrientationTab';
import EnvironmentalTab from '@/components/tabs/EnvironmentalTab';
import RawDataTab from '@/components/tabs/RawDataTab';
import DiagnosticTab from '@/components/tabs/DiagnosticTab';

const POLLING_INTERVAL = 100; // 100ms to match your current setup

export default function Dashboard() {
  const [dashboardState, setDashboardState] = useState<DashboardState>({
    isConnected: false,
    currentSession: null,
    sensorStatuses: [],
    realtimeData: [],
    maxDataPoints: 500,
  });

  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState('diagnostics');
  const [debugMode, setDebugMode] = useState(false);

  // Fetch initial data and set up polling
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/data?limit=100');
        const result = await response.json();
        
        if (result.success && result.data) {
          // Convert timestamp strings back to Date objects
          const processedData = result.data.map((item: any) => ({
            ...item,
            timestamp: new Date(item.timestamp)
          }));
          
          setDashboardState(prev => ({
            ...prev,
            realtimeData: processedData,
            isConnected: true,
          }));
          
          // Update sensor statuses based on received data
          updateSensorStatuses(processedData);
          setLastUpdate(new Date());
        }
      } catch (error) {
        console.error('Failed to fetch sensor data:', error);
        setDashboardState(prev => ({ ...prev, isConnected: false }));
      }
    };

    // Initial fetch
    fetchData();

    // Set up polling
    const interval = setInterval(fetchData, POLLING_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  const updateSensorStatuses = (data: ProcessedSensorData[]) => {
    if (!data.length) return;

    const now = new Date();

    const statuses: SensorStatus[] = [
      {
        name: 'Accelerometer',
        isActive: hasRecentData(data, [{ key: 'accelerometer.x', name: 'X', color: '' }]),
        lastUpdate: now,
        dataPointsReceived: data.filter(d => d.accelerometer).length,
        color: '#ef4444',
      },
      {
        name: 'Gyroscope', 
        isActive: hasRecentData(data, [{ key: 'gyroscope.x', name: 'X', color: '' }]),
        lastUpdate: now,
        dataPointsReceived: data.filter(d => d.gyroscope).length,
        color: '#f97316',
      },
      {
        name: 'Magnetometer',
        isActive: hasRecentData(data, [{ key: 'magnetometer.magneticBearing', name: 'Bearing', color: '' }]),
        lastUpdate: now,
        dataPointsReceived: data.filter(d => d.magnetometer).length,
        color: '#8b5cf6',
      },
      {
        name: 'Orientation',
        isActive: hasRecentData(data, [{ key: 'orientation.yaw', name: 'Yaw', color: '' }]),
        lastUpdate: now,
        dataPointsReceived: data.filter(d => d.orientation).length,
        color: '#06b6d4',
      },
      {
        name: 'Wrist Motion',
        isActive: hasRecentData(data, [{ key: 'wristMotion.rotationRateX', name: 'Rotation X', color: '' }]),
        lastUpdate: now,
        dataPointsReceived: data.filter(d => d.wristMotion).length,
        color: '#10b981',
      },
      {
        name: 'Microphone',
        isActive: hasRecentData(data, [{ key: 'microphone.dBFS', name: 'dBFS', color: '' }]),
        lastUpdate: now,
        dataPointsReceived: data.filter(d => d.microphone).length,
        color: '#f59e0b',
      },
      {
        name: 'Gravity',
        isActive: hasRecentData(data, [{ key: 'gravity.x', name: 'X', color: '' }]),
        lastUpdate: now,
        dataPointsReceived: data.filter(d => d.gravity).length,
        color: '#6366f1',
      },
      // Watch-specific sensors
      {
        name: 'Heart Rate',
        isActive: hasRecentData(data, [{ key: 'heartRate.bpm', name: 'BPM', color: '' }]),
        lastUpdate: now,
        dataPointsReceived: data.filter(d => d.heartRate).length,
        color: '#ef4444',
      },
      {
        name: 'Location',
        isActive: hasRecentData(data, [{ key: 'location.latitude', name: 'Lat', color: '' }]),
        lastUpdate: now,
        dataPointsReceived: data.filter(d => d.location).length,
        color: '#22c55e',
      },
      {
        name: 'Barometer',
        isActive: hasRecentData(data, [{ key: 'barometer.pressure', name: 'Pressure', color: '' }]),
        lastUpdate: now,
        dataPointsReceived: data.filter(d => d.barometer).length,
        color: '#3b82f6',
      },
      {
        name: 'Watch Motion',
        isActive: hasRecentData(data, [{ key: 'watchMotion.x', name: 'X', color: '' }]),
        lastUpdate: now,
        dataPointsReceived: data.filter(d => d.watchMotion).length,
        color: '#8b5cf6',
      },
    ];

    setDashboardState(prev => ({ ...prev, sensorStatuses: statuses }));
  };

  const { realtimeData, sensorStatuses, isConnected } = dashboardState;

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab data={realtimeData} sensorStatuses={sensorStatuses} />;
      case 'watch-sensors':
        return <WatchSensorsTab data={realtimeData} />;
      case 'device-motion':
        return <DeviceMotionTab data={realtimeData} debug={debugMode} />;
      case 'wrist-motion':
        return <WristMotionTab data={realtimeData} />;
      case 'orientation':
        return <OrientationTab data={realtimeData} />;
      case 'environmental':
        return <EnvironmentalTab data={realtimeData} />;
      case 'raw-data':
        return <RawDataTab data={realtimeData} />;
      case 'diagnostics':
        return <DiagnosticTab data={realtimeData} />;
      default:
        return <OverviewTab data={realtimeData} sensorStatuses={sensorStatuses} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <DashboardHeader 
        isConnected={isConnected}
        lastUpdate={lastUpdate}
        dataPoints={realtimeData.length}
      />
      
      {/* Debug Controls */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-yellow-50 border-b border-yellow-200 px-4 sm:px-6 py-2">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
            <span className="text-sm text-yellow-700 font-medium">Debug Controls</span>
            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <label className="flex items-center space-x-2 text-sm text-yellow-700">
                <input
                  type="checkbox"
                  checked={debugMode}
                  onChange={(e) => setDebugMode(e.target.checked)}
                  className="rounded"
                />
                <span>Enable Debug Mode</span>
              </label>
              <button
                onClick={() => console.log('Current data:', realtimeData.slice(-5))}
                className="text-xs bg-yellow-200 text-yellow-800 px-3 py-2 rounded-md hover:bg-yellow-300 transition-colors w-full sm:w-auto"
              >
                Log Recent Data
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="flex-1">
        <TabNavigation
          tabs={SENSOR_TABS}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        >
          {renderTabContent()}
        </TabNavigation>
      </div>
    </div>
  );
} 