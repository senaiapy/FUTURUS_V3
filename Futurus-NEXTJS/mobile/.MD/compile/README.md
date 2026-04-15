# Futurus - Mobile App

Full-featured React Native cross-platform mobile application for Futurus e-commerce platform (Brazil). Built with Expo Router for iOS, Android, and Web.

## 📱 Project Overview

- **Version**: 8.0.0
- **Framework**: Expo Router v5.1.0 + React Native 0.79.4
- **Platforms**: iOS, Android, Web
- **Package Manager**: pnpm 10.12.3
- **Bundle ID**: com.futurus
- **EAS Project ID**: 762f480f-9c15-44b5-99a6-e228c430a71c

## 🚀 Quick Start

```bash
# Install dependencies
pnpm install

# Start development server
pnpm start

# Run on specific platforms
pnpm android          # Android device/emulator
pnpm ios              # iOS device/simulator (macOS only)
pnpm web              # Web browser

# Run with environment
pnpm android:staging       # Staging environment
pnpm android:production    # Production environment
```

## 📚 Documentation

All documentation is in **[`md_files/`](md_files/)** (34 comprehensive guides).

### Essential Guides

- **[📖 Documentation Index](md_files/INDEX.md)** - Complete documentation map
- **[🚀 Quick Start](md_files/QUICK_START.md)** - 5-minute setup guide
- **[📱 USB Device Testing](md_files/USB_DEVICE_TESTING.md)** - Physical device setup
- **[⚙️ Environment Variables](md_files/ENVIRONMENT_VARIABLES.md)** - All configuration options
- **[🚢 Deployment Guide](md_files/DEPLOYMENT_GUIDE.md)** - Complete deployment instructions
- **[🌐 Web Deployment](md_files/WEB_DEPLOYMENT.md)** - Netlify/Vercel deployment
- **[🛒 Cart & Wishlist API](md_files/CART_WISHLIST_API_INTEGRATION.md)** - API integration guide
- **[✅ Final Summary](md_files/FINAL_SUMMARY.md)** - All recent changes & fixes
- **[🔧 Quick Fix Guide](md_files/QUICK_FIX_GUIDE.md)** - Troubleshooting reference

## 🏗️ Tech Stack

### Core Framework

- **Expo Router** v5.1.0 - File-based routing
- **React** 19.0.0 - UI library
- **React Native** 0.79.4 - Native components
- **TypeScript** 5.8.3 - Type safety (strict mode)

### State Management

- **Zustand** 5.0.5 - Client state management
- **TanStack React Query** 5.52.1 - Server state & caching
- **react-query-kit** 3.3.0 - Query hooks utilities

### UI & Styling

- **NativeWind** 4.1.21 - Tailwind CSS for React Native
- **Tailwind CSS** 3.4.4 - Utility-first CSS
- **Lucide React Native** 0.546.0 - Icon library
- **Moti** 0.29.0 - Declarative animations
- **react-native-reanimated** 3.17.5 - Low-level animations
- **@gorhom/bottom-sheet** 5.0.5 - Bottom sheet modals

### Forms & Validation

- **React Hook Form** 7.53.0 - Form management
- **Zod** 3.23.8 - Schema validation
- **@hookform/resolvers** 3.9.0 - Validation resolvers

### Storage & Data

- **react-native-mmkv** 3.1.0 - Fast encrypted storage
- **Axios** 1.7.5 - HTTP client

### Internationalization

- **i18next** 23.14.0 - i18n framework
- **react-i18next** 15.0.1 - React bindings
- **expo-localization** 16.1.5 - Device locale detection
- **Languages**: Spanish (es), English (en), Portuguese (pt), Arabic (ar)

### Navigation & Gestures

- **react-native-gesture-handler** 2.24.0 - Touch gestures
- **react-native-screens** 4.11.1 - Native screen optimization
- **react-native-safe-area-context** 5.4.0 - Safe area support

### Utilities

- **@shopify/flash-list** 1.7.6 - Performant lists
- **react-error-boundary** 4.0.13 - Error handling
- **react-native-flash-message** 0.4.2 - Toast notifications
- **react-native-keyboard-controller** 1.17.4 - Keyboard management
- **app-icon-badge** 0.1.2 - App icon badges (dev/staging)

## 📱 Features

### E-Commerce Core

- ✅ Product browsing with search & filters
- ✅ Shopping cart with backend sync
- ✅ Wishlist management
- ✅ User authentication (JWT tokens)
- ✅ Order checkout & history
- ✅ Real-time inventory updates
- ✅ Currency conversion (USD → Guaraníes)

### User Experience

