import os

# Sensor Dashboard Configuration
# Switch between local development and production

# Production (Deployed)
PRODUCTION_URL = "https://motion-two-virid.vercel.app/api/data"

# Local Development  
LOCAL_URL = "http://localhost:3000/api/data"

# Use environment variable or default to production
USE_LOCAL = os.getenv('USE_LOCAL_SERVER', 'false').lower() == 'true'

API_URL = LOCAL_URL if USE_LOCAL else PRODUCTION_URL

print(f"🎯 Using API URL: {API_URL}")
print(f"📍 Mode: {'Local Development' if USE_LOCAL else 'Production (Vercel)'}") 