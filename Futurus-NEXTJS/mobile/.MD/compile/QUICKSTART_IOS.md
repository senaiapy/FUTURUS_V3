# iOS Build - Quick Start Guide

## TL;DR - Build iOS App Now

```bash
cd /Users/galo/PROJECTS/futurus.com.br-version1.0.8/mobile
APP_ENV=production EXPO_NO_DOTENV=1 eas build --profile production --platform ios
```

**That's it!** The interactive build will guide you through the rest.

---

## What This Command Does

1. ✅ Loads production environment variables from `eas.json`
2. ✅ Uses your Apple Developer credentials (prompts if needed)
3. ✅ Builds iOS app on EAS cloud servers
4. ✅ Signs with distribution certificate
5. ✅ Generates `.ipa` file for App Store

---

## After Build Completes (15-20 min)

### Submit to App Store:

```bash
eas submit --platform ios
```

**Or:**

```bash
npm run submit:ios
```

---

## Complete Documentation

- **Full Guide**: [BUILD_IOS.md](./BUILD_IOS.md)
- **Troubleshooting**: [BUILD_IOS_TROUBLESHOOTING.md](./BUILD_IOS_TROUBLESHOOTING.md)

---

## Configuration Summary

**Already Configured:**

- ✅ Bundle ID: `com.futurus`
- ✅ Apple Team: `5MSQX2BRA2` (marcelo anjos)
- ✅ Version: `1.0.8`
- ✅ Build Number: `1`
- ✅ Production API: `https://api.futurus.com.br/api`
- ✅ EAS Updates: Enabled
- ✅ Credentials: Already set up

---

## Monitor Build

**Web Dashboard:**

```
https://expo.dev/accounts/futuruspy/projects/pyfoundation/builds
```

**Terminal:**

```bash
eas build:list --platform ios
```

---

## Need Help?

**Build Failed?** Check [BUILD_IOS_TROUBLESHOOTING.md](./BUILD_IOS_TROUBLESHOOTING.md)

**Common Issues:**

- Remove `--non-interactive` flag to see errors
- Ensure EAS CLI is logged in: `eas whoami`
- Check build logs on dashboard

---

## Version Updates (Future)

```bash
# Update version in package.json first
# Then:
eas build:version:set --platform ios
APP_ENV=production EXPO_NO_DOTENV=1 eas build --profile production --platform ios
```

---

**Ready to build? Run the command above!** 🚀
