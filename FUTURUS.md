Market Pools & Payout
Business Logic Calculation
How It Works

FUTURUS allows users to predict outcomes by purchasing shares in a "Yes" or "No" pool for a given market event. Each market has two sides:

Yes Pool – Users predicting the event will happen.
No Pool – Users predicting the event will not happen.
As users place bets, the pool amounts dynamically change, and percentages are recalculated in real time. When the market is resolved, winners receive payouts based on their share of the winning pool.

Mathematical Logic

Step 1: Pool Percentage Calculation

Formula:

Yes (%) = (Yes Pool ÷ Total Pool) × 100
No (%) = (No Pool ÷ Total Pool) × 100
Example:

Yes Pool = $1,000
No Pool = $2,000
Total Pool = $3,000
Yes (%) = (1,000 ÷ 3,000) × 100 = 33.33%
No (%) = (2,000 ÷ 3,000) × 100 = 66.67%

Step 2: Payout Calculation

Formula:

Payout = (Total Pool - Total Pool × Commission) × (User Investment ÷ Total Winning Pool)

This ensures that winnings are distributed proportionally to each user based on their contribution to the winning pool.

Example with Commission:

Total Pool = $3,000
Commission = 5% → $150
Net Pool = $3,000 - $150 = $2,850
User Invested $100 in Yes Pool
Total Yes Pool = $1,000
Payout = 2,850 × (100 ÷ 1,000) = $285

Dynamic Example (5 Users)

User	Choice	Bet	Yes Pool	No Pool	Yes %	No %
Initial	-	-	$1,000	$2,000	33.3%	66.7%
1	Yes	$200	$1,200	$2,000	35.3%	64.7%
2	No	$150	$1,200	$2,150	32.4%	67.6%
3	Yes	$300	$1,500	$2,150	38.5%	61.5%
4	No	$250	$1,500	$2,400	34.9%	65.1%
5	Yes	$100	$1,600	$2,400	36.4%	63.6%
This example shows how each user’s bet dynamically changes the pool percentages, which in turn affects potential payouts for all participants.