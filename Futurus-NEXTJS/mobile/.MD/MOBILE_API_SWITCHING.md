# Mobile App API Backend Switching

## Overview

The mobile app now supports switching between **Laravel** and **NestJS** backends. This allows you to use the existing Laravel backend while migrating to the new NestJS backend.

## Configuration

### Backend Selection (.env File)

The `mobile/.env` file contains the `API` variable that controls which backend to use:

```bash
# Set to 'next' for NestJS backend (port 3001)
# Set to 'laravel' for Laravel backend (port 8000)
API=next
```

### API URLs

```bash
# For Next.js (NestJS) Backend:
EXPO_PUBLIC_API_URL=http://localhost:3001/api

# For Laravel Backend (if switching):
EXPO_PUBLIC_API_URL=http://localhost:8000/api
```

## API Endpoint Compatibility

### Authentication Endpoints

| Endpoint | Laravel | NestJS | Mobile App | Compatible |
|----------|---------|----------|-------------|-------------|
| POST /auth/login | ✅ | ✅ | ✅ | ✅ |
| POST /auth/register | ✅ | ✅ | ✅ | ✅ |
| POST /auth/logout | ✅ | ✅ | ✅ | ✅ |
| GET /auth/user | ✅ | GET /auth/me | ✅ | ⚠️ |
| GET /auth/profile | ✅ | GET /auth/me | ✅ | ⚠️ |
| POST /auth/forgot-password | ✅ | ✅ | ✅ | ✅ |
| POST /auth/verify-code | ✅ | ✅ | ✅ | ✅ |
| POST /auth/reset-password | ✅ | ✅ | ✅ | ✅ |

### Market Endpoints

| Endpoint | Laravel | NestJS | Mobile App | Compatible |
|----------|---------|----------|-------------|-------------|
| GET /markets | ✅ | ✅ | ✅ | ✅ |
| GET /markets/{slug} | ✅ | ✅ | ✅ | ✅ |
| GET /markets/categories | ✅ | GET /settings/languages | ✅ | ⚠️ |
| GET /market/{id}/trends | ✅ | GET /markets/:id/trends | ✅ | ✅ |
| GET /market/bookmarks | ✅ | GET /markets/bookmarks/my-bookmarks | ✅ | ✅ |
| POST /market/{marketId}/bookmark | ✅ | POST /markets/:id/bookmark | ✅ | ✅ |

### Wallet Endpoints

| Endpoint | Laravel | NestJS | Mobile App | Compatible |
|----------|---------|----------|-------------|-------------|
| GET /wallet | ✅ | ✅ | ✅ | ✅ |
| GET /wallet/deposit-methods | ✅ | ✅ | ✅ | ✅ |
| POST /wallet/deposit | ✅ | ✅ | ✅ | ✅ |
| POST /wallet/deposit/confirm | ✅ | ✅ | ❌ | ⚠️ |
| GET /wallet/withdraw-methods | ✅ | ✅ | ✅ | ✅ |
| POST /wallet/withdraw | ✅ | ✅ | ✅ | ✅ |
| GET /wallet/transactions | ✅ | ✅ | ✅ | ✅ |

### Bet/Purchase Endpoints

| Endpoint | Laravel | NestJS | Mobile App | Compatible |
|----------|---------|----------|-------------|-------------|
| POST /bets/buy | ✅ | ✅ | ✅ | ✅ |
| GET /bets/my-bets | ✅ | ✅ | ✅ | ✅ |
| GET /bets/my-positions | ✅ | ✅ | ✅ | ✅ |

### Game/Gamification Endpoints

