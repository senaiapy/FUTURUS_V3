<?php

namespace App\Http\Controllers\Api;

use App\Constants\Status;
use App\Http\Controllers\Controller;
use App\Lib\MarketPrice;
use App\Lib\Referral;
use App\Models\Market;
use App\Models\MarketOption;
use App\Models\Purchase;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PurchaseController extends Controller
{
    /**
     * Create a new purchase (bet)
     */
    public function store(Request $request)
    {
        $marketId  = $request->market_id ?? $request->marketId;
        $optionId  = $request->option_id ?? $request->outcomeId;
        $buyOption = $request->buy_option ?? $request->buyOption;
        $amount    = $request->amount;
        $shares    = $request->shares;

        if (!$shares && $amount) {
            // Fetch price to calculate shares
            $tempOption = MarketOption::active()->findOrFail($optionId);
            $totalPool = $tempOption->yes_pool + $tempOption->no_pool;
            $prob = $totalPool > 0 ? ($buyOption === 'yes' ? $tempOption->yes_pool / $totalPool : $tempOption->no_pool / $totalPool) : 0.5;
            $price = max(0.01, $prob);
            $shares = $amount / $price;
        }

        $request->merge([
            'market_id' => $marketId,
            'option_id' => $optionId,
            'buy_option' => $buyOption,
            'shares' => $shares,
        ]);

        $request->validate([
            'market_id'   => 'required|exists:markets,id',
            'option_id'   => 'required|exists:market_options,id',
            'buy_option'  => 'required|in:yes,no',
            'shares'      => 'required|numeric|gt:0',
            'amount'      => 'required|numeric|gt:0',
        ]);

        $market = Market::running()
            ->with('activeMarketOptions')
            ->findOrFail($request->market_id);

        $option = MarketOption::active()
            ->where('market_id', $market->id)
            ->findOrFail($request->option_id);

        $user   = Auth::user();
        $shares = (float) $request->shares;
        $amount = (float) $request->amount;

        // Validate option belongs to market
        if ($option->market_id !== $market->id) {
            return response()->json([
                'success' => false,
                'message' => 'This option does not belong to this market',
            ], 400);
        }

        // Check if option is locked
        if ($option->isLocked()) {
            return response()->json([
                'success' => false,
                'message' => 'This option is currently unavailable',
            ], 400);
        }

        // Check if market is locked
        if ($market->isLocked()) {
            return response()->json([
                'success' => false,
                'message' => 'This market is currently unavailable',
            ], 400);
        }

        // Validate amount
        $calculations = MarketPrice::getMarketCalculations($option->id, $shares, $request->buy_option);

        $expectedAmount = $calculations['total_amount'];

        if (abs($amount - $expectedAmount) > 0.01) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid amount. Please refresh and try again.',
                'expected' => $expectedAmount,
            ], 400);
        }

        // Check balance
        if ($user->balance < $amount) {
            return response()->json([
                'success' => false,
                'message' => 'Insufficient balance in your account',
                'required' => $amount,
                'available' => $user->balance,
            ], 400);
        }

        $pricePerShare = $request->buy_option === 'yes'
            ? $calculations['yes_share_price']
            : $calculations['no_share_price'];

        $totalShares = $amount / $pricePerShare;
        $winAmount = $request->buy_option === 'yes'
            ? $calculations['yes_payout_if_win']
            : $calculations['no_payout_if_win'];

        $profit = $request->buy_option === 'yes'
            ? $calculations['yes_profit_if_win']
            : $calculations['no_profit_if_win'];

        // Create purchase
        $purchase = new Purchase();
        $purchase->user_id          = $user->id;
        $purchase->market_id        = $market->id;
        $purchase->market_option_id = $option->id;
        $purchase->type             = $request->buy_option;
        $purchase->total_share      = $totalShares;
        $purchase->price_per_share  = $pricePerShare;
        $purchase->amount           = $amount;
        $purchase->profit           = $profit;
        $purchase->win_amount       = $winAmount;
        $purchase->status           = Status::WAITING;
        $purchase->trx              = getTrx();
        $purchase->save();

        // Update user balance
        $user->balance -= $amount;
        $user->total_shares_bought += $totalShares;
        $user->save();

        // Update market option pools
        if ($request->buy_option === 'yes') {
            $option->yes_pool += $amount;
        } else {
            $option->no_pool += $amount;
        }

        $totalPool      = $option->yes_pool + $option->no_pool;
        $chance         = $totalPool > 0 ? ($option->yes_pool / $totalPool) * 100 : 50.00;
        $option->chance = round($chance, 2);
        $option->save();

        // Update market stats
        if ($market->type == Status::SINGLE_MARKET) {
            $newTotalPool      = $option->yes_pool + $option->no_pool;
            $market->volume    = $newTotalPool;
            $market->yes_share = $newTotalPool > 0 ? round(($option->yes_pool / $newTotalPool) * 100, 2) : 50.00;
            $market->no_share  = $newTotalPool > 0 ? round(($option->no_pool / $newTotalPool) * 100, 2) : 50.00;
            $market->save();
        } else {
            $this->updateMarketStatsMultiple($market->id);
        }

        // Create transaction
        $transaction = new Transaction();
        $transaction->user_id      = $user->id;
        $transaction->amount       = $amount;
        $transaction->post_balance = $user->balance;
        $transaction->charge       = 0;
        $transaction->trx_type     = '-';
        $transaction->details      = 'Purchase ' . $request->buy_option . ' share amount ' . showAmount($amount);
        $transaction->remark       = 'purchase_share';
        $transaction->trx          = $purchase->trx;
        $transaction->save();

        // Handle referral commission
        if (gs()->share_purchase_commission) {
            Referral::levelCommission($user, $purchase->amount, $purchase->trx, 'share_purchase_commission');
        }

        return response()->json([
            'success' => true,
            'message' => 'Shares purchased successfully',
            'data' => [
                'id' => (string) $purchase->id,
                'marketId' => (string) $market->id,
                'marketTitle' => $market->question,
                'optionId' => (string) $option->id,
                'optionTitle' => $option->question,
                'type' => strtoupper($request->buy_option),
                'shares' => (string) $totalShares,
                'price' => (string) $pricePerShare,
                'amount' => (string) $amount,
                'potentialProfit' => (string) $profit,
                'winAmount' => (string) $winAmount,
                'status' => $this->getPurchaseStatus($purchase->status),
                'trx' => $purchase->trx,
                'createdAt' => $purchase->created_at->toIso8601String(),
            ],
        ]);
    }

    /**
     * Get user's purchases history
     */
    public function index(Request $request)
    {
        $user = Auth::user();

        $query = Purchase::with(['market', 'option' => function ($q) {
            $q->with('market');
        }])
            ->where('user_id', $user->id)
            ->latest();

        // Apply filters
        if ($request->filled('status')) {
            $statusMap = [
                'PENDING' => [Status::WAITING, Status::PENDING],
                'CONFIRMED' => [Status::CONFIRMED],
                'WON' => [Status::WIN],
                'LOST' => [Status::LOST],
                'CANCELLED' => [Status::CANCELLED],
            ];

            if (isset($statusMap[$request->status])) {
                $query->whereIn('status', $statusMap[$request->status]);
            }
        }

        if ($request->filled('market_id')) {
            $query->where('market_id', $request->market_id);
        }

        $page = $request->get('page', 1);
        $limit = $request->get('limit', 20);

        $purchases = $query->paginate($limit, ['*'], 'page', $page);

        $data = $purchases->map(function ($purchase) {
            $market = $purchase->market;
            $option = $purchase->option ?? null;

            return [
                'id' => (string) $purchase->id,
                'market' => [
                    'id' => (string) $market->id,
                    'title' => $market->question,
                    'slug' => $market->slug,
                ],
                'outcome' => $option ? [
                    'id' => (string) $option->id,
                    'title' => $option->question,
                    'market' => [
                        'id' => (string) $market->id,
                        'title' => $market->question,
                        'slug' => $market->slug,
                    ],
                ] : null,
                'type' => strtoupper($purchase->type),
                'shares' => (string) $purchase->total_share,
                'price' => (string) $purchase->price_per_share,
                'amount' => (string) $purchase->amount,
                'profit' => (string) $purchase->profit,
                'winAmount' => (string) $purchase->win_amount,
                'status' => $this->getPurchaseStatus($purchase->status),
                'trx' => $purchase->trx,
                'createdAt' => $purchase->created_at->toIso8601String(),
                'updatedAt' => $purchase->updated_at->toIso8601String(),
            ];
        })->toArray();

        return response()->json([
            'success' => true,
            'message' => 'Success',
            'data' => [
                'data' => $data,
                'meta' => [
                    'total' => $purchases->total(),
                    'page' => $purchases->currentPage(),
                    'limit' => $purchases->perPage(),
                    'totalPages' => $purchases->lastPage(),
                ],
            ]
        ]);
    }

    /**
     * Get user's positions (active purchases)
     */
    public function positions(Request $request)
    {
        $user = Auth::user();

        $query = Purchase::with(['market', 'option'])
            ->where('user_id', $user->id)
            ->whereIn('status', [Status::WAITING, Status::PENDING])
            ->latest();

        $page = $request->get('page', 1);
        $limit = $request->get('limit', 20);

        $purchases = $query->paginate($limit, ['*'], 'page', $page);

        $data = $purchases->map(function ($purchase) {
            $market = $purchase->market;
            $option = $purchase->option;

            // Calculate option price from pools
            $optionPrice = 0.50; // default
            if ($option) {
                $totalPool = $option->yes_pool + $option->no_pool;
                if ($totalPool > 0) {
                    $optionPrice = $purchase->type === 'yes'
                        ? $option->yes_pool / $totalPool
                        : $option->no_pool / $totalPool;
                }
            }

            return [
                'id' => (string) $purchase->id,
                'shares' => (string) $purchase->total_share,
                'price' => (string) $purchase->price_per_share,
                'amount' => (string) $purchase->amount,
                'outcome' => $option ? [
                    'id' => (string) $option->id,
                    'title' => $option->question,
                    'probability' => $option->chance / 100,
                    'price' => (string) $optionPrice,
                ] : null,
                'market' => [
                    'id' => (string) $market->id,
                    'title' => $market->question,
                    'slug' => $market->slug,
                    'endDate' => $market->end_date?->toIso8601String(),
                ],
            ];
        })->toArray();

        return response()->json([
            'success' => true,
            'message' => 'Success',
            'data' => [
                'data' => $data,
                'meta' => [
                    'total' => $purchases->total(),
                    'page' => $purchases->currentPage(),
                    'limit' => $purchases->perPage(),
                    'totalPages' => $purchases->lastPage(),
                ],
            ]
        ]);
    }

    /**
     * Update market stats for multiple markets
     */
    private function updateMarketStatsMultiple($marketId)
    {
        $marketOptions = MarketOption::where('market_id', $marketId)->get();

        $totalVolume  = 0;
        $totalYesPool = 0;
        $totalNoPool  = 0;

        foreach ($marketOptions as $option) {
            $totalVolume += ($option->yes_pool + $option->no_pool);
            $totalYesPool += $option->yes_pool;
            $totalNoPool += $option->no_pool;
        }

        $yesSharePercentage = $totalVolume > 0 ? ($totalYesPool / $totalVolume) * 100 : 0.00;
        $noSharePercentage  = $totalVolume > 0 ? ($totalNoPool / $totalVolume) * 100 : 0.00;

        $market = Market::findOrFail($marketId);
        $market->volume    = $totalVolume;
        $market->yes_share = round($yesSharePercentage, 2);
        $market->no_share  = round($noSharePercentage, 2);
        $market->save();
    }

    /**
     * Convert Laravel status to mobile app status
     */
    private function getPurchaseStatus($status): string
    {
        return match($status) {
            Status::WAITING, Status::PENDING => 'PENDING',
            Status::CONFIRMED => 'CONFIRMED',
            Status::WIN => 'WON',
            Status::LOST => 'LOST',
            Status::CANCELLED => 'CANCELLED',
            default => 'UNKNOWN',
        };
    }
}