- ✅ Dark mode support
- ✅ Multi-language (4 languages)
- ✅ Smooth animations & transitions
- ✅ Pull-to-refresh
- ✅ Infinite scroll pagination
- ✅ Image lazy loading
- ✅ Offline error handling
- ✅ Touch-optimized UI

### Technical Features

- ✅ File-based routing (Expo Router)
- ✅ Server Components support (SSR for web)
- ✅ Type-safe API calls
- ✅ Automatic JWT refresh
- ✅ Local data persistence (MMKV)
- ✅ Environment-based configuration
- ✅ Development badge overlay

## 📂 Project Structure

```
mobile/
├── src/                          # Source code (131 TypeScript files)
│   ├── app/                     # Expo Router pages (file-based routing)
│   │   ├── (app)/              # Authenticated app pages
│   │   ├── feed/               # Feed page
│   │   ├── product/            # Product detail pages
│   │   ├── login.tsx           # Login screen
│   │   ├── register.tsx        # Registration screen
│   │   ├── onboarding.tsx      # Onboarding flow
│   │   ├── dashboard.tsx       # Main dashboard
│   │   ├── checkout.tsx        # Checkout page
│   │   ├── order-confirmation.tsx
│   │   ├── _layout.tsx         # Root layout
│   │   └── [...missing].tsx    # 404 catch-all
│   │
│   ├── api/                    # API integration layer (React Query)
│   │   ├── auth/              # Authentication hooks
│   │   ├── products/          # Product queries
│   │   ├── cart/              # Cart API
│   │   ├── wishlist/          # Wishlist API
│   │   ├── orders/            # Orders API
│   │   ├── posts/             # Posts API
│   │   └── common/            # Common utilities
│   │
│   ├── components/            # Reusable UI components
│   │   ├── ui/               # UI primitives
│   │   ├── settings/         # Settings components
│   │   ├── buttons.tsx
│   │   ├── inputs.tsx
│   │   ├── header.tsx
│   │   ├── card.tsx
│   │   ├── carousel.tsx
│   │   └── login-form.test.tsx
│   │
│   ├── lib/                  # Utilities & hooks
│   │   ├── hooks/           # Custom React hooks
│   │   ├── auth/            # Auth utilities
│   │   ├── cart/            # Cart state & logic
│   │   ├── wishlist/        # Wishlist logic
│   │   ├── i18n/            # i18n configuration
│   │   ├── currency.ts      # USD to Guaraní conversion
│   │   ├── storage.tsx      # MMKV storage wrapper
│   │   ├── use-theme-config.tsx
│   │   └── utils.ts         # General utilities
│   │
│   ├── translations/         # i18n language files
│   │   ├── es.json          # Spanish
│   │   ├── en.json          # English
│   │   ├── pt.json          # Portuguese
│   │   └── ar.json          # Arabic
│   │
│   └── types/               # TypeScript type definitions
│
├── android/                  # Android native code
├── ios/                     # iOS native code
├── assets/                  # Images, fonts, icons
│   ├── icon.png
│   ├── splash-icon.png
│   ├── adaptive-icon.png
│   └── fonts/
│
├── .maestro/                # E2E automation tests
├── .github/workflows/       # CI/CD pipelines (13 workflows)
├── md_files/                # 📚 Documentation (34 guides)
├── scripts/                 # Utility scripts
├── docs/                    # VitePress documentation
│
├── Configuration Files
│   ├── app.config.ts       # Expo app configuration
│   ├── eas.json           # EAS Build profiles
│   ├── package.json       # Dependencies & scripts
│   ├── tsconfig.json      # TypeScript config
│   ├── tailwind.config.js # Tailwind CSS config
│   ├── jest.config.js     # Jest testing config
│   ├── metro.config.js    # Metro bundler config
│   ├── eslint.config.mjs  # ESLint config
│   ├── babel.config.js    # Babel config
│   │
│   ├── Environment Files
│   ├── .env.development   # Development environment
│   ├── .env.staging       # Staging environment
│   ├── .env.production    # Production environment
│   ├── env.js             # Env validation (Zod)
│   │
│   ├── Deployment Scripts
│   ├── netlify.toml       # Netlify config
│   ├── vercel.json        # Vercel config
│   ├── deploy-web.sh      # Web deployment script
│   │
│   └── Utility Scripts
│       ├── fix-and-restart.sh          # Auto-fix script
│       ├── start-mobile.sh             # Mobile startup
│       ├── setup-android-usb.sh        # USB debugging setup
│       └── test-connection.sh          # Connection tester
```

## 🔧 Configuration

### Environment Variables

Create `.env.development`, `.env.staging`, or `.env.production`:

