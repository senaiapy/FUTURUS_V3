<?php

namespace App\Http\Controllers\User;

use App\Constants\Status;
use App\Http\Controllers\Controller;
use App\Lib\FormProcessor;
use App\Models\AdminNotification;
use App\Models\Transaction;
use App\Models\Withdrawal;
use App\Models\WithdrawMethod;
use Illuminate\Http\Request;

class WithdrawController extends Controller {

    public function withdrawMoney() {
        $withdrawMethod = WithdrawMethod::active()->get();
        $pageTitle      = 'Withdraw Money';
        return view('Template::user.withdraw.methods', compact('pageTitle', 'withdrawMethod'));
    }

    public function withdrawStore(Request $request) {
        $validationRules = [
            'method_code' => 'required',
            'amount'      => 'required|numeric',
        ];

        $method = WithdrawMethod::where('id', $request->method_code)->active()->firstOrFail();

        // Check if it's Asaas/PIX or Bank Transfer method
        $methodName = strtolower($method->name);
        if (str_contains($methodName, 'pix')) {
            // Asaas PIX
            $validationRules['cpf'] = 'required|string';
            $validationRules['pix_key_type'] = 'required|in:CPF,CNPJ,EMAIL,PHONE,EVP';
            $validationRules['pix_key'] = 'required|string';
        } elseif (str_contains($methodName, 'transfer') || str_contains($methodName, 'bank')) {
            // Bank Transfer
            $validationRules['cpf'] = 'required|string';
            $validationRules['bank_code'] = 'required|string';
            $validationRules['bank_agency'] = 'required|string';
            $validationRules['bank_account'] = 'required|string';
            $validationRules['bank_account_type'] = 'required|in:CONTA_CORRENTE,CONTA_POUPANCA';
            $validationRules['bank_holder_name'] = 'required|string';
        } elseif (str_contains($methodName, 'asaas')) {
            $validationRules['cpf'] = 'required|string';
        }

        $request->validate($validationRules);

        $user = auth()->user();

        // Save CPF if provided
        if ($request->cpf && !$user->cpf) {
            $user->cpf = $request->cpf;
            $user->save();
        }
        if ($request->amount < $method->min_limit) {
            $notify[] = ['error', 'Your requested amount is smaller than minimum amount'];
            return back()->withNotify($notify)->withInput($request->all());
        }
        if ($request->amount > $method->max_limit) {
            $notify[] = ['error', 'Your requested amount is larger than maximum amount'];
            return back()->withNotify($notify)->withInput($request->all());
        }

        if ($request->amount > $user->balance) {
            $notify[] = ['error', 'Insufficient balance for withdrawal'];
            return back()->withNotify($notify)->withInput($request->all());
        }

        $charge      = $method->fixed_charge + ($request->amount * $method->percent_charge / 100);
        $afterCharge = $request->amount - $charge;

        if ($afterCharge <= 0) {
            $notify[] = ['error', 'Withdraw amount must be sufficient for charges'];
            return back()->withNotify($notify)->withInput($request->all());
        }

        $finalAmount = $afterCharge * $method->rate;

        $withdraw               = new Withdrawal();
        $withdraw->method_id    = $method->id; // wallet method ID
        $withdraw->user_id      = $user->id;
        $withdraw->amount       = $request->amount;
        $withdraw->currency     = $method->currency;
        $withdraw->rate         = $method->rate;
        $withdraw->charge       = $charge;
        $withdraw->final_amount = $finalAmount;
        $withdraw->after_charge = $afterCharge;

        // Store withdrawal information based on method type
        $methodName = strtolower($method->name);
        if ($request->pix_key) {
            // PIX withdrawal
            $withdraw->withdraw_information = [
                ['name' => 'CPF/CNPJ', 'type' => 'text', 'value' => $request->cpf ?? $user->cpf],
                ['name' => 'PIX Key Type', 'type' => 'text', 'value' => $request->pix_key_type],
                ['name' => 'PIX Key', 'type' => 'text', 'value' => $request->pix_key],
            ];
        } elseif ($request->bank_code) {
            // Bank Transfer withdrawal
            $withdraw->withdraw_information = [
                ['name' => 'CPF/CNPJ', 'type' => 'text', 'value' => $request->cpf ?? $user->cpf],
                ['name' => 'Bank Code', 'type' => 'text', 'value' => $request->bank_code],
                ['name' => 'Agency', 'type' => 'text', 'value' => $request->bank_agency],
                ['name' => 'Account', 'type' => 'text', 'value' => $request->bank_account],
                ['name' => 'Account Type', 'type' => 'text', 'value' => $request->bank_account_type],
                ['name' => 'Account Holder', 'type' => 'text', 'value' => $request->bank_holder_name],
            ];
        }
        $withdraw->trx          = getTrx();
        $withdraw->save();
        session()->put('wtrx', $withdraw->trx);
        return to_route('user.withdraw.preview');
    }

