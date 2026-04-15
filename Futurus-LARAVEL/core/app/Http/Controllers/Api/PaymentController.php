<?php

namespace App\Http\Controllers\Api;

use App\Constants\Status;
use App\Http\Controllers\Controller;
use App\Lib\FormProcessor;
use App\Models\Deposit;
use App\Models\GatewayCurrency;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    public function methods()
    {
        $gatewayCurrency = GatewayCurrency::whereHas('method', function ($gate) {
            $gate->where('status', Status::ENABLE);
        })->with('method')->orderby('name')->get();

        return response()->json([
            'success' => true,
            'data' => [
                'methods' => $gatewayCurrency
            ]
        ]);
    }

    public function depositInsert(Request $request)
    {
        $request->validate([
            'amount' => 'required|numeric|gt:0',
            'gateway' => 'required',
            'currency' => 'required',
        ]);

        $user = auth()->user();
        $gate = GatewayCurrency::whereHas('method', function ($gate) {
            $gate->where('status', Status::ENABLE);
        })->where('method_code', $request->gateway)->where('currency', $request->currency)->first();

        if (!$gate) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid gateway'
            ], 422);
        }

        if ($gate->min_amount > $request->amount || $gate->max_amount < $request->amount) {
            return response()->json([
                'success' => false,
                'message' => 'Please follow deposit limit'
            ], 422);
        }

        $charge = $gate->fixed_charge + ($request->amount * $gate->percent_charge / 100);
        $payable = $request->amount + $charge;
        $finalAmount = $payable * $gate->rate;

        $data = new Deposit();
        $data->user_id = $user->id;
        $data->method_code = $gate->method_code;
        $data->method_currency = strtoupper($gate->currency);
        $data->amount = $request->amount;
        $data->charge = $charge;
        $data->rate = $gate->rate;
        $data->final_amount = $finalAmount;
        $data->btc_amount = 0;
        $data->btc_wallet = "";
        $data->trx = getTrx();
        $data->success_url = route('user.deposit.history');
        $data->failed_url = route('user.deposit.history');
        $data->save();

        if ($request->cpf) {
            $user->cpf = $request->cpf;
            $user->save();
        }

        return response()->json([
            'success' => true,
            'message' => 'Deposit initiated',
            'data' => [
                'deposit' => $data,
                'redirect_url' => route('deposit.app.confirm', encrypt($data->id))
            ]
        ]);
    }

    public function appPaymentConfirm(Request $request)
    {
        $request->validate([
            'trx' => 'required|string'
        ]);

        $deposit = Deposit::where('trx', $request->trx)
            ->where('status', Status::PAYMENT_INITIATE)
            ->with('gateway')
            ->firstOrFail();

        return response()->json([
            'success' => true,
            'data' => [
                'deposit' => $deposit,
                'gateway' => $deposit->gateway
            ]
        ]);
    }

    public function manualDepositConfirm(Request $request)
    {
        $request->validate([
            'trx' => 'required|string'
        ]);

        $data = Deposit::with('gateway')
            ->where('status', Status::PAYMENT_INITIATE)
            ->where('trx', $request->trx)
            ->first();

        if (!$data || $data->method_code <= 999) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid deposit'
            ], 404);
        }

        $gatewayCurrency = $data->gatewayCurrency();
        $gateway = $gatewayCurrency->method;
        $formData = $gateway->form->form_data ?? [];

        $formProcessor = new FormProcessor();
        $validationRule = $formProcessor->valueValidation($formData);
        $request->validate($validationRule);
        $userData = $formProcessor->processFormData($request, $formData);

        $data->detail = $userData;
        $data->status = Status::PAYMENT_PENDING;
        $data->save();

        notify($data->user, 'DEPOSIT_REQUEST', [
            'method_name' => $data->gatewayCurrency()->name,
            'method_currency' => $data->method_currency,
            'method_amount' => showAmount($data->final_amount, currencyFormat: false),
            'amount' => showAmount($data->amount, currencyFormat: false),
            'charge' => showAmount($data->charge, currencyFormat: false),
            'rate' => showAmount($data->rate, currencyFormat: false),
            'trx' => $data->trx,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Deposit request submitted successfully'
        ]);
    }
}
