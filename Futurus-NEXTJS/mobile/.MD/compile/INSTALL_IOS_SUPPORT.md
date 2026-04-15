# Installing iOS 26/18 Device Support for Xcode

Your iPhone is running **iOS 18.6 beta** (Xcode reports it as "iOS 26.1"), but Xcode only has device support up to iOS 16.4.

## Quick Fix - Install via Xcode Settings

### Step 1: Open Xcode Settings

1. Xcode should be opening now (or run: `open -a Xcode`)
2. Press `⌘,` (Command + Comma) or click **Xcode → Settings**

### Step 2: Download iOS Platform

1. Click the **"Platforms"** or **"Components"** tab
2. Look for one of these:
   - **iOS 18.x**
   - **iOS 26.x**
   - **Latest iOS Platform**
3. Click the **Download** button (⬇️ icon)
4. **Wait 15-30 minutes** for the ~5-10 GB download

### Step 3: Verify Installation

After download completes, run:

```bash
ls -la "/Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/DeviceSupport/"
```

You should see a new directory like `18.0` or `26.0`.

### Step 4: Try iOS Build Again

```bash
cd /Users/galo/PROJECTS/futurus.com.br-version1.0.8/mobile
pnpm ios
```

---

## Alternative Method - Manual Download

If Xcode Settings doesn't show the platform:

### Option A: Download from Apple Developer

1. Go to: https://developer.apple.com/download/all/
2. Search: **"iOS 18 Device Support"** or **"Xcode 16"**
3. Download the `.dmg` file
4. Install it (will copy files to Xcode automatically)

### Option B: Use xcode-install (if you have it)

```bash
gem install xcode-install
xcversion simulators --install='iOS 18.1'
```

---

## Workaround - Use Simulator Without Physical Device

If you don't want to wait for the download:

### Simply unplug your iPhone from the Mac

Then run:

```bash
cd /Users/galo/PROJECTS/futurus.com.br-version1.0.8/mobile
pnpm ios
```

The build will work on the **iPhone 16 Simulator (iOS 18.1)** which is already installed and booted.

---

## Verification Commands

Check iOS device support versions:

```bash
ls "/Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/DeviceSupport/"
```

Check connected devices:

```bash
xcrun xctrace list devices
```

Check available simulators:

```bash
xcrun simctl list devices available | grep iPhone
```

---

## Current Status

- ✅ Xcode 26.1.1 installed
- ✅ iOS project regenerated successfully
- ✅ CocoaPods installed
- ✅ iPhone 16 Simulator (iOS 18.1) ready and booted
- ❌ iOS 18.6 device support missing (your physical iPhone)
- 🎯 **Action needed**: Install iOS 18/26 platform OR unplug iPhone

---

**Estimated time to install iOS support: 15-30 minutes**
**Fastest solution: Unplug iPhone and use simulator (instant)**
