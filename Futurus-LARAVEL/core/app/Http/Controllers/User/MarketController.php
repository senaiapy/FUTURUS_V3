<?php

namespace App\Http\Controllers\User;

use App\Constants\Status;
use App\Http\Controllers\Controller;
use App\Lib\MarketPrice;
use App\Lib\Referral;
use App\Models\Market;
use App\Models\MarketBookmark;
use App\Models\MarketOption;
use App\Models\MarketTrend;
use App\Models\Purchase;
use App\Models\Transaction;
use Illuminate\Http\Request;

class MarketController extends Controller {

    public function purchase(Request $request, $id) {
        $request->validate([
            'option_id'  => 'required|exists:market_options,id',
            'buy_option' => 'required|in:yes,no',
            'shares'     => 'required|numeric|gt:0',
        ]);

        $market = Market::running()->withWhereHas('activeMarketOptions')->findOrFail($id);
        $option = MarketOption::active()->where('market_id', $market->id)->findOrFail($request->option_id);

        $user   = auth()->user();
        $shares = (float) $request->shares;

        if ($option->isLocked()) {
            $notify[] = ['error', 'This option is currently unavailable.'];
            return back()->withNotify($notify);
        }

        if ($market->isLocked()) {
            $notify[] = ['error', 'This market is currently unavailable.'];
            return back()->withNotify($notify);
        }

        $calculations = MarketPrice::getMarketCalculations($option->id, $shares, $request->buy_option);

        $amount = $calculations['total_amount'];

        if ($user->balance < $amount) {
            $notify[] = ['error', 'Insufficient balance in your account'];
            return back()->withNotify($notify);
        }

        $pricePerShare = $request->buy_option === 'yes' ? $calculations['yes_share_price'] : $calculations['no_share_price'];
        $totalShares   = $amount / $pricePerShare;

        $winAmount = $request->buy_option === 'yes' ? $calculations['yes_payout_if_win'] : $calculations['no_payout_if_win'];
        $profit    = $request->buy_option === 'yes' ? $calculations['yes_profit_if_win'] : $calculations['no_profit_if_win'];

        $purchase                   = new Purchase();
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

        $user->balance -= $amount;
        $user->total_shares_bought += $totalShares;
        $user->save();

        $totalPoolBefore = $option->yes_pool + $option->no_pool;
        $initialChance   = $totalPoolBefore > 0 ? ($option->yes_pool / $totalPoolBefore) * 100 : 50.00;

        if (MarketTrend::where('market_option_id', $option->id)->count() === 0) {
            $trend                   = new MarketTrend();
            $trend->market_id        = $market->id;
            $trend->market_option_id = $option->id;
            $trend->chance           = round($initialChance, 2);
            $trend->created_at       = $option->created_at ?? now()->subMinutes(5);
            $trend->save();
        }

        if ($request->buy_option === 'yes') {
            $option->yes_pool += $amount;
        } else {
            $option->no_pool += $amount;
        }

        $totalPool      = $option->yes_pool + $option->no_pool;
        $chance         = $totalPool > 0 ? ($option->yes_pool / $totalPool) * 100 : 50.00;
        $option->chance = round($chance, 2);

        $option->save();

        $trend                   = new MarketTrend();
        $trend->market_id        = $market->id;
        $trend->market_option_id = $option->id;
        $trend->chance           = $option->chance;
        $trend->save();

        if ($market->type == Status::SINGLE_MARKET) {
            $newTotalPool      = $option->yes_pool + $option->no_pool;
            $market->volume    = $newTotalPool;
            $market->yes_share = $newTotalPool > 0 ? round(($option->yes_pool / $newTotalPool) * 100, 2) : 50.00;
            $market->no_share  = $newTotalPool > 0 ? round(($option->no_pool / $newTotalPool) * 100, 2) : 50.00;
            $market->save();
        } else {
            $this->updateMarketStatsMultiple($market->id);
        }

        $transaction               = new Transaction();
        $transaction->user_id      = $user->id;
        $transaction->amount       = $amount;
        $transaction->post_balance = $user->balance;
        $transaction->charge       = 0;
        $transaction->trx_type     = '-';
        $transaction->details      = 'Purchase ' . $request->buy_option . ' share amount ' . showAmount($amount);
        $transaction->remark       = 'purchase_share';
        $transaction->trx          = $purchase->trx;
        $transaction->save();

        if (gs()->share_purchase_commission) {
            Referral::levelCommission($user, $purchase->amount, $purchase->trx, 'share_purchase_commission');
        }

        notify($user, 'MARKET_PURCHASE', [
            'market'     => $market->question,
            'option'     => $option->question,
            'type'       => $purchase->type,
            'share'      => $totalShares,
            'amount'     => showAmount($amount, currencyFormat: false),
            'win_amount' => showAmount($winAmount, currencyFormat: false),
            'profit'     => showAmount($profit, currencyFormat: false),
        ]);

        $notify[] = ['success', 'Shares purchased successfully!'];
        return to_route('user.market.purchase.history')->withNotify($notify);
    }

    public function purchaseHistory() {
        $pageTitle = 'Share Purchase History';
        $purchases = Purchase::where('user_id', auth()->id())->latest()->searchable(['trx', 'market:question', 'option:question'])->dateFilter()->paginate(getPaginate());
        return view('Template::user.purchase', compact('pageTitle', 'purchases'));
    }

    public function toggleBookmark($marketId) {
        $user = auth()->user();

        $bookmark = MarketBookmark::where('user_id', $user->id)
            ->where('market_id', $marketId)
            ->first();

        if ($bookmark) {
            $bookmark->delete();
            $notify[] = 'Bookmark remove successfully';
            $book     = false;
        } else {
            $bookmark            = new MarketBookmark();
            $bookmark->user_id   = $user->id;
            $bookmark->market_id = $marketId;
            $bookmark->save();

            $book     = true;
            $notify[] = 'Bookmark successfully';
        }
        return response()->json(['success' => true, 'bookmarked' => $book, 'message' => $notify]);
    }

    private function updateMarketStatsMultiple($marketId) {
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

        $market            = Market::findOrFail($marketId);
        $market->volume    = $totalVolume;
        $market->yes_share = round($yesSharePercentage, 2);
        $market->no_share  = round($noSharePercentage, 2);
        $market->save();
    }
}
