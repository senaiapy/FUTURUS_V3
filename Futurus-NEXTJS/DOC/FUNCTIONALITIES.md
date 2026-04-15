# FUTURUS - Complete Platform Functionalities

## Overview

FUTURUS is a comprehensive prediction market platform that allows users to trade on the outcomes of future events. The platform consists of four main stacks:

| Stack | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | Next.js 16 + React 19 | User-facing web application |
| **Backend** | NestJS 11 + PostgreSQL + Prisma | API server and business logic |
| **Admin** | Next.js 16 + React 19 | Administrative dashboard |
| **Mobile** | Expo 54 + React Native 0.81 | iOS/Android mobile application |

---

## 1. FRONTEND (Web Application)

### 1.1 Authentication & Security
- Email/username and password login
- Google OAuth integration
- Facebook OAuth integration
- User registration with validation
- Password recovery (forgot password flow)
- Two-Factor Authentication (2FA) setup
- JWT token-based session management
- KYC (Know Your Customer) verification system
- Account deletion option

### 1.2 Markets & Trading
- Browse all prediction markets
- Search markets by keyword
- Filter markets by category
- View trending markets
- Individual market detail pages with:
  - Market description and rules
  - YES/NO trading panel
  - Real-time price updates via WebSocket (Socket.io)
  - Share quantity calculator
  - Profit/loss calculations
- Market bookmarking/favorites

### 1.3 User Dashboard
- Account balance display
- Deposit/withdrawal summaries
- Total shares purchased
- Profit tracking
- Recent market activity
- Recent purchase history
- Security alerts (2FA, empty balance)

### 1.4 Financial Features
- **Deposit Methods:**
  - Cryptocurrency
  - PIX/Card (Brazilian payments)
  - Bank Transfer
  - PayPal
  - Stripe (Credit/Debit Card)
- **Withdrawals:**
  - Multiple withdrawal methods
  - Status tracking
- Transaction history with search
- Deposit history

### 1.5 Referral Program
- Unique referral link generation
- Copy-to-clipboard functionality
- Referral statistics dashboard
- Commission tracking

### 1.6 User Profile Management
- Profile settings (name, address, etc.)
- Email and username management
- Account security settings
- KYC document submission
- 2FA management
- Password change

### 1.7 Support & Community
- Support ticket system (create, view, track)
- Priority-based tickets
- Blog/news articles
- Leaderboard rankings
- Games center

### 1.8 Internationalization
- Multi-language support: Portuguese (PT), English (EN), Spanish (ES)
- Language switcher in header
- Locale-based routing

### 1.9 Content Pages
- Homepage with features showcase
- About page
- How it works
- FAQ
- Terms of service
- Privacy policy
- Cookie policy
- Contact form
- Testimonials

---

## 2. BACKEND (API Server)

### 2.1 Authentication Module
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/login` | POST | User login (rate limited: 5/min) |
| `/api/auth/register` | POST | User registration (rate limited: 10/5min) |
| `/api/auth/me` | GET | Get authenticated user |
| `/api/auth/forgot-password` | POST | Request password reset |
| `/api/auth/reset-password` | POST | Reset password with token |
| `/api/auth/google` | GET | Google OAuth redirect |
| `/api/auth/google/callback` | GET | Google OAuth callback |
| `/api/auth/facebook` | GET | Facebook OAuth redirect |
| `/api/auth/facebook/callback` | GET | Facebook OAuth callback |

### 2.2 Users Module
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/users/profile` | GET/PATCH | Get/Update user profile |
| `/api/users/change-password` | POST | Change password |
| `/api/users/kyc-form` | GET | KYC form template |
| `/api/users/kyc-data` | GET | User's KYC data |
| `/api/users/kyc-submit` | POST | Submit KYC verification |
| `/api/users/2fa` | GET | Get 2FA data |
| `/api/users/2fa/enable` | POST | Enable 2FA |
| `/api/users/2fa/disable` | POST | Disable 2FA |
| `/api/users/referrals` | GET | Get referral data |
| `/api/users/dashboard` | GET | Dashboard statistics |
| `/api/users/leaderboard` | GET | Global leaderboard |
| `/api/users/login-history` | GET | Login history |
| `/api/users/delete-account` | POST | Delete account |