```bash
# API Configuration
API_URL=http://localhost:6062/api
SIMPLE_API_URL=http://localhost:6060

# Security
SECRET_KEY=your-secret-key

# Features
ENABLE_ANALYTICS=false
ENABLE_CRASH_REPORTING=false
```

### Device-Specific URLs

**Android Physical Device (USB):**

```bash
# Setup ADB reverse port forwarding
pnpm setup-android-usb
# Then use localhost in .env
API_URL=http://localhost:6062/api
```

**iOS Simulator:**

```bash
API_URL=http://localhost:6062/api
```

**Android Emulator:**

```bash
API_URL=http://10.0.2.2:6062/api
```

**Network Access (WiFi):**

```bash
API_URL=http://192.168.x.x:6062/api
```

See [Environment Variables Guide](md_files/ENVIRONMENT_VARIABLES.md) for complete details.

## 🧪 Testing

### Unit Tests (Jest)

```bash
pnpm test              # Run all tests
pnpm test:watch        # Watch mode
pnpm test:ci           # With coverage
```

### E2E Tests (Maestro)

```bash
pnpm install-maestro   # Install Maestro CLI
pnpm e2e-test         # Run E2E tests
```

### Code Quality

```bash
pnpm lint              # ESLint
pnpm type-check        # TypeScript
pnpm lint:translations # i18n JSON validation
pnpm check-all         # Run all checks
```

### Test Coverage

- Unit tests: Jest with React Testing Library
- E2E tests: Maestro automation
- Coverage reports: JSON summary, JUnit XML
- CI reporters: GitHub Actions integration

## 🚢 Deployment

### EAS Build (Native Apps)

**Production Builds:**

```bash
# Login to EAS
pnpm eas-login

# Build for stores
pnpm build:production:android    # Google Play
pnpm build:production:ios        # App Store
pnpm build:all                   # Both platforms

# Submit to stores
pnpm submit:android              # Google Play submission
pnpm submit:ios                  # App Store submission
```

**Staging Builds (Internal Testing):**

```bash
pnpm build:staging:android       # Android APK
pnpm build:staging:ios           # iOS TestFlight
```

**Development Builds:**

```bash
pnpm build:development:android   # Dev client (Android)
pnpm build:development:ios       # Dev client (iOS)
```

### Web Deployment

**Build for Web:**

```bash
# Production export
pnpm web:export

# Staging export
pnpm web:export:staging

# Serve locally
pnpm web:serve
```

**Deploy to Netlify:**

```bash
# Automatic deployment via netlify.toml
# Push to main branch or run:
pnpm deploy-web
```

**Deploy to Vercel:**

```bash
# Automatic deployment via vercel.json
# Connected to Git repository
```

See [Deployment Guide](md_files/DEPLOYMENT_GUIDE.md) for complete instructions.

## 🛠️ Available Scripts

### Development

```bash
pnpm start                 # Start dev server
pnpm android              # Run Android
pnpm ios                  # Run iOS
pnpm web                  # Run web
pnpm prebuild             # Generate native code
pnpm clean                # Clean prebuild
```

### Environment-Specific

```bash
pnpm start:staging        # Start staging
pnpm start:production     # Start production
pnpm android:staging      # Android staging
pnpm ios:production       # iOS production
```

### Build & Release

```bash
pnpm apk                  # Build Android APK (debug)
pnpm apk-release          # Build APK (release)
pnpm apk-install          # Install APK via ADB
pnpm app-release          # Create new release
pnpm version              # Bump version
```

### Maintenance

```bash
pnpm doctor               # Expo diagnostics
pnpm expo-fix             # Fix dependencies
pnpm cleanp               # Clean project
pnpm cnode                # Remove node_modules
pnpm erase                # Full clean
pnpm pods                 # iOS pod install
```

### Updates (OTA)

```bash
pnpm update:preview       # Push preview update
pnpm update:production    # Push production update
```

See [package.json](package.json) for all 60+ available scripts.

## 🔐 Authentication Flow

1. User registers/logs in via `/login` or `/register`
2. Backend returns JWT token
3. Token stored in MMKV (encrypted storage)
4. Axios interceptor automatically adds token to requests
5. Token refresh on 401 responses
6. Logout clears token and redirects to login

## 💰 Currency System

- **Backend**: Stores prices in USD
- **Frontend**: Displays prices in Guaraníes (₲)
- **Exchange Rate**: 1 USD = 7,300 Guaraníes
- **Utility**: `lib/currency.ts` - `convertAndFormatPrice()`

```typescript
import { convertAndFormatPrice } from '@/lib/currency';

// Display price
{
  convertAndFormatPrice(product.price);
} // "₲386.754"
```

