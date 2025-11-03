'use client';

import { useEffect, useState } from 'react';
import { Smartphone } from 'lucide-react';

interface DeviceInfo {
  deviceId: string;
  count: number;
  lastSeen: string;
}

export default function DeviceIdentifier() {
  const [devices, setDevices] = useState<DeviceInfo[]>([]);

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const response = await fetch('/api/data?limit=100');
        const result = await response.json();
        
        if (result.success && result.data) {
          // Group by device ID
          const deviceMap = new Map<string, DeviceInfo>();
          
          result.data.forEach((item: any) => {
            const deviceId = item.deviceId || 'unknown';
            
            if (!deviceMap.has(deviceId)) {
              deviceMap.set(deviceId, {
                deviceId,
                count: 0,
                lastSeen: item.timestamp,
              });
            }
            
            const info = deviceMap.get(deviceId)!;
            info.count++;
            
            // Update last seen if newer
            if (item.timestamp > info.lastSeen) {
              info.lastSeen = item.timestamp;
            }
          });
          
          setDevices(Array.from(deviceMap.values()));
        }
      } catch (error) {
        console.error('Failed to fetch devices:', error);
      }
    };

    fetchDevices();
    const interval = setInterval(fetchDevices, 5000); // Update every 5s
    
    return () => clearInterval(interval);
  }, []);

  if (devices.length === 0) {
    return null;
  }

  const getDeviceRole = (deviceId: string): string => {
    const id = deviceId.toLowerCase();
    if (id.includes('left')) return 'LEFT';
    if (id.includes('right')) return 'RIGHT';
    return '?';
  };

  const getDeviceColor = (deviceId: string): string => {
    const role = getDeviceRole(deviceId);
    if (role === 'LEFT') return 'bg-blue-500';
    if (role === 'RIGHT') return 'bg-red-500';
    return 'bg-gray-500';
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4 mb-4">
      <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
        <Smartphone className="w-4 h-4" />
        Connected Devices ({devices.length})
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {devices.map((device) => (
          <div key={device.deviceId} className="bg-gray-700 rounded p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${getDeviceColor(device.deviceId)}`} />
                <span className="font-semibold text-sm">
                  {getDeviceRole(device.deviceId)} POCKET
                </span>
              </div>
              <span className="text-xs text-gray-400">{device.count} pts</span>
            </div>
            
            <div className="text-xs text-gray-400">
              ID: {device.deviceId}
            </div>
            
            <div className="text-xs text-gray-500 mt-1">
              Last: {new Date(device.lastSeen).toLocaleTimeString()}
            </div>
          </div>
        ))}
      </div>
      
      {devices.length === 1 && (
        <div className="mt-3 p-2 bg-yellow-900/30 border border-yellow-700/50 rounded text-xs text-yellow-300">
          ⚠️ Single device detected. For Episode 1 two-device fusion, configure second phone with different deviceId
        </div>
      )}
    </div>
  );
}