### 2.3 Markets Module
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/markets` | GET | List markets (pagination, filtering, search) |
| `/api/markets/trending` | GET | Trending markets |
| `/api/markets/:slug` | GET | Market details by slug |
| `/api/markets/calculations/:optionId` | GET | Calculate profit/loss |
| `/api/markets/:id/trends` | GET | Market trend data |
| `/api/markets/:id/bookmark` | POST | Toggle bookmark |

### 2.4 Trading Module
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/bets/buy` | POST | Place a bet/trade |
| `/api/bets/my-bets` | GET | User's bet history |
| `/api/bets/my-positions` | GET | User's active positions |
| `/api/purchases` | POST | Place trade/purchase |
| `/api/purchases/history` | GET | Purchase history |
| `/api/purchases/positions` | GET | Current positions |

### 2.5 Financial Module
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/deposits` | POST | Create deposit |
| `/api/deposits/history` | GET | Deposit history |
| `/api/withdrawals` | POST/GET | Create/List withdrawals |
| `/api/withdrawals/methods` | GET | Available withdrawal methods |
| `/api/wallet` | GET | Wallet balance |
| `/api/wallet/deposit-methods` | GET | Available deposit methods |
| `/api/transactions` | GET | Transaction history |

### 2.6 Payment Gateway Integrations

#### Stripe
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/stripe/methods` | GET | Stripe configuration |
| `/api/stripe/deposit/create-session` | POST | Create Stripe session |
| `/api/stripe/deposit/status/:trx` | GET | Check deposit status |
| `/api/stripe/webhook` | POST | Stripe webhook handler |

#### PayPal
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/paypal/methods` | GET | PayPal configuration |
| `/api/paypal/deposit/create` | POST | Create PayPal order |
| `/api/paypal/deposit/capture/:orderId` | POST | Capture PayPal order |
| `/api/paypal/ipn` | POST | PayPal IPN webhook |

#### Asaas (Brazilian Payments)
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/asaas/balance` | GET | User balance |
| `/api/asaas/deposit/pix` | POST | PIX deposit |
| `/api/asaas/deposit/card` | POST | Credit card deposit |
| `/api/asaas/withdraw/pix` | POST | PIX withdrawal |
| `/api/asaas/withdraw/transfer` | POST | Bank transfer withdrawal |
| `/api/asaas/ipn` | POST | Asaas webhook |

### 2.7 Gamification Module
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/game/progress/dashboard` | GET | Gamification dashboard |
| `/api/game/coins/balance` | GET | Coin balance |
| `/api/game/coins/transactions` | GET | Coin transaction history |
| `/api/game/tasks` | GET | All available tasks |
| `/api/game/tasks/user/my-tasks` | GET | User's tasks |
| `/api/game/progress/start/:taskId` | POST | Start task |
| `/api/game/progress/complete/:taskId` | POST | Complete task |
| `/api/game/referrals/generate` | POST | Generate referral code |
| `/api/game/referrals` | GET | Referral data |

### 2.8 Comments & Community
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/comments` | GET/POST | Get/Create market comments |
| `/api/comments/:id/replies` | GET | Get comment replies |
| `/api/comments/:id/like` | POST | Like/unlike comment |
| `/api/comments/:id/report` | POST | Report comment |

### 2.9 Support Module
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/support/tickets` | GET/POST | Get/Create support tickets |
| `/api/support/tickets/:ticket` | GET | View ticket details |
| `/api/support/tickets/:id/reply` | POST | Reply to ticket |
| `/api/support/tickets/:id/close` | POST | Close ticket |

### 2.10 Content Management
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/blogs` | GET | List published blogs |
| `/api/blogs/:slug` | GET | Get blog post |
| `/api/categories` | GET | All categories |
| `/api/settings/general` | GET | Site settings |
| `/api/settings/faq` | GET | FAQ |
| `/api/settings/policies` | GET | Privacy/terms |
| `/api/settings/pages/:slug` | GET | CMS page |

### 2.11 Real-time Features
- WebSocket support via Socket.io
- Market update subscriptions
- Live price updates

### 2.12 Database Models
- **User Management:** User, UserLogin, AdminPermission, CookieConsent
- **Markets & Trading:** Market, MarketOption, Purchase, MarketBookmark, MarketTrend
- **Financial:** Transaction, Deposit, Withdrawal, Gateway, GatewayCurrency
- **Content:** Blog, Category, SubCategory, Page, Comment
- **Support:** SupportTicket, SupportMessage, SupportAttachment
- **Gamification:** GameTask, UserTask, CoinTransaction, Referral
- **Admin:** Admin, GeneralSetting, CronJob, AdminNotification

---

## 3. ADMIN PANEL

