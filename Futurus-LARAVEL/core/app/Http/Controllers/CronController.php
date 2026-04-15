<?php

namespace App\Http\Controllers;

use App\Constants\Status;
use App\Lib\CurlRequest;
use App\Models\CronJob;
use App\Models\CronJobLog;
use App\Models\Market;
use App\Models\Purchase;
use App\Models\Transaction;
use Carbon\Carbon;

class CronController extends Controller {
    public function cron() {
        $general            = gs();
        $general->last_cron = now();
        $general->save();

        $crons = CronJob::with('schedule');

        if (request()->alias) {
            $crons->where('alias', request()->alias);
        } else {
            $crons->where('next_run', '<', now())->where('is_running', Status::YES);
        }
        $crons = $crons->get();
        foreach ($crons as $cron) {
            $cronLog              = new CronJobLog();
            $cronLog->cron_job_id = $cron->id;
            $cronLog->start_at    = now();
            if ($cron->is_default) {
                $controller = new $cron->action[0];
                try {
                    $method = $cron->action[1];
                    $controller->$method();
                } catch (\Exception $e) {
                    $cronLog->error = $e->getMessage();
                }
            } else {
                try {
                    CurlRequest::curlContent($cron->url);
                } catch (\Exception $e) {
                    $cronLog->error = $e->getMessage();
                }
            }
            $cron->last_run = now();
            $cron->next_run = now()->addSeconds((int) $cron->schedule->interval);
            $cron->save();

            $cronLog->end_at = $cron->last_run;

            $startTime         = Carbon::parse($cronLog->start_at);
            $endTime           = Carbon::parse($cronLog->end_at);
            $diffInSeconds     = $startTime->diffInSeconds($endTime);
            $cronLog->duration = $diffInSeconds;
            $cronLog->save();
        }
        if (request()->target == 'all') {
            $notify[] = ['success', 'Cron executed successfully'];
            return back()->withNotify($notify);
        }
        if (request()->alias) {
            $notify[] = ['success', keyToTitle(request()->alias) . ' executed successfully'];
            return back()->withNotify($notify);
        }
    }

    public function processMarketPayouts() {
        $purchases = Purchase::where('status', Status::WON)->where('is_paid', Status::PAYMENT_AWAIT)->limit(10)->get();

        $transactions = [];
        foreach ($purchases as $purchase) {
            $user = $purchase->user;
            $user->balance += $purchase->win_amount;
            $user->total_profit += $purchase->win_amount - $purchase->amount;
            $user->save();

            $purchase->is_paid = Status::PAID;
            $purchase->save();

            $this->updateUserSuccessRate($user);

            $transactions[] = [
                'user_id'      => $user->id,
                'amount'       => $purchase->win_amount,
                'post_balance' => $user->balance,
                'charge'       => 0,
                'trx_type'     => '+',
                'details'      => 'Win share - Purchase: ' . $purchase->trx,
                'remark'       => 'share_win',
                'trx'          => getTrx(),
                'created_at'   => now(),
                'updated_at'   => now(),
            ];

            notify($user, 'MARKET_WIN', [
                'market'        => $purchase?->market?->question ?? '',
                'invest_amount' => showAmount($purchase->amount, currencyFormat: false),
                'win_amount'    => showAmount($purchase->win_amount, currencyFormat: false),
                'profit'        => showAmount($purchase->win_amount - $purchase->amount, currencyFormat: false),
            ]);
        }

        if (!blank($transactions)) {
            Transaction::insert($transactions);
        }
    }
    public function marketRefunded() {
        $purchases = Purchase::where('status', Status::REFUNDED)->where('is_paid', Status::PAYMENT_AWAIT)->limit(10)->get();

        $transactions = [];
        foreach ($purchases as $purchase) {
            $user = $purchase->user;
            $user->balance += $purchase->amount;
            $user->save();

            $purchase->is_paid = Status::PAID;
            $purchase->save();

            $transactions[] = [
                'user_id'      => $user->id,
                'amount'       => $purchase->amount,
                'post_balance' => $user->balance,
                'charge'       => 0,
                'trx_type'     => '+',
                'details'      => 'Refund share purchase amount',
                'remark'       => 'share_refunded',
                'trx'          => getTrx(),
                'created_at'   => now(),
                'updated_at'   => now(),
            ];

            notify($user, 'MARKET_REFUNDED', [
                'market' => $purchase?->market?->question ?? '',
                'amount' => showAmount($purchase->amount, currencyFormat: false),
                'option' => $purchase?->option?->question ?? '',
                'type'   => $purchase->type,
            ]);
        }

        if (!blank($transactions)) {
            Transaction::insert($transactions);
        }
    }

    private function updateUserSuccessRate($user) {
        $totalSettled       = Purchase::where('user_id', $user->id)->where('status', Status::MARKET_SETTLED)->count();
        $totalWins          = Purchase::where('user_id', $user->id)->where('status', Status::MARKET_SETTLED)->where('win', Status::YES)->count();
        $successRate        = $totalSettled > 0 ? ($totalWins / $totalSettled) * 100 : 0;
        $user->success_rate = $successRate;
        $user->save();
    }

    public function marketCompleted() {
        $markets = Market::where('status', Status::MARKET_SETTLED)->where('is_paid', Status::NO)->limit(30)->get();

        foreach ($markets as $market) {
            $isAllPaid = $market->purchases()->where('status', Status::WON)->where('is_paid', Status::PAYMENT_AWAIT)->count();
            if ($isAllPaid > 0) {
                continue;
            }
            $market->status  = Status::MARKET_COMPLETED;
            $market->is_paid = Status::PAID;
            $market->save();
        }
    }
    public function marketClosed() {
        $markets = Market::where('status', Status::ENABLE)->where('end_date', '<', now())->get();
        foreach ($markets as $key => $market) {
            $market->status = Status::MARKET_CLOSED;
            $market->save();
        }
    }
}