| Endpoint | Laravel | NestJS | Mobile App | Compatible |
|----------|---------|----------|-------------|-------------|
| GET /game/progress/dashboard | ✅ | ✅ | ✅ | ✅ |
| GET /game/coins/balance | ✅ | ✅ | ✅ | ✅ |
| GET /game/coins/transactions | ✅ | ✅ | ✅ | ✅ |
| GET /game/tasks | ✅ | ✅ | ✅ | ✅ |
| GET /game/tasks/user/my-tasks | ✅ | ✅ | ✅ | ✅ |
| POST /game/progress/start/:taskId | ✅ | ✅ | ✅ | ✅ |
| POST /game/progress/complete/:taskId | ✅ | ✅ | ✅ | ✅ |
| GET /game/referrals | ✅ | GET /game/referrals | ✅ | ✅ |
| POST /game/referrals/generate | ✅ | ✅ | ✅ | ✅ |
| GET /game/referrals/{code} | ✅ | GET /game/referrals/:code | ✅ | ✅ |

### Settings Endpoints

| Endpoint | Laravel | NestJS | Mobile App | Compatible |
|----------|---------|----------|-------------|-------------|
| GET /general-setting | ✅ | GET /settings/general | ✅ | ✅ |
| GET /get-countries | ✅ | GET /settings/countries | ✅ | ✅ |
| GET /policies | ✅ | GET /settings/policies | ✅ | ✅ |
| GET /policy/{slug} | ✅ | GET /settings/policy/:slug | ✅ | ✅ |
| GET /faq | ✅ | GET /settings/faq | ✅ | ✅ |
| GET /seo | ✅ | GET /settings/seo | ✅ | ✅ |
| GET /get-extension/{act} | ✅ | GET /settings/extension/:act | ✅ | ✅ |
| POST /contact | ✅ | ✅ | ✅ | ✅ |
| GET /cookie | ✅ | GET /settings/cookie | ✅ | ✅ |

## Response Format Differences

### Laravel Response Format

```json
{
  "success": true,
  "data": { ... },
  "message": "Optional message"
}
```

### NestJS Response Format

```json
{
  "data": { ... },
  "meta": { ... }
}
```

**Impact on Mobile App:** The mobile app's API client will need to handle both formats for full compatibility.

## Quick Switching Guide

### To switch from Laravel to NestJS:

1. Edit `mobile/.env`
2. Change `API=laravel` to `API=next`
3. Change `EXPO_PUBLIC_API_URL` to `http://localhost:3001/api`
4. Restart the mobile app development server

### To switch from NestJS to Laravel:

1. Edit `mobile/.env`
2. Change `API=next` to `API=laravel`
3. Change `EXPO_PUBLIC_API_URL` to `http://localhost:8000/api`
4. Restart the mobile app development server

## Troubleshooting

### Issue: API not responding

**Check:**
- Backend is running on the correct port (3001 for NestJS, 8000 for Laravel)
- No firewall blocking connections
- Correct URL in .env file

### Issue: Authentication errors

**Check:**
- Backend API base URL is correct
- Backend and mobile are in same environment (dev/prod)

### Issue: Data type mismatches

**Check:**
- String vs Number parsing in API responses
- Date format differences (ISO string vs Date object)

## Files Modified

- `mobile/.env` - Added API switching configuration
- `mobile/src/lib/api/config.ts` - New API config utility
- `mobile/src/lib/api/client.tsx` - Updated to use dynamic config
- `mobile/src/api/wallet/methods.ts` - Added deposit/withdraw methods queries
- `mobile/src/api/wallet/types.ts` - Added DepositMethod/WithdrawMethod interfaces
- `mobile/src/api/wallet/index.ts` - Exported new methods

## Development Setup

### Local Development with Docker

Using `FUTURUS/docker-compose.yml`:

```bash
# Start all services
cd FUTURUS
docker-compose up

# View logs
docker-compose logs -f backend  # NestJS backend on port 3001
# docker-compose logs -f frontend # Next.js frontend on port 3000
```

### Laravel Setup (if using Laravel backend)

Laravel runs separately. Make sure Laravel is running:

```bash
cd LARAVEL/core
php artisan serve
# Runs on port 8000 by default
```

### Mobile App Development

```bash
cd FUTURUS/mobile
npm start
# or
npx expo start
```