### 3.1 Dashboard Overview
- Total users and active users count
- Email/Mobile verification statistics
- Deposits/Withdrawals summary with totals, pending, rejected
- Deposit/Withdrawal fees tracking
- Profit/Loss tracking (Today, Week, Month, All-time)
- Purchase tracking
- Market status breakdown (Live, Resolved, Pending, Cancelled)
- **Charts:**
  - Profit vs Purchases (Last 30 days)
  - Market Status Distribution
  - Active Users Trend (Last 7 days)
  - Browser/OS/Country Distribution

### 3.2 User Management
- List all users with filtering (Active, Banned, Email Verified, etc.)
- Search by username, email, firstname
- User detail view with comprehensive information
- Ban/unban users
- Add/subtract user balance
- KYC verification approval/rejection
- Bulk notification sending
- User impersonation (login as user)

### 3.3 Market Management
- **Create Markets:**
  - Question/Title
  - Category and Subcategory selection
  - Tags assignment
  - Start/End date picker
  - Market type selection
  - Pool allocation (Yes/No)
  - Description and slug
  - Image upload
- **Market Filtering by Status:**
  - Draft, Upcoming, Live, Closing Soon
  - Pending Resolution, Declared, Completed
  - Disabled, Cancelled
- Lock/unlock markets
- Toggle trending status
- Cancel markets
- Resolve markets with outcomes
- Manage market options

### 3.4 Category Management
- Create/edit categories
- Create/edit subcategories
- Toggle category status (active/inactive)

### 3.5 Financial Management

#### Deposits
- Filter by status: Pending, Approved, Successful, Rejected, Initiated
- Search by transaction ID, username, email
- Approve/Reject deposits
- View transaction details

#### Withdrawals
- Filter: All, Pending, Approved, Rejected
- Search by transaction ID, user info
- Approve/Reject withdrawals
- View withdrawal details with bank info

### 3.6 Payment Gateway Configuration
- **Automatic Gateways:** Stripe, PayPal, Asaas
- **Manual Methods:** Bank transfer, etc.
- Gateway status toggle
- Currency configuration per gateway

### 3.7 Support Ticket Management
- Ticket filtering: All, Open, Answered, Closed
- Search by ticket number, subject, username
- Reply to tickets
- Close tickets
- Priority management

### 3.8 Blog Management
- Create/Edit blog posts
- Categories: Mercados, Previsoes, Analises, Tutoriais, Novidades, Geral
- Image upload for featured images
- Status management (Published/Draft)
- View tracking

### 3.9 Game Module Management
- **Statistics:**
  - Total game users
  - Total coins earned
  - Total tasks completed
  - Total referrals
  - Pending verifications
  - Active tasks
  - Today's/Weekly earnings
- Task management
- Referral tracking
- Coin transaction history

### 3.10 Reports
- Transaction Reports
- Purchase Reports
- Login History Reports

### 3.11 Settings & Configuration
- **Identity Settings:** Site name, Logo, Contact info, Currency
- **Security:** Admin password, 2FA enforcement, KYC toggle
- **Notifications:** Email, SMS, Push configuration
- **Language Management:** Multi-language support
- **Cookie Management:** Cookie consent, GDPR compliance
- **SEO Settings:** Meta tags, site optimization
- **Social Login:** OAuth provider configuration
- **Custom CSS:** Custom stylesheet
- **Maintenance Mode:** Toggle with custom message
- **Newsletter Settings:** Subscription configuration

### 3.12 Permission Management (Super Admin Only)
- Role-based access control (Super Admin vs Staff Admin)
- Granular per-route permissions
- Read-only vs Read-Write modes
- Add/edit/delete admin staff
- Module access control:
  - Dashboard, Categories, Subcategories
  - Markets, Users, Deposits, Withdrawals
  - Reports, Support, Game, Settings
  - Grupos, Futurus Coin, IA Control

### 3.13 Groups Management
- Manage user groups/syndicates
- Group authorization for betting
- Participant limits and contribution limits

### 3.14 Future Features (Planned)
- **Futurus Coin:** Transactions, Rewards, Staking
- **IA Control:** AI Models, Automation, Analytics

---

## 4. MOBILE APPLICATION

### 4.1 Authentication
- User login with form validation
- User registration
- Password recovery flow
- Onboarding screens for new users
- Session persistence (MMKV storage)

### 4.2 Markets & Trading
- Browse all prediction markets
- Search markets by name/symbol
- Filter by category and status
- Individual market detail pages with:
  - Candlestick charts
  - BUY/SELL trading interface
  - Real-time price information
- Place trades/bets

### 4.3 Portfolio Management
- View active positions and historical bets
- Portfolio performance metrics
- Profit/loss visualization with SVG charts
- Transaction filtering and sorting
- Position details (average price, shares, P&L)

