# iOS Build Troubleshooting Guide

## Current Issue: "Run fastlane" Step Failed

### Build Error:

```
The "Run fastlane" step failed with an unknown error.
Refer to "Xcode Logs" for additional, more detailed logs.
```

**Build URL**: https://expo.dev/accounts/futuruspy/projects/pyfoundation/builds/6b3a82f6-66c8-4284-a42c-3435a96d3e00

---

## Solution 1: Interactive Build (Recommended)

Running the build in **interactive mode** allows you to see errors in real-time and provide credentials when needed.

```bash
cd /Users/galo/PROJECTS/futurus.com.br-version1.0.8/mobile
APP_ENV=production EXPO_NO_DOTENV=1 eas build --profile production --platform ios
```

**What this does:**

- Shows real-time build progress
- Prompts for credentials if needed
- Displays detailed error messages
- Allows you to fix issues and retry immediately

---

## Solution 2: Clean Rebuild

If the interactive build also fails, perform a complete clean rebuild:

### Step 1: Clean iOS Project

```bash
cd /Users/galo/PROJECTS/futurus.com.br-version1.0.8/mobile

# Remove existing iOS folder
rm -rf ios

# Remove build artifacts
rm -rf node_modules/.cache
rm -rf .expo
```

### Step 2: Regenerate iOS Project

```bash
# Regenerate with production settings
APP_ENV=production EXPO_NO_DOTENV=1 npx expo prebuild --platform ios --clean
```

### Step 3: Install CocoaPods

```bash
# Set UTF-8 encoding
export LANG=en_US.UTF-8

# Install pods
cd ios && pod install && cd ..
```

### Step 4: Build Again

```bash
APP_ENV=production EXPO_NO_DOTENV=1 eas build --profile production --platform ios
```

---

## Solution 3: Check Build Logs

Visit the build dashboard to see detailed Xcode logs:

1. Go to: https://expo.dev/accounts/futuruspy/projects/pyfoundation/builds/6b3a82f6-66c8-4284-a42c-3435a96d3e00
2. Click on **"Xcode Logs"** section
3. Look for errors marked with ❌
4. Common issues to look for:
   - Missing frameworks
   - Code signing errors
   - Swift/Objective-C compilation errors
   - Asset catalog issues

---

## Solution 4: Disable New Architecture (If Needed)

The app is using React Native New Architecture. If this is causing issues:

### Edit app.config.ts:

```typescript
export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  newArchEnabled: false, // Change from true to false
  // ... rest of config
});
```

Then rebuild:

```bash
rm -rf ios
APP_ENV=production EXPO_NO_DOTENV=1 npx expo prebuild --platform ios --clean
cd ios && export LANG=en_US.UTF-8 && pod install && cd ..
APP_ENV=production EXPO_NO_DOTENV=1 eas build --profile production --platform ios
```

---

## Solution 5: Use Managed Workflow (Alternative)

If bare workflow continues to fail, consider using managed workflow:

### Step 1: Remove iOS folder

```bash
rm -rf ios
```

### Step 2: Update eas.json

Remove the iOS folder check by not running prebuild:

```json
{
  "build": {
    "production": {
      "ios": {
        "image": "latest"
      }
    }
  }
}
```

### Step 3: Build with managed workflow

```bash
APP_ENV=production EXPO_NO_DOTENV=1 eas build --profile production --platform ios
```

EAS will handle the iOS project generation automatically.

---

## Common Xcode Build Errors

### 1. Code Signing Error

**Error**: `Code signing failed`

**Solution**: Run in interactive mode to authenticate:

```bash
eas build --platform ios
```

Select: **"Let EAS handle credentials automatically"**

---

### 2. Missing Podfile Dependencies

**Error**: `Pod not found` or `Framework not found`

**Solution**:

```bash
cd ios
export LANG=en_US.UTF-8
pod deintegrate
pod install
cd ..
```

---

### 3. Xcode Version Mismatch

**Error**: `Xcode version X.X is not supported`

**Solution**: Update eas.json to use latest image:

```json
{
  "build": {
    "production": {
      "ios": {
        "image": "latest"
      }
    }
  }
}
```

---

### 4. Asset Catalog Errors

