# FUTURUS Prediction Market - Deployment Guide

## Overview

This guide covers the complete deployment process for the FUTURUS prediction market mobile application integrated with Laravel backend.

---

## Prerequisites

### Backend (Laravel)
- PHP 8.1+
- Composer
- MySQL/MariaDB
- Laravel 9.x or later
- CORS enabled for mobile app domain

### Mobile App (Expo/React Native)
- Node.js 18+
- pnpm or npm
- Expo CLI
- EAS account (for app store deployment)
- iOS: Xcode 14+
- Android: Android Studio

---

## 1. Backend Configuration

### Laravel Setup

```bash
cd /path/to/LARAVEL/core
```

#### Environment Variables (.env)

```env
APP_NAME=Futurus
APP_ENV=production
APP_DEBUG=false
APP_URL=https://api.futurus.us

DB_CONNECTION=mysql
DB_HOST=your_database_host
DB_PORT=3306
DB_DATABASE=futurus
DB_USERNAME=your_db_username
DB_PASSWORD=your_db_password

# Sanctum Configuration
SANCTUM_TOKEN_TTL=1440
SANCTUM_TOKEN_EXPIRED_TTL=20160
SANCTUM_STATEFUL_DOMAINS=api.futurus.us

# Payment Gateway (PIX)
PIX_CLIENT_ID=your_pix_client_id
PIX_CLIENT_SECRET=your_pix_secret
PIX_WEBHOOK_URL=https://api.futurus.us/pix/webhook

# USDC (Solana)
USDC_WALLET_ADDRESS=your_usdc_wallet_address
USDC_NETWORK=solana
```

#### CORS Configuration (config/cors.php)

```php
return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],
    'allowed_methods' => ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    'allowed_origins' => [
        'http://localhost:6062',
        'exp://192.168.*:19000', // Expo development
        'https://futurus.us',      // Production
    ],
    'allowed_headers' => ['Content-Type', 'Authorization', 'X-Requested-With'],
    'supports_credentials' => true,
    'max_age' => 86400,
];
```

#### Database Migrations

```bash
php artisan migrate
php artisan optimize:clear
```

---

## 2. Mobile App Configuration

### Environment Files

#### Development (.env.development)
```env
NODE_ENV=development
API_URL=http://localhost:6062/api
EXPO_PUBLIC_API_URL=http://localhost:6062/api
SIMPLE_API_URL=http://localhost:6062
IMAGE_BASE_URL=http://localhost:6062/storage/app
```

#### Production (.env.production)
```env
NODE_ENV=production
API_URL=https://api.futurus.us/api
EXPO_PUBLIC_API_URL=https://api.futurus.us/api
SIMPLE_API_URL=https://api.futurus.us
IMAGE_BASE_URL=https://api.futurus.us/images

# EAS Configuration
EAS_PROJECT_ID=762f480f-9c15-44b5-99a6-e228c430a71c
EXPO_ACCOUNT_OWNER=senaiapy

# Payment Configuration
NEXT_PUBLIC_ZAP_PHONE=5511995009969
NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY=your_mercado_pago_key
MERCADO_PAGO_ACCESS_TOKEN=your_mercado_pago_token
MERCADO_PAGO_WEBHOOK_SECRET=your_webhook_secret
NEXT_PUBLIC_WALLET_ADDRESS=your_wallet_address
```

### API Configuration (src/api/common/client.tsx)

The API client is already configured to:
- Use Laravel Sanctum token authentication
- Handle 401 errors by clearing tokens
- Retry failed requests automatically

---

## 3. Build and Test

### Local Development

```bash
cd /Users/galo/Desktop/futurus.net.br/FUTURUS/mobile

# Install dependencies
pnpm install

# Start development server
pnpm start

# Open Expo Go app
# Available at http://localhost:19006
```

### Build for Production

```bash
# iOS Build
pnpm build:ios

# Android Build
pnpm build:android

# iOS Simulator Test
pnpm ios

# Android Emulator Test
pnpm android
```

---

## 4. Deployment to App Stores

### EAS (Expo Application Services)

#### Configure EAS (if not already configured)

```bash
npx eas init
```

#### Build for App Store

```bash
# iOS App Store
npx eas build --profile production --platform ios

# Google Play Store
npx eas build --profile production --platform android
```

#### Submit to App Stores

```bash
# iOS
eas submit --platform ios

# Android
eas submit --platform android
```

### Manual Build (if needed)

```bash
# Build iOS (Xcode)
npx expo prebuild --platform ios --clean
# Then open ios/ folder in Xcode and submit manually

# Build Android (Android Studio)
npx expo prebuild --platform android --clean
# Then open android/ folder in Android Studio and submit manually
```

---

## 5. API Testing

### Required Laravel Endpoints

Test all endpoints using Postman or curl:

#### Authentication
```bash
# Register
curl -X POST https://api.futurus.us/api/register \
  -H "Content-Type: application/json" \
  -d '{"firstname":"Test","lastname":"User","email":"test@example.com","password":"password123"}'

# Login
curl -X POST https://api.futurus.us/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Get Profile (requires token)
curl -X GET https://api.futurus.us/api/auth/user \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Markets
```bash
# List Markets
curl -X GET "https://api.futurus.us/api/markets?page=1&limit=20" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get Market by Slug
curl -X GET https://api.futurus.us/api/markets/market-slug \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get Categories
curl -X GET https://api.futurus.us/api/market/categories \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Trading/Purchases
```bash
# Place Bet
curl -X POST https://api.futurus.us/api/purchase \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"market_id":"1","option_id":"1","buy_option":"yes","shares":10,"amount":10}'

# Get My Bets
curl -X GET "https://api.futurus.us/api/purchase?page=1&limit=20" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get Positions
curl -X GET "https://api.futurus.us/api/purchase/positions" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Wallet
```bash
# Get Balance
curl -X GET https://api.futurus.us/api/wallet \
  -H "Authorization: Bearer YOUR_TOKEN"

