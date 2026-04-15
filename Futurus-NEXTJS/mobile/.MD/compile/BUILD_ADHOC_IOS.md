# Build Ad-Hoc iOS Distribution for Direct Device Installation

This guide shows you how to build an .ipa file that can be installed directly on your iPhone without TestFlight or App Store.

---

## What is Ad-Hoc Distribution?

Ad-Hoc distribution allows you to install apps on specific registered devices without going through the App Store. This is perfect for:

- Testing on your own device
- Distributing to a small team (up to 100 devices)
- Beta testing without TestFlight

---

## Prerequisites

✅ **Your device UDID must be registered** in Apple Developer Portal

### Get Your iPhone UDID

```bash
# With iPhone connected via USB:
xcrun devicectl list devices
```

**Current Device:**

- Name: Marcelo Anjos's iPhone
- Model: iPhone 11 (iPhone12,1)
- Identifier: `AFA06CA1-CA7F-5DF9-A129-B368496708C7`

---

## Step 1: Register Your Device in Apple Developer Portal

1. Go to [Apple Developer - Devices](https://developer.apple.com/account/resources/devices/list)
2. Click **"+"** to add a new device
3. Select **iOS, iPadOS, tvOS, visionOS**
4. Enter:
   - **Device Name**: `Marcelo iPhone 11`
   - **Device ID (UDID)**: `AFA06CA1-CA7F-5DF9-A129-B368496708C7`
5. Click **Continue** → **Register**

---

## Step 2: Build Ad-Hoc Distribution

```bash
cd /Users/galo/PROJECTS/futurus.com.br-version1.0.8/mobile

# Run interactive build (will prompt for credentials setup)
APP_ENV=production EXPO_NO_DOTENV=1 eas build --profile adhoc --platform ios
```

**When prompted:**

### 1. Credentials Setup

```
? Set up a new iOS Distribution Certificate? › Yes
```

EAS will generate a new certificate for internal distribution.

### 2. Provisioning Profile

```
? Set up a new Provisioning Profile? › Yes
? Register new Apple Devices? › Yes
```

EAS will:

- Fetch registered devices from Apple Developer Portal
- Create ad-hoc provisioning profile with your device
- Bundle it into the .ipa

### 3. Wait for Build

- Build will upload to EAS servers
- Compilation takes ~15-20 minutes
- Monitor at: https://expo.dev/accounts/futuruspy/projects/pyfoundation/builds

---

## Step 3: Download the Ad-Hoc .ipa

Once build completes:

```bash
# Download the .ipa file
eas build:download --id <BUILD_ID>
```

Or download from the EAS dashboard:

- Go to build details page
- Click **"Download"** button
- Save to your Mac

---

## Step 4: Install on Your iPhone

### Option A: Using Xcode (Recommended)

1. **Open Xcode**
2. Go to **Window → Devices and Simulators** (`Shift + Cmd + 2`)
3. Select your iPhone from the left sidebar
4. Click **"+"** under "Installed Apps"
5. Select the downloaded .ipa file
6. Wait for installation to complete

### Option B: Using Command Line

```bash
# With iPhone connected:
xcrun devicectl device install app --device AFA06CA1-CA7F-5DF9-A129-B368496708C7 /path/to/downloaded.ipa
```

---

## What's Different from App Store Build?

| Feature         | App Store Build           | Ad-Hoc Build                      |
| --------------- | ------------------------- | --------------------------------- |
| Distribution    | `"store"`                 | `"internal"`                      |
| Certificate     | Distribution Certificate  | Distribution Certificate (Ad-Hoc) |
| Provisioning    | App Store Profile         | Ad-Hoc Profile (with UDIDs)       |
| Installation    | TestFlight/App Store only | Direct device install via Xcode   |
| Device Limit    | Unlimited                 | 100 devices per year              |
| Review Required | Yes                       | No                                |

---

## EAS Build Profile Configuration

The ad-hoc profile has been added to `eas.json`:

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

## Troubleshooting

### Issue: "This app cannot be installed because its integrity could not be verified"

**Cause**: Using App Store distribution .ipa on device

**Solution**: Use the ad-hoc build profile instead:

```bash
eas build --profile adhoc --platform ios
```

---

### Issue: "Failed to install embedded profile: 0xe800801f"

**Cause**: Device UDID not included in provisioning profile

**Solution**:

1. Register device in Apple Developer Portal
2. Rebuild with ad-hoc profile (EAS will fetch devices automatically)

---

### Issue: "No devices registered"

**Cause**: No devices in Apple Developer Portal

**Solution**:

1. Go to https://developer.apple.com/account/resources/devices/list
2. Add your device UDID
3. Rebuild

---

### Issue: Build fails with "No credentials suitable for internal distribution"

**Cause**: Running in non-interactive mode without existing credentials

**Solution**: Run without `--non-interactive` flag:

```bash
eas build --profile adhoc --platform ios
```

---

## Quick Commands Reference

```bash
# Get device UDID
xcrun devicectl list devices

# Build ad-hoc (interactive)
cd /Users/galo/PROJECTS/futurus.com.br-version1.0.8/mobile
APP_ENV=production EXPO_NO_DOTENV=1 eas build --profile adhoc --platform ios

# Download build
eas build:download --id <BUILD_ID>

# Install on device
xcrun devicectl device install app --device <UDID> /path/to/app.ipa

# List builds
eas build:list --platform ios
```

---

## Next Steps After Installation

1. **Trust Developer Certificate** on iPhone:
   - Go to **Settings → General → VPN & Device Management**
   - Tap on your Apple Developer account
   - Tap **Trust**

2. **Test the App**:
   - App icon should appear on home screen
   - Launch and verify functionality
   - Check API connectivity to production

3. **For App Store Submission**:
   - Use the original production build: `66c9651b-b30a-4955-acfb-751e87503124`
   - Follow steps in [CREATE_APP_STORE_LISTING.md](./CREATE_APP_STORE_LISTING.md)

---

## Summary

**App Store Build** (existing):

- Build ID: `66c9651b-b30a-4955-acfb-751e87503124`
- Distribution: Store
- Use for: TestFlight and App Store submission
- Status: ✅ Ready for submission

**Ad-Hoc Build** (new):

- Profile: `adhoc`
- Distribution: Internal
- Use for: Direct device installation
- Status: 🔄 Ready to build

---

**Date**: December 3, 2024
**Device**: Marcelo Anjos's iPhone (iPhone 11)
**UDID**: AFA06CA1-CA7F-5DF9-A129-B368496708C7
**Bundle ID**: com.futurus
