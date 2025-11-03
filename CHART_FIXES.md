# Dashboard Chart Visibility Fixes

## PROBLEM
Data is streaming (100 points, 10Hz) but lines are not visible in charts.

## ROOT CAUSE
Values are very small (0.00 to 0.27 range) - lines exist but too thin/flat to see.

## FIXES FOR web/Motion

### Fix 1: Increase Line Width in SensorChart.tsx

FILE: `components/SensorChart.tsx`

Find the line configuration and update:

```typescript
// BEFORE:
stroke={color}
strokeWidth={1}

// AFTER:
stroke={color}
strokeWidth={2.5}  // Thicker lines
strokeOpacity={0.9}  // More visible
```

### Fix 2: Better Auto-Scaling

In `SensorChart.tsx`, update domain calculation:

```typescript
// Add padding to Y-axis domain
const values = data.map(d => d[dataKey]);
const min = Math.min(...values);
const max = Math.max(...values);
const padding = (max - min) * 0.1 || 0.1;  // 10% padding or minimum 0.1

<YAxis 
  domain={[min - padding, max + padding]}
  tickFormatter={(value) => value.toFixed(3)}  // More precision
/>
```

### Fix 3: Add Magnitude Chart for Better Visibility

Create a new chart that shows MAGNITUDE instead of X/Y/Z separately:

```typescript
// In DeviceMotionTab.tsx or similar
const magnitude = data.map(d => {
  const accel = d.accelerometer;
  if (!accel) return { time: d.timestamp, mag: 0 };
  
  const mag = Math.sqrt(
    accel.x * accel.x + 
    accel.y * accel.y + 
    accel.z * accel.z
  );
  
  return { time: d.timestamp, mag };
});

<LineChart data={magnitude}>
  <Line 
    dataKey="mag" 
    stroke="#8b5cf6" 
    strokeWidth={3}  // Thick line
    dot={false}
  />
</LineChart>
```

### Fix 4: Color Enhancement

Make lines more visible:

```typescript
const BRIGHT_COLORS = {
  x: '#ef4444',  // Bright red
  y: '#22c55e',  // Bright green  
  z: '#3b82f6',  // Bright blue
};

<Line 
  dataKey="accelerometer.x"
  stroke={BRIGHT_COLORS.x}
  strokeWidth={2.5}
  dot={false}
  isAnimationActive={false}  // Disable animation for smoother realtime
/>
```

### Fix 5: Add Grid and Reference Lines

```typescript
<CartesianGrid 
  strokeDasharray="3 3" 
  stroke="#374151"
  opacity={0.3}
/>

<ReferenceLine 
  y={0} 
  stroke="#6b7280" 
  strokeWidth={2}
  strokeDasharray="5 5"
  label="Zero"
/>
```

## QUICK FIX (Minimal Changes)

If you just want to see the data NOW, edit ONE file:

**FILE: `components/SensorChart.tsx`**

Change these TWO lines:
```typescript
strokeWidth={1}      →    strokeWidth={3}
strokeOpacity={0.7}  →    strokeOpacity={1.0}
```

Save, refresh dashboard. Lines should be visible!

## TESTING

After fixes:
1. Refresh dashboard (Cmd+R)
2. Lines should be thick and visible
3. Data should update smoothly at 10Hz
4. All sensor charts populated

## For Episode 1 Integration

Once charts are visible, add DeviceIdentifier component to show which device is which:

**FILE: `app/page.tsx`**

Add after imports:
```typescript
import DeviceIdentifier from '@/components/DeviceIdentifier';
```

Add in render (before Episode1Panel):
```tsx
<DeviceIdentifier />
<Episode1Panel />
```

This will show:
- 🔵 LEFT POCKET device
- 🔴 RIGHT POCKET device
- Data point counts
- Last update times

