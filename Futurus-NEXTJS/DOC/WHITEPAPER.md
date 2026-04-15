# FUTURUS Whitepaper

**A Next-Generation Prediction Market Platform with Group Syndicates**

**Version 2.0 | March 2026**

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Introduction](#2-introduction)
3. [Problem Statement](#3-problem-statement)
4. [Solution Overview](#4-solution-overview)
5. [Platform Architecture](#5-platform-architecture)
6. [Core Features](#6-core-features)
7. [Group Syndicates System](#7-group-syndicates-system)
8. [Technology Stack](#8-technology-stack)
9. [Security & Compliance](#9-security--compliance)
10. [Payment Infrastructure](#10-payment-infrastructure)
11. [Gamification & Engagement](#11-gamification--engagement)
12. [Mobile Experience](#12-mobile-experience)
13. [Admin & Operations](#13-admin--operations)
14. [Roadmap](#14-roadmap)
15. [Conclusion](#15-conclusion)

---

## 1. Executive Summary

**FUTURUS** is a comprehensive prediction market platform that revolutionizes how users participate in forecasting future events. Built on a modern, scalable architecture, FUTURUS combines traditional prediction markets with innovative **Group Syndicates** - a social betting feature that allows users to pool resources and make collective predictions.

### Key Highlights

| Metric | Description |
|--------|-------------|
| **Platform Type** | Centralized Prediction Market |
| **Multi-Platform** | Web (Next.js), Mobile (Expo/React Native), Admin Panel |
| **Unique Feature** | Group Syndicates for collective betting |
| **Payment Methods** | PIX, Credit Card, PayPal, Stripe, Crypto |
| **Languages** | Portuguese, English, Spanish, Arabic |
| **Real-time** | WebSocket-powered live market updates |

---

## 2. Introduction

### 2.1 What Are Prediction Markets?

Prediction markets are speculative markets where participants trade on the outcomes of future events. Unlike traditional betting, prediction markets aggregate collective intelligence to produce accurate probability estimates for events ranging from political elections to sports outcomes.

### 2.2 The FUTURUS Vision

FUTURUS aims to democratize prediction markets by making them:

- **Accessible**: Available on web and mobile, in multiple languages
- **Social**: Group Syndicates enable collaborative predictions
- **Secure**: Enterprise-grade security with KYC verification
- **Engaging**: Gamification mechanics to enhance user experience
- **Inclusive**: Multiple payment methods including regional options (PIX for Brazil)

---

## 3. Problem Statement

### 3.1 Current Market Challenges

| Challenge | Description |
|-----------|-------------|
| **High Barriers to Entry** | Individual users lack capital for meaningful positions |
| **Limited Social Features** | Existing platforms operate in isolation |
| **Poor Mobile Experience** | Most platforms lack native mobile applications |
| **Regional Payment Limitations** | Lack of support for local payment methods |
| **Complex User Experience** | Steep learning curves for new users |

### 3.2 Market Opportunity

The global prediction market industry is experiencing rapid growth, driven by:

- Increasing interest in alternative investment vehicles
- Growing acceptance of gamified financial products
- Demand for social and collaborative financial tools
- Expansion of mobile-first user bases in emerging markets

---

## 4. Solution Overview

### 4.1 The FUTURUS Approach

FUTURUS addresses market challenges through:

1. **Group Syndicates**: Pooled betting groups that lower individual capital requirements
2. **Multi-Platform Presence**: Native experiences across web and mobile
3. **Localization**: Multi-language support with regional payment integration
4. **Gamification**: Engagement-driving mechanics including tasks, referrals, and rewards
5. **Admin Oversight**: Comprehensive management tools for platform operators

### 4.2 Platform Components

```
┌─────────────────────────────────────────────────────────────────┐
│                         FUTURUS ECOSYSTEM                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   ┌─────────────┐   ┌─────────────┐   ┌─────────────────────┐   │
│   │   FRONTEND  │   │    ADMIN    │   │       MOBILE        │   │
│   │  Next.js 16 │   │  Next.js 16 │   │   Expo 54 + RN 0.81 │   │
│   │   Port 3000 │   │   Port 3002 │   │   iOS / Android     │   │
│   └──────┬──────┘   └──────┬──────┘   └──────────┬──────────┘   │
│          │                 │                      │              │
│          └─────────────────┼──────────────────────┘              │
│                            │                                     │
│                   ┌────────▼────────┐                            │
│                   │     BACKEND     │                            │
│                   │   NestJS 11     │                            │
│                   │    Port 3001    │                            │
│                   └────────┬────────┘                            │
│                            │                                     │
│                   ┌────────▼────────┐                            │
│                   │   PostgreSQL    │                            │
│                   │  Prisma 6.4.1   │                            │
│                   └─────────────────┘                            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 5. Platform Architecture

### 5.1 Service Architecture

| Service | Technology | Port | Purpose |
|---------|-----------|------|---------|
| **Frontend** | Next.js 16 + React 19 | 3000 | Public-facing web application |
| **Backend API** | NestJS 11 + Prisma | 3001 | REST API and business logic |
| **Admin Panel** | Next.js 16 + React 19 | 3002 | Administrative dashboard |
| **Mobile** | Expo 54 + React Native 0.81 | - | iOS/Android applications |
| **Database** | PostgreSQL 15 | 5432 | Primary data store |

### 5.2 Key Architectural Decisions

#### Monolithic Backend with Modular Structure

The backend follows NestJS's modular architecture:

```
backend/src/
├── auth/           # Authentication & authorization
├── users/          # User management
├── markets/        # Market operations
├── groups/         # Group Syndicates
├── bets/           # Trading/betting logic
├── payments/       # Payment processing
├── notifications/  # Real-time notifications
├── admin/          # Admin operations
└── prisma/         # Database layer
```

#### Real-Time Communication

- **Socket.io** powers real-time features
- Live market price updates
- Group member join/leave notifications
- Instant transaction confirmations

### 5.3 Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                          DATA FLOW                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   USER ACTION                                                    │
│       │                                                          │
│       ▼                                                          │
│   ┌───────────────┐                                              │
│   │  Frontend/    │                                              │
│   │   Mobile App  │                                              │
│   └───────┬───────┘                                              │
│           │ HTTP/WebSocket                                       │
│           ▼                                                      │
│   ┌───────────────┐      ┌───────────────┐                       │
│   │   API Layer   │─────▶│    Guards     │ (Auth, Rate Limit)   │
│   │   (NestJS)    │      │   & Filters   │                       │
│   └───────┬───────┘      └───────────────┘                       │
│           │                                                      │
│           ▼                                                      │
│   ┌───────────────┐      ┌───────────────┐                       │
│   │   Services    │─────▶│   External    │ (Stripe, PayPal)     │
│   │ (Business)    │      │    APIs       │                       │
│   └───────┬───────┘      └───────────────┘                       │
│           │                                                      │
│           ▼                                                      │
│   ┌───────────────┐      ┌───────────────┐                       │
│   │    Prisma     │─────▶│  PostgreSQL   │                       │
│   │     ORM       │      │   Database    │                       │
│   └───────────────┘      └───────────────┘                       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 6. Core Features

### 6.1 Markets & Trading

#### Market Types

- **Binary Markets**: YES/NO outcome predictions
- **Event-Based**: Sports, politics, entertainment, economics
- **Time-Bounded**: Markets with defined resolution dates
- **Temporary Markets**: Flash markets for short-term events

#### Trading Mechanics

| Feature | Description |
|---------|-------------|
| **Price Discovery** | Dynamic pricing based on market activity |
| **Share Trading** | Buy/sell shares representing outcome probabilities |
| **Position Tracking** | Real-time portfolio management |
| **P&L Calculation** | Instant profit/loss visualization |

### 6.2 User Management

#### Authentication Methods

- Email/username + password
- Google OAuth
- Facebook OAuth
- Two-Factor Authentication (2FA)

#### User Profile Features

- KYC verification system
- Account security settings
- Login history tracking
- Balance management

### 6.3 Dashboard

The user dashboard provides:

- **Balance Overview**: Current account balance
- **Position Summary**: Active positions and performance
- **Recent Activity**: Latest transactions and trades
- **Market Watchlist**: Bookmarked markets
- **Security Status**: 2FA status and alerts

---

## 7. Group Syndicates System

### 7.1 Overview

Group Syndicates is FUTURUS's flagship feature, enabling users to pool resources for collective predictions. This social layer transforms individual betting into a collaborative experience.

### 7.2 Key Concepts

| Term | Definition |
|------|------------|
| **Syndicate/Group** | A collective of users pooling funds for a single market position |
| **Manager** | The group creator who sets rules and selects outcomes |
| **Member** | A participant who contributes funds to the pool |
| **Contribution** | The amount a member invests in the group |
| **Ownership Percentage** | Member's share of the pool (contribution / total pool) |

### 7.3 Group Lifecycle

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   DRAFT     │───▶│  PENDING    │───▶│    OPEN     │
│  (Created)  │    │  APPROVAL   │    │ (Accepting) │
└─────────────┘    └──────┬──────┘    └──────┬──────┘
                         │                   │
                    ┌────▼────┐              │
                    │REJECTED │              │
                    └─────────┘              │
                                             ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  RESOLVED   │◀───│  EXECUTED   │◀───│   LOCKED    │
│  (Payout)   │    │  (Bet Runs) │    │  (Betting)  │
└─────────────┘    └─────────────┘    └──────┬──────┘
                                             │
                                   ┌─────────▼─────────┐
                                   │    AWAITING       │
                                   │ RESULT APPROVAL   │
                                   └───────────────────┘
```

### 7.4 Status Reference

| Code | Status | Description |
|------|--------|-------------|
| 0 | DRAFT | Initial state, not submitted |
| 1 | PENDING_APPROVAL | Awaiting admin review |
| 2 | REJECTED | Admin rejected the group |
| 3 | OPEN | Accepting member contributions |
| 4 | LOCKED | No more joins, awaiting decision |
| 5 | VOTING | Members voting (if voting method) |
| 6 | EXECUTED | Bet placed on market |
| 7 | RESOLVED | Payouts complete |
| 8 | CANCELLED | Admin cancelled |
| 9 | REFUNDED | All members refunded |
| 10 | AWAITING_RESULT_APPROVAL | Manager declared result, awaiting admin |

### 7.5 Group Types

| Type | Visibility | Join Method |
|------|------------|-------------|
| **Public** | Anyone can view and join | Direct join via share link |
| **Private** | Invitation only | WhatsApp/invite code link |

### 7.6 Decision Methods

| Method | Description | Use Case |
|--------|-------------|----------|
| **Manager** | Group creator selects outcome | Trust-based groups |
| **Voting** | Capital-weighted member voting | Democratic groups |

### 7.7 Payout Distribution

When a market resolves:

1. **Calculate Total Winnings**: Based on shares purchased
2. **Apply Platform Fee**: Configurable percentage (default 2%)
3. **Apply Manager Fee**: Optional commission for group creator (0-10%)
4. **Distribute Pro-Rata**: Each member receives based on ownership %

**Formula:**
```
User_Payout = (Group_Winnings × (1 - Platform_Fee - Manager_Fee)) × User_Ownership_Percentage
```

### 7.8 API Endpoints

#### User Endpoints (`/groups`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/groups` | Create new group |
| GET | `/groups` | List public groups |
| GET | `/groups/my` | Get user's groups |
| GET | `/groups/:slug` | Get group details |
| POST | `/groups/:id/join` | Join group |
| POST | `/groups/:id/leave` | Leave group |
| POST | `/groups/:id/lock` | Lock group (manager) |
| POST | `/groups/:id/set-outcome` | Set outcome (manager) |

#### Admin Endpoints (`/admin/groups`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/groups` | List all groups |
| POST | `/admin/groups/:id/approve` | Approve group |
| POST | `/admin/groups/:id/reject` | Reject group |
| POST | `/admin/groups/:id/approve-result` | Approve result & execute |
| POST | `/admin/groups/:id/cancel` | Cancel & refund |

---

## 8. Technology Stack

### 8.1 Frontend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 16.1.6 | React framework with SSR |
| **React** | 19.2.3 | UI component library |
| **Tailwind CSS** | 4.x | Utility-first styling |
| **next-intl** | 4.8.3 | Internationalization |
| **NextAuth** | 5.0.0-beta | Authentication |
| **React Hook Form** | 7.71.2 | Form management |
| **Zod** | 4.3.6 | Schema validation |
| **Socket.io Client** | 4.8.3 | Real-time communication |
| **Lucide React** | 0.575 | Icon library |

### 8.2 Backend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| **NestJS** | 11.0.1 | Server framework |
| **Prisma** | 6.4.1 | ORM & database toolkit |
| **PostgreSQL** | 15 | Primary database |
| **Socket.io** | 4.8.3 | Real-time server |
| **Passport.js** | 0.7.0 | Authentication middleware |
| **bcryptjs** | 3.0.3 | Password hashing |
| **class-validator** | 0.15.1 | DTO validation |
| **Stripe SDK** | 17.5.0 | Payment processing |

### 8.3 Mobile Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| **Expo** | 54.0.32 | React Native framework |
| **React Native** | 0.81.5 | Cross-platform mobile |
| **Expo Router** | 6.0.22 | File-based navigation |
| **React Query** | 5.90.19 | Server state management |
| **Zustand** | 5.0.10 | Client state management |
| **MMKV** | 4.1.1 | Persistent storage |
| **React Native Reanimated** | 4.1.6 | Animations |

### 8.4 Development & DevOps

| Technology | Purpose |
|------------|---------|
| **Docker** | Containerization |
| **Docker Compose** | Multi-container orchestration |
| **TypeScript** | Type-safe development |
| **ESLint** | Code linting |
| **Jest** | Unit testing |
| **Husky** | Git hooks |
| **EAS** | Expo Application Services |

---

## 9. Security & Compliance

### 9.1 Authentication Security

| Feature | Implementation |
|---------|----------------|
| **Password Hashing** | bcryptjs with salt rounds |
| **JWT Tokens** | Signed access/refresh tokens |
| **2FA Support** | TOTP-based authentication |
| **OAuth** | Google & Facebook integration |
| **Session Management** | Secure cookie handling |

### 9.2 API Security

| Measure | Description |
|---------|-------------|
| **Rate Limiting** | Throttling on sensitive endpoints |
| **Input Validation** | class-validator for all DTOs |
| **XSS Protection** | DOMPurify sanitization |
| **CORS Configuration** | Restricted origin policies |
| **JWT Guards** | Protected routes |

### 9.3 Financial Security

| Measure | Description |
|---------|-------------|
| **Atomic Transactions** | Database transactions for balance changes |
| **Double-Spend Prevention** | Balance checks before deductions |
| **Audit Trail** | Complete transaction logging |
| **Refund Guarantees** | Automatic refunds on failures |
| **Decimal Precision** | Decimal.js for financial calculations |

### 9.4 KYC & Compliance

- Document verification system
- Identity validation workflow
- Admin approval process
- Compliance reporting capabilities

### 9.5 Access Control

| Role | Permissions |
|------|-------------|
| **User** | Trade, join groups, manage profile |
| **Group Manager** | Create/manage groups, set outcomes |
| **Staff Admin** | Limited admin access (configurable) |
| **Super Admin** | Full platform access |

---

## 10. Payment Infrastructure

### 10.1 Supported Payment Methods

#### Deposits

| Method | Provider | Regions |
|--------|----------|---------|
| **PIX** | Asaas | Brazil |
| **Credit/Debit Card** | Stripe, Asaas | Global |
| **PayPal** | PayPal | Global |
| **Bank Transfer** | Manual | Brazil |
| **Cryptocurrency** | - | Global |

#### Withdrawals

| Method | Provider | Processing |
|--------|----------|------------|
| **PIX** | Asaas | Instant |
| **Bank Transfer** | Manual | 1-3 days |
| **PayPal** | PayPal | 1-2 days |

### 10.2 Payment Flow

```
USER REQUEST           BACKEND              PAYMENT PROVIDER
     │                    │                       │
     │  Deposit Request   │                       │
     │───────────────────▶│                       │
     │                    │   Create Session      │
     │                    │──────────────────────▶│
     │                    │   Session URL         │
     │                    │◀──────────────────────│
     │   Redirect URL     │                       │
     │◀───────────────────│                       │
     │                    │                       │
     │   [User Pays]      │                       │
     │─ ─ ─ ─ ─ ─ ─ ─ ─ ─▶│                       │
     │                    │                       │
     │                    │   Webhook             │
     │                    │◀──────────────────────│
     │                    │                       │
     │                    │   Update Balance      │
     │                    │   (DB Transaction)    │
     │                    │                       │
     │   Balance Updated  │                       │
     │◀───────────────────│                       │
```

### 10.3 API Endpoints

#### Stripe Integration

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/stripe/methods` | GET | Get Stripe configuration |
| `/stripe/deposit/create-session` | POST | Create payment session |
| `/stripe/deposit/status/:trx` | GET | Check deposit status |
| `/stripe/webhook` | POST | Handle Stripe events |

#### PayPal Integration

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/paypal/methods` | GET | Get PayPal configuration |
| `/paypal/deposit/create` | POST | Create PayPal order |
| `/paypal/deposit/capture/:orderId` | POST | Capture payment |
| `/paypal/ipn` | POST | Handle PayPal IPN |

#### Asaas Integration (Brazil)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/asaas/balance` | GET | Get user balance |
| `/asaas/deposit/pix` | POST | PIX deposit |
| `/asaas/deposit/card` | POST | Card deposit |
| `/asaas/withdraw/pix` | POST | PIX withdrawal |
| `/asaas/ipn` | POST | Handle Asaas webhook |

---

## 11. Gamification & Engagement

### 11.1 Task System

Users earn coins by completing tasks:

| Task Type | Examples | Reward |
|-----------|----------|--------|
| **Daily** | Login, make first trade | Variable |
| **Weekly** | Trade 5 times, refer a friend | Higher |
| **One-time** | Complete KYC, first deposit | Bonus |

### 11.2 Task States

```
LOCKED ──▶ AVAILABLE ──▶ IN_PROGRESS ──▶ PENDING_VERIFY ──▶ COMPLETED
```

### 11.3 Referral Program

- Generate unique referral codes
- Track referred users
- Earn commissions on referral activity
- Share via social media/clipboard

### 11.4 Leaderboard

- Global rankings based on performance
- Period-based competitions
- Social recognition mechanics

---

## 12. Mobile Experience

### 12.1 Platform Support

| Platform | Minimum Version |
|----------|-----------------|
| **iOS** | iOS 15+ |
| **Android** | Android 10+ |
| **Web** | React Native Web |

### 12.2 Mobile Features

#### Navigation Structure

```
┌─────────────────────────────────────────────┐
│               BOTTOM TABS                    │
├─────────┬─────────┬─────────┬───────┬───────┤
│ Markets │Portfolio│ Wallet  │ Game  │Profile│
└─────────┴─────────┴─────────┴───────┴───────┘
```

#### Key Screens

- **Markets**: Browse, search, filter predictions
- **Portfolio**: Active positions, P&L tracking
- **Wallet**: Balance, deposits, withdrawals
- **Game**: Tasks, referrals, coin balance
- **Profile**: Settings, security, support

### 12.3 Mobile-Specific Features

| Feature | Technology |
|---------|------------|
| **Persistent Storage** | MMKV |
| **OTA Updates** | Expo Updates |
| **Share API** | React Native Share |
| **Clipboard** | expo-clipboard |
| **Deep Linking** | expo-linking |
| **Smooth Animations** | Reanimated + Moti |

---

## 13. Admin & Operations

### 13.1 Admin Dashboard

The admin panel provides comprehensive management tools:

#### Dashboard Statistics

- Total users and active users
- Deposit/withdrawal summaries
- Profit/loss tracking
- Market status breakdown
- Trend visualizations (Recharts)

### 13.2 Management Modules

| Module | Capabilities |
|--------|--------------|
| **Users** | View, ban, add/subtract balance, KYC approval |
| **Markets** | Create, edit, resolve, cancel markets |
| **Deposits** | Approve, reject, track transactions |
| **Withdrawals** | Process, approve, reject withdrawals |
| **Support** | Ticket management, responses |
| **Groups** | Approve, reject, cancel syndicates |
| **Content** | Blog posts, CMS pages, FAQs |

### 13.3 Permission System

| Role | Description |
|------|-------------|
| **Super Admin** | Full access, can manage permissions |
| **Staff Admin** | Configurable per-module access |

#### Permission Types

- **Access**: `access` (can view) or `lock` (cannot access)
- **Mode**: `read` (view only) or `read_write` (view and edit)

### 13.4 Notification System

Automated notifications for:

- Group approval requests
- Result declaration reviews
- KYC verifications
- Support ticket updates

---

## 14. Roadmap

### Phase 1: Foundation (Completed)

- [x] Core platform architecture
- [x] User authentication & management
- [x] Market trading functionality
- [x] Admin panel with full controls
- [x] Multi-language support

### Phase 2: Group Syndicates (Completed)

- [x] Group creation and management
- [x] Member join/leave flows
- [x] Manager decision workflow
- [x] Admin approval system
- [x] Result declaration & execution
- [x] Payout distribution

### Phase 3: Mobile App (Completed)

- [x] iOS and Android applications
- [x] Full feature parity with web
- [x] OTA update capability
- [x] App store deployment

### Phase 4: Enhancements (Planned)

- [ ] **Futurus Coin**: Native token system
  - Token rewards
  - Staking mechanisms
  - Trading incentives

- [ ] **AI Integration**
  - Market analysis tools
  - Prediction assistance
  - Automated market creation

- [ ] **Advanced Analytics**
  - User behavior insights
  - Market performance metrics
  - Predictive modeling

### Phase 5: Expansion (Future)

- [ ] Additional payment providers
- [ ] New regional localizations
- [ ] API for third-party integrations
- [ ] White-label solutions

---

## 15. Conclusion

FUTURUS represents a new paradigm in prediction markets, combining:

- **Modern Technology**: Built on cutting-edge frameworks (Next.js 16, NestJS 11, React Native 0.81)
- **Social Innovation**: Group Syndicates enable collaborative predictions
- **Global Accessibility**: Multi-platform, multi-language, multi-payment support
- **Enterprise Security**: KYC, 2FA, and comprehensive audit trails
- **Engaging Experience**: Gamification mechanics drive user retention

The platform is designed for scalability, maintainability, and rapid feature development. With a solid architectural foundation and innovative features like Group Syndicates, FUTURUS is positioned to capture significant market share in the growing prediction market industry.

---

## Appendix A: API Response Format

All API responses follow a standardized format:

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... }
}
```

## Appendix B: Environment Configuration

### Frontend

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Backend API URL |
| `NEXTAUTH_SECRET` | Session encryption key |
| `NEXTAUTH_URL` | Auth callback URL |

### Backend

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | JWT signing key |
| `STRIPE_SECRET_KEY` | Stripe API key |
| `PAYPAL_CLIENT_ID` | PayPal credentials |
| `ASAAS_API_KEY` | Asaas API key |

### Mobile

| Variable | Description |
|----------|-------------|
| `EXPO_PUBLIC_API_URL` | API endpoint |
| `EXPO_PUBLIC_APP_ENV` | Environment (dev/preview/prod) |

---

## Appendix C: Database Schema Overview

### Core Models

```
User ──────────── GroupMember ──────────── Group
  │                                          │
  │                                          │
  ├──── Transaction                   GroupOrder
  │                                          │
  ├──── Purchase ────────── Market ──────────┘
  │                            │
  └──── SupportTicket     MarketOption
```

### Key Tables

| Table | Purpose |
|-------|---------|
| `User` | User accounts and profiles |
| `Market` | Prediction markets |
| `MarketOption` | Market outcomes (YES/NO) |
| `Purchase` | Individual trades |
| `Group` | Group syndicates |
| `GroupMember` | Group membership and contributions |
| `GroupOrder` | Collective trades |
| `Transaction` | Financial transactions |
| `AdminNotification` | Admin alerts |
| `UserNotification` | User notifications |

---

**Document Information**

| Field | Value |
|-------|-------|
| **Version** | 2.0 |
| **Last Updated** | March 2026 |
| **Authors** | FUTURUS Development Team |
| **Status** | Production |

---

*This whitepaper is intended for technical and business stakeholders to understand the FUTURUS platform architecture, features, and capabilities.*
