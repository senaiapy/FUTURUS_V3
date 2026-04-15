<?php

namespace App\Http\Controllers\Gateway\Asaas;

use App\Constants\Status;
use App\Models\Deposit;
use App\Http\Controllers\Gateway\PaymentController;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Lib\CurlRequest;
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
        $send = [];

        if (!$user->cpf) {
            $send['error'] = true;
            $send['message'] = 'CPF/CNPJ is required to process Asaas PIX payments.';
            return json_encode($send);
        }

        // 1. Find or Create Customer
        $customerData = [
            'name' => trim($user->firstname . ' ' . $user->lastname) ?: $user->username,
            'email' => $user->email,
            'cpfCnpj' => $user->cpf,
            'externalReference' => $user->id,
        ];

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, "$url/customers");
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($customerData));
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            "access_token: $apiKey",
            "Content-Type: application/json",
            "User-Agent: Futurus-App"
        ]);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        
        $customerResponse = curl_exec($ch);
        $curlError = curl_error($ch);
        curl_close($ch);

        if ($curlError) {
            Log::error('Asaas CURL Error: ' . $curlError);
            $send['error'] = true;
            $send['message'] = 'CURL Error: ' . $curlError;
            return json_encode($send);
        }

        Log::info('Asaas Customer Response: ' . $customerResponse);

        $customer = json_decode($customerResponse);

        if (!$customer) {
            $send['error'] = true;
            $send['message'] = 'Failed to decode Asaas response. Check logs.';
            return json_encode($send);
        }

        if (isset($customer->errors)) {
            $send['error'] = true;
            $send['message'] = $customer->errors[0]->description;
            return json_encode($send);
        }

        if (!isset($customer->id)) {
            $send['error'] = true;
            $send['message'] = 'Customer ID not found in Asaas response.';
            return json_encode($send);
        }

        $customerId = $customer->id;

        // 2. Create PIX Charge
        $paymentData = [
            'customer' => $customerId,
            'billingType' => 'PIX',
            'value' => round($deposit->final_amount, 2),
            'dueDate' => date('Y-m-d', strtotime('+1 day')),
            'externalReference' => $deposit->trx,
        ];

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, "$url/payments");
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($paymentData));
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            "access_token: $apiKey",
            "Content-Type: application/json",
            "User-Agent: Futurus-App"
        ]);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        
        $paymentResponse = curl_exec($ch);
        $curlError = curl_error($ch);
        curl_close($ch);

        if ($curlError) {
            Log::error('Asaas Payment CURL Error: ' . $curlError);
            $send['error'] = true;
            $send['message'] = 'CURL Payment Error: ' . $curlError;
            return json_encode($send);
        }

        $payment = json_decode($paymentResponse);

        if (!$payment) {
            $send['error'] = true;
            $send['message'] = 'Empty response from Asaas while creating payment.';
            return json_encode($send);
        }

        if (isset($payment->errors)) {
            $send['error'] = true;
            $send['message'] = $payment->errors[0]->description;
            return json_encode($send);
        }

        if (!isset($payment->id)) {
            $send['error'] = true;
            $send['message'] = 'Payment ID not found in Asaas response.';
            return json_encode($send);
        }

        // 3. Get PIX QR Code
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, "$url/payments/{$payment->id}/pixQrCode");
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            "access_token: $apiKey",
            "User-Agent: Futurus-App"
        ]);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        
        $pixResponse = curl_exec($ch);
        $curlError = curl_error($ch);
        curl_close($ch);

        if ($curlError) {
            Log::error('Asaas QR Code CURL Error: ' . $curlError);
            $send['error'] = true;
            $send['message'] = 'CURL QR Code Error: ' . $curlError;
            return json_encode($send);
        }

        $pixData = json_decode($pixResponse);

        if (!$pixData) {
            $send['error'] = true;
            $send['message'] = 'Empty response from Asaas while getting QR Code.';
            return json_encode($send);
        }

        if (isset($pixData->errors)) {
            $send['error'] = true;
            $send['message'] = $pixData->errors[0]->description;
            return json_encode($send);
        }

        $deposit->btc_wallet = $payment->id; // Using btc_wallet to store Asaas Payment ID
        $deposit->detail = [
            'encodedImage' => $pixData->encodedImage,
            'payload' => $pixData->payload,
            'payment_id' => $payment->id
        ];
        $deposit->save();

        $send['view'] = 'user.payment.asaas';
        $send['encodedImage'] = $pixData->encodedImage;
        $send['payload'] = $pixData->payload;
        
        return json_encode($send);
    }

    public function ipn(Request $request)
    {
        // Asaas Webhook
        $data = $request->all();
        Log::info('Asaas Webhook Data: ' . json_encode($data));
        
        if (isset($data['event']) && ($data['event'] == 'PAYMENT_CONFIRMED' || $data['event'] == 'PAYMENT_RECEIVED')) {
            $paymentId = $data['payment']['id'];
            $deposit = Deposit::where('btc_wallet', $paymentId)->where('status', Status::PAYMENT_INITIATE)->first();
            
            if ($deposit) {
                Log::info('Asaas Webhook: Deposit found, updating status for TRX: ' . $deposit->trx);
                PaymentController::userDataUpdate($deposit);
            } else {
                Log::warning('Asaas Webhook: Deposit not found or already processed for Payment ID: ' . $paymentId);
            }
        }
        
        return response()->json(['status' => 'success']);
    }
}
