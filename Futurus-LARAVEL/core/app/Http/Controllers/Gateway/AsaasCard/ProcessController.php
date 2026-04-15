<?php

namespace App\Http\Controllers\Gateway\AsaasCard;

use App\Constants\Status;
use App\Models\Deposit;
use App\Http\Controllers\Gateway\PaymentController;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class ProcessController extends Controller
{
    public static function process($deposit)
    {
        $asaasAcc = json_decode($deposit->gatewayCurrency()->gateway_parameter);
        $apiKey = @$asaasAcc->api_key;
        $mode = @$asaasAcc->mode;
        $url = ($mode == 'sandbox') ? 'https://sandbox.asaas.com/api/v3' : 'https://www.asaas.com/api/v3';

        if (!$apiKey) {
            $send['error'] = true;
            $send['message'] = 'Asaas API Key is not configured.';
            return json_encode($send);
        }

        $user = $deposit->user;

        // Store deposit info and redirect to card form
        // CPF will be collected on the card form itself
        $deposit->detail = [
            'awaiting_card' => true,
            'api_key' => $apiKey,
            'api_url' => $url,
        ];
        $deposit->save();

        $send['redirect'] = true;
        $send['redirect_url'] = route('user.deposit.asaas.card.form', encrypt($deposit->id));

        return json_encode($send);
    }

    public function cardForm($id)
    {
        $deposit = Deposit::findOrFail(decrypt($id));

        if ($deposit->status != Status::PAYMENT_INITIATE) {
            $notify[] = ['error', 'Invalid payment request'];
            return to_route('user.deposit.history')->withNotify($notify);
        }

        $pageTitle = 'Credit/Debit Card Payment';
        $user = $deposit->user;

        return view('Template::user.payment.asaas_card', compact('pageTitle', 'deposit', 'user'));
    }

    public function cardSubmit(Request $request, $id)
    {
        $deposit = Deposit::findOrFail(decrypt($id));

        if ($deposit->status != Status::PAYMENT_INITIATE) {
            $notify[] = ['error', 'Invalid payment request'];
            return to_route('user.deposit.history')->withNotify($notify);
        }

        $request->validate([
            'holder_name' => 'required|string|max:100',
            'card_number' => 'required|string|min:13|max:19',
            'expiry_month' => 'required|string|size:2',
            'expiry_year' => 'required|string|size:4',
            'cvv' => 'required|string|min:3|max:4',
            'holder_cpf' => 'required|string',
            'holder_email' => 'required|email',
            'holder_phone' => 'required|string',
            'holder_postal_code' => 'required|string',
            'holder_address_number' => 'required|string',
            'holder_address' => 'required|string',
            'holder_province' => 'required|string',
            'installments' => 'required|integer|min:1|max:12',
        ]);

        $asaasAcc = json_decode($deposit->gatewayCurrency()->gateway_parameter);
        $apiKey = @$asaasAcc->api_key;
        $mode = @$asaasAcc->mode;
        $url = ($mode == 'sandbox') ? 'https://sandbox.asaas.com/api/v3' : 'https://www.asaas.com/api/v3';

        $user = $deposit->user;

        // Update user CPF if not set
        if (!$user->cpf && $request->holder_cpf) {
            $user->cpf = preg_replace('/[^0-9]/', '', $request->holder_cpf);
            $user->save();
        }

        // 1. Create/Find Customer
        $customerData = [
            'name' => $request->holder_name,
            'email' => $request->holder_email,
            'cpfCnpj' => preg_replace('/[^0-9]/', '', $request->holder_cpf),
            'phone' => preg_replace('/[^0-9]/', '', $request->holder_phone),
            'postalCode' => preg_replace('/[^0-9]/', '', $request->holder_postal_code),
            'address' => $request->holder_address,
            'addressNumber' => $request->holder_address_number,
            'province' => $request->holder_province,
            'externalReference' => (string) $user->id,
        ];

        $customer = self::asaasRequest($url . '/customers', $customerData, $apiKey);

        if (isset($customer->errors)) {
            $notify[] = ['error', $customer->errors[0]->description ?? 'Error creating customer'];
            return back()->withNotify($notify)->withInput();
        }

        if (!isset($customer->id)) {
            $notify[] = ['error', 'Failed to create customer in Asaas'];
            return back()->withNotify($notify)->withInput();
        }

        $customerId = $customer->id;

        // 2. Create Credit Card Payment
        $cardNumber = preg_replace('/[^0-9]/', '', $request->card_number);

        $paymentData = [
            'customer' => $customerId,
            'billingType' => 'CREDIT_CARD',
            'value' => round($deposit->final_amount, 2),
            'dueDate' => date('Y-m-d'),
            'externalReference' => $deposit->trx,
            'installmentCount' => (int) $request->installments,
            'installmentValue' => round($deposit->final_amount / $request->installments, 2),
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
                'cpfCnpj' => preg_replace('/[^0-9]/', '', $request->holder_cpf),
                'postalCode' => preg_replace('/[^0-9]/', '', $request->holder_postal_code),
                'addressNumber' => $request->holder_address_number,
                'phone' => preg_replace('/[^0-9]/', '', $request->holder_phone),
            ],
            'remoteIp' => $request->ip(),
        ];

        Log::info('Asaas Card Payment Request', ['trx' => $deposit->trx]);

        $payment = self::asaasRequest($url . '/payments', $paymentData, $apiKey);

        if (isset($payment->errors)) {
            Log::error('Asaas Card Payment Error', ['errors' => $payment->errors]);
            $notify[] = ['error', $payment->errors[0]->description ?? 'Payment processing error'];
            return back()->withNotify($notify)->withInput();
        }

        if (!isset($payment->id)) {
            $notify[] = ['error', 'Payment ID not returned from Asaas'];
            return back()->withNotify($notify)->withInput();
        }

        // Store payment info
        $deposit->btc_wallet = $payment->id;
        $deposit->detail = [
            'payment_id' => $payment->id,
            'status' => $payment->status,
            'installments' => $request->installments,
            'card_last_digits' => substr($cardNumber, -4),
        ];

        // Check payment status
        if ($payment->status == 'CONFIRMED' || $payment->status == 'RECEIVED') {
            // Payment approved immediately
            $deposit->save();
            PaymentController::userDataUpdate($deposit);

            $notify[] = ['success', 'Payment confirmed successfully!'];
            return to_route('user.deposit.history')->withNotify($notify);
        } elseif ($payment->status == 'PENDING') {
            $deposit->save();
            $notify[] = ['info', 'Payment is being processed. You will be notified when confirmed.'];
            return to_route('user.deposit.history')->withNotify($notify);
        } else {
            // Payment failed or refused
            $deposit->detail = array_merge((array) $deposit->detail, ['error' => $payment->status]);
            $deposit->save();

            $notify[] = ['error', 'Payment was declined. Status: ' . $payment->status];
            return back()->withNotify($notify)->withInput();
        }
    }

    private static function asaasRequest($url, $data, $apiKey, $method = 'POST')
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
            Log::error('Asaas CURL Error: ' . $error);
            return (object) ['errors' => [(object) ['description' => 'Connection error: ' . $error]]];
        }

        Log::info('Asaas Response: ' . $response);

        return json_decode($response);
    }

    public function ipn(Request $request)
    {
        $data = $request->all();
        Log::info('Asaas Card Webhook Data: ' . json_encode($data));

        if (isset($data['event']) && in_array($data['event'], ['PAYMENT_CONFIRMED', 'PAYMENT_RECEIVED'])) {
            $paymentId = $data['payment']['id'];
            $deposit = Deposit::where('btc_wallet', $paymentId)
                ->where('status', Status::PAYMENT_INITIATE)
                ->first();

            if ($deposit) {
                Log::info('Asaas Card Webhook: Processing deposit TRX: ' . $deposit->trx);
                PaymentController::userDataUpdate($deposit);
            }
        }

        return response()->json(['status' => 'success']);
    }
}