### 4.4 Wallet & Payments
- Balance display in multiple currencies
- **Deposit Methods:**
  - PIX (Brazilian instant payment)
  - Credit/Debit Card (Asaas integration)
  - Installment payment options
- **Withdraw Methods:**
  - PIX withdrawal
  - Bank transfer
- Transaction history with filtering
- Clipboard copy for payment details
- Real-time payment status polling

### 4.5 Game System (Gamification)
- Coin balance tracking
- **Task System:**
  - Daily, weekly, one-time tasks
  - Task statuses: LOCKED, AVAILABLE, IN_PROGRESS, PENDING_VERIFY, COMPLETED
  - Task completion with proof submission
- **Referral System:**
  - Generate unique referral codes
  - Track referred users
  - Bonus rewards for successful referrals
  - Share referral links via social/clipboard
- Coin transaction history
- Dashboard with progress overview
- Leaderboard/stats display

### 4.6 User Profile
- User information display
- Avatar management
- Account verification status badges
- Balance viewing
- Settings access
- Logout functionality

### 4.7 Settings & Preferences
- Language selection: English, Portuguese, Spanish, Arabic
- Theme selection: Light/Dark mode
- App version display
- Support links (website, social media)
- Share and rating options
- Privacy/Terms access

### 4.8 Navigation Structure
- **Bottom Tab Navigation:**
  - Markets/Home
  - Portfolio
  - Wallet
  - Game
  - Profile
- **Drawer Navigation:**
  - Home, Profile, Settings
  - Fees, Game, FAQ
  - Responsible Gaming
  - Terms & Policy
  - Contact
  - Login/Register (when logged out)

### 4.9 Additional Features
- Flash message notifications (toast)
- WhatsApp integration button
- Deep linking support
- OTA updates (Expo Updates)
- Web support (React Native Web)

### 4.10 Internationalization
- 4 languages: Portuguese, English, Spanish, Arabic
- Dynamic number/currency formatting
- Locale-aware date formatting

---

## 5. CROSS-PLATFORM FEATURES

### 5.1 Security
- JWT token-based authentication
- Password hashing with bcryptjs
- Rate limiting on sensitive endpoints
- XSS protection (DOMPurify)
- GDPR cookie consent
- KYC verification system
- Two-Factor Authentication (2FA)

### 5.2 Payment Processing
- Multi-gateway support (Stripe, PayPal, Asaas)
- PIX instant payments (Brazil)
- Credit/debit card processing
- Bank transfers
- Webhook handlers for payment confirmations
- Transaction status tracking

### 5.3 Real-time Communication
- WebSocket via Socket.io
- Live market price updates
- Real-time trading notifications

### 5.4 Internationalization
- Multi-language support (PT, EN, ES, AR)
- Currency localization
- Date/time formatting per locale

### 5.5 Gamification
- Task-based reward system
- In-app currency (coins)
- Referral program with commissions
- Leaderboards

### 5.6 Content Management
- Blog system
- CMS pages
- FAQ management
- Policy pages

---

## 6. TECHNOLOGY STACK SUMMARY

| Component | Technology |
|-----------|------------|
| **Frontend Framework** | Next.js 16.1.6 |
| **Frontend UI** | React 19, Tailwind CSS 4 |
| **Backend Framework** | NestJS 11.0.1 |
| **Database** | PostgreSQL |
| **ORM** | Prisma 6.4.1 |
| **Mobile Framework** | Expo 54, React Native 0.81 |
| **State Management** | Zustand, React Query |
| **Authentication** | NextAuth, Passport.js, JWT |
| **Real-time** | Socket.io |
| **Payments** | Stripe, PayPal, Asaas |
| **File Storage** | Local (Multer) |
| **Styling** | Tailwind CSS |
| **Icons** | Lucide React |
| **Forms** | React Hook Form, Zod |
| **Testing** | Jest |
| **Deployment** | Docker |

---

## 7. API RESPONSE FORMAT

All API responses follow a standardized format:

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... }
}
```

---

## 8. ENVIRONMENT CONFIGURATION

### Frontend
- `NEXT_PUBLIC_API_URL` - Backend API URL
- `NEXTAUTH_SECRET` - Session encryption
- `NEXTAUTH_URL` - Auth callback URL

### Backend
- Database connection (PostgreSQL)
- JWT secrets
- OAuth credentials (Google, Facebook)
- Payment gateway API keys (Stripe, PayPal, Asaas)
- SMTP configuration

### Mobile
- API URL
- Build configuration (EAS)

---

*Document generated: March 2026*
*Version: 2.0*
