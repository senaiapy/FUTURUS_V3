<?php

namespace App\Lib;

use App\Models\MarketOption;

class MarketPrice {

    public static function getMarketCalculations($marketOptionId, $shares = 0, $selectedType = null) {
        $marketOption = MarketOption::active()->with('market')->find($marketOptionId);

        if (!$marketOption || $marketOption->isLocked() || $marketOption->market->isLOcked()) {
            return [
                'yes_pool'          => 0,
                'no_pool'           => 0,
                'total_pool'        => 0,
                'commission_rate'   => 0,
                'commission_amount' => round(0, 2),
                'net_pool'          => round(0, 2),
                'yes_share_price'   => round(0, 4),
                'no_share_price'    => round(0, 4),
                'yes_payout_if_win' => round(0, 2),
                'no_payout_if_win'  => round(0, 2),
                'yes_profit_if_win' => round(0, 2),
                'no_profit_if_win'  => round(0, 2),
                'market_option'     => $marketOption,
            ];
        }

        $yesPool    = $marketOption->yes_pool;
        $noPool     = $marketOption->no_pool;
        $commission = $marketOption->commission;

        $totalPool = $yesPool + $noPool;

        if ($totalPool <= 0) {
            return [
                'yes_pool'          => $yesPool,
                'no_pool'           => $noPool,
                'total_pool'        => $totalPool,
                'commission_rate'   => $commission,
                'commission_amount' => 0,
                'net_pool'          => 0,
                'yes_share_price'   => 1.00,
                'no_share_price'    => 1.00,
                'yes_payout_if_win' => 0,
                'no_payout_if_win'  => 0,
                'yes_profit_if_win' => 0,
                'no_profit_if_win'  => 0,
                'market_option'     => $marketOption,
            ];
        }

        $commissionAmount = $totalPool * ($commission / 100);
        $netPool          = $totalPool - $commissionAmount;

        $yesProbability = $yesPool / $totalPool;
        $noProbability  = $noPool / $totalPool;

        $yesSharePrice = max(0.01, $yesProbability);
        $noSharePrice  = max(0.01, $noProbability);

        $yesPotentialPayout = 0;
        $noPotentialPayout  = 0;
        $yesPotentialProfit = 0;
        $noPotentialProfit  = 0;

        $betAmount = 0;
        if ($shares > 0 && $selectedType) {
            $sharePrice = ($selectedType === 'yes') ? $yesSharePrice : $noSharePrice;
            $betAmount  = $shares * $sharePrice;
        }

        if ($betAmount > 0) {
            $yesPotentialPayout = $yesPool > 0 ? ($netPool * ($betAmount / $yesPool)) : 0;
            $noPotentialPayout  = $noPool > 0 ? ($netPool * ($betAmount / $noPool)) : 0;

            $yesPotentialProfit = $yesPotentialPayout - $betAmount;
            $noPotentialProfit  = $noPotentialPayout - $betAmount;
        }

        return [
            'yes_pool'          => $yesPool,
            'no_pool'           => $noPool,
            'total_pool'        => $totalPool,
            'commission_rate'   => $commission,
            'commission_amount' => round($commissionAmount, 2),
            'net_pool'          => round($netPool, 2),
            'yes_share_price'   => round($yesSharePrice, 4),
            'no_share_price'    => round($noSharePrice, 4),
            'yes_payout_if_win' => round($yesPotentialPayout, 2),
            'no_payout_if_win'  => round($noPotentialPayout, 2),
            'yes_profit_if_win' => round($yesPotentialProfit, 2),
            'no_profit_if_win'  => round($noPotentialProfit, 2),
            'total_amount'      => round($betAmount, 2),
            'market_option'     => $marketOption,
        ];
    }

}
