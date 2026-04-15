#!/bin/bash

echo "🔧 Fixing Futurus Mobile App..."
echo ""

# Kill all Expo processes
echo "🧹 Cleaning up processes..."
pkill -9 -f "expo start" 2>/dev/null
pkill -9 -f "metro" 2>/dev/null
lsof -ti:8081 2>/dev/null | xargs kill -9 2>/dev/null
lsof -ti:8082 2>/dev/null | xargs kill -9 2>/dev/null
sleep 3
echo "✅ Processes cleaned"
echo ""

# Check backend
echo "🔍 Checking backend..."
if ! netstat -tlnp 2>/dev/null | grep -q ":6062" && ! ss -tln | grep -q ":6062"; then
    echo "❌ Backend is NOT running!"
    echo "   Start it with: cd .. && npm run dev:backend"
    exit 1
fi
echo "✅ Backend is running"
echo ""

# Get WiFi IP
WIFI_IP=$(ip addr show wlp2s0 | grep "inet " | awk '{print $2}' | cut -d'/' -f1)
echo "📡 API URL: http://$WIFI_IP:6062/api"
echo ""

# Test API
echo "🧪 Testing API..."
if curl -s "http://$WIFI_IP:6062/api/products?page=1&limit=1" | jq -e '.products[0]' > /dev/null 2>&1; then
    echo "✅ API is responding correctly"
else
    echo "❌ API test failed"
    exit 1
fi
echo ""

echo "🚀 Starting Expo Metro bundler..."
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  AFTER EXPO STARTS:"
echo "  Press 'a' to open on Android"
echo "  Press 'r' to reload"
echo "  Press 'c' to clear cache"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "⚠️  If you see products loading, the fix worked!"
echo ""

# Start Expo
exec pnpm start -c