## 🌍 Internationalization

- **Framework**: i18next + react-i18next
- **Languages**: 4 (es, en, pt, ar)
- **Auto-detection**: Device locale via expo-localization
- **Translation files**: `src/translations/*.json`

```typescript
import { useTranslation } from 'react-i18next';

const { t } = useTranslation();
{
  t('common.add_to_cart');
}
```

## 🎨 Styling & Theming

- **System**: NativeWind (Tailwind CSS for React Native)
- **Dark Mode**: Class-based strategy
- **Custom Font**: Inter
- **Configuration**: `tailwind.config.js`

```tsx
<View className="flex-1 bg-white dark:bg-gray-900">
  <Text className="text-lg font-bold text-gray-900 dark:text-white">
    Product Title
  </Text>
</View>
```

## 🔄 CI/CD Pipeline

### GitHub Actions Workflows (13)

1. **test.yml** - Unit tests on push/PR
2. **type-check.yml** - TypeScript validation
3. **lint-ts.yml** - ESLint checks
4. **expo-doctor.yml** - Expo health check
5. **e2e-android.yml** - E2E Android tests
6. **e2e-android-maestro.yml** - Maestro E2E
7. **e2e-android-eas-build.yml** - EAS build E2E
8. **eas-build-prod.yml** - Production builds
9. **eas-build-qa.yml** - Staging builds
10. **compress-images.yml** - Image optimization
11. **new-app-version.yml** - Auto version bump
12. **new-github-release.yml** - Release creation
13. **stale.yml** - Stale issue management

### Pre-commit Hooks (Husky)

- Lint staged files
- Run type check
- Validate commit messages (Commitlint)

## 🐛 Troubleshooting

### Common Issues

**Issue**: `localStorage is not defined` error
**Fix**: Ensure browser environment checks in API services

**Issue**: Cannot connect to API on physical device
**Fix**: Use ADB reverse port forwarding or network IP

**Issue**: Build fails with dependency errors
**Fix**: `pnpm cnode && pnpm install`

**Issue**: iOS build fails
**Fix**: `cd ios && pod install && cd ..`

**Issue**: Stuck on loading screen
**Fix**: Check API_URL in environment file, verify backend is running

See [Quick Fix Guide](md_files/QUICK_FIX_GUIDE.md) for comprehensive troubleshooting.

## 📊 Project Stats

- **TypeScript Files**: 131 source files
- **Documentation**: 34 comprehensive guides
- **Dependencies**: ~180 npm packages
- **Test Coverage**: Unit + E2E
- **Supported Platforms**: 3 (iOS, Android, Web)
- **Languages**: 4 (es, en, pt, ar)
- **CI/CD Workflows**: 13 automated pipelines

## 🔗 Integration

This mobile app integrates with the Futurus monorepo:

- **Backend API**: [backend/](../backend/) - NestJS API (port 6062)
- **Frontend Web**: [frontend/](../frontend/) - Next.js storefront (port 6060)
- **Admin Panel**: [admin/](../admin/) - Next.js admin (port 6061)
- **Database**: PostgreSQL (port 15432)

## 🎯 Key Development Rules

1. **Type Safety**: All code must be TypeScript with strict mode
2. **Currency**: Use `convertAndFormatPrice()` for all price displays
3. **API Calls**: Use React Query hooks from `src/api/`
4. **State Management**: Zustand for client state, React Query for server state
5. **Styling**: Use NativeWind/Tailwind classes (no inline styles)
6. **Navigation**: Use Expo Router's file-based routing
7. **i18n**: Use `useTranslation()` hook for all user-facing text
8. **Storage**: Use MMKV wrapper from `lib/storage.tsx`
9. **Testing**: Write tests for all components and utilities
10. **Documentation**: Update `md_files/` when adding features

## 🤝 Contributing

1. Follow the project structure and conventions
2. Add documentation to `md_files/` for new features
3. Update `md_files/INDEX.md` when adding new docs
4. Run `pnpm check-all` before committing
5. Write tests for new features
6. Follow TypeScript strict mode
7. Use conventional commits (Commitlint enforced)

## 📄 License

See LICENSE file in repository root.

---

**For detailed documentation, browse [`md_files/`](md_files/) - 34 comprehensive guides covering setup, development, deployment, troubleshooting, and more.**

**Quick Links**: [Index](md_files/INDEX.md) | [Quick Start](md_files/QUICK_START.md) | [Deployment](md_files/DEPLOYMENT_GUIDE.md) | [Environment Setup](md_files/ENVIRONMENT_VARIABLES.md)
