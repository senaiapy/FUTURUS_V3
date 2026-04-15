# 📱 Futurus - Unified Mobile Compilation & Publication Manual

This manual provides a comprehensive, step-by-step guide for compiling and publishing the Futurus mobile application for both **iOS** and **Android**.

---

## 📋 Table of Contents

1. [Development Mode](#-development-mode)
2. [Environment Configuration](#-environment-configuration)
3. [Compiling for Android](#-compiling-for-android)
   - [Generate APK (Manual Install)](#generate-apk-manual-install)
   - [Generate AAB (Play Store)](#generate-aab-play-store)
4. [Compiling for iOS](#-compiling-for-ios)
   - [Generate IPA (Manual/Ad-hoc)](#generate-ipa-manual-adhoc)
   - [Simulator Build](#simulator-build)
5. [Artifact Creation Summary](#-artifact-creation-summary)
6. [Troubleshooting](#-troubleshooting)

---

## 🛠 Development Mode

To run the application in development mode with hot reloading:

### 1. Start Metro Bundler

```bash
pnpm start
```

### 2. Run on Device/Simulator

```bash
# Android
pnpm android

# iOS (macOS required)
pnpm ios
```

---

## 🌍 Environment Configuration

The app uses `env.ts` at the root, which is populated by `.env` files.

- `.env.development`: Default for `pnpm start`
- `.env.production`: Used for release builds

**Strict Validation**: Before building, you can validate your environment variables:

```bash
STRICT_ENV_VALIDATION=1 pnpm prebuild:production
```

---

## 🤖 Compiling for Android

### Generate APK (Manual Install)

Easily shareable file for testing on physical devices.

```bash
# Cloud Build (EAS)
pnpm build:preview:android

# Local Build (requires Android Studio/SDK)
npx expo prebuild --platform android
cd android && ./gradlew assembleRelease
```

_Output: `android/app/build/outputs/apk/release/app-release.apk`_

### Generate AAB (Play Store)

The bundle format required by Google Play Console.

```bash
pnpm build:production:android
```

_Output: Managed by EAS Cloud_

---

## 🍏 Compiling for iOS

### Generate IPA (Manual/Ad-hoc)

```bash
pnpm build:preview:ios
```

_Note: Requires an Apple Developer Program membership._

### Simulator Build

To test on the iOS simulator locally:

```bash
eas build --profile simulator --platform ios
```

---

## 📦 Artifact Creation Summary

| Format     | Target Platform | Command                         | Notes                   |
| :--------- | :-------------- | :------------------------------ | :---------------------- |
| **.apk**   | Android (Local) | `pnpm build:preview:android`    | For direct installation |
| **.aab**   | Android (Store) | `pnpm build:production:android` | For Play Store upload   |
| **.ipa**   | iOS (Devices)   | `pnpm build:preview:ios`        | Requires signed profile |
| **Bundle** | All             | `npx expo export`               | Static JS bundle        |

---

## 🔍 Troubleshooting

### App Crashes on Start

1. **Clear Cache**: `pnpm start --clear`
2. **Re-Prebuild**: `rm -rf android ios && pnpm prebuild`
3. **Check Native Logs**:
   - Android: `adb logcat *:E`
   - iOS: Open `Console.app` on Mac and select device.

### Reanimated Issues

If you see a Reanimated error, ensure the plugin is the LAST in `babel.config.js`:

```js
plugins: [
  // ... other plugins
  'react-native-reanimated/plugin', // MUST BE LAST
];
```

---

**Last Updated**: March 2, 2026
**EAS Project ID**: `c3e1075b-6fe7-4686-aa49-35b46a229044`
**Bundle ID**: `com.futurus`
