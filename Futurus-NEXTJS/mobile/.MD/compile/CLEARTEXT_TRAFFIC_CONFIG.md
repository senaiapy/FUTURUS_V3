# Cleartext Traffic Configuration for Expo/EAS

## Problem

In release mode, Android blocks HTTP traffic by default, causing the app to freeze on the splash screen when trying to connect to HTTP APIs.

## Solution Applied

### 1. AndroidManifest.xml Configuration

The `android:usesCleartextTraffic="true"` attribute has been added to the `<application>` tag in:

```
mobile/android/app/src/main/AndroidManifest.xml
```

```xml
<application
  android:name=".MainApplication"
  android:label="@string/app_name"
  android:icon="@mipmap/ic_launcher"
  android:roundIcon="@mipmap/ic_launcher_round"
  android:allowBackup="true"
  android:theme="@style/AppTheme"
  android:supportsRtl="true"
  android:usesCleartextTraffic="true">
  <!-- ... -->
</application>
```

### 2. Expo Prebuild Compatibility

Since this project uses a bare workflow with custom native code, the AndroidManifest.xml will not be overwritten by `expo prebuild`.

### 3. EAS Build Configuration

The current EAS build configuration in `eas.json` will use the modified AndroidManifest.xml automatically.

## Building Release APKs

### Local Build

```bash
pnpm release-android-apk
```

### EAS Build

```bash
# Production APK
pnpm build:production:android

# Staging APK
pnpm build:staging:android
```

## Important Notes

⚠️ **Security Warning**: Using `usesCleartextTraffic="true"` allows HTTP connections, which are not encrypted. For production apps handling sensitive data, consider:

1. **Migrate API to HTTPS** (Recommended)
   - Update API URLs in `.env` files to use HTTPS
   - Remove `usesCleartextTraffic` once migration is complete

2. **Or use Network Security Configuration** for specific domains only:
   Create `android/app/src/main/res/xml/network_security_config.xml`:

   ```xml
   <?xml version="1.0" encoding="utf-8"?>
   <network-security-config>
       <domain-config cleartextTrafficPermitted="true">
           <domain includeSubdomains="true">api.futurus.com.br</domain>
       </domain-config>
   </network-security-config>
   ```

   Then reference it in AndroidManifest.xml:

   ```xml
   <application
       android:networkSecurityConfig="@xml/network_security_config"
       ...>
   ```

## Testing

The release APK has been tested and confirmed working with the cleartext traffic configuration.
