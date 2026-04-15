# Phase 2: Core Trading & User Features Implementation

This phase focuses on bridging the gap between the static frontend and the functional backend, enabling users to authenticate, browse markets, and place predictions.

## 1. Authentication & Security (@frontend)

- **Goal**: Implement NextAuth.js (Auth.js) integration with the NestJS backend.
- **Tasks**:
  - [ ] Create `[...nextauth]/route.ts` with a `CredentialsProvider` that calls NestJS `/auth/login`.
  - [ ] Implement `Login` and `Register` pages using **Shadcn UI** and **Lucide React**.
  - [ ] Add `useUser` hook or equivalent to manage session/balance state.
  - [ ] Implement Middleware to protect `/dashboard` and `/purchase` routes.

## 2. Trading System (@backend)

- **Goal**: Replicate the Laravel `MarketController@purchase` logic in NestJS.
- **Tasks**:
  - [ ] Create `Purchases` module.
  - [ ] Implement `PurchasesService.placeTrade()`:
    - [ ] Balance check.
    - [ ] Calculate specific Yes/No share prices using `MarketsService`.
    - [ ] Prisma transaction to:
      - [ ] Create `Purchase` record.
      - [ ] Deduct `User.balance`.
      - [ ] Increment `MarketOption.yesPool` or `noPool`.
      - [ ] Update `MarketOption.chance`.
      - [ ] Record `MarketTrend` (for charts).
  - [ ] Implement `TransactionsService` to log ledger entries.

## 3. Market UI Components (@frontend)

- **Goal**: Build interactive market interfaces.
- **Tasks**:
  - [ ] `MarketCard`: Show question, volume, and Yes/No win probability.
  - [ ] `MarketDetails`: Full page with description, rules, and trading panel.
  - [ ] `TradingPanel`: Input field for "Amount" or "Shares", showing calculated payout/profit before purchase.
  - [ ] `CategoryFilter`: Filter markets by slug (Mundo, Crypto, etc.).

## 4. User Dashboard (@frontend)

- **Goal**: Personalized experience for traders.
- **Tasks**:
  - [ ] `Overview`: Show Total Invested, Total Profit, and Success Rate.
  - [ ] `PurchaseHistoryTable`: Paginated list of all bets (Waiting, Won, Lost, Cancelled).
  - [ ] `TransactionHistoryTable`: Financial logs (Deposits, Withdrawals, Purchases).
  - [ ] `ProfileSettings`: Update name, password, 2FA toggle.

## 5. Admin Dashboard Phase 1 (@admin)

- **Goal**: Basic CRUD for markets.
- **Tasks**:
  - [ ] `CategoryManager`: List/Add categories.
  - [ ] `MarketManager`: Form to create new markets with initial pools and end dates.

---

**Status**: Ready for implementation.
**Current Directory**: `/Users/galo/Desktop/futurus.net.br/FUTURUS`
