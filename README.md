# 📊 Mobile-Friendly Sensor Dashboard

A modern, responsive Next.js application for monitoring and visualizing sensor data in real-time. Built for comprehensive sensor logging with support for accelerometer, gyroscope, magnetometer, orientation, wrist motion, and audio sensors.

## 🌐 **LIVE DEPLOYMENT**
**Dashboard URL**: https://motion-two-virid.vercel.app/
**API Endpoint**: https://motion-two-virid.vercel.app/api/data

## ✨ Features

### 📱 **Mobile-First Design**
- **Responsive layout** optimized for mobile devices
- **Touch-friendly** navigation with collapsible sidebar
- **PWA support** - installable as a mobile app
- **Mobile-optimized charts** with responsive sizing

### 🎯 **Intuitive Dashboard Design**
- **Real-time visualization** of all sensor types
- **Color-coded sensors** for easy identification
- **Live status indicators** showing connection and data flow
- **Debug mode** for troubleshooting

### 📊 **Comprehensive Sensor Support**
- **Device Motion**: Accelerometer, Gyroscope, Gravity
- **Wrist Motion**: Apple Watch/WearOS sensors 
- **Orientation**: Euler angles and Quaternions
- **Environmental**: Magnetometer, Compass, Microphone
- **Raw Data**: Uncalibrated sensor variants

### ⚡ **Real-time Performance**
- **100ms update rate** for smooth real-time updates
- **Efficient data processing** and visualization
- **Live charts** with smooth animations
- **Automatic data buffering** (configurable limits)

## 🚀 Quick Start

### **📱 For Sensor Logger Apps**
Update your sensor logger configuration to send data to:
```
https://motion-two-virid.vercel.app/api/data
```

### **🖥️ For Local Development**
```bash
# Clone the repository
git clone https://github.com/Diomandeee/Motion.git
cd Motion

# Install dependencies
npm install

# Start development server
npm run dev
```

Your local dashboard will be available at `http://localhost:3000`

### **📋 For Mobile App Configuration**
Change your Sensor Logger URL from:
```
http://localhost:3000/api/data
```
To:
```
https://motion-two-virid.vercel.app/api/data
```

## 📊 Dashboard Overview

### **Header Section**
- **Connection Status**: Live/Disconnected indicator
- **Data Statistics**: Total data points received
- **Last Update**: Real-time timestamp
- **Mobile Controls**: Collapsible status panel

### **Mobile Navigation**
- **Sidebar on Desktop**: Fixed navigation panel
- **Drawer on Mobile**: Slide-out hamburger menu
- **Touch-Optimized**: Proper touch targets (44px minimum)

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

### **Production Deployment**
The app is deployed on Vercel and automatically updates from the main branch.

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
│   ├── globals.css        # Global styles + mobile optimizations
│   ├── layout.tsx         # Root layout with PWA support
│   └── page.tsx          # Main dashboard
├── components/            # React components
│   ├── SensorChart.tsx    # Mobile-responsive chart visualization
│   ├── SensorStatusPanel.tsx
│   ├── DashboardHeader.tsx # Mobile-optimized header
│   └── TabNavigation.tsx  # Mobile drawer navigation
├── types/                 # TypeScript definitions
│   └── sensor.ts         # Sensor data types
├── public/               # Static assets
│   └── manifest.json     # PWA manifest
└── data/                 # Sensor data files (local only)
```

## 🌐 API Endpoints

### **POST /api/data**
Receive sensor data from logging applications
```bash
curl -X POST https://motion-two-virid.vercel.app/api/data \
  -H "Content-Type: application/json" \
  -d '{"messageId": 1, "sessionId": "test", "deviceId": "device1", "payload": [...]}'
```

### **GET /api/data**
Retrieve recent sensor data for dashboard display
```bash
curl https://motion-two-virid.vercel.app/api/data?limit=10
```

## 📱 Mobile Features

### **Progressive Web App (PWA)**
- Install dashboard as a mobile app
- Offline capability (coming soon)
- Native app-like experience

### **Touch Optimizations**
- Minimum 44px touch targets
- Smooth scrolling and animations
- Mobile-optimized chart interactions

### **Responsive Design**
- Single-column layout on mobile
- Collapsible navigation drawer
- Responsive text and spacing

## 🚀 Deployment

The app is automatically deployed to Vercel from the main branch:
- **Production**: https://motion-two-virid.vercel.app/
- **Repository**: https://github.com/Diomandeee/Motion

### **Local Development**
```bash
npm run dev     # Development server
npm run build   # Production build
npm run start   # Production server
```

## 🔧 Troubleshooting

### **Common Issues**
- **No data showing**: Verify sensor logger is sending to correct URL
- **Connection refused**: Check if API endpoint is accessible
- **Mobile layout issues**: Clear cache and reload

### **Debug Mode**
Enable debug mode in development to see:
- Detailed sensor validation logs
- Data structure analysis
- Connection status information

---

**Built with ❤️ using Next.js 14, TypeScript, Tailwind CSS, and Recharts**
