# Run Ad-Hoc Build - Step by Step

Follow these exact steps to generate an .ipa that can be installed directly on your iPhone.

---

## Step 1: Register Your Device (REQUIRED FIRST)

Before building, you **must** register your iPhone in the Apple Developer Portal:

1. Go to: https://developer.apple.com/account/resources/devices/list
2. Click the **"+"** button (top left)
3. Fill in:
   - **Platform**: iOS, iPadOS, tvOS, visionOS
   - **Device Name**: `Marcelo iPhone 11`
   - **Device ID (UDID)**: `AFA06CA1-CA7F-5DF9-A129-B368496708C7`
4. Click **Continue** → **Register**

✅ **You must complete this step first!** The ad-hoc build will include only registered devices.

---

## Step 2: Run the Build Command

Open a **new terminal window** and run:

```bash
cd /Users/galo/PROJECTS/futurus.com.br-version1.0.8/mobile
APP_ENV=production EXPO_NO_DOTENV=1 eas build --profile adhoc --platform ios
```

---

## Step 3: Answer the Prompts

The build will ask you several questions. Here's what to answer:

### Prompt 1: Apple Account Login

```
? Do you want to log in to your Apple account? › (Y/n)
```

**Answer**: `Y` (Yes)

This allows EAS to:

- Fetch your registered devices
- Create ad-hoc provisioning profile automatically
- Validate credentials

### Prompt 2: Apple ID

```
? Apple ID: ›
```

