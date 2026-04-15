# 🍎 Futurus - iOS Compilation & Publication Manual

This manual provides focused, detailed instructions for compiling and publishing the Futurus mobile app for iOS using **EAS CLI** and **Xcode**.

---

## 📋 Table of Contents

1. [Prerequisites](#-prerequisites)
2. [Environment Setup](#-environment-setup)
3. [EAS Build Profiles](#-eas-build-profiles)
4. [Compilation Methods](#-compilation-methods)
   - [Cloud Build (Recommended)](#cloud-build)
   - [Ad-Hoc Build (Physical Device)](#ad-hoc-build)
   - [Local Build (Xcode)](#local-build)
5. [Submitting to App Store](#-submitting-to-app-store)
6. [Troubleshooting](#-troubleshooting)

---

## 🛠 Prerequisites

### Required Accounts

- **Apple Developer Account**: ($99/year) Active membership required at [developer.apple.com](https://developer.apple.com).
- **Expo Account**: Account owner or team member with build permissions at [expo.dev](https://expo.dev).

### Required Hardware/Software

- **Mac Computer**: Running macOS 12.0 or later.
- **Xcode**: Version 14+ installed from the Mac App Store.
- **EAS CLI**: Installed globally via `npm install -g eas-cli`.

### Configuration Check

```bash
# Verify EAS login
eas whoami

# Verify Xcode installation
xcodebuild -version
```

---

## 🌍 Environment Setup

Ensure `eas.json` contains the production environment variables specifically for iOS.

**Bundle ID**: `com.futurus`
**Apple Team ID**: `5MSQX2BRA2` (marcelo anjos)

```json
 "build": {
   ...
    "production": {
      "distribution": "store",
      "pnpm": "9.12.3",
      "ios": {
        "image": "latest",
        "bundleIdentifier": "com.futurus",
        "appleTeamId": "5MSQX2BRA2"
      },
    }
    ...
  }
```

```bash
# Set UTF-8 encoding (Crucial for CocoaPods)
export LANG=en_US.UTF-8
```

---
cd /Users/galo/PROJECTS/futurus.com.br/FUTURUS/mobile && pnpm exec eas init

## 🏗 EAS Build Profiles

The project is configured with the following iOS-specific profiles in `eas.json`:

- **`production`**: For App Store submission. Generates `.ipa`.
- **`adhoc`**: For testing on registered physical devices.
- **`development`**: For development clients (simulator or physical device).

---

## 🍏 Compilation Methods

### 1. Compiling with EAS (Cloud Build)

This is the recommended method as it handles the compilation environment and credentials automatically in the cloud.

#### **A. Start the Build**

Run the production build command:

```bash
pnpm build:production:ios
```

_This executes: `APP_ENV=production EXPO_NO_DOTENV=1 eas build --profile production --platform ios`_

#### **B. Credential Handling**

If it's your first time or if credentials expired, EAS will prompt you:

1. **Log in to Apple**: Enter your Apple ID and password.
2. **2FA**: Provide the 6-digit code sent to your Apple device.
3. **Select Team**: Choose `marcelo anjos (5MSQX2BRA2)`.
4. **Provisioning**: Choose `Generate new provisioning profile` if prompted.

#### **C. Build Profiles**

You can use different profiles defined in `eas.json`:

- `--profile production`: Full App Store build.
- `--profile adhoc`: For internal testing on registered devices.
- `--profile development`: Creates a development client for use with `npx expo start`.

---

### 2. Compiling with Xcode (Local Build)

Recommended for debugging native code or when cloud builds are too slow.

#### **A. Prepare the Project**

Generate the native `ios/` directory with production configuration:

```bash
# 1. Clean and prebuild
APP_ENV=production npx expo prebuild --platform ios --clean

# 2. Install native dependencies
cd ios
export LANG=en_US.UTF-8
pod install
cd ..
```

#### **B. Open in Xcode**

```bash
xed -b ios
```

#### **C. Configure Signing & Capabilities**

1. Select the **root project** in the Navigator.
2. Go to the **"Signing & Capabilities"** tab.
3. Ensure **"Automatically manage signing"** is checked.
4. Select the Team: `marcelo anjos`.
5. Verify the **Bundle Identifier**: `com.futurus`.

#### **D. Create the Archive**

1. In the top bar, select **"Any iOS Device (arm64)"** instead of a simulator.
2. Go to **Product → Archive**.
3. Once finished, the **Organizer** window will open.

#### **E. Distribution Wizard**

1. In the Organizer, click **"Distribute App"**.
2. Select **"App Store Connect"** → **"Upload"**.
3. Follow the sequence: `Next` → `Next` → `Upload`.
4. The app will be sent to App Store Connect for processing.

---

### 3. Ad-Hoc Build (Direct Physical Installation)

To test the release version on your iPhone without App Store review:

1. **Register Device**: Add your UDID to the [Apple Developer Portal Devices](https://developer.apple.com/account/resources/devices/list).
2. **Build Ad-Hoc**:
   ```bash
   pnpm release-ios-ipa
   ```
3. **Download & Install**:
   - Download the `.ipa` from the EAS terminal link.
   - Connect iPhone via USB.
   - Use Xcode Organizer or `xcrun devicectl` to install.

### ❌ EAS Build Error: "request to storage.googleapis.com failed, reason: write EPIPE"

**Cause**: The project archive is too large (usually > 100MB), causing the upload to timeout or fail.
**Fix**:

1. Check your `.easignore` file.
2. Ensure `node_modules/`, `.expo/`, `bin/`, and `*.ipa` are ignored.
3. The upload size should ideally be under 50MB.

### ❌ Xcode Build Error: "constexpr variable... must be initialized by a constant expression"

**Cause**: New Xcode versions (16+) are stricter with `constexpr` in some dependencies like `react-native-screens`.
**Fix**:

1. Applied a permanent patch using `pnpm patch`.
2. Changed `constexpr` to `const` in `RNSScreenStackHeaderConfig.mm`.
3. The fix is now integrated into `package.json` and will persist.

### ❌ Xcode Build Error: "'View' is only available in iOS 13.0 or newer"

**Cause**: The `IPHONEOS_DEPLOYMENT_TARGET` in the `Podfile` was set to `12.0`, which is too low for modern Expo Modules using SwiftUI.
**Fix**:

1. Updated `ios/Podfile` within the `post_install` hook.
2. Set `config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = '15.1'` for all pods.
3. This ensures all dependencies are compiled with a compatible target.

---

## 🚀 Submitting to App Store

### 1. App Store Connect Setup

1. Log in to [App Store Connect](https://appstoreconnect.apple.com).
2. Create a "New App" (Platform: iOS, Bundle ID: `com.futurus`).

### 2. Submit via EAS (Recommended)

```bash
pnpm submit:ios

# Follow prompts to select the latest build
```

### 3. Submit via Xcode/Transporter

If you have a local `.ipa`:

- Open **Transporter** app (Mac App Store).
- Sign in with Apple ID.
- Drag `.ipa` and click "Deliver".

---

## 🔍 Troubleshooting

### ❌ "The iOS deployment target... is set to 9.0"

This is often fixed by cleaning and reinstalling:

```bash
pnpm erase && pnpm install && pnpm pods
```

### ❌ CocoaPods / Unicode Errors

Ensure your terminal has UTF-8 encoding:

```bash
export LANG=en_US.UTF-8
cd ios && pod install
```

### ❌ EAS Build Error: "packages field missing or empty"

**Cause**: Presence of an invalid `pnpm-workspace.yaml` in the `mobile` folder.

**Fix**:

1. Remove `mobile/pnpm-workspace.yaml`.
2. Ensure `mobile/package.json` has `pnpm.ignoredBuiltDependencies` configured.
3. Re-run the build.

---

**Last Updated**: January 16, 2026
**Version**: 8.0.0
**Project ID**: `762f480f-9c15-44b5-99a6-e228c430a71c`


cd /Users/galo/PROJECTS/futurus.com.br/FUTURUS/mobile && xcrun xctrace list devices 2>/dev/null | head -20

cross-env EXPO_PUBLIC_APP_ENV=production EXPO_NO_DOTENV=1 npx expo run:ios --configuration Release --device "00008110-000A0DDE0205801E"

EXPO_PUBLIC_APP_ENV=production EXPO_NO_DOTENV=1 pnpm exec expo run:ios --configuration Release --device "00008110-000A0DDE0205801E"

Go to Settings → Privacy & Security
Scroll down and find Developer Mode
Toggle it ON
The device will ask to restart - confirm and restart 

cd /Users/galo/PROJECTS/futurus.com.br/FUTURUS/mobile && xcodebuild -workspace ios/FUTURUS.xcworkspace -configuration Debug -scheme FUTURUS -destination "id=00008110-000A0DDE0205801E" DEVELOPMENT_TEAM=5MSQX2BRA2 -allowProvisioningUpdates -allowProvisioningDeviceRegistration 2>&1 | tail -50


The device needs to be registered in your Apple Developer account. In Xcode:

Select the FUTURUS project in the left sidebar
Select FUTURUS target (not the project)
Go to Signing & Capabilities tab
Under Team, make sure your team is selected (5MSQX2BRA2)
Check "Automatically manage signing"
Click "Register Device" when prompted
If Xcode doesn't auto-register, you can manually register at developer.apple.com:

Go to Certificates, Identifiers & Profiles → Devices
Click + to add new device
Enter:
Name: iPhone de marcelo
UDID: 00008110-000A0DDE0205801E
Save, then in Xcode click Download Manual Profiles or just rebuild
After registering, try building again with the Play button in Xcode. Would you like me to try the CLI build again once you've registered the device?

# apple login
cd /Users/galo/PROJECTS/futurus.com.br/FUTURUS/mobile && pnpm build:production:ios

# local login
cd /Users/galo/PROJECTS/futurus.com.br/FUTURUS/mobile && pnpm build:ios


Build successful!

iOS IPA ready:
https://expo.dev/artifacts/eas/qM6gfFBbH6cpWru2wifvu.ipa

Build logs:
https://expo.dev/accounts/pyfoundation/projects/futurus/builds/0375a37d-af4b-486b-8688-30c1cae67e4e

To install on your iPhone, you can:

Download the IPA and use Apple Configurator 2 or Xcode to install it
Or use Transporter to upload to TestFlight

xcrun devicectl device install app --device 00008110-000A0DDE0205801E /Users/galo/PROJECTS/futurus.com.br/FUTURUS/mobile/futurus.ipa 2>&1

cd /Users/galo/PROJECTS/futurus.com.br/FUTURUS/mobile && pnpm exec eas build --profile adhoc --platform ios


cd /Users/galo/PROJECTS/futurus.com.br/FUTURUS/mobile && EXPO_PUBLIC_APP_ENV=production pnpm exec expo run:ios --device "00008110-000A0DDE0205801E" --configuration Release

## MARCELO IPHONE
cd /Users/galo/PROJECTS/futurus.com.br/FUTURUS/mobile && EXPO_PUBLIC_APP_ENV=production pnpm exec expo run:ios --device "00008150-000A69EA3642401C" --configuration Release

## REGISTER TONINHO IPHONE
cd /Users/galo/PROJECTS/futurus.com.br/FUTURUS/mobile && xcodebuild -workspace ios/FUTURUS.xcworkspace -configuration Release -scheme FUTURUS -destination "id=00008150-000A69EA3642401C" DEVELOPMENT_TEAM=5MSQX2BRA2 -allowProvisioningUpdates -allowProvisioningDeviceRegistration 2>&1 | tail -30

## TONINHO IPHONE
cd /Users/galo/PROJECTS/futurus.com.br/FUTURUS/mobile && EXPO_PUBLIC_APP_ENV=production pnpm exec expo run:ios --device "00008150-000A69EA3642401C" --configuration Release

## gabriel iphone
cd /Users/galo/PROJECTS/futurus.com.br/FUTURUS/mobile && xcodebuild -workspace ios/FUTURUS.xcworkspace -configuration Release -scheme FUTURUS -destination "id=00008150-001603E13C84401C" DEVELOPMENT_TEAM=5MSQX2BRA2 -allowProvisioningUpdates -allowProvisioningDeviceRegistration 2>&1 | tail -20

cd /Users/galo/PROJECTS/futurus.com.br/FUTURUS/mobile && xcodebuild -workspace ios/FUTURUS.xcworkspace -configuration Release -scheme FUTURUS -destination "id=00008150-001603E13C84401C" DEVELOPMENT_TEAM=5MSQX2BRA2 -allowProvisioningUpdates -allowProvisioningDeviceRegistration 2>&1 | tail -30
