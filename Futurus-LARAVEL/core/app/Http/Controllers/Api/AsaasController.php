<?php

namespace App\Http\Controllers\Api;

use App\Constants\Status;
use App\Http\Controllers\Controller;
use App\Http\Controllers\Gateway\PaymentController;
use App\Models\AdminNotification;
use App\Models\Deposit;
use App\Models\GatewayCurrency;
use App\Models\Transaction;
use App\Models\Withdrawal;
use App\Models\WithdrawMethod;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class AsaasController extends Controller
{
    /**
     * Get Asaas configuration (API URL based on mode)
     */
    private function getAsaasConfig($methodCode = 127)
    {
        $gateway = GatewayCurrency::where('method_code', $methodCode)->first();

        if (!$gateway) {
            return null;
        }

        $params = json_decode($gateway->gateway_parameter);
        $apiKey = $params->api_key ?? null;
        $mode = $params->mode ?? 'sandbox';

        $url = ($mode == 'sandbox' || $mode == 'test')
            ? 'https://sandbox.asaas.com/api/v3'
            : 'https://www.asaas.com/api/v3';

        return [
            'api_key' => $apiKey,
            'api_url' => $url,
            'mode' => $mode,
            'gateway' => $gateway
        ];
    }

    /**
     * Make request to Asaas API
     */
    private function asaasRequest($url, $data, $apiKey, $method = 'POST')
    {
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

        if ($method == 'POST') {
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        }

        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            "access_token: $apiKey",
            "Content-Type: application/json",
            "User-Agent: Futurus-App"
        ]);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

        $response = curl_exec($ch);
        $error = curl_error($ch);
        curl_close($ch);

        if ($error) {
            Log::error('Asaas API CURL Error: ' . $error);
            return (object) ['errors' => [(object) ['description' => 'Connection error: ' . $error]]];
        }

        Log::info('Asaas API Response: ' . $response);

        return json_decode($response);
    }

    // ==================== DEPOSIT ENDPOINTS ====================

    /**
     * Get available deposit methods (PIX and Credit Card)
     */
    public function depositMethods()
    {
        $methods = GatewayCurrency::whereHas('method', function ($q) {
            $q->where('status', Status::ENABLE);
        })->whereIn('method_code', [127, 128])->with('method')->get();

        return response()->json([
            'success' => true,
            'data' => [
                'methods' => $methods->map(function ($m) {
                    return [
                        'id' => $m->id,
                        'method_code' => $m->method_code,
                        'name' => $m->name,
                        'currency' => $m->currency,
                        'min_amount' => $m->min_amount,
                        'max_amount' => $m->max_amount,
                        'fixed_charge' => $m->fixed_charge,
                        'percent_charge' => $m->percent_charge,
                        'type' => $m->method_code == 127 ? 'pix' : 'credit_card',
                    ];
                })
            ]
        ]);
    }

    /**
     * Create PIX deposit
     */
    public function depositPix(Request $request)
    {
        $request->validate([
            'amount' => 'required|numeric|min:1',
            'cpf' => 'required|string',
        ]);

        $user = auth()->user();
        $config = $this->getAsaasConfig(127); // PIX

        if (!$config || !$config['api_key']) {
            return response()->json([
                'success' => false,
                'message' => 'Payment gateway not configured'
            ], 500);
        }

        $gateway = $config['gateway'];

        // Validate amount limits
        if ($request->amount < $gateway->min_amount || $request->amount > $gateway->max_amount) {
            return response()->json([
                'success' => false,
                'message' => "Amount must be between {$gateway->min_amount} and {$gateway->max_amount}"
            ], 422);
        }

        // Update user CPF
        $cpf = preg_replace('/[^0-9]/', '', $request->cpf);
        if (!$user->cpf) {
            $user->cpf = $cpf;
            $user->save();
        }

        // Calculate charges
        $charge = $gateway->fixed_charge + ($request->amount * $gateway->percent_charge / 100);
        $payable = $request->amount + $charge;
        $finalAmount = $payable * $gateway->rate;

        // Create deposit record
        $deposit = new Deposit();
        $deposit->user_id = $user->id;
        $deposit->method_code = 127;
        $deposit->method_currency = 'BRL';
        $deposit->amount = $request->amount;
        $deposit->charge = $charge;
        $deposit->rate = $gateway->rate;
        $deposit->final_amount = $finalAmount;
        $deposit->btc_amount = 0;
        $deposit->btc_wallet = '';
        $deposit->trx = getTrx();
        $deposit->save();

        // Create Asaas customer
        $customerData = [
            'name' => trim($user->firstname . ' ' . $user->lastname) ?: $user->username,
            'email' => $user->email,
            'cpfCnpj' => $cpf,
            'externalReference' => (string) $user->id,
        ];

        $customer = $this->asaasRequest($config['api_url'] . '/customers', $customerData, $config['api_key']);

        if (isset($customer->errors)) {
            return response()->json([
                'success' => false,
                'message' => $customer->errors[0]->description ?? 'Error creating customer'
            ], 422);
        }

        // Create PIX payment
        $paymentData = [
            'customer' => $customer->id,
            'billingType' => 'PIX',
            'value' => round($finalAmount, 2),
            'dueDate' => date('Y-m-d', strtotime('+1 day')),
            'externalReference' => $deposit->trx,
        ];

        $payment = $this->asaasRequest($config['api_url'] . '/payments', $paymentData, $config['api_key']);

        if (isset($payment->errors)) {
            return response()->json([
                'success' => false,
                'message' => $payment->errors[0]->description ?? 'Error creating payment'
            ], 422);
        }

        // Get PIX QR Code
        $pixQr = $this->asaasRequest($config['api_url'] . "/payments/{$payment->id}/pixQrCode", [], $config['api_key'], 'GET');

        if (isset($pixQr->errors)) {
            return response()->json([
                'success' => false,
                'message' => $pixQr->errors[0]->description ?? 'Error getting QR code'
            ], 422);
        }

        // Update deposit with payment info
        $deposit->btc_wallet = $payment->id;
        $deposit->detail = [
            'payment_id' => $payment->id,
            'pix_qr_code' => $pixQr->encodedImage ?? null,
            'pix_copy_paste' => $pixQr->payload ?? null,
        ];
        $deposit->save();

        return response()->json([
            'success' => true,
            'message' => 'PIX payment created successfully',
            'data' => [
                'deposit' => [
                    'trx' => $deposit->trx,
                    'amount' => $deposit->amount,
                    'charge' => $deposit->charge,
                    'final_amount' => $deposit->final_amount,
                    'status' => 'pending',
                ],
                'pix' => [
                    'qr_code_base64' => $pixQr->encodedImage ?? null,
                    'copy_paste' => $pixQr->payload ?? null,
                    'expires_at' => date('Y-m-d H:i:s', strtotime('+1 day')),
                ]
            ]
        ]);
    }

    /**
     * Create Credit/Debit Card deposit
     */
    public function depositCard(Request $request)
    {
        $request->validate([
            'amount' => 'required|numeric|min:10',
            // Card info
            'card_number' => 'required|string|min:13|max:19',
            'holder_name' => 'required|string|max:100',
            'expiry_month' => 'required|string|size:2',
            'expiry_year' => 'required|string|size:4',
            'cvv' => 'required|string|min:3|max:4',
            'installments' => 'required|integer|min:1|max:12',
            // Holder info
            'holder_cpf' => 'required|string',
            'holder_email' => 'required|email',
            'holder_phone' => 'required|string',
            // Billing address
            'holder_postal_code' => 'required|string',
            'holder_address' => 'required|string',
            'holder_address_number' => 'required|string',
            'holder_province' => 'required|string',
        ]);

        $user = auth()->user();
        $config = $this->getAsaasConfig(128); // Credit Card

        if (!$config || !$config['api_key']) {
            return response()->json([
                'success' => false,
                'message' => 'Payment gateway not configured'
            ], 500);
        }

        $gateway = $config['gateway'];

        // Validate amount limits
        if ($request->amount < $gateway->min_amount || $request->amount > $gateway->max_amount) {
            return response()->json([
                'success' => false,
                'message' => "Amount must be between {$gateway->min_amount} and {$gateway->max_amount}"
            ], 422);
        }

        // Clean input data
        $cpf = preg_replace('/[^0-9]/', '', $request->holder_cpf);
        $phone = preg_replace('/[^0-9]/', '', $request->holder_phone);
        $postalCode = preg_replace('/[^0-9]/', '', $request->holder_postal_code);
        $cardNumber = preg_replace('/[^0-9]/', '', $request->card_number);

        // Update user CPF
        if (!$user->cpf) {
            $user->cpf = $cpf;
            $user->save();
        }

        // Calculate charges
        $charge = $gateway->fixed_charge + ($request->amount * $gateway->percent_charge / 100);
        $payable = $request->amount + $charge;
        $finalAmount = $payable * $gateway->rate;

        // Create deposit record
        $deposit = new Deposit();
        $deposit->user_id = $user->id;
        $deposit->method_code = 128;
        $deposit->method_currency = 'BRL';
        $deposit->amount = $request->amount;
        $deposit->charge = $charge;
        $deposit->rate = $gateway->rate;
        $deposit->final_amount = $finalAmount;
        $deposit->btc_amount = 0;
        $deposit->btc_wallet = '';
        $deposit->trx = getTrx();
        $deposit->save();

        // Create Asaas customer
        $customerData = [
            'name' => $request->holder_name,
            'email' => $request->holder_email,
            'cpfCnpj' => $cpf,
            'phone' => $phone,
            'postalCode' => $postalCode,
            'address' => $request->holder_address,
            'addressNumber' => $request->holder_address_number,
            'province' => $request->holder_province,
            'externalReference' => (string) $user->id,
        ];

        $customer = $this->asaasRequest($config['api_url'] . '/customers', $customerData, $config['api_key']);

        if (isset($customer->errors)) {
            return response()->json([
                'success' => false,
                'message' => $customer->errors[0]->description ?? 'Error creating customer'
            ], 422);
        }

        // Create Credit Card payment
        $installments = (int) $request->installments;
        $installmentValue = round($finalAmount / $installments, 2);

        $paymentData = [
            'customer' => $customer->id,
            'billingType' => 'CREDIT_CARD',
            'value' => round($finalAmount, 2),
            'dueDate' => date('Y-m-d'),
            'externalReference' => $deposit->trx,
            'installmentCount' => $installments,
            'installmentValue' => $installmentValue,
            'creditCard' => [
                'holderName' => $request->holder_name,
                'number' => $cardNumber,
                'expiryMonth' => $request->expiry_month,
                'expiryYear' => $request->expiry_year,
                'ccv' => $request->cvv,
            ],
            'creditCardHolderInfo' => [
                'name' => $request->holder_name,
                'email' => $request->holder_email,
                'cpfCnpj' => $cpf,
                'postalCode' => $postalCode,
                'addressNumber' => $request->holder_address_number,
                'phone' => $phone,
            ],
            'remoteIp' => $request->ip(),
        ];

        Log::info('Asaas Card Payment Request', ['trx' => $deposit->trx]);

        $payment = $this->asaasRequest($config['api_url'] . '/payments', $paymentData, $config['api_key']);

        if (isset($payment->errors)) {
            Log::error('Asaas Card Payment Error', ['errors' => $payment->errors]);
            return response()->json([
                'success' => false,
                'message' => $payment->errors[0]->description ?? 'Payment processing error'
            ], 422);
        }

        // Update deposit with payment info
        $deposit->btc_wallet = $payment->id;
        $deposit->detail = [
            'payment_id' => $payment->id,
            'status' => $payment->status,
            'installments' => $installments,
            'card_last_digits' => substr($cardNumber, -4),
        ];

        // Check payment status
        if (in_array($payment->status, ['CONFIRMED', 'RECEIVED'])) {
            // Payment approved immediately
            $deposit->save();
            PaymentController::userDataUpdate($deposit);

            return response()->json([
                'success' => true,
                'message' => 'Payment confirmed successfully!',
                'data' => [
                    'deposit' => [
                        'trx' => $deposit->trx,
                        'amount' => $deposit->amount,
                        'charge' => $deposit->charge,
                        'final_amount' => $deposit->final_amount,
                        'status' => 'confirmed',
                    ]
                ]
            ]);
        } elseif ($payment->status == 'PENDING') {
            $deposit->save();
            return response()->json([
                'success' => true,
                'message' => 'Payment is being processed',
                'data' => [
                    'deposit' => [
                        'trx' => $deposit->trx,
                        'amount' => $deposit->amount,
                        'charge' => $deposit->charge,
                        'final_amount' => $deposit->final_amount,
                        'status' => 'pending',
                    ]
                ]
            ]);
        } else {
            $deposit->detail = array_merge((array) $deposit->detail, ['error' => $payment->status]);
            $deposit->save();

            return response()->json([
                'success' => false,
                'message' => 'Payment was declined. Status: ' . $payment->status
            ], 422);
        }
    }

    /**
     * Check deposit status
     */
    public function depositStatus(Request $request)
    {
        $request->validate([
            'trx' => 'required|string'
        ]);

        $deposit = Deposit::where('trx', $request->trx)
            ->where('user_id', auth()->id())
            ->first();

        if (!$deposit) {
            return response()->json([
                'success' => false,
                'message' => 'Deposit not found'
            ], 404);
        }

        $statusMap = [
            Status::PAYMENT_INITIATE => 'pending',
            Status::PAYMENT_SUCCESS => 'confirmed',
            Status::PAYMENT_PENDING => 'processing',
            Status::PAYMENT_REJECT => 'rejected',
        ];

        return response()->json([
            'success' => true,
            'data' => [
                'deposit' => [
                    'trx' => $deposit->trx,
                    'amount' => $deposit->amount,
                    'charge' => $deposit->charge,
                    'final_amount' => $deposit->final_amount,
                    'status' => $statusMap[$deposit->status] ?? 'unknown',
                    'method' => $deposit->method_code == 127 ? 'pix' : 'credit_card',
                    'created_at' => $deposit->created_at,
                ]
            ]
        ]);
    }

    // ==================== WITHDRAW ENDPOINTS ====================

    /**
     * Get available withdraw methods (PIX and Transfer)
     */
    public function withdrawMethods()
    {
        $methods = WithdrawMethod::active()->get();

        return response()->json([
            'success' => true,
            'data' => [
                'methods' => $methods->map(function ($m) {
                    $type = 'other';
                    $nameLower = strtolower($m->name);
                    if (str_contains($nameLower, 'pix')) {
                        $type = 'pix';
                    } elseif (str_contains($nameLower, 'transfer') || str_contains($nameLower, 'bank')) {
                        $type = 'bank_transfer';
                    }

                    return [
                        'id' => $m->id,
                        'name' => $m->name,
                        'currency' => $m->currency,
                        'min_limit' => $m->min_limit,
                        'max_limit' => $m->max_limit,
                        'fixed_charge' => $m->fixed_charge,
                        'percent_charge' => $m->percent_charge,
                        'type' => $type,
                        'required_fields' => $this->getWithdrawRequiredFields($type),
                    ];
                })
            ]
        ]);
    }

    /**
     * Get required fields for withdraw type
     */
    private function getWithdrawRequiredFields($type)
    {
        $common = [
            ['name' => 'cpf', 'label' => 'CPF/CNPJ', 'type' => 'text', 'required' => true],
        ];

        if ($type == 'pix') {
            return array_merge($common, [
                ['name' => 'pix_key_type', 'label' => 'PIX Key Type', 'type' => 'select', 'required' => true, 'options' => ['CPF', 'CNPJ', 'EMAIL', 'PHONE', 'EVP']],
                ['name' => 'pix_key', 'label' => 'PIX Key', 'type' => 'text', 'required' => true],
            ]);
        } elseif ($type == 'bank_transfer') {
            return array_merge($common, [
                ['name' => 'bank_code', 'label' => 'Bank Code', 'type' => 'text', 'required' => true],
                ['name' => 'bank_agency', 'label' => 'Agency', 'type' => 'text', 'required' => true],
                ['name' => 'bank_account', 'label' => 'Account', 'type' => 'text', 'required' => true],
                ['name' => 'bank_account_type', 'label' => 'Account Type', 'type' => 'select', 'required' => true, 'options' => ['CONTA_CORRENTE', 'CONTA_POUPANCA']],
                ['name' => 'bank_holder_name', 'label' => 'Account Holder Name', 'type' => 'text', 'required' => true],
            ]);
        }

        return $common;
    }

    /**
     * Create PIX withdraw request
     */
    public function withdrawPix(Request $request)
    {
        $request->validate([
            'amount' => 'required|numeric|min:1',
            'cpf' => 'required|string',
            'pix_key_type' => 'required|in:CPF,CNPJ,EMAIL,PHONE,EVP',
            'pix_key' => 'required|string',
        ]);

        $user = auth()->user();

        // Find PIX withdraw method
        $method = WithdrawMethod::active()
            ->where(function ($q) {
                $q->where('name', 'like', '%pix%')
                  ->orWhere('name', 'like', '%PIX%');
            })->first();

        if (!$method) {
            return response()->json([
                'success' => false,
                'message' => 'PIX withdraw method not available'
            ], 404);
        }

        return $this->processWithdraw($request, $method, 'pix');
    }

    /**
     * Create Bank Transfer withdraw request
     */
    public function withdrawTransfer(Request $request)
    {
        $request->validate([
            'amount' => 'required|numeric|min:1',
            'cpf' => 'required|string',
            'bank_code' => 'required|string',
            'bank_agency' => 'required|string',
            'bank_account' => 'required|string',
            'bank_account_type' => 'required|in:CONTA_CORRENTE,CONTA_POUPANCA',
            'bank_holder_name' => 'required|string',
        ]);

        $user = auth()->user();

        // Find Bank Transfer withdraw method
        $method = WithdrawMethod::active()
            ->where(function ($q) {
                $q->where('name', 'like', '%transfer%')
                  ->orWhere('name', 'like', '%Transfer%')
                  ->orWhere('name', 'like', '%bank%');
            })->first();

        if (!$method) {
            return response()->json([
                'success' => false,
                'message' => 'Bank transfer withdraw method not available'
            ], 404);
        }

        return $this->processWithdraw($request, $method, 'bank_transfer');
    }

    /**
     * Process withdraw request
     */
    private function processWithdraw(Request $request, $method, $type)
    {
        $user = auth()->user();

        // Validate limits
        if ($request->amount < $method->min_limit) {
            return response()->json([
                'success' => false,
                'message' => "Minimum withdrawal amount is {$method->min_limit}"
            ], 422);
        }

        if ($request->amount > $method->max_limit) {
            return response()->json([
                'success' => false,
                'message' => "Maximum withdrawal amount is {$method->max_limit}"
            ], 422);
        }

        if ($request->amount > $user->balance) {
            return response()->json([
                'success' => false,
                'message' => 'Insufficient balance'
            ], 422);
        }

        // Calculate charges
        $charge = $method->fixed_charge + ($request->amount * $method->percent_charge / 100);
        $afterCharge = $request->amount - $charge;

        if ($afterCharge <= 0) {
            return response()->json([
                'success' => false,
                'message' => 'Amount must be greater than charges'
            ], 422);
        }

        $finalAmount = $afterCharge * $method->rate;

        // Update user CPF
        $cpf = preg_replace('/[^0-9]/', '', $request->cpf);
        if (!$user->cpf) {
            $user->cpf = $cpf;
            $user->save();
        }

        // Build withdraw information
        if ($type == 'pix') {
            $withdrawInfo = [
                ['name' => 'CPF/CNPJ', 'type' => 'text', 'value' => $cpf],
                ['name' => 'PIX Key Type', 'type' => 'text', 'value' => $request->pix_key_type],
                ['name' => 'PIX Key', 'type' => 'text', 'value' => $request->pix_key],
            ];
        } else {
            $withdrawInfo = [
                ['name' => 'CPF/CNPJ', 'type' => 'text', 'value' => $cpf],
                ['name' => 'Bank Code', 'type' => 'text', 'value' => $request->bank_code],
                ['name' => 'Agency', 'type' => 'text', 'value' => $request->bank_agency],
                ['name' => 'Account', 'type' => 'text', 'value' => $request->bank_account],
                ['name' => 'Account Type', 'type' => 'text', 'value' => $request->bank_account_type],
                ['name' => 'Account Holder', 'type' => 'text', 'value' => $request->bank_holder_name],
            ];
        }

        // Create withdrawal
        $withdraw = new Withdrawal();
        $withdraw->method_id = $method->id;
        $withdraw->user_id = $user->id;
        $withdraw->amount = $request->amount;
        $withdraw->currency = $method->currency;
        $withdraw->rate = $method->rate;
        $withdraw->charge = $charge;
        $withdraw->final_amount = $finalAmount;
        $withdraw->after_charge = $afterCharge;
        $withdraw->withdraw_information = $withdrawInfo;
        $withdraw->trx = getTrx();
        $withdraw->status = Status::PAYMENT_PENDING;
        $withdraw->save();

        // Deduct from user balance
        $user->balance -= $request->amount;
        $user->save();

        // Create transaction
        $transaction = new Transaction();
        $transaction->user_id = $user->id;
        $transaction->amount = $request->amount;
        $transaction->post_balance = $user->balance;
        $transaction->charge = $charge;
        $transaction->trx_type = '-';
        $transaction->details = 'Withdraw request via ' . $method->name;
        $transaction->trx = $withdraw->trx;
        $transaction->remark = 'withdraw';
        $transaction->save();

        // Admin notification
        $adminNotification = new AdminNotification();
        $adminNotification->user_id = $user->id;
        $adminNotification->title = 'New withdraw request from ' . $user->username;
        $adminNotification->click_url = urlPath('admin.withdraw.data.details', $withdraw->id);
        $adminNotification->save();

        // Notify user
        notify($user, 'WITHDRAW_REQUEST', [
            'method_name' => $method->name,
            'method_currency' => $method->currency,
            'method_amount' => showAmount($finalAmount, currencyFormat: false),
            'amount' => showAmount($request->amount, currencyFormat: false),
            'charge' => showAmount($charge, currencyFormat: false),
            'rate' => showAmount($method->rate, currencyFormat: false),
            'trx' => $withdraw->trx,
            'post_balance' => showAmount($user->balance, currencyFormat: false),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Withdraw request submitted successfully',
            'data' => [
                'withdraw' => [
                    'trx' => $withdraw->trx,
                    'amount' => $withdraw->amount,
                    'charge' => $withdraw->charge,
                    'final_amount' => $withdraw->final_amount,
                    'status' => 'pending',
                    'method' => $method->name,
                ],
                'balance' => $user->balance,
            ]
        ]);
    }

    /**
     * Check withdraw status
     */
    public function withdrawStatus(Request $request)
    {
        $request->validate([
            'trx' => 'required|string'
        ]);

        $withdraw = Withdrawal::where('trx', $request->trx)
            ->where('user_id', auth()->id())
            ->with('method')
            ->first();

        if (!$withdraw) {
            return response()->json([
                'success' => false,
                'message' => 'Withdrawal not found'
            ], 404);
        }

        $statusMap = [
            Status::PAYMENT_INITIATE => 'initiated',
            Status::PAYMENT_SUCCESS => 'completed',
            Status::PAYMENT_PENDING => 'pending',
            Status::PAYMENT_REJECT => 'rejected',
        ];

        return response()->json([
            'success' => true,
            'data' => [
                'withdraw' => [
                    'trx' => $withdraw->trx,
                    'amount' => $withdraw->amount,
                    'charge' => $withdraw->charge,
                    'final_amount' => $withdraw->final_amount,
                    'status' => $statusMap[$withdraw->status] ?? 'unknown',
                    'method' => $withdraw->method->name ?? 'Unknown',
                    'created_at' => $withdraw->created_at,
                ]
            ]
        ]);
    }

    /**
     * Get user balance
     */
    public function balance()
    {
        $user = auth()->user();

        return response()->json([
            'success' => true,
            'data' => [
                'balance' => $user->balance,
                'currency' => gs('cur_text'),
                'symbol' => gs('cur_sym'),
            ]
        ]);
    }
}
