# Deployment Steps - Manual Execution Required

The deployment setup is now complete! However, some steps require interactive user input. Please follow these steps:

## Step 1: Create EAS Project

You need to create the EAS project interactively. Run this command and answer the prompts:

```bash
cd /Users/galo/PROJECTS/sportcenter.space/mobile/template

# This will ask: "Would you like to create a project for @futuruspy/futurus?"
# Answer: Yes
eas project:init
```

After this completes, it will give you a Project ID. Copy that ID.

## Step 2: Update env.js with Project ID

Open `/Users/galo/PROJECTS/sportcenter.space/mobile/template/env.js` and update line 42:

```javascript
const EAS_PROJECT_ID = 'YOUR_PROJECT_ID_HERE'; // Replace with the actual ID from step 1
```

## Step 3: Verify Configuration

Run this to verify the configuration is correct:

```bash
APP_ENV=development npx expo config --json
```

You should see no errors.

## Step 4: Build Staging Version (Optional - For Testing)

Build a staging version to test on your device:

```bash
# iOS (TestFlight)
pnpm build:staging:ios

# Android (APK)
pnpm build:staging:android
```

This will take 15-30 minutes. You'll get a QR code to download the build.

## Step 5: Build Production Version

When ready for App Store/Play Store:

```bash
# Build both platforms
eas build --profile production --platform all

# Or build separately:
pnpm build:production:ios
pnpm build:production:android
```

## Step 6: Submit to Stores

After builds complete:

```bash
# iOS (App Store)
eas submit --platform ios --latest

# Android (Play Store)
eas submit --platform android --latest
```

## Current Status

✅ **Completed:**

- EAS CLI installed (v16.24.0)
- Logged in as: futuruspy
- Environment variables configured
- Build profiles configured (development, staging, production)
- App identifiers set:
  - iOS Bundle ID: com.futurus.development / com.futurus.staging / com.futurus (production)
  - Android Package: com.futurus.development / com.futurus.staging / com.futurus (production)
- App name: Futurus

⚠️ **Requires Your Action:**

- Create EAS project (Step 1-2)
- Deploy backend API and update .env.production
- Set up Apple Developer account ($99/year)
- Set up Google Play Console ($25 one-time)
- Prepare app store assets (screenshots, descriptions)

## Quick Reference

**Environment Files:**

- `.env.development` - For local development
- `.env.staging` - For internal testing
- `.env.production` - For production builds

**Build Commands:**

```bash
pnpm build:development:ios      # Dev build for iOS
pnpm build:development:android  # Dev build for Android
pnpm build:staging:ios          # Staging for iOS TestFlight
pnpm build:staging:android      # Staging APK for Android
pnpm build:production:ios       # Production iOS
pnpm build:production:android   # Production Android
```

**EAS Documentation:**

- https://docs.expo.dev/eas/
- https://docs.expo.dev/build/introduction/
- https://docs.expo.dev/submit/introduction/

## Troubleshooting

**"Invalid environment variables" error:**

- Make sure you're in the correct directory
- Check that .env.development, .env.staging, and .env.production exist
- Verify API_URL and SECRET_KEY are set in each file

**"EAS project not configured" error:**

- Run `eas project:init` and answer yes to create the project
- Update EAS_PROJECT_ID in env.js with the generated ID

**Build fails:**

- Check `eas build:list` for error details
- Verify credentials are set up correctly
- Run `eas build --profile staging --platform ios --clear-credentials` to reset

---

## Next Steps

1. Run `eas project:init` to create your EAS project
2. Update the EAS_PROJECT_ID in env.js
3. Deploy your backend API
4. Update .env.production with your production API URL
5. Run a staging build to test
6. Submit to App Store and Play Store

Good luck with your deployment! 🚀
