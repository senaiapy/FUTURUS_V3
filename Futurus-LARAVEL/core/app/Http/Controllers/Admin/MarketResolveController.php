<?php

namespace App\Http\Controllers\Admin;

use App\Constants\Status;
use App\Http\Controllers\Controller;
use App\Models\Market;
use App\Models\MarketOption;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MarketResolveController extends Controller {
    public function resolveForm($id) {
        $pageTitle = "Declare Market";
        $market    = Market::where('status', Status::MARKET_CLOSED)->with([
            'category',
            'subcategory',
            'purchases:id,market_id,user_id,market_option_id,amount,win_amount,type',
            'activeMarketOptions:id,market_id,question,image',
        ])->findOrFail($id);

        if ($market->status == Status::MARKET_SETTLED || $market->status == Status::MARKET_CANCELLED) {
            $notify[] = ['error', 'This market has already been resolved or canceled.'];
            return to_route('admin.market.pending')->withNotify($notify);
        }

        $totalInvested     = $market->purchases->sum('amount');
        $totalParticipants = $market->purchases->unique('user_id')->count();
        $optionsData       = [];

        $market->load('activeMarketOptions.purchases:id,market_option_id,amount,win_amount,type');

        if ($market->type == Status::SINGLE_MARKET && $market->singleMarketOption) {

            $option       = $market->singleMarketOption;
            $yesPurchases = $option->purchases->where('type', 'yes');
            $noPurchases  = $option->purchases->where('type', 'no');

            $optionsData['yes'] = [
                'id'               => $option->id,
                'outcome_type'     => 'yes',
                'label'            => 'Yes',
                'total_wagered'    => $yesPurchases->sum('amount'),
                'potential_payout' => $yesPurchases->sum('win_amount'),
            ];

            $optionsData['no'] = [
                'id'               => $option->id,
                'outcome_type'     => 'no',
                'label'            => 'No',
                'total_wagered'    => $noPurchases->sum('amount'),
                'potential_payout' => $noPurchases->sum('win_amount'),
            ];
        } else {
            foreach ($market->activeMarketOptions as $option) {
                $yesPurchases = $option->purchases->where('type', 'yes');
                $noPurchases  = $option->purchases->where('type', 'no');

                $payoutIfWins = $yesPurchases->sum('win_amount');
                foreach ($market->activeMarketOptions as $otherOption) {
                    if ($option->id != $otherOption->id) {
                        $payoutIfWins += $otherOption->purchases->where('type', 'no')->sum('win_amount');
                    }
                }

                $optionsData[] = [
                    'id'                     => $option->id,
                    'label'                  => $option->question,
                    'image'                  => $option->image,
                    'yes_wagered'            => $yesPurchases->sum('amount'),
                    'yes_payout'             => $yesPurchases->sum('win_amount'),
                    'no_wagered'             => $noPurchases->sum('amount'),
                    'no_payout'              => $noPurchases->sum('win_amount'),
                    'total_payout_if_winner' => $payoutIfWins,
                ];
            }
        }

        return view('admin.market.resolve', compact(
            'pageTitle',
            'market',
            'totalInvested',
            'totalParticipants',
            'optionsData'
        ));
    }

    public function resolveStore(Request $request, $id) {
        $market = Market::where('status', Status::MARKET_CLOSED)->with('activeMarketOptions', 'purchases')->findOrFail($id);

        if ($market->status == Status::MARKET_SETTLED || $market->status == Status::MARKET_CANCELLED) {
            $notify[] = ['error', 'Market has already been resolved or cancelled.'];
            return back()->withNotify($notify);
        }

        if ($market->type == Status::SINGLE_MARKET) {
            $request->validate([
                'winning_outcome'  => 'required|in:yes,no',
                'market_option_id' => 'required|exists:market_options,id',
            ]);
        } else if ($market->type == Status::MULTI_MARKET) {
            $request->validate([
                'winning_option_id' => 'required|exists:market_options,id',
            ]);
        }

        try {
            DB::beginTransaction();
            if ($market->type == Status::SINGLE_MARKET) {

                $this->resolveSingleMarket($request->winning_outcome, $request->market_option_id);

                $purchases = $market->purchases;
                $optionId  = $market->marketOptions->pluck('id')->unique()->toArray();
                $winners   = collect($purchases)->whereIn('market_option_id', $optionId)->where('type', $request->winning_outcome)->each(function ($purchase) {
                    $purchase->update([
                        'status'  => Status::WON,
                        'is_paid' => Status::YES,
                    ]);
                });
                $winnerPurchaseId = $winners->pluck('id')->toArray();
                collect($purchases)->whereNotIn('id', $winnerPurchaseId)->each(function ($purchase) {
                    $purchase->update([
                        'status' => Status::LOST,
                    ]);
                });
            } else {

                $this->resolveMultiMarket($market, $request->winning_option_id);

                $purchases     = $market->purchases;
                $optionId      = $market->marketOptions->pluck('id')->unique()->toArray();
                $otherOptionId = array_diff($optionId, [$request->winning_option_id]);

                $winners = collect($purchases)->where('market_option_id', $request->winning_option_id)->where('type', 'yes')->each(function ($purchase) {
                    $purchase->update([
                        'status'  => Status::WON,
                        'is_paid' => Status::PAYMENT_AWAIT,
                    ]);
                });
                $otherWinners = collect($purchases)->whereIn('market_option_id', $otherOptionId)->where('type', 'no')->each(function ($purchase) {
                    $purchase->update([
                        'status'  => Status::WON,
                        'is_paid' => Status::PAYMENT_AWAIT,
                    ]);
                });

                $winnerPurchaseId = array_merge($winners->pluck('id')->toArray(), $otherWinners->pluck('id')->toArray());
                collect($purchases)->whereNotIn('id', $winnerPurchaseId)->each(function ($purchase) {
                    $purchase->update([
                        'status' => Status::LOST,
                    ]);
                });
            }

            $market->status      = Status::MARKET_SETTLED;
            $market->profit_loss = $request->profit_loss;
            $market->resolved_at = now();
            $market->save();

            DB::commit();

            $notify[] = ['success', 'Market resolved successfully!'];
            return to_route('admin.market.pending')->withNotify($notify);
        } catch (\Exception $e) {
            DB::rollback();
            $notify[] = ['error', 'Failed to resolve market: ' . $e->getMessage()];
            return back()->withNotify($notify);
        }
    }

    private function resolveSingleMarket($winningOutcome, $marketOptionId) {
        $marketOption                 = MarketOption::findOrFail($marketOptionId);
        $marketOption->winner_outcome = $winningOutcome;
        $marketOption->status         = Status::MARKET_OPTION_SETTLED;
        $marketOption->save();
    }

    private function resolveMultiMarket($market, $winningOptionId) {
        foreach ($market->activeMarketOptions as $option) {
            $option->is_winner = ($option->id == $winningOptionId) ? 1 : 0;
            $option->status    = Status::MARKET_OPTION_SETTLED;
            $option->save();
        }
    }
}