**Answer**: Enter your Apple Developer account email
(The one you use to login at https://developer.apple.com)

### Prompt 3: Password

```
? Password: ›
```

**Answer**: Enter your Apple ID password
(Input will be hidden)

### Prompt 4: Two-Factor Authentication (if enabled)

```
? Two-factor authentication code: ›
```

**Answer**: Enter the 6-digit code from your iPhone/Mac

### Prompt 5: Distribution Certificate

```
? Set up a new iOS Distribution Certificate? › (Y/n)
```

**Answer**: `Y` (Yes)

Or if you already have one:

```
? Select an iOS Distribution Certificate ›
❯ Apple Distribution: marcelo anjos (5MSQX2BRA2)
  [Create a new certificate]
```

**Answer**: Select the existing certificate (if available)

### Prompt 6: Provisioning Profile

```
? Set up a new Provisioning Profile? › (Y/n)
```

**Answer**: `Y` (Yes)

### Prompt 7: Register Devices

```
? Register new Apple Devices? › (Y/n)
```

**Answer**: `Y` (Yes)

EAS will:

- Fetch all devices from your Apple Developer Portal
- Include them in the ad-hoc provisioning profile
- Your iPhone (`AFA06CA1-CA7F-5DF9-A129-B368496708C7`) will be included

---

## Step 4: Wait for Build

After answering all prompts:

```
✔ iOS distribution credentials successfully created
✔ All credentials are ready to build @futuruspy/pyfoundation (com.futurus)

Uploading to EAS Build...
```

**Build Progress**:

1. **Uploading** (~2-3 minutes) - Code uploaded to EAS servers
2. **Queued** (~0-5 minutes) - Waiting for build worker
3. **Building** (~15-20 minutes) - Xcode compilation
4. **Completed** - .ipa ready for download

**Monitor build**:

- Terminal will show progress
- Or visit: https://expo.dev/accounts/futuruspy/projects/pyfoundation/builds

---

## Step 5: Download the .ipa

When build completes, you'll see:

```
✔ Build finished
Build ID: <BUILD_ID>
Build URL: https://expo.dev/accounts/futuruspy/projects/pyfoundation/builds/<BUILD_ID>
```

**Download**:

Option 1 - From terminal:

```bash
eas build:download --id <BUILD_ID>
```

Option 2 - From web:

1. Visit the Build URL
2. Click **"Download"** button
3. Save to your Mac

---

## Step 6: Install on Your iPhone

### Method A: Using Xcode (Easiest)

1. **Connect your iPhone** via USB
2. **Trust the computer** on iPhone if prompted
3. **Open Xcode**
4. Go to **Window → Devices and Simulators** (or press `Shift + Cmd + 2`)
5. Select **Marcelo Anjos's iPhone** from left sidebar
6. Click the **"+"** button under "Installed Apps"
7. Select the downloaded .ipa file
8. Wait for installation (~10-30 seconds)

### Method B: Using Command Line

```bash
# Replace <PATH_TO_IPA> with actual file path
xcrun devicectl device install app --device AFA06CA1-CA7F-5DF9-A129-B368496708C7 <PATH_TO_IPA>
```

---

## Step 7: Trust the App on iPhone

After installation, the app icon will appear on your home screen, but may show "Untrusted Developer" when you try to open it.

**Fix**:

1. On your iPhone, go to **Settings**
2. Scroll down to **General**
3. Tap **VPN & Device Management**
4. Under "Developer App", tap your Apple ID
5. Tap **Trust "Your Name"**
6. Confirm by tapping **Trust**

Now you can launch the app!

---

## Complete Example Session

```bash
$ cd /Users/galo/PROJECTS/futurus.com.br-version1.0.8/mobile
$ APP_ENV=production EXPO_NO_DOTENV=1 eas build --profile adhoc --platform ios

✔ Using remote iOS credentials (Expo server)
? Do you want to log in to your Apple account? › Yes
? Apple ID: › your-email@example.com
? Password: › ********
? Two-factor authentication code: › 123456
✔ Authenticated with Apple
✔ iOS distribution credentials successfully created

Uploading to EAS Build...
✔ Uploaded to EAS
Build ID: abc123xyz
Build URL: https://expo.dev/accounts/futuruspy/projects/pyfoundation/builds/abc123xyz

Building...
[██████████████████████████] 100%
✔ Build finished

$ eas build:download --id abc123xyz
✔ Downloaded to ./application-abc123xyz.ipa

# Install with Xcode or:
$ xcrun devicectl device install app --device AFA06CA1-CA7F-5DF9-A129-B368496708C7 ./application-abc123xyz.ipa
✔ App installed successfully
```

---

## Troubleshooting

### Issue: "No devices found"

**Cause**: Device not registered in Apple Developer Portal

**Solution**: Complete Step 1 above, then rebuild

---

### Issue: "Failed to install embedded profile"

**Cause**: Device UDID not in provisioning profile

**Solution**:

1. Verify device registered at https://developer.apple.com/account/resources/devices/list
2. Rebuild (answer "Yes" to "Register new Apple Devices?")

---

### Issue: "This app cannot be installed because its integrity could not be verified"

**Cause**: Using wrong distribution type

**Solution**: Ensure you're using `--profile adhoc`, not `--profile production`

---

### Issue: "Apple ID or password is incorrect"

**Cause**: Invalid credentials or 2FA issue

**Solution**:

1. Verify credentials at https://appleid.apple.com
2. Try using an app-specific password: https://appleid.apple.com/account/manage
3. Generate new password for "EAS CLI"

---

## Quick Reference

```bash
# Get device UDID
xcrun devicectl list devices

# Register device
open https://developer.apple.com/account/resources/devices/list

# Build ad-hoc
cd /Users/galo/PROJECTS/futurus.com.br-version1.0.8/mobile
APP_ENV=production EXPO_NO_DOTENV=1 eas build --profile adhoc --platform ios

# Download
eas build:download --id <BUILD_ID>

# Install
xcrun devicectl device install app --device AFA06CA1-CA7F-5DF9-A129-B368496708C7 <PATH_TO_IPA>

# Trust on iPhone
Settings → General → VPN & Device Management → Trust
```

---

## What You Get

**Ad-Hoc .ipa File**:

- Bundle ID: `com.futurus`
- Version: `1.0.8`
- Build: `1`
- Environment: Production
- API: `https://api.futurus.com.br/api`
- Distribution: Internal (Ad-Hoc)
- Devices: Registered devices only

**Differences from App Store Build**:

- ✅ Can install directly via Xcode
- ✅ No TestFlight required
- ✅ No App Store review needed
- ❌ Only works on registered devices (max 100/year)
- ❌ Cannot distribute via App Store

---

## Next Steps

After successfully installing on your device:

1. **Test the app thoroughly**
2. **Report any issues**
3. **For App Store submission**, use the production build:
   - Build ID: `66c9651b-b30a-4955-acfb-751e87503124`
   - Follow: [CREATE_APP_STORE_LISTING.md](./CREATE_APP_STORE_LISTING.md)

---

**Device**: Marcelo Anjos's iPhone (iPhone 11)
**UDID**: `AFA06CA1-CA7F-5DF9-A129-B368496708C7`
**Bundle ID**: `com.futurus`
**Date**: December 3, 2024
