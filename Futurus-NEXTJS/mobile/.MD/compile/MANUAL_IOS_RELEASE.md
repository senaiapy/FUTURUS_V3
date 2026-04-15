# Manual: Build iOS Release IPA for Physical Device

This guide explains how to build an iOS release IPA and install it on a physical device like "Marcelo Anjos's iPhone".

---

## Prerequisites

1. **Apple Developer Account** with valid membership
2. **Device UDID registered** in Apple Developer Portal
3. **EAS CLI installed**: `npm install -g eas-cli`
4. **Logged into EAS**: `eas login`
5. **iPhone connected via USB**

---

## Step 1: Get Device UDID

```bash
# List connected iOS devices
xcrun devicectl list devices
```

**Current registered device:**

- Name: Marcelo Anjos's iPhone
- Model: iPhone 11
- UDID: `AFA06CA1-CA7F-5DF9-A129-B368496708C7`

---

## Step 2: Register Device in Apple Developer Portal

1. Go to [Apple Developer Portal - Devices](https://developer.apple.com/account/resources/devices/list)
2. Click **"+"** to add new device
3. Enter device **Name** and **UDID**
4. Click **Continue** → **Register**

---

## Step 3: Build the Ad-Hoc IPA

```bash
cd /Users/galo/PROJECTS/Futurus/mobile

# Run the release iOS build script
pnpm release-ios-ipa
```

This command runs:

```bash
APP_ENV=production EXPO_NO_DOTENV=1 npx eas build --profile adhoc --platform ios
```

### What happens during build:

1. **Apple ID Login**: Enter your Apple Developer credentials
2. **Certificate Generation**: EAS creates/uses iOS Distribution Certificate
3. **Provisioning Profile**: EAS creates ad-hoc profile with your device UDIDs
4. **Build Upload**: Project uploads to EAS servers
5. **Compilation**: ~15-20 minutes on EAS servers
6. **Download Link**: Get .ipa file when complete

---

## Step 4: Download the IPA

After build completes:

```bash
# List recent iOS builds
eas build:list --platform ios --limit 5

# Download specific build (replace BUILD_ID)
eas build:download --id <BUILD_ID>
```

Or download directly from the EAS dashboard link provided at end of build.

---

## Step 5: Install on Physical Device

### Option A: Using Xcode (Recommended)

1. Open **Xcode**
2. Go to **Window → Devices and Simulators** (`Shift + Cmd + 2`)
3. Select your iPhone from left sidebar
4. Click **"+"** under "Installed Apps"
5. Select the downloaded `.ipa` file
6. Wait for installation

### Option B: Using Command Line

```bash
# Install IPA on connected device
xcrun devicectl device install app \
  --device AFA06CA1-CA7F-5DF9-A129-B368496708C7 \
  /path/to/downloaded.ipa
```

---

## Step 6: Trust Developer Certificate

After installation, on the iPhone:

1. Go to **Settings → General → VPN & Device Management**
2. Tap on your Apple Developer certificate
3. Tap **Trust**
4. Confirm when prompted

---

## Troubleshooting

### "This app cannot be installed because its integrity could not be verified"

**Solution**: Use `adhoc` profile, not `production` (store) profile.

### "Failed to install embedded profile: 0xe800801f"

**Cause**: Device UDID not in provisioning profile.
**Solution**: Register device in Apple Portal, rebuild with `pnpm release-ios-ipa`.

### Build fails with owner mismatch

**Solution**: Ensure `EXPO_ACCOUNT_OWNER` in `env.js` matches your EAS account:

```bash
eas whoami  # Check current account
```

---

## Quick Reference Commands

```bash
# Check EAS login
eas whoami

# List connected devices
xcrun devicectl list devices

# Build iOS release IPA
pnpm release-ios-ipa

# List builds
eas build:list --platform ios

# Download build
eas build:download --id <BUILD_ID>

# Install on device
xcrun devicectl device install app --device <UDID> /path/to/app.ipa
```

---

## EAS Profile Configuration

The `adhoc` profile in `eas.json`:

```json
{
  "build": {
    "adhoc": {
      "distribution": "internal",
      "pnpm": "9.12.3",
      "ios": {
        "image": "latest"
      },
      "env": {
        "EXPO_NO_DOTENV": "1",
        "APP_ENV": "production",
        "FLIPPER_DISABLE": "1",
        "API_URL": "https://api.futurus.com.br/api",
        "SIMPLE_API_URL": "https://api.futurus.com.br",
        "IMAGE_BASE_URL": "https://api.futurus.com.br/images",
        "SECRET_KEY": "production-secret-key-2024"
      }
    }
  }
}
```

---

**Last Updated**: January 15, 2026
**Target Device**: Marcelo Anjos's iPhone (iPhone 11)
**Bundle ID**: com.futurus
