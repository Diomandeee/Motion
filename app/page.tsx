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

// Episode 1: Two-Device Fusion
import Episode1Panel from '@/components/Episode1Panel';

const POLLING_INTERVAL = 100;

interface DatabaseStats {
  devices: number;
  sessions: number;
  rawReadings: number;
  processedData: number;
  lastUpdated: string;
  source: 'database' | 'memory';
}

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
  const [dbStats, setDbStats] = useState<DatabaseStats | null>(null);

  // Fetch database statistics
  const fetchDbStats = async () => {
    try {
      const response = await fetch('/api/test-db');
      const result = await response.json();
      
      if (result.success) {
        setDbStats({
          devices: result.counts.devices,
          sessions: result.counts.sessions,
          rawReadings: result.counts.rawReadings,
          processedData: result.counts.processedData,
          lastUpdated: result.timestamp,
          source: 'database',
        });
      }
    } catch (error) {
      console.warn('Could not fetch database stats:', error);
    }
  };

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
          
          // Update database stats if data source is database
          if (result.source === 'database') {
            setDbStats(prev => prev ? {
              ...prev,
              source: 'database',
              lastUpdated: result.timestamp,
            } : null);
          }
        }
      } catch (error) {
        console.error('Failed to fetch sensor data:', error);
        setDashboardState(prev => ({ ...prev, isConnected: false }));
      }
    };

    // Initial fetch
    fetchData();
    fetchDbStats();

    // Set up polling
    const interval = setInterval(fetchData, POLLING_INTERVAL);
    const dbStatsInterval = setInterval(fetchDbStats, 5000); // Update DB stats every 5 seconds

    return () => {
      clearInterval(interval);
      clearInterval(dbStatsInterval);
    };
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

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab data={realtimeData} sensorStatuses={sensorStatuses} />;
      case 'watchSensors':
        return <WatchSensorsTab data={realtimeData} />;
      case 'deviceMotion':
        return <DeviceMotionTab data={realtimeData} />;
      case 'wristMotion':
        return <WristMotionTab data={realtimeData} />;
      case 'orientation':
        return <OrientationTab data={realtimeData} />;
      case 'environmental':
        return <EnvironmentalTab data={realtimeData} />;
      case 'rawData':
        return <RawDataTab data={realtimeData} />;
      case 'diagnostics':
        return <DiagnosticTab data={realtimeData} />;
      default:
        return <DiagnosticTab data={realtimeData} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <DashboardHeader 
        isConnected={isConnected}
        sensorStatuses={sensorStatuses}
        totalDataPoints={realtimeData.length}
        lastUpdate={lastUpdate}
      />

      {/* Database Status Panel */}
      {dbStats && (
        <div className="bg-white border-b border-gray-200 px-4 py-2">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="font-medium">Database: Connected</span>
              </div>
              <div className="text-gray-600">
                📦 Devices: <span className="font-medium">{dbStats.devices}</span>
              </div>
              <div className="text-gray-600">
                🔄 Sessions: <span className="font-medium">{dbStats.sessions}</span>
              </div>
              <div className="text-gray-600">
                📊 Raw Data: <span className="font-medium">{dbStats.rawReadings.toLocaleString()}</span>
              </div>
              <div className="text-gray-600">
                ⚡ Processed: <span className="font-medium">{dbStats.processedData.toLocaleString()}</span>
              </div>
              <div className="text-gray-500 text-xs ml-auto">
                Storage: {dbStats.source === 'database' ? '🗄️ Persistent' : '💾 Memory'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Debug Controls */}
      {debugMode && (
        <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-3">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <span className="font-medium text-yellow-800">🔧 Debug Mode</span>
              <span className="text-yellow-700">
                Buffer Size: {realtimeData.length} | Active Sensors: {sensorStatuses.filter(s => s.isActive).length}
              </span>
              <button
                onClick={() => fetchDbStats()}
                className="px-3 py-1 bg-yellow-200 text-yellow-800 rounded text-xs hover:bg-yellow-300"
              >
                Refresh DB Stats
              </button>
              <button
                onClick={() => setDebugMode(false)}
                className="px-3 py-1 bg-yellow-200 text-yellow-800 rounded text-xs hover:bg-yellow-300"
              >
                Disable Debug
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex">
        {/* Navigation */}
        <TabNavigation 
          tabs={SENSOR_TABS}
          activeTab={activeTab} 
          onTabChange={setActiveTab}
        />

        {/* Main Content */}
        <div className="flex-1 lg:ml-64">
          <main className="p-6">
            {/* Debug Toggle Button */}
            {!debugMode && (
              <div className="mb-4">
                <button
                  onClick={() => setDebugMode(true)}
                  className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-xs hover:bg-gray-300"
                >
                  Enable Debug Mode
                </button>
              </div>
            )}
            
            {renderContent()}
          </main>
        </div>
      </div>
    </div>
  );
} 