# Deposit Methods
curl -X GET https://api.futurus.us/api/wallet/deposit-methods \
  -H "Authorization: Bearer YOUR_TOKEN"

# Initiate Deposit (PIX)
curl -X POST https://api.futurus.us/api/wallet/deposit \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"amount":100,"paymentMethod":"PIX"}'

# Withdraw
curl -X POST https://api.futurus.us/api/wallet/withdraw \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"method":"pix","amount":100,"pixKey":"000201010001"}'

# Transactions
curl -X GET "https://api.futurus.us/api/wallet/transactions?page=1&limit=20" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 6. Common Issues and Solutions

### Issue: CORS Error

**Symptom**: "Access to fetch at ... from origin ... has been blocked by CORS policy"

**Solution**:
1. Verify Laravel CORS configuration includes your mobile app URL
2. Check OPTIONS preflight requests are handled
3. Ensure `supports_credentials: true` in CORS config

### Issue: 401 Unauthorized

**Symptom**: Login fails with 401 error

**Solution**:
1. Verify credentials are correct
2. Check Laravel user status is not banned
3. Clear mobile app token storage and re-login

### Issue: Payment Timeout

**Symptom**: Deposit initiated but not confirmed

**Solution**:
1. Check webhook URL is accessible
2. Verify payment gateway is active
3. Check Laravel logs for webhook errors

### Issue: Push Notifications Not Working

**Symptom**: Notifications not received on device

**Solution**:
1. Verify Expo Push Notifications are configured
2. Check device has notifications enabled in OS settings
3. Verify push token is sent to Laravel backend
4. Test using Expo Notification Tool:
   ```bash
   npx expo-notifications
   ```

### Issue: Images Not Loading

**Symptom**: Market images, user avatars not displaying

**Solution**:
1. Verify `IMAGE_BASE_URL` is correct in .env
2. Check Laravel storage link is publicly accessible
3. Clear image cache in mobile app by restarting

### Issue: Transaction Status Not Updating

**Symptom**: Transaction shows as pending after payment

**Solution**:
1. Check Laravel cron jobs are running
2. Verify payment webhook is calling Laravel correctly
3. Check transaction status in database

---

## 7. Performance Optimization

### Image Optimization
- Use WebP format for market images
- Implement lazy loading for market lists
- Cache market categories

### Data Fetching
- Implement pagination for all list endpoints
- Use React Query's built-in caching
- Deduplicate API calls in components

### State Management
- Use Zustand for global auth state (already implemented)
- Minimize unnecessary re-renders
- Use memo for expensive components

---

## 8. Security Checklist

### Backend
- [ ] Enable HTTPS for all endpoints
- [ ] Implement rate limiting on sensitive endpoints
- [ ] Sanitize all user inputs
- [ ] Validate file uploads (type, size)
- [ ] Enable Laravel security headers
- [ ] Configure CORS properly
- [ ] Use Laravel Sanctum for API authentication
- [ ] Mask sensitive logs in production

### Mobile App
- [ ] Store tokens securely (Keychain/KeyStore)
- [ ] Never log sensitive data
- [ ] Clear sensitive data on logout
- [ ] Validate HTTPS certificates
- [ ] Use HTTPS for all API calls
- [ ] Implement certificate pinning for production
- [ ] Enable app transport security (iOS)
- [ ] Enable network security config (Android)

---

## 9. Monitoring and Analytics

### Required Metrics
- API response times
- Error rates by endpoint
- User signup/conversion rates
- Transaction success rates
- App crash rates
- Load times for critical screens

### Error Tracking
- Configure Sentry or similar error tracking service
- Log errors with context (user action, page, device)
- Track exceptions with stack traces

---

## 10. Maintenance

### Regular Tasks
- Update dependencies monthly
- Monitor Laravel security advisories
- Review and optimize slow queries
- Clean up old transactions and logs
- Update SSL certificates before expiration

### Backup Strategy
- Database backups: Daily
- File storage backups: Weekly
- Code repository backups: Every commit

---

## Quick Reference

### Important File Locations

**Laravel Backend:**
- Controllers: `LARAVEL/core/app/Http/Controllers/Api/`
- Models: `LARAVEL/core/app/Models/`
- Routes: `LARAVEL/core/routes/api.php`
- Environment: `LARAVEL/core/.env`

**Mobile App:**
- API: `FUTURUS/mobile/src/api/`
- Screens: `FUTURUS/mobile/src/app/`
- Translations: `FUTURUS/mobile/src/translations/`
- Environment: `FUTURUS/mobile/.env.development` / `.env.production`

### Start Commands

```bash
# Laravel Backend
cd LARAVEL/core
php artisan serve
php artisan queue:work
php artisan schedule:work

# Mobile App
cd FUTURUS/mobile
pnpm start
pnpm run android
```

---

## Support

For issues not covered in this guide, please refer to:
- Laravel Documentation: https://laravel.com/docs
- Expo Documentation: https://docs.expo.dev
- React Native Documentation: https://reactnative.dev
