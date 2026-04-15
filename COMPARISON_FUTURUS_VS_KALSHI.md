# Futurus vs Kalshi: Prediction Market Comparison

## 1. Overview

| Aspect | Futurus | Kalshi |
|--------|---------|--------|
| **Type** | Pool-based prediction market | Binary options exchange (order book) |
| **Model** | Parimutuel (pool-based) | Continuous Double Auction (order book) |
| **Regulation** | Not specified | CFTC regulated (US legal) |
| **Counterparty** | All participants share a pool | Peer-to-peer (trader vs trader) |

---

## 2. Market Mechanics

### Futurus - Parimutuel Pool Model
- Users buy into a **Yes Pool** or **No Pool**.
- Prices (probabilities) are determined by the ratio of money in each pool.
- All bets are aggregated; there is no individual counterparty matching.
- The market resolves at the end, and the **entire losing pool** is redistributed to winners (minus commission).

### Kalshi - Order Book Exchange Model
- Users buy **event contracts** priced between $0.01 and $0.99.
- Prices are set by supply and demand on a **limit order book** (like a stock exchange).
- Each trade has a specific counterparty (maker/taker).
- Contracts settle at **$1.00** (event happens) or **$0.00** (event doesn't happen).

---

## 3. Pricing & Probability

| Aspect | Futurus | Kalshi |
|--------|---------|--------|
| **Price Discovery** | Pool ratio: `Yes% = YesPool / TotalPool` | Market-driven order book |
| **Probability Signal** | Percentage of pool on each side | Contract price (e.g., $0.65 = 65%) |
| **Price Dynamics** | Changes with every new bet added to pools | Changes with every trade on the order book |
| **Granularity** | Continuous (any dollar amount) | Discrete ($0.01 increments) |

---

## 4. Payout Structure

### Futurus
```
Payout = (TotalPool - Commission) x (UserBet / WinningPool)
```
- **Variable return**: Depends on pool sizes at close.
- **Example**: $100 bet on Yes pool ($1,000 total), No pool = $2,000, 5% commission.
  - Net pool = $2,850. Payout = $2,850 x (100/1,000) = **$285** (2.85x return).
- Winners split the entire pool proportionally.
- Losers lose their entire bet.

### Kalshi
```
Max Profit = ($1.00 - Purchase Price) x Number of Contracts
Max Loss  = Purchase Price x Number of Contracts
```
- **Fixed return**: Each contract pays exactly $1.00 if correct, $0.00 if wrong.
- **Example**: Buy 100 "Yes" contracts at $0.40. If correct: profit = ($1.00 - $0.40) x 100 = **$60**. If wrong: loss = $0.40 x 100 = **$40**.
- Return is known at the time of purchase.

---

## 5. Fee Structure

| Aspect | Futurus | Kalshi |
|--------|---------|--------|
| **Fee Model** | Commission on total pool (e.g., 5%) | Per-contract fee based on price |
| **Fee Formula** | `Commission = TotalPool x Rate` | `Fee = ceil(0.07 x Contracts x Price x (1-Price))` |
| **Fee Impact** | Deducted from winnings at resolution | Paid at time of trade |
| **Fee Behavior** | Flat percentage | Highest at 50/50 uncertainty, lower at extremes |

---

## 6. Trading Flexibility

| Feature | Futurus | Kalshi |
|---------|---------|--------|
| **Early Exit** | Not described (likely hold-to-resolution) | Yes - sell contracts anytime on secondary market |
| **Order Types** | Single type (bet into pool) | Market orders and limit orders |
| **Partial Exit** | Not described | Yes - sell any number of contracts |
| **Pre-Resolution Trading** | Bets change pool odds dynamically | Full secondary market trading |

---

## 7. Risk Profile

| Aspect | Futurus | Kalshi |
|--------|---------|--------|
| **Max Loss** | Full bet amount | Full purchase price |
| **Max Gain** | Proportional share of entire pool (can be very high) | $1.00 per contract minus purchase price |
| **Return Uncertainty** | High - payout depends on final pool state | Low - payout known at purchase |
| **Liquidity Risk** | None (pool always pays) | Possible (may not find buyer/seller) |

---

## 8. Strengths & Weaknesses

### Futurus
| Strengths | Weaknesses |
|-----------|------------|
| Simple to understand (bet Yes or No) | Payout uncertain until market closes |
| No counterparty matching needed | No early exit mechanism described |
| Guaranteed liquidity (pool-based) | Late bettors can dilute early bettors' returns |
| Potentially higher returns (whole losing pool redistributed) | No regulatory framework mentioned |

### Kalshi
| Strengths | Weaknesses |
|-----------|------------|
| CFTC regulated, legal in the US | More complex (order book, limit orders) |
| Known payout at time of purchase | Liquidity dependent on market activity |
| Can exit positions early | Fee structure penalizes uncertain markets |
| Broker integrations (Robinhood) | Capped at $1.00 per contract |
| Maker/taker incentive structure | Requires more financial literacy |

---

## 9. Target Audience

| Aspect | Futurus | Kalshi |
|--------|---------|--------|
| **Ideal User** | Casual predictors, simpler UX | Sophisticated traders, finance-oriented users |
| **Complexity** | Low barrier to entry | Medium-high (order book familiarity needed) |
| **Market Focus** | General events | Politics, finance, sports, entertainment |
| **Geography** | Not specified | US-focused (CFTC regulated) |

---

## 10. Key Differentiator Summary

**Futurus** operates like a **betting pool** - everyone puts money in, and winners split the pot. This model is simpler, guarantees liquidity, and can offer outsized returns when one side of the pool is much larger than the other.

**Kalshi** operates like a **stock exchange** - you buy and sell contracts at market-driven prices with known payouts. This model offers more trading flexibility, regulatory protection, and transparency, but requires more sophistication from users.

### Analogy
- **Futurus** = Horse racing (parimutuel) - bet into a pool, winners split proportionally.
- **Kalshi** = Stock market (exchange) - buy/sell contracts with fixed settlement values.
