# 🚨 Sensor Data Troubleshooting Guide

## Current Issue: Missing Real Sensor Data

Your dashboard shows **null values** because your sensor logging device/app has stopped sending data to the API.

### 📊 Current Status
- **Database**: Only test data (accelerometer, gyroscope)
- **Real Sensors**: No recent data from your device
- **Charts**: Showing null because no real sensor data in database

---

## ✅ Quick Fix Steps

### 1. **Check Your Sensor Logger**
Is your sensor logging app/device still running?

**For iOS/Android Apps:**
- Open your sensor logging app
- Verify it's set to send data to: `http://localhost:3001/api/data`
- Check if the app is still recording/transmitting

**For Python Scripts:**
```bash
# Check if your sensor script is running
ps aux | grep python
ps aux | grep sensor

# Or restart your sensor logger
python main.py
# or
python sensor_logger.py
```

### 2. **Verify API Endpoint**
Your sensor logger should be sending data to:
```
LOCAL: http://localhost:3001/api/data
PRODUCTION: https://motion-two-virid.vercel.app/api/data
```

### 3. **Test Data Flow**
```bash
# Test if API is receiving data (check terminal logs)
curl -X POST http://localhost:3001/api/data \
  -H "Content-Type: application/json" \
  -d '{
    "messageId": 1,
    "sessionId": "test-live-123",
    "deviceId": "test-device-live",
    "payload": [
      {
        "name": "accelerometer",
        "time": 1753068000000000,
        "values": {"x": 1.5, "y": 2.5, "z": 3.5}
      },
      {
        "name": "wristMotion", 
        "time": 1753068000000000,
        "values": {"rotationRateX": 0.1, "rotationRateY": 0.2, "rotationRateZ": 0.3}
      }
    ]
  }'
```

### 4. **Check Sensor Logger Configuration**
Update your sensor logger URL configuration:

**For `sensor_config.py`:**
```python
# Make sure USE_LOCAL is set correctly
USE_LOCAL = True  # for local development
API_URL = "http://localhost:3001/api/data"  # Note: 3001, not 3000
```

**For mobile apps:**
- Update server URL to `localhost:3001` (not 3000)
- Ensure the app has network permissions
- Check if device and computer are on same WiFi

---

## 🔍 Debug Commands

### Check Current Sensor Data
```bash
# See what's actually in the database
curl -s "http://localhost:3001/api/debug-sensors" | jq '.analysis.sensorCounts'

# Check recent sensor readings
curl -s "http://localhost:3001/api/debug-sensors" | jq '.recentRawReadings[0]'
```

### Monitor Live Data
```bash
# Watch the terminal where `npm run dev` is running
# You should see logs like:
# 📡 RECEIVED RAW DATA: {"messageId":1,"sessionId":"..."}
# 📊 PARSED MESSAGE: {sensorTypes: ["accelerometer", "gyroscope", "wristMotion"]}
```

---

## 🎯 Expected Sensor Types

Your device should be sending these sensor types:
- `accelerometer`, `gyroscope`, `gravity`
- `orientation` (yaw, pitch, roll)  
- `magnetometer`, `compass`
- `microphone`
- `wristMotion` (Apple Watch/WearOS)
- `accelerometeruncalibrated`, `gyroscopeuncalibrated`
- `heartrate`, `location`, `barometer` (if available)

---

## ✅ Success Indicators

When working correctly, you should see:
1. **Terminal Logs**: 📡 RECEIVED RAW DATA messages
2. **Database Growth**: Increasing sensor counts in debug endpoint
3. **Charts**: Real data instead of null values
4. **Dashboard**: Green status indicators for active sensors

---

## 🆘 If Still Not Working

1. **Restart Everything**:
   ```bash
   # Stop the dev server (Ctrl+C)
   npm run dev
   ```

2. **Clear and Restart**:
   ```bash
   # Clear the database (optional)
   npx prisma db push --force-reset
   
   # Restart server
   npm run dev
   ```

3. **Check Network**:
   - Ensure device and computer are on same network
   - Try `curl -X GET http://localhost:3001/api/data` to verify API is running
   - Check firewall/antivirus blocking port 3001

---

**Need Help?** 
- Check the terminal logs where `npm run dev` is running
- Run the debug commands above
- Verify your sensor logger configuration 