    public function withdrawPreview() {
        $withdraw  = Withdrawal::with('method', 'user')->where('trx', session()->get('wtrx'))->where('status', Status::PAYMENT_INITIATE)->orderBy('id', 'desc')->firstOrFail();
        $pageTitle = 'Withdraw Preview';
        return view('Template::user.withdraw.preview', compact('pageTitle', 'withdraw'));
    }

    public function withdrawSubmit(Request $request) {
        $withdraw = Withdrawal::with('method', 'user')->where('trx', session()->get('wtrx'))->where('status', Status::PAYMENT_INITIATE)->orderBy('id', 'desc')->firstOrFail();

        $method = $withdraw->method;
        if ($method->status == Status::DISABLE) {
            abort(404);
        }

        $formData = ($method->form->form_data) ?? [];

        $formProcessor  = new FormProcessor();
        $validationRule = $formProcessor->valueValidation($formData);
        $request->validate($validationRule);
        $userData = $formProcessor->processFormData($request, $formData);

        $user = auth()->user();
        if ($user->ts) {
            $response = verifyG2fa($user, $request->authenticator_code);
            if (!$response) {
                $notify[] = ['error', 'Wrong verification code'];
                return back()->withNotify($notify)->withInput($request->all());
            }
        }

        if ($withdraw->amount > $user->balance) {
            $notify[] = ['error', 'Your request amount is larger then your current balance.'];
            return back()->withNotify($notify)->withInput($request->all());
        }

        $withdraw->status               = Status::PAYMENT_PENDING;
        $withdraw->withdraw_information = $userData;
        $withdraw->save();
        $user->balance -= $withdraw->amount;
        $user->save();

        $transaction               = new Transaction();
        $transaction->user_id      = $withdraw->user_id;
        $transaction->amount       = $withdraw->amount;
        $transaction->post_balance = $user->balance;
        $transaction->charge       = $withdraw->charge;
        $transaction->trx_type     = '-';
        $transaction->details      = 'Withdraw request via ' . $withdraw->method->name;
        $transaction->trx          = $withdraw->trx;
        $transaction->remark       = 'withdraw';
        $transaction->save();

        $adminNotification            = new AdminNotification();
        $adminNotification->user_id   = $user->id;
        $adminNotification->title     = 'New withdraw request from ' . $user->username;
        $adminNotification->click_url = urlPath('admin.withdraw.data.details', $withdraw->id);
        $adminNotification->save();

        notify($user, 'WITHDRAW_REQUEST', [
            'method_name'     => $withdraw->method->name,
            'method_currency' => $withdraw->currency,
            'method_amount'   => showAmount($withdraw->final_amount, currencyFormat: false),
            'amount'          => showAmount($withdraw->amount, currencyFormat: false),
            'charge'          => showAmount($withdraw->charge, currencyFormat: false),
            'rate'            => showAmount($withdraw->rate, currencyFormat: false),
            'trx'             => $withdraw->trx,
            'post_balance'    => showAmount($user->balance, currencyFormat: false),
        ]);

        $notify[] = ['success', 'Withdraw request sent successfully'];
        return to_route('user.withdraw.history')->withNotify($notify);
    }

    public function withdrawLog(Request $request) {
        $pageTitle = "Withdrawal Log";
        $withdraws = Withdrawal::where('user_id', auth()->id())->where('status', '!=', Status::PAYMENT_INITIATE);
        if ($request->search) {
            $withdraws = $withdraws->where('trx', $request->search);
        }
        $withdraws = $withdraws->with('method')->orderBy('id', 'desc')->paginate(getPaginate());
        return view('Template::user.withdraw.log', compact('pageTitle', 'withdraws'));
    }
}
