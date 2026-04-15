#!/bin/bash

# Script to build iOS app for simulator only, ignoring physical devices
# This fixes the iOS 26.1 device detection issue

set -e

echo "🔧 Building iOS app for simulator only..."
echo ""

# Kill any running simulators and Xcode processes
echo "📱 Resetting simulator environment..."
killall Simulator 2>/dev/null || true
killall -9 CoreSimulatorService 2>/dev/null || true
sleep 2

# Boot a specific simulator
SIMULATOR_ID="32F449E9-33BA-46BA-9155-6E32EDF9C031"  # iPhone 16 (18.1)
echo "🚀 Booting iPhone 16 simulator..."
xcrun simctl boot "$SIMULATOR_ID" 2>/dev/null || echo "Simulator already booted"
sleep 3

# Open Simulator app
open -a Simulator

# Build the project
echo "🔨 Building Xcode project..."
cd ios

xcodebuild \
  -workspace Futurus.xcworkspace \
  -scheme Futurus \
  -configuration Debug \
  -sdk iphonesimulator \
  -destination "id=$SIMULATOR_ID" \
  -derivedDataPath ./build \
  CODE_SIGN_IDENTITY="" \
  CODE_SIGNING_REQUIRED=NO \
  CODE_SIGNING_ALLOWED=NO \
  build

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ Build successful!"
  echo ""
  echo "📦 Installing app on simulator..."

  # Find the built app
  APP_PATH=$(find ./build/Build/Products/Debug-iphonesimulator -name "*.app" -maxdepth 1 | head -n 1)

  if [ -n "$APP_PATH" ]; then
    xcrun simctl install "$SIMULATOR_ID" "$APP_PATH"

    # Get bundle identifier
    BUNDLE_ID=$(defaults read "$APP_PATH/Info.plist" CFBundleIdentifier)

    echo "🚀 Launching app..."
    xcrun simctl launch "$SIMULATOR_ID" "$BUNDLE_ID"

    echo ""
    echo "✅ App launched successfully on iPhone 16 simulator!"
  else
    echo "❌ Could not find built app"
    exit 1
  fi
else
  echo ""
  echo "❌ Build failed"
  exit 1
fi
