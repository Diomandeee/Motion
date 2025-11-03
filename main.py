#!/usr/bin/env python3
"""
Sensor Data Logger - Updated for Vercel Deployment
Sends sensor data to the deployed dashboard at motion-two-virid.vercel.app
"""

from sensor_config import API_URL
import requests
import json
import time
from datetime import datetime

# Your existing sensor code here...
# Just make sure to use API_URL for all requests

def send_sensor_data(sensor_data):
    """Send sensor data to the deployed dashboard"""
    try:
        response = requests.post(API_URL, json=sensor_data)
        if response.status_code == 200:
            print(f"✅ Data sent successfully to {API_URL}")
        else:
            print(f"❌ Failed to send data: {response.status_code}")
    except Exception as e:
        print(f"🚨 Connection error: {e}")

# Usage example:
if __name__ == "__main__":
    print("🚀 Starting sensor logger for Vercel deployment...")
    print(f"📡 Sending data to: {API_URL}")
    
    # Your sensor data collection loop here...