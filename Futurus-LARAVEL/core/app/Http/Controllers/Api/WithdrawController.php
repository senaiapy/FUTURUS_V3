<?php

namespace App\Http\Controllers\Api;

use App\Constants\Status;
use App\Http\Controllers\Controller;
use App\Lib\FormProcessor;
use App\Models\AdminNotification;
use App\Models\Transaction;
use App\Models\Withdrawal;
use App\Models\WithdrawMethod;
use Illuminate\Http\Request;

class WithdrawController extends Controller
{
    public function withdrawMethod()
    {
        $withdrawMethods = WithdrawMethod::active()->get();

        return response()->json([
            'success' => true,
            'data' => [
                'methods' => $withdrawMethods
            ]
        ]);
    }

    public function withdrawStore(Request $request)
    {
        $request->validate([
            'method_code' => 'required',
            'amount' => 'required|numeric',
        ]);

        $method = WithdrawMethod::where('id', $request->method_code)->active()->firstOrFail();
        $user = auth()->user();

        if ($request->amount < $method->min_limit) {
            return response()->json([
                'success' => false,
                'message' => 'Your requested amount is smaller than minimum amount'
            ], 422);
        }

        if ($request->amount > $method->max_limit) {
            return response()->json([
                'success' => false,
                'message' => 'Your requested amount is larger than maximum amount'
            ], 422);
        }

        if ($request->amount > $user->balance) {
            return response()->json([
                'success' => false,
                'message' => 'Insufficient balance for withdrawal'
            ], 422);
        }

        $charge = $method->fixed_charge + ($request->amount * $method->percent_charge / 100);
        $afterCharge = $request->amount - $charge;

        if ($afterCharge <= 0) {
            return response()->json([
                'success' => false,
                'message' => 'Withdraw amount must be sufficient for charges'
            ], 422);
        }

        $finalAmount = $afterCharge * $method->rate;

        $withdraw = new Withdrawal();
        $withdraw->method_id = $method->id;
        $withdraw->user_id = $user->id;
        $withdraw->amount = $request->amount;
        $withdraw->currency = $method->currency;
        $withdraw->rate = $method->rate;
        $withdraw->charge = $charge;
        $withdraw->final_amount = $finalAmount;
        $withdraw->after_charge = $afterCharge;
        $withdraw->trx = getTrx();
        $withdraw->save();

        return response()->json([
            'success' => true,
            'message' => 'Withdraw request initiated',
            'data' => [
                'withdraw' => $withdraw,
                'form_data' => $method->form->form_data ?? []
            ]
        ]);
    }

    public function withdrawSubmit(Request $request)
    {
        $request->validate([
            'trx' => 'required|string'
        ]);

        $withdraw = Withdrawal::with('method', 'user')
            ->where('trx', $request->trx)
            ->where('status', Status::PAYMENT_INITIATE)
            ->orderBy('id', 'desc')
            ->firstOrFail();

        $method = $withdraw->method;
        if ($method->status == Status::DISABLE) {
            return response()->json([
                'success' => false,
                'message' => 'Withdraw method is not available'
            ], 404);
        }

        $formData = ($method->form->form_data) ?? [];

        $formProcessor = new FormProcessor();
        $validationRule = $formProcessor->valueValidation($formData);
        $request->validate($validationRule);
        $userData = $formProcessor->processFormData($request, $formData);

        $user = auth()->user();

        if ($user->ts) {
            $response = verifyG2fa($user, $request->authenticator_code);
            if (!$response) {
                return response()->json([
                    'success' => false,
                    'message' => 'Wrong verification code'
                ], 422);
            }
        }

        if ($withdraw->amount > $user->balance) {
            return response()->json([
                'success' => false,
                'message' => 'Your request amount is larger than your current balance.'
            ], 422);
        }

        $withdraw->status = Status::PAYMENT_PENDING;
        $withdraw->withdraw_information = $userData;
        $withdraw->save();

        $user->balance -= $withdraw->amount;
        $user->save();

        $transaction = new Transaction();
        $transaction->user_id = $withdraw->user_id;
        $transaction->amount = $withdraw->amount;
        $transaction->post_balance = $user->balance;
        $transaction->charge = $withdraw->charge;
        $transaction->trx_type = '-';
        $transaction->details = 'Withdraw request via ' . $withdraw->method->name;
        $transaction->trx = $withdraw->trx;
        $transaction->remark = 'withdraw';
        $transaction->save();

        $adminNotification = new AdminNotification();
        $adminNotification->user_id = $user->id;
        $adminNotification->title = 'New withdraw request from ' . $user->username;
        $adminNotification->click_url = urlPath('admin.withdraw.data.details', $withdraw->id);
        $adminNotification->save();

        notify($user, 'WITHDRAW_REQUEST', [
            'method_name' => $withdraw->method->name,
            'method_currency' => $withdraw->currency,
            'method_amount' => showAmount($withdraw->final_amount, currencyFormat: false),
            'amount' => showAmount($withdraw->amount, currencyFormat: false),
            'charge' => showAmount($withdraw->charge, currencyFormat: false),
            'rate' => showAmount($withdraw->rate, currencyFormat: false),
            'trx' => $withdraw->trx,
            'post_balance' => showAmount($user->balance, currencyFormat: false),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Withdraw request sent successfully',
            'data' => [
                'withdraw' => $withdraw
            ]
        ]);
    }

    public function withdrawLog(Request $request)
    {
        $withdraws = Withdrawal::where('user_id', auth()->id())
            ->where('status', '!=', Status::PAYMENT_INITIATE);

        if ($request->search) {
            $withdraws = $withdraws->where('trx', $request->search);
        }

        $withdraws = $withdraws->with('method')->orderBy('id', 'desc')->paginate(getPaginate());

        return response()->json([
            'success' => true,
            'data' => $withdraws
        ]);
    }
}
