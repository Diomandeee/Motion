# 📊 Real-time Sensor Dashboard

A modern, intuitive Next.js application for monitoring and visualizing sensor data in real-time. Built specifically for comprehensive sensor logging with support for accelerometer, gyroscope, magnetometer, orientation, wrist motion, and audio sensors.

## ✨ Features

### 🎯 **Intuitive Dashboard Design**
- **Real-time visualization** of all sensor types
- **Responsive layout** that works on all devices
- **Color-coded sensors** for easy identification
- **Live status indicators** showing connection and data flow

### 📱 **Comprehensive Sensor Support**
- **Device Motion**: Accelerometer, Gyroscope, Gravity
- **Wrist Motion**: Apple Watch/WearOS sensors 
- **Orientation**: Euler angles and Quaternions
- **Environmental**: Magnetometer, Compass, Microphone
- **Raw Data**: Uncalibrated sensor variants

### ⚡ **Real-time Performance**
- **100ms update rate** matching your Sensor Logger
- **Efficient data processing** and visualization
- **Live charts** with smooth animations
- **Automatic data buffering** (configurable limits)

### 🔧 **Developer Friendly**
- **TypeScript** for full type safety
- **Prisma** for database management
- **Tailwind CSS** for responsive styling
- **Modern React** with hooks and components

## 🚀 Quick Start

### 1. **Install Dependencies**
```bash
npm install
# or
yarn install
```

### 2. **Set Up Database**
```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push
```

### 3. **Start Development Server**
```bash
npm run dev
# or
yarn dev
```

Your dashboard will be available at `http://localhost:3000`

### 4. **Update Sensor Logger**
Change your Sensor Logger URL from:
```
http://192.168.1.35:8000/data
```
To:
```
http://192.168.1.35:3000/api/data
```

## 📊 Dashboard Overview

### **Header Section**
- **Connection Status**: Live/Disconnected indicator
- **Data Statistics**: Total data points received
- **Last Update**: Real-time timestamp
- **Session Info**: Current monitoring session

### **Sensor Status Panel**
- **Visual indicators** for each sensor type
- **Data point counts** per sensor
- **Activity status** with color coding
- **Real-time monitoring** confirmation

### **Chart Sections**

#### 📱 **Device Motion**
- Accelerometer (X, Y, Z) - solid lines
- Gyroscope (X, Y, Z) - dashed lines
- Gravity vector components

#### ⌚ **Wrist Motion** (Apple Watch/WearOS)
- Rotation rates (X, Y, Z)
- Wrist acceleration (X, Y, Z)
- Quaternion and gravity data

#### 🧭 **Orientation & Attitude**
- Euler angles (Yaw, Pitch, Roll)
- Quaternion components (Qw, Qx, Qy, Qz)

#### 🌍 **Environmental Sensors**
- Magnetometer bearing
- Compass bearing
- Microphone dBFS levels

## 🔧 Configuration

### **Data Retention**
```typescript
// In app/api/data/route.ts
const MAX_BUFFER_SIZE = 1000; // Adjust buffer size
```

### **Update Frequency**
```typescript
// In app/page.tsx
const POLLING_INTERVAL = 100; // 100ms (10Hz)
```

### **Chart Colors**
```typescript
// In tailwind.config.js
sensor: {
  accelerometer: '#ef4444', // red
  gyroscope: '#f97316',     // orange  
  magnetometer: '#8b5cf6',  // purple
  // ... customize colors
}
```

## 📁 Project Structure

```
sensor-dashboard/
├── app/                    # Next.js 14 App Router
│   ├── api/data/          # Sensor data ingestion
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx          # Main dashboard
├── components/            # React components
│   ├── SensorChart.tsx    # Chart visualization
│   ├── SensorStatusPanel.tsx
│   └── DashboardHeader.tsx
├── types/                 # TypeScript definitions
│   └── sensor.ts         # Sensor data types
├── prisma/               # Database schema
│   └── schema.prisma     # Prisma schema
└── data/                 # Sensor data files
```

## 🔗 API Endpoints

### **POST /api/data**
Receives sensor data from Sensor Logger
- **Input**: Raw JSON sensor data
- **Output**: Processing confirmation
- **Auto-saves**: Raw data to `/data` directory

### **GET /api/data**
Retrieves recent sensor data
- **Query**: `?limit=100` (optional)
- **Output**: Processed sensor data array

## 📈 Data Flow

```
Sensor Logger → Next.js API → Processing → Database + Files → Real-time Dashboard
```

1. **Sensor Logger** sends JSON data every 100ms
2. **API Route** processes and saves data
3. **Dashboard** polls for updates and displays charts
4. **Real-time updates** maintain live visualization

## 🎨 Customization

### **Add New Sensor Types**
1. Update `types/sensor.ts` with new interfaces
2. Add processing logic in `app/api/data/route.ts`
3. Create chart configuration in dashboard
4. Add status tracking and colors

### **Modify Chart Appearance**
- Colors defined in `tailwind.config.js`
- Chart configuration in `SensorChart.tsx`
- Layout adjustments in `app/page.tsx`

## 🚀 Deployment

### **Vercel (Recommended)**
```bash
npm run build
npx vercel --prod
```

### **Docker**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### **Self-hosted**
```bash
npm run build
npm start
```

## 📊 Performance

- **Real-time updates**: 10Hz (100ms intervals)
- **Data buffering**: 1000 points in memory
- **Chart rendering**: Optimized with Recharts
- **Memory usage**: ~50MB typical
- **CPU usage**: <5% on modern hardware

## 🔧 Troubleshooting

### **Connection Issues**
- Verify Sensor Logger URL is updated
- Check firewall settings on port 3000
- Ensure devices are on same network

### **Performance Issues**
- Reduce `MAX_BUFFER_SIZE` for lower memory usage
- Increase `POLLING_INTERVAL` for less frequent updates
- Disable animations in charts if needed

### **Data Issues**
- Check `/data` directory for raw files
- Verify sensor types in console logs
- Use Prisma Studio to inspect database

## 📝 License

MIT License - feel free to use for personal or commercial projects.

## 🤝 Contributing

This is a personal dashboard, but suggestions and improvements are welcome!

---

**Ready to monitor your sensors in style!** 🎯 # Motion
