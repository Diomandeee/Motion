'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ProcessedSensorData } from '@/types/sensor';
import { format } from 'date-fns';

interface SensorConfig {
  key: string;
  name: string;
  color: string;
  strokeDasharray?: string;
}

interface SensorChartProps {
  data: ProcessedSensorData[];
  title: string;
  sensors: SensorConfig[];
  height?: number;
  className?: string;
  debug?: boolean;
}

function getNestedValue(obj: any, path: string): number | null {
  const keys = path.split('.');
  let value = obj;
  
  for (const key of keys) {
    if (value && typeof value === 'object' && key in value) {
      value = value[key];
    } else {
      return null;
    }
  }
  
  return typeof value === 'number' ? value : null;
}

function formatChartData(data: ProcessedSensorData[], sensors: SensorConfig[]) {
  return data.map((point, index) => {
    // Ensure timestamp is a Date object
    const timestamp = point.timestamp instanceof Date 
      ? point.timestamp 
      : new Date(point.timestamp);
    
    const chartPoint: any = {
      timestamp: timestamp.getTime(),
      time: format(timestamp, 'HH:mm:ss.SSS'),
      index,
    };
    
    sensors.forEach(sensor => {
      const value = getNestedValue(point, sensor.key);
      chartPoint[sensor.key] = value;
    });
    
    return chartPoint;
  });
}

export function hasRecentData(data: ProcessedSensorData[], sensors: SensorConfig[], timeWindowMs: number = 5000, debug: boolean = false) {
  if (!data.length) return false;
  
  // Be more generous with time windows to prevent bouncing
  const isWristMotion = sensors.some(sensor => sensor.key.includes('wristMotion'));
  const effectiveTimeWindow = isWristMotion ? 20000 : 15000; // 20s for wrist motion, 15s for others
  
  const now = new Date();
  const recentData = data.filter(point => {
    const timestamp = point.timestamp instanceof Date 
      ? point.timestamp 
      : new Date(point.timestamp);
    return (now.getTime() - timestamp.getTime()) <= effectiveTimeWindow;
  });
  
  // If we have any recent data points, assume the sensor is active
  // This prevents bouncing caused by strict field validation
  return recentData.length > 0;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="text-sm font-medium text-gray-900">{`Time: ${label}`}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {`${entry.name}: ${entry.value?.toFixed(4) || 'N/A'}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function SensorChart({ 
  data, 
  title, 
  sensors, 
  height = 300, 
  className = '',
  debug = false
}: SensorChartProps) {
  const chartData = formatChartData(data, sensors);
  
  // Enhanced debug logging
  if (debug || process.env.NODE_ENV === 'development') {
    console.log(`🎯 SensorChart "${title}":`, {
      totalDataPoints: data.length,
      sensors: sensors.map(s => s.key),
      lastDataPoint: data.length > 0 ? data[data.length - 1] : null,
      chartDataLength: chartData.length
    });
  }

  // Check if ANY of our target sensors have data in recent points (more lenient)
  const sensorsWithData = sensors.filter(sensor => {
    return data.some(point => {
      const value = getNestedValue(point, sensor.key);
      const hasValue = value !== null && value !== undefined && !isNaN(value);
      if (hasValue && debug) {
        console.log(`✅ Found data for ${sensor.key}: ${value}`);
      }
      return hasValue;
    });
  });

  const hasAnySensorData = sensorsWithData.length > 0;

  // Check if we have recent data (last 30 seconds)
  const hasRecentData = data.length > 0 && data.some(point => {
    const timestamp = point.timestamp instanceof Date 
      ? point.timestamp 
      : new Date(point.timestamp);
    return (Date.now() - timestamp.getTime()) <= 30000; // 30 seconds
  });
  
  if (debug || process.env.NODE_ENV === 'development') {
    console.log(`📊 Chart "${title}" status:`, {
      hasRecentData,
      hasAnySensorData,
      sensorsWithData: sensorsWithData.map(s => s.key),
      totalSensors: sensors.length,
      willShowChart: hasRecentData && hasAnySensorData
    });
  }
  
  // Show chart if we have recent data AND at least one sensor has data
  if (!hasRecentData || !hasAnySensorData) {
    const missingReason = !hasRecentData 
      ? 'No recent data received' 
      : `No data for any of ${sensors.length} configured sensors`;
    
    return (
      <div className={`flex items-center justify-center h-32 ${className}`}>
        <div className="text-center px-4">
          <div className="text-gray-400 text-lg mb-2">📊</div>
          <p className="text-gray-500 text-sm">Waiting for {title.toLowerCase()} data...</p>
          {debug && (
            <p className="text-xs text-gray-400 mt-1">{missingReason}</p>
          )}
        </div>
      </div>
    );
  }

  // Responsive height and font sizes
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const responsiveHeight = isMobile ? Math.max(height * 0.8, 200) : height;

  return (
    <div className={`w-full ${className}`}>
      <ResponsiveContainer width="100%" height={responsiveHeight}>
        <LineChart
          data={chartData}
          margin={{
            top: 5,
            right: isMobile ? 15 : 30,
            left: isMobile ? 10 : 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="time"
            stroke="#6b7280"
            fontSize={isMobile ? 10 : 12}
            tickMargin={5}
            interval="preserveStartEnd"
            angle={isMobile ? -45 : 0}
            textAnchor={isMobile ? 'end' : 'middle'}
            height={isMobile ? 60 : 30}
          />
          <YAxis 
            stroke="#6b7280"
            fontSize={isMobile ? 10 : 12}
            tickMargin={5}
            tickFormatter={(value) => value.toFixed(isMobile ? 1 : 2)}
            width={isMobile ? 35 : 50}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={{ 
              paddingTop: '10px',
              fontSize: isMobile ? '12px' : '14px'
            }}
            iconType="line"
            layout={isMobile ? 'horizontal' : 'horizontal'}
            align="center"
            verticalAlign="bottom"
          />
          
          {/* Only render lines for sensors that have data */}
          {sensorsWithData.map((sensor, index) => (
            <Line
              key={sensor.key}
              type="monotone"
              dataKey={sensor.key}
              stroke={sensor.color}
              strokeWidth={isMobile ? 1.5 : 2}
              strokeDasharray={sensor.strokeDasharray}
              dot={false}
              name={sensor.name}
              connectNulls={false}
              animationDuration={300}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
      
      {/* Enhanced chart info */}
      <div className="mt-2 flex flex-col sm:flex-row sm:justify-between sm:items-center text-xs text-gray-500 space-y-1 sm:space-y-0">
        <span>
          {chartData.length} data points • {sensorsWithData.length}/{sensors.length} sensors active
        </span>
        <span className="text-right">
          Last updated: {data.length > 0 ? format(data[data.length - 1].timestamp instanceof Date ? data[data.length - 1].timestamp : new Date(data[data.length - 1].timestamp), 'HH:mm:ss') : 'Never'}
        </span>
      </div>
    </div>
  );
} 