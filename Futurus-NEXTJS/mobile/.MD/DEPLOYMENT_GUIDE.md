# 🚀 Futurus - Deployment Guide

Complete guide to deploy your React Native e-commerce app to iOS App Store and Google Play Store.

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [EAS Build Setup](#eas-build-setup)
4. [Build for Testing](#build-for-testing)
5. [Production Build](#production-build)
6. [App Store Deployment (iOS)](#ios-deployment)
7. [Play Store Deployment (Android)](#android-deployment)
8. [CI/CD Setup](#cicd-setup)
9. [Troubleshooting](#troubleshooting)

---

## 🔧 Prerequisites

### Required Accounts:

- [ ] **Expo Account** - Sign up at https://expo.dev
- [ ] **Apple Developer Account** ($99/year) - https://developer.apple.com
- [ ] **Google Play Console** ($25 one-time) - https://play.google.com/console
- [ ] **Backend Server** - API deployed and accessible

### Required Tools:

```bash
# Install EAS CLI globally
npm install -g eas-cli

# Login to Expo
eas login

# Verify installation
eas --version
```

---

## 🌍 Environment Setup

### 1. Update Environment Files

**Production** (`.env.production`):

```bash
API_URL=https://your-production-api.com/api
SECRET_KEY=your-secure-production-key
ENABLE_ANALYTICS=true
ENABLE_CRASH_REPORTING=true
```

**Staging** (`.env.staging`):

```bash
API_URL=https://staging-api.your-domain.com/api
SECRET_KEY=staging-key
ENABLE_ANALYTICS=true
ENABLE_CRASH_REPORTING=false
```

### 2. Deploy Your Backend

Before deploying the mobile app, ensure your backend is accessible:

```bash
# Option 1: Deploy to Heroku
cd /Users/galo/PROJECTS/sportcenter.space/mobile/Sellify-main/backend
heroku create fratelli-api
git push heroku main

# Option 2: Deploy to Railway
# railway up

# Option 3: Deploy to Render, AWS, or your preferred host
```

Update API_URL in `.env.production` with your backend URL.

---

## 🏗️ EAS Build Setup

### 1. Initialize EAS Project

```bash
cd /Users/galo/PROJECTS/sportcenter.space/mobile/template

# Initialize EAS (one-time setup)
eas build:configure

# This will create eas.json if not exists
```

### 2. Update app.json

The `app.json` has been configured with:

- Bundle ID (iOS): `com.futurus`
- Package Name (Android): `com.futurus`
- App Name: "Futurus"

**Important**: Update these values if you want different identifiers:

```json
{
  "expo": {
    "name": "Your App Name",
    "slug": "your-app-slug",
    "ios": {
      "bundleIdentifier": "com.yourcompany.yourapp"
    },
    "android": {
      "package": "com.yourcompany.yourapp"
    }
  }
}
```

### 3. Configure EAS Project ID

```bash
# Create/link EAS project
eas project:init

# This will update app.json with your project ID
```

---

## 🧪 Build for Testing

### Internal Testing Build (Staging)

**iOS (TestFlight):**

```bash
# Build for iOS staging
pnpm build:staging:ios
# or
eas build --profile staging --platform ios

# Install on device via QR code or TestFlight
```

**Android (Internal Testing):**

```bash
# Build APK for staging
pnpm build:staging:android
# or
eas build --profile staging --platform android

# Install APK directly on device
```

### Development Build (For Testing)

```bash
# iOS Simulator
pnpm build:development:ios
eas build --profile development --platform ios

# Android Emulator
pnpm build:development:android
eas build --profile development --platform android
```

---

## 🏭 Production Build

### iOS Production Build

```bash
# Build for App Store
pnpm build:production:ios

# Or manually:
cross-env APP_ENV=production EXPO_NO_DOTENV=1 eas build --profile production --platform ios

# This will:
# 1. Build your app
# 2. Create an .ipa file
# 3. Upload to EAS servers
# 4. Provide download link
```

**Build Time**: ~15-30 minutes

### Android Production Build

```bash
# Build AAB for Play Store
pnpm build:production:android

# Or manually:
cross-env APP_ENV=production EXPO_NO_DOTENV=1 eas build --profile production --platform android

# This will:
# 1. Build your app
# 2. Create an .aab (App Bundle) file
# 3. Upload to EAS servers
# 4. Provide download link
```

**Build Time**: ~15-25 minutes

### Build Both Platforms

```bash
# Build iOS and Android simultaneously
eas build --profile production --platform all
```

---

## 📱 iOS Deployment (App Store)

### Step 1: Prepare App Store Connect

1. **Go to App Store Connect**: https://appstoreconnect.apple.com
2. **Create New App**:
   - Click "My Apps" → "+" → "New App"
   - Platform: iOS
   - Name: "Futurus"
   - Bundle ID: `com.futurus` (must match app.json)
   - SKU: `futurus-001`
   - User Access: Full Access

### Step 2: Submit Build

```bash
# Option A: Auto-submit after build
eas build --profile production --platform ios --auto-submit

# Option B: Manual submit after build completes
eas submit --platform ios --latest

# Option C: Submit specific build
eas submit --platform ios --id <build-id>
```

### Step 3: App Store Listing

Fill out in App Store Connect:

- [ ] **App Information**: Description, keywords, category
- [ ] **Pricing**: Free or paid ($0.99+)
- [ ] **App Privacy**: Data collection details
- [ ] **Screenshots**:
  - iPhone 6.7" (1290x2796) - 3-10 images
  - iPad Pro 12.9" (2048x2732) - 3-10 images
- [ ] **App Icon**: 1024x1024 PNG
- [ ] **Age Rating**: Select appropriate age rating
- [ ] **App Review Information**: Contact details

### Step 4: Submit for Review

1. Select your build in "Build" section
2. Click "Submit for Review"
3. Review time: 1-3 days typically

---

## 🤖 Android Deployment (Play Store)

### Step 1: Prepare Play Console

1. **Go to Play Console**: https://play.google.com/console
2. **Create New App**:
   - App name: "Futurus"
   - Default language: English (US)
   - App or game: App
   - Free or paid: Free
   - Accept declarations

### Step 2: Submit Build

```bash
# Option A: Auto-submit after build
eas build --profile production --platform android --auto-submit

# Option B: Manual submit
eas submit --platform android --latest

# You'll need to provide:
# - Service Account Key (JSON file from Google Cloud)
# - Track: internal, alpha, beta, or production
```

### Service Account Setup (One-time):

1. Go to Google Cloud Console
2. Create Service Account
3. Download JSON key
4. Enable Google Play Android Developer API
5. Grant access in Play Console

```bash
# Configure service account
eas submit --platform android
# Follow prompts to upload service account JSON
```

### Step 3: Play Store Listing

Fill out in Play Console:

- [ ] **App Details**:
  - Short description (80 chars)
  - Full description (4000 chars)
  - App icon (512x512 PNG)
  - Feature graphic (1024x500)
- [ ] **Screenshots**:
  - Phone: 2-8 images (min 320px on shortest side)
  - 7" Tablet: 2-8 images
  - 10" Tablet: 2-8 images
- [ ] **Categorization**: Category and tags
- [ ] **Contact Details**: Email, phone (optional), website
- [ ] **Privacy Policy**: URL to privacy policy
- [ ] **App Content**:
  - Target audience and age rating
  - Content declarations
  - Privacy & security questionnaire

### Step 4: Release

1. **Internal Testing** → Test with up to 100 testers
2. **Closed Testing (Beta)** → Test with limited users
3. **Open Testing** → Public beta
4. **Production** → Full release

Review time: Few hours to 1-2 days

---

## 🔄 CI/CD Setup (Optional but Recommended)

### GitHub Actions

Create `.github/workflows/eas-build.yml`:

```yaml
name: EAS Build

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - uses: pnpm/action-setup@v2
        with:
          version: 10.12.3

      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install

      - name: Run tests
        run: pnpm test

      - name: Type check
        run: pnpm type-check

      - name: Setup Expo
        uses: expo/expo-github-action@v8
        with:
          expo-version: latest
          eas-version: latest
          token: ${{ secrets.EXPO_TOKEN }}

      - name: Build on EAS
        run: eas build --platform all --profile production --non-interactive
```

### Environment Secrets

Add to GitHub Secrets:

- `EXPO_TOKEN` - From `expo whoami --json`
- `GOOGLE_SERVICES_JSON` - Android Firebase config
- `GOOGLE_SERVICE_INFO_PLIST` - iOS Firebase config

---

## 📊 Post-Deployment

### 1. Monitor Builds

```bash
# Check build status
eas build:list

# View build logs
eas build:view <build-id>

# Cancel build
eas build:cancel <build-id>
```

### 2. Update Management

```bash
# OTA (Over-The-Air) Updates with EAS Update
eas update --branch production --message "Bug fixes"

# View updates
eas update:list --branch production
```

### 3. Analytics & Crash Reporting

Install and configure:

```bash
# Firebase
pnpm add @react-native-firebase/app @react-native-firebase/analytics @react-native-firebase/crashlytics

# Sentry
pnpm add @sentry/react-native

# Expo Application Services (built-in)
# Already configured via Expo
```

---

## 🐛 Troubleshooting

### Common Issues:

**1. Build fails with "Bundle ID mismatch"**

```bash
# Ensure app.json matches your Apple Developer account
# Update bundleIdentifier in app.json
```

**2. "Provisioning profile doesn't include signing certificate"**

```bash
# Re-run with --clear-credentials
eas build --profile production --platform ios --clear-credentials
```

**3. Android build fails with "Keystore error"**

```bash
# Reset credentials
eas credentials --platform android --clear
```

**4. API not reachable in production**

```bash
# Check .env.production has correct API_URL
# Verify backend is deployed and accessible
# Test: curl https://your-api-url.com/api/health
```

**5. App crashes on startup**

```bash
# Check logs
eas build:view <build-id>

# Common causes:
# - Missing environment variables
# - API URL incorrect
# - Font loading issues
```

---

## ✅ Pre-Launch Checklist

### Technical:

- [ ] All environment variables configured
- [ ] Backend API deployed and tested
- [ ] Type check passes (`pnpm type-check`)
- [ ] No console errors/warnings
- [ ] App icon and splash screen set
- [ ] Deep linking configured (if needed)
- [ ] Push notifications set up (if needed)

### App Store/Play Store:

- [ ] Screenshots prepared (all required sizes)
- [ ] App description written
- [ ] Privacy policy URL ready
- [ ] Keywords/tags selected
- [ ] Age rating determined
- [ ] Contact information provided
- [ ] Pricing tier selected

### Testing:

- [ ] Tested on iOS device
- [ ] Tested on Android device
- [ ] Tested all user flows
- [ ] Tested payment (if applicable)
- [ ] Tested offline mode
- [ ] Tested on different screen sizes

---

## 📞 Support & Resources

- **EAS Docs**: https://docs.expo.dev/eas/
- **Expo Forums**: https://forums.expo.dev/
- **App Store Review Guidelines**: https://developer.apple.com/app-store/review/guidelines/
- **Play Console Help**: https://support.google.com/googleplay/android-developer/

---

## 🚀 Quick Deployment Commands

```bash
# Full production deployment workflow
cd /Users/galo/PROJECTS/sportcenter.space/mobile/template

# 1. Install dependencies
pnpm install

# 2. Run tests and type check
pnpm test
pnpm type-check

# 3. Build for both platforms
eas build --profile production --platform all

# 4. After build completes, submit to stores
eas submit --platform ios --latest
eas submit --platform android --latest

# 5. Monitor submission status
eas build:list
```

---

## 🎉 Congratulations!

Your Futurus e-commerce app is now deployed!

**Next Steps:**

1. Monitor user feedback
2. Track analytics
3. Plan feature updates
4. Maintain backend infrastructure

Happy selling! 🛍️
