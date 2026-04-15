# Futurus Platform - Complete Functionalities Report

> **Generated:** 2026-03-26 | **Platform:** Prediction Market

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Architecture Overview](#2-architecture-overview)
3. [Backend (NestJS)](#3-backend-nestjs)
4. [Frontend (Next.js)](#4-frontend-nextjs)
5. [Admin Panel (Next.js)](#5-admin-panel-nextjs)
6. [Mobile App (React Native/Expo)](#6-mobile-app-react-nativeexpo)
7. [Blockchain Integration](#7-blockchain-integration)
8. [Database Schema](#8-database-schema)
9. [API Reference](#9-api-reference)
10. [Payment Integrations](#10-payment-integrations)

---

## 1. Executive Summary

Futurus is a **prediction market platform** allowing users to bet on future outcomes (Yes/No markets). The platform consists of:

| Component | Technology | Purpose |
|-----------|------------|---------|
| Backend | NestJS + PostgreSQL | API, business logic, payments |
| Frontend | Next.js 16 | User web interface |
| Admin | Next.js 16 | Admin dashboard |
| Mobile | React Native + Expo | iOS/Android app |
| Blockchain | Solana + Anchor | On-chain prediction markets |

### Key Features
- Automated Market Maker (AMM) for dynamic pricing
- PIX/Card payments via Asaas (Brazilian market)
- Stripe/PayPal integrations
- Two-factor authentication (TOTP)
- Referral system with commission tiers
- Groups/betting pools functionality
- Real-time WebSocket updates
- Multi-language support (PT, EN, ES)

---

## 2. Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           CLIENTS                                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                   │
│  │   Frontend   │  │    Admin     │  │    Mobile    │                   │
│  │  (Next.js)   │  │  (Next.js)   │  │   (Expo)     │                   │
│  │  Port 3000   │  │  Port 3002   │  │  iOS/Android │                   │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘                   │
└─────────┼─────────────────┼─────────────────┼───────────────────────────┘
          │                 │                 │
          ▼                 ▼                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      BACKEND (NestJS)                                    │
│                        Port 3001                                         │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │ Modules: Auth | Markets | Bets | Wallet | Users | Admin | Referrals ││
│  │         Deposits | Withdrawals | Transactions | Asaas | Stripe      ││
│  │         PayPal | Categories | Comments | Groups | Notifications     ││
│  │         Settings | Support | Permissions | Game | Blogs             ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                  │                                       │
│                                  ▼                                       │
│  ┌────────────────────┐  ┌────────────────────┐  ┌──────────────────┐  │
│  │   PostgreSQL       │  │   Socket.IO        │  │   File Storage   │  │
│  │   (Prisma ORM)     │  │   (Real-time)      │  │   (Uploads)      │  │
│  └────────────────────┘  └────────────────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
                                  │
                    ┌─────────────┴─────────────┐
                    ▼                           ▼
┌────────────────────────────┐    ┌────────────────────────────────────────┐
│   Payment Gateways         │    │        Solana Blockchain               │
│   • Asaas (PIX/Card)       │    │   • Prediction Market Program          │
│   • Stripe                 │    │   • Futurus Coin (FUT)                 │
│   • PayPal                 │    │   • Switchboard Oracle                 │
└────────────────────────────┘    └────────────────────────────────────────┘
```

---

## 3. Backend (NestJS)

**Location:** `/backend/`
**Framework:** NestJS 11 with TypeScript
**Database:** PostgreSQL with Prisma ORM

### 3.1 Module Structure

| Module | Purpose | Key Files |
|--------|---------|-----------|
| `AuthModule` | Authentication, JWT, OAuth | `auth.service.ts`, `auth.controller.ts` |
| `UsersModule` | User profiles, KYC, 2FA | `users.service.ts`, `users.controller.ts` |
| `MarketsModule` | Market CRUD, AMM calculations | `markets.service.ts`, `markets.controller.ts` |
| `BetsModule` | Place bets, positions, history | `bets.service.ts`, `bets.controller.ts` |
| `WalletModule` | Balance, deposits, withdrawals | `wallet.service.ts`, `wallet.controller.ts` |
| `AsaasModule` | PIX/Card payments (Brazil) | `asaas.service.ts` |
| `StripeModule` | Stripe checkout integration | `stripe.service.ts` |
| `PaypalModule` | PayPal integration | `paypal.service.ts` |
| `AdminModule` | Admin operations | `admin.service.ts`, `admin.controller.ts` |
| `ReferralsModule` | Referral system | `referrals.service.ts` |
| `GroupsModule` | Betting pools | `groups.service.ts` |
| `NotificationsModule` | Push notifications | `notifications.service.ts` |
| `TransactionsModule` | Transaction logs | `transactions.service.ts` |
| `CategoriesModule` | Market categories | `categories.service.ts` |
| `CommentsModule` | Market comments | `comments.service.ts` |
| `SupportModule` | Support tickets | `support.service.ts` |
| `SettingsModule` | System settings | `settings.service.ts` |
| `GameModule` | Gamification features | `game.service.ts` |
| `PermissionsModule` | Role-based access | `permissions.service.ts` |

### 3.2 Authentication Service

**File:** `/backend/src/auth/auth.service.ts`

```typescript
// Key Methods:
login(email: string, password: string): Promise<AuthResponse>
register(data: RegisterDto): Promise<User>
verify2fa(userId: number, code: string): Promise<AuthResponse>
refreshToken(token: string): Promise<AuthResponse>
resetPassword(email: string): Promise<void>
googleAuth(token: string): Promise<AuthResponse>
facebookAuth(token: string): Promise<AuthResponse>
```

**Features:**
- JWT-based authentication with refresh tokens
- Password hashing with bcryptjs (12 rounds)
- TOTP-based 2FA with otpauth library
- OAuth support (Google, Facebook)
- Rate limiting (100 req/min via @nestjs/throttler)

### 3.3 Markets Service

**File:** `/backend/src/markets/markets.service.ts`

```typescript
// Key Methods:
findAll(params: MarketQueryDto): Promise<PaginatedMarkets>
findOneBySlug(slug: string): Promise<Market>
getCalculations(optionId: number, shares: number, type: 'yes' | 'no'): Promise<Calculation>
getMarketTrends(marketId: number): Promise<Trend[]>
toggleBookmark(userId: number, marketId: number): Promise<void>
getUserBookmarks(userId: number, page: number, limit: number): Promise<Market[]>
```

**AMM Calculation Logic:**
```typescript
// Price is determined by pool ratios
// Yes probability = yesPool / (yesPool + noPool)
// No probability = noPool / (yesPool + noPool)
// Commission deducted from trade amounts
```

**Market Status Codes:**
| Code | Status | Description |
|------|--------|-------------|
| 0 | DRAFT | Not yet published |
| 1 | OPEN | Active for betting |
| 2 | CLOSED | Betting closed |
| 3 | RESOLVED | Winner determined |
| 4 | CANCELLED | Market cancelled |

### 3.4 Bets Service

**File:** `/backend/src/bets/bets.service.ts`

```typescript
// Key Methods:
placeBet(userId: number, data: PlaceBetDto): Promise<Purchase>
getMyBets(userId: number, params: QueryDto): Promise<PaginatedBets>
getMyPositions(userId: number, params: QueryDto): Promise<Position[]>
```

**Bet Flow:**
1. Get market calculations (price, potential return)
2. Validate user balance
3. Create purchase record
4. Deduct from user balance
5. Update market pools
6. Recalculate probabilities
7. Update market volume
8. Log transaction

**Bet Status:**
| Code | Status |
|------|--------|
| 0 | PENDING |
| 1 | ACTIVE |
| 2 | WON |
| 3 | LOST |

### 3.5 Wallet Service

**File:** `/backend/src/wallet/wallet.service.ts`

```typescript
// Key Methods:
getBalance(userId: number): Promise<Balance>
createDeposit(userId: number, data: DepositDto): Promise<Deposit>
createWithdrawal(userId: number, data: WithdrawDto): Promise<Withdrawal>
confirmDeposit(depositId: number, status: string): Promise<void>
getTransactions(userId: number, page: number, limit: number): Promise<Transaction[]>
getDepositMethods(): Promise<Method[]>
getWithdrawMethods(): Promise<Method[]>
```

### 3.6 Users Service

**File:** `/backend/src/users/users.service.ts`

```typescript
// Key Methods:
getProfile(userId: number): Promise<User>
updateProfile(userId: number, data: UpdateProfileDto): Promise<User>
changePassword(userId: number, current: string, newPassword: string): Promise<void>
getKycData(userId: number): Promise<KycData>
submitKyc(userId: number, data: KycDto): Promise<void>
get2faData(userId: number): Promise<{ qrCode: string, secret: string }>
enable2fa(userId: number, code: string, key: string): Promise<void>
disable2fa(userId: number, code: string): Promise<void>
getDashboardStats(userId: number): Promise<DashboardStats>
getLeaderboard(params: LeaderboardParams): Promise<User[]>
getReferrals(userId: number): Promise<Referral[]>
getLoginHistory(userId: number): Promise<Login[]>
```

**User Fields:**
- `balance` - Available BRL funds
- `totalSharesBought` - Total investment
- `totalProfit` - Profit/loss amount
- `successRate` - Win rate percentage
- `investedAmount` - Total invested
- `winningAmount` - Total winnings
- `referralCommissions` - Referral earnings
- `coinBalance` - Futurus coin balance

### 3.7 Real-time (WebSocket)

**Implementation:** Socket.IO with @nestjs/websockets

**Events:**
- `joinMarket(slug)` - Join market room
- `leaveMarket(slug)` - Leave market room
- `marketUpdate` - Broadcast price/volume changes
- `newBet` - Notify new bet placed
- `notification` - User notifications

---

## 4. Frontend (Next.js)

**Location:** `/frontend/`
**Framework:** Next.js 16.1.6 with App Router
**Styling:** Tailwind CSS v4

### 4.1 Page Structure

```
/app/[locale]/
├── page.tsx                    # Homepage with markets
├── login/page.tsx              # Login form
├── register/page.tsx           # Registration
├── market/
│   ├── page.tsx                # Markets listing
│   └── [slug]/page.tsx         # Market detail + trading
├── dashboard/
│   ├── page.tsx                # User dashboard
│   ├── profile/page.tsx        # Profile settings
│   ├── deposit/page.tsx        # Deposit funds
│   ├── withdrawals/page.tsx    # Withdrawal requests
│   ├── purchases/page.tsx      # Bet history
│   ├── transactions/page.tsx   # Transaction log
│   ├── referral/page.tsx       # Referral program
│   ├── groups/
│   │   ├── page.tsx            # My groups
│   │   ├── create/page.tsx     # Create group
│   │   ├── [slug]/page.tsx     # Group detail
│   │   └── join/[code]/page.tsx # Join group
│   └── admin/
│       ├── page.tsx            # Admin home
│       ├── markets/page.tsx    # Market management
│       ├── users/page.tsx      # User management
│       ├── settings/page.tsx   # Settings
│       ├── support/page.tsx    # Support tickets
│       └── 2fa/page.tsx        # 2FA management
```

### 4.2 Key Components

**TradingPanel** (`/components/TradingPanel.tsx`)
- Yes/No option selection
- Share quantity input
- Real-time calculation display
- Submit bet button

**MarketCard** (`/components/MarketCard.tsx`)
- Market preview with odds
- Category badge
- Volume display
- Time remaining

**UserHeader** (`/components/dashboard/UserHeader.tsx`)
- Balance display
- Notification dropdown
- User menu

**UserSidebar** (`/components/dashboard/UserSidebar.tsx`)
- Navigation menu
- Active state tracking

### 4.3 API Integration

**File:** `/frontend/src/lib/api.ts`

```typescript
// Axios instance with interceptors
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api",
  headers: { "Content-Type": "application/json" }
});

// Response interceptor unwraps { success, data } format
// 401 responses trigger automatic logout
```

### 4.4 Authentication

**File:** `/frontend/src/auth.ts`

- NextAuth.js v5 with Credentials provider
- JWT stored in session
- 2FA support in login flow
- OAuth buttons (Google, Facebook)

---

## 5. Admin Panel (Next.js)

**Location:** `/admin/`
**Framework:** Next.js 16.1.6
**UI:** Tailwind CSS + Lucide icons + Recharts

### 5.1 Dashboard Routes

```
/dashboard/
├── /                          # Overview stats
├── /markets/
│   ├── /                      # All markets
│   ├── /create                # Create market
│   ├── /live                  # Live markets
│   ├── /draft                 # Draft markets
│   ├── /pending               # Pending approval
│   ├── /upcoming              # Upcoming markets
│   ├── /closing-soon          # Closing soon
│   ├── /declared              # Resolved
│   ├── /completed             # Completed
│   ├── /cancelled             # Cancelled
│   └── /disabled              # Disabled
├── /users/
│   ├── /                      # User list
│   └── /[id]/                 # User detail
├── /deposits/
│   ├── /                      # All deposits
│   ├── /initiated             # Initiated
│   ├── /pending               # Pending
│   ├── /approved              # Approved
│   ├── /successful            # Successful
│   └── /rejected              # Rejected
├── /withdrawals/              # Same structure as deposits
├── /purchases/                # Bet/trade tracking
├── /categories/               # Market categories
├── /subcategories/            # Sub-categories
├── /comments/                 # Comment moderation
├── /referrals/                # Referral tracking
├── /transactions/             # Transaction history
├── /payments/                 # Payment reports
├── /support/                  # Support tickets
├── /groups/                   # Group management
├── /gateways/                 # Payment gateway config
├── /settings/
│   ├── /general               # General settings
│   ├── /kyc/                  # KYC settings
│   ├── /2fa/                  # 2FA settings
│   ├── /languages/            # Language config
│   ├── /social-login/         # OAuth settings
│   ├── /notifications/        # Notification settings
│   ├── /seo/                  # SEO settings
│   └── /logo-icon/            # Branding
├── /notifications/            # Push notifications
├── /permissions/              # Role management
├── /blog/                     # Blog posts
├── /reports/                  # Analytics
├── /futurus-coin/             # Coin management
└── /system/                   # System info
```

### 5.2 Admin API Endpoints

**File:** `/backend/src/admin/admin.controller.ts`

```typescript
// Authentication
POST /admin/login
POST /admin/2fa/verify-login
POST /admin/login-user            # User impersonation

// Market Management
GET  /admin/markets
POST /admin/markets
PATCH /admin/markets/:id
PATCH /admin/markets/:id/status
POST /admin/markets/:id/lock
POST /admin/markets/:id/trending
POST /admin/markets/:id/cancel
POST /admin/markets/:id/resolve

// User Management
GET  /admin/users
GET  /admin/users/:id
PATCH /admin/users/:id
PATCH /admin/users/:id/status
POST /admin/users/:id/balance
POST /admin/users/:id/kyc-approve
POST /admin/users/:id/kyc-reject
POST /admin/users/:id/impersonate

// Payment Management
GET  /admin/deposits
POST /admin/deposits/:id/approve
POST /admin/deposits/:id/reject
GET  /admin/withdrawals
POST /admin/withdrawals/:id/approve
POST /admin/withdrawals/:id/reject

// Reports
GET /admin/dashboard
GET /admin/chart/:type
GET /admin/transactions
GET /admin/reports/transactions
GET /admin/reports/purchases
GET /admin/reports/logins

// Settings
GET/POST /admin/settings/general
GET/POST /admin/kyc-setting
GET/POST /admin/notification/settings

// Groups
GET /admin/groups
POST /admin/groups/:id/approve
POST /admin/groups/:id/reject
POST /admin/groups/:id/approve-result
POST /admin/groups/:id/reject-result
```

---

## 6. Mobile App (React Native/Expo)

**Location:** `/mobile/`
**Framework:** React Native 0.81.5 + Expo 54.0.32
**Navigation:** Expo Router (file-based)
**State:** Zustand + TanStack React Query

### 6.1 Navigation Structure

```
/src/app/
├── _layout.tsx                 # Root layout with providers
├── login.tsx                   # Login screen
├── register.tsx                # Registration
├── onboarding.tsx              # Onboarding flow
├── forgot-password.tsx         # Password recovery
├── (app)/                      # Protected routes
│   ├── _layout.tsx             # Drawer navigation
│   ├── (tabs)/                 # Tab navigation
│   │   ├── index.tsx           # Markets/Home (932 lines)
│   │   ├── wallet.tsx          # Wallet (58,598 bytes)
│   │   ├── portfolio.tsx       # Positions
│   │   ├── profile.tsx         # User profile (412 lines)
│   │   └── game.tsx            # Game features
│   ├── 2fa.tsx                 # 2FA setup
│   ├── dashboard.tsx           # Dashboard
│   ├── market/[slug].tsx       # Market detail
│   ├── groups/                 # Groups screens
│   ├── settings.tsx            # Settings
│   └── notifications.tsx       # Notifications
```

### 6.2 State Management

**Auth Store (Zustand):** `/mobile/src/lib/auth/index.tsx`

```typescript
interface AuthState {
  token: TokenType | null;
  status: 'idle' | 'signOut' | 'signIn';
  user: User | null;
  signIn: (data) => void;
  signOut: () => void;
  hydrate: () => void;
  setUser: (user) => void;
}
```

**API Queries (TanStack Query):** React Query for server state caching

### 6.3 Key Screens

**Home/Markets Screen** (`/src/app/(app)/(tabs)/index.tsx`):
- Live ticker with market indicators
- Category filtering
- Search functionality
- Market grid (2 columns)
- Pull-to-refresh

**Wallet Screen** (`/src/app/(app)/(tabs)/wallet.tsx`):
- Balance display (total, available, bonus)
- Transaction history
- Deposit modal (PIX/Card via Asaas)
- Withdraw modal (PIX/Bank Transfer)

**Profile Screen** (`/src/app/(app)/(tabs)/profile.tsx`):
- User avatar
- Balance stats
- Settings menu
- Logout

### 6.4 API Integration

**HTTP Client:** `/mobile/src/api/common/client.tsx`

```typescript
// Axios with interceptors for:
// - Auto-attach JWT Bearer token
// - Unwrap NestJS/Laravel response formats
// - 401 auto-logout
```

**API Modules:**
- `/api/auth/` - Authentication
- `/api/wallet/` - Deposits, withdrawals, balance
- `/api/markets/` - Market data
- `/api/bets/` - Betting operations
- `/api/groups/` - Community features
- `/api/settings/` - User settings
- `/api/notifications/` - Notifications

---

## 7. Blockchain Integration

**Location:** `/blockchain/`

### 7.1 Smart Contracts

**Prediction Market Program** (`6tb9fNKNxfEfzAPda2NScrq9RpxBJqPWQWiqWtnQm3oY`)

| Instruction | Description |
|-------------|-------------|
| `initialize` | Initialize global state |
| `init_market` | Create market with Yes/No tokens |
| `add_liquidity` | Deposit SOL to activate market |
| `create_bet` | Place bet with FUT tokens |
| `mint_token` | Mint Yes/No tokens to PDA |
| `resolve` | Oracle-based resolution |
| `claim` | Claim proportional winnings |
| `admin_close_market` | Manual resolution |

**Futurus Coin (FUT)** (`FHcFVMktPV8YgiKPHA5xnbzaEugQ8py7FYZrG8CXRave`)

| Instruction | Description |
|-------------|-------------|
| `initialize` | Create token with 1B supply |
| `mint_to` | Mint additional tokens |
| `burn` | Burn tokens |
| `transfer` | Transfer between accounts |

### 7.2 Blockchain Backend

**Location:** `/blockchain/prediction-market-backend/`
**Framework:** Express.js + MongoDB (standalone)

**SDK Functions:**
- `setClusterConfig()` - Configure Solana connection
- `global()` - Initialize global PDA
- `createMarket()` - Deploy market on-chain
- `depositLiquidity()` - Add liquidity
- `marketBetting()` - Place on-chain bet
- `getOracleResult()` - Fetch oracle data

### 7.3 Planned Integration (Dual-Mode)

The blockchain will be integrated into the centralized stack:

```
User Action → Mode Selection (CASH/SOLANA) → Execute in Selected System
                     │
         ┌──────────┴──────────┐
         ▼                     ▼
    CASH Mode              SOLANA Mode
    (BRL balance)          (FUT balance)
    (PostgreSQL)           (Solana blockchain)
```

---

## 8. Database Schema

**Location:** `/backend/prisma/schema.prisma`
**Database:** PostgreSQL
**ORM:** Prisma

### 8.1 Core Models

```prisma
model User {
  id                  Int       @id @default(autoincrement())
  email               String    @unique
  username            String    @unique
  password            String
  firstname           String?
  lastname            String?
  balance             Decimal   @default(0) @db.Decimal(28, 8)
  totalSharesBought   Decimal   @default(0) @db.Decimal(28, 8)
  totalProfit         Decimal   @default(0) @db.Decimal(28, 8)
  successRate         Decimal   @default(0) @db.Decimal(5, 2)
  investedAmount      Decimal   @default(0) @db.Decimal(28, 8)
  winningAmount       Decimal   @default(0) @db.Decimal(28, 8)
  referralCommissions Decimal   @default(0) @db.Decimal(28, 8)
  coinBalance         Decimal   @default(0) @db.Decimal(28, 8)
  status              Int       @default(1)  // 0=banned, 1=active
  ev                  Int       @default(0)  // email verified
  kv                  Int       @default(0)  // KYC verified
  twoFaEnabled        Boolean   @default(false)
  twoFaSecret         String?
  preferredMode       String    @default("CASH")  // CASH or SOLANA
  // ... additional fields
}

model Market {
  id              Int       @id @default(autoincrement())
  slug            String    @unique
  question        String
  description     String?
  categoryId      Int
  status          Int       @default(0)  // 0=draft, 1=open, 2=closed, 3=resolved
  volume          Decimal   @default(0) @db.Decimal(28, 8)
  startDate       DateTime?
  endDate         DateTime?
  resolvedAt      DateTime?
  winnerId        Int?      // winning MarketOption id
  isFeatured      Boolean   @default(false)
  isTrending      Boolean   @default(false)
  isLocked        Boolean   @default(false)
  // ... relations
}

model MarketOption {
  id              Int       @id @default(autoincrement())
  marketId        Int
  name            String    // "Yes" or "No"
  yesPool         Decimal   @default(0) @db.Decimal(28, 8)
  noPool          Decimal   @default(0) @db.Decimal(28, 8)
  chance          Decimal   @default(50) @db.Decimal(5, 2)  // probability
  // ... relations
}

model Purchase {
  id              Int       @id @default(autoincrement())
  userId          Int
  marketId        Int
  optionId        Int
  type            String    // "yes" or "no"
  shares          Decimal   @db.Decimal(28, 8)
  amount          Decimal   @db.Decimal(28, 8)
  pricePerShare   Decimal   @db.Decimal(28, 8)
  profit          Decimal   @default(0) @db.Decimal(28, 8)
  status          Int       @default(0)  // 0=pending, 1=active, 2=won, 3=lost
  // ... relations
}

model Deposit {
  id              Int       @id @default(autoincrement())
  userId          Int
  trx             String    @unique
  methodCode      Int
  amount          Decimal   @db.Decimal(28, 8)
  charge          Decimal   @default(0) @db.Decimal(28, 8)
  finalAmount     Decimal   @db.Decimal(28, 8)
  status          Int       @default(0)  // 0=pending, 1=approved, 2=successful, 3=rejected
  // ... relations
}

model Withdrawal {
  id              Int       @id @default(autoincrement())
  userId          Int
  trx             String    @unique
  methodCode      Int
  amount          Decimal   @db.Decimal(28, 8)
  charge          Decimal   @default(0) @db.Decimal(28, 8)
  finalAmount     Decimal   @db.Decimal(28, 8)
  status          Int       @default(0)
  // ... relations
}

model Transaction {
  id              Int       @id @default(autoincrement())
  userId          Int
  trx             String    @unique
  type            String    // deposit, withdrawal, bet, win, referral
  amount          Decimal   @db.Decimal(28, 8)
  postBalance     Decimal   @db.Decimal(28, 8)
  details         String?
  // ... relations
}
```

### 8.2 Additional Models

- `Category` / `SubCategory` - Market categorization
- `Comment` - Market discussions
- `MarketBookmark` - Saved markets
- `MarketTrend` - Historical price data
- `UserLogin` - Login audit log
- `Group` - Betting pools
- `Referral` - Referral tracking
- `CoinTransaction` - Futurus coin operations
- `SupportTicket` - Support system
- `AdminNotification` - Admin alerts

---

## 9. API Reference

### 9.1 Public Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/login` | User login |
| POST | `/auth/register` | User registration |
| POST | `/auth/verify-2fa` | 2FA verification |
| GET | `/markets` | List markets |
| GET | `/markets/:slug` | Market details |
| GET | `/categories` | List categories |

### 9.2 Protected Endpoints (Require JWT)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/users/profile` | Get user profile |
| PATCH | `/users/profile` | Update profile |
| GET | `/users/dashboard` | Dashboard stats |
| POST | `/purchases` | Place bet |
| GET | `/purchases/history` | Bet history |
| GET | `/wallet` | Get balance |
| POST | `/deposits` | Create deposit |
| GET | `/deposits/history` | Deposit history |
| POST | `/withdrawals` | Request withdrawal |
| GET | `/transactions` | Transaction log |
| GET | `/users/referrals` | Referral list |
| GET | `/groups/my-groups` | User's groups |
| POST | `/groups` | Create group |

### 9.3 Admin Endpoints (Require Admin JWT)

See Section 5.2 for complete admin API reference.

---

## 10. Payment Integrations

### 10.1 Asaas (Brazil)

**File:** `/backend/src/asaas/asaas.service.ts`

**Supported Methods:**
- PIX (methodCode: 127) - Instant payment
- Credit Card (methodCode: 128) - With installments

**Features:**
- QR code generation for PIX
- CPF validation
- Webhook handling (PAYMENT_CONFIRMED, PAYMENT_RECEIVED)
- Installment support for cards

**Deposit Flow:**
1. User selects PIX or Card
2. PIX: Generate QR code, user pays via bank app
3. Card: Collect card details, process payment
4. Webhook confirms payment
5. Balance updated

### 10.2 Stripe

**File:** `/backend/src/stripe/stripe.service.ts`

**Features:**
- Checkout session creation
- Webhook signature verification
- USD currency support

### 10.3 PayPal

**File:** `/backend/src/paypal/paypal.service.ts`

**Features:**
- OAuth integration
- Order creation
- Payment capture

---

## Appendix A: Environment Variables

### Backend (.env)
```env
DATABASE_URL=postgresql://...
JWT_SECRET=...
JWT_EXPIRATION=7d

# Asaas
ASAAS_API_KEY=...
ASAAS_API_URL=https://api.asaas.com/v3

# Stripe
STRIPE_SECRET_KEY=...
STRIPE_WEBHOOK_SECRET=...

# PayPal
PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...

# OAuth
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
FACEBOOK_APP_ID=...
FACEBOOK_APP_SECRET=...

# Solana (for blockchain integration)
SOLANA_RPC_URL=https://api.devnet.solana.com
SOLANA_CLUSTER=devnet
PREDICTION_PROGRAM_ID=6tb9fNKNxfEfzAPda2NScrq9RpxBJqPWQWiqWtnQm3oY
FUT_MINT=FHcFVMktPV8YgiKPHA5xnbzaEugQ8py7FYZrG8CXRave
```

### Frontend/Mobile
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_WS_URL=http://localhost:3001
NEXTAUTH_SECRET=...
```

---

## Appendix B: Decimal Precision

All monetary values use `Decimal(28, 8)`:
- 28 total digits
- 8 decimal places
- Uses Decimal.js library for arithmetic
- Prevents floating-point errors

---

*Report generated by analyzing the Futurus-NEXTJS codebase.*