**Error**: `Asset catalog compilation failed`

**Solution**: Check that all required assets exist:

```bash
# Verify icon exists
ls -la assets/icon.png

# Verify splash exists
ls -la assets/splash.png

# Verify adaptive icon exists
ls -la assets/adaptive-icon.png
```

If missing, add placeholder images or use default Expo assets.

---

### 5. Swift Compilation Errors

**Error**: Swift module compilation failed

**Solution**: Ensure all pods support same Swift version:

```bash
cd ios
pod update
cd ..
```

---

## Debugging Checklist

Run through this checklist before building:

- [ ] EAS CLI is up to date: `npm install -g eas-cli`
- [ ] Logged in to EAS: `eas whoami`
- [ ] Dependencies installed: `pnpm install`
- [ ] No `pnpm-workspace.yaml` in mobile directory
- [ ] Environment variables set in `eas.json`
- [ ] Bundle ID matches Apple Developer Portal: `com.futurus`
- [ ] Apple Team ID is correct: `5MSQX2BRA2`
- [ ] Valid Distribution Certificate exists
- [ ] Valid Provisioning Profile exists

---

## Quick Diagnostic Commands

```bash
# Check EAS status
eas whoami

# Check build list
eas build:list --platform ios

# Check credentials
eas credentials

# View specific build
eas build:view 6b3a82f6-66c8-4284-a42c-3435a96d3e00

# Check iOS project
ls -la ios/

# Check dependencies
pnpm list expo-updates

# Check environment
printenv | grep APP_ENV
```

---

## Best Practice: Start Fresh

If you've tried multiple solutions and still failing:

```bash
# 1. Clean everything
cd /Users/galo/PROJECTS/futurus.com.br-version1.0.8/mobile
rm -rf ios android node_modules .expo

# 2. Reinstall dependencies
pnpm install

# 3. Run interactive build (EAS handles iOS generation)
APP_ENV=production EXPO_NO_DOTENV=1 eas build --profile production --platform ios
```

This lets EAS Build handle the entire iOS project setup automatically.

---

## Alternative: Local Build for Debugging

To debug faster, build locally:

```bash
# 1. Ensure Xcode is installed
xcodebuild -version

# 2. Generate iOS project
APP_ENV=production EXPO_NO_DOTENV=1 npx expo prebuild --platform ios --clean

# 3. Install pods
cd ios && export LANG=en_US.UTF-8 && pod install && cd ..

# 4. Open in Xcode
xed -b ios

# 5. Build in Xcode (Cmd + B)
# This will show exact errors in Xcode console
```

---

## Contact Support

If none of these solutions work:

1. **EAS Support**: https://expo.dev/support
   - Include build ID: `6b3a82f6-66c8-4284-a42c-3435a96d3e00`
   - Attach Xcode logs from build page

2. **Expo Forums**: https://forums.expo.dev
   - Tag: `eas-build`, `ios`
   - Include error screenshots

3. **GitHub Issues**: https://github.com/expo/eas-cli/issues
   - Search for similar issues first

---

## Summary

**Recommended Next Steps:**

1. **Try Interactive Build First**:

   ```bash
   cd /Users/galo/PROJECTS/futurus.com.br-version1.0.8/mobile
   APP_ENV=production EXPO_NO_DOTENV=1 eas build --profile production --platform ios
   ```

2. **If that fails, check Xcode logs**:
   - Visit build URL
   - Read detailed error messages
   - Apply specific fix based on error

3. **If still failing, clean rebuild**:

   ```bash
   rm -rf ios
   APP_ENV=production EXPO_NO_DOTENV=1 npx expo prebuild --platform ios --clean
   cd ios && export LANG=en_US.UTF-8 && pod install && cd ..
   APP_ENV=production EXPO_NO_DOTENV=1 eas build --profile production --platform ios
   ```

4. **Last resort: Managed workflow**:
   ```bash
   rm -rf ios
   APP_ENV=production EXPO_NO_DOTENV=1 eas build --profile production --platform ios
   ```

---

**Note**: The most common solution is running in **interactive mode** without the `--non-interactive` flag. This allows EAS to prompt for credentials and show detailed errors.

Good luck! 🚀
