<?php

namespace App\Http\Controllers\Api;

use App\Constants\Status;
use App\Http\Controllers\Controller;
use App\Models\Deposit;
use App\Models\Gateway;
use App\Models\Transaction;
use App\Models\Withdrawal;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class WalletController extends Controller
{
    /**
     * Get user wallet information
     */
    public function index()
    {
        $user = Auth::user();

        $balanceBonus = 0;

        return response()->json([
            'success' => true,
            'data' => [
                'balance' => (string) $user->balance,
                'balanceBonus' => (string) $balanceBonus,
                'balanceTotal' => (string) ($user->balance + $balanceBonus),
                'totalSharesBought' => (string) $user->total_shares_bought,
                'totalInvested' => (string) $user->invested_amount,
                'totalWinning' => (string) $user->winning_amount,
                'referralEarnings' => (string) $user->referral_commissions,
            ],
        ]);
    }

    /**
     * Get available deposit methods
     */
    public function depositMethods()
    {
        $methods = Gateway::where('status', Status::ENABLE)
            ->where('gateway_type', Status::AUTOMATIC)
            ->latest()
            ->get()
            ->map(function ($gateway) {
                return [
                    'id' => (string) $gateway->id,
                    'name' => $gateway->gateway_name,
                    'image' => $gateway->image ? '/' . getFilePath('gateway') . '/' . $gateway->image : null,
                    'code' => $gateway->code,
                    'minAmount' => (string) $gateway->min_amount,
                    'maxAmount' => (string) $gateway->max_amount,
                    'charge' => (string) $gateway->charge,
                    'fixedCharge' => (string) $gateway->fixed_charge,
                ];
            });

        // Add PIX as a manual method
        $pixMethod = [
            'id' => 'pix',
            'name' => 'PIX',
            'code' => 'PIX',
            'image' => 'https://logopng.com.br/logos/pix-106.png',
            'minAmount' => '10.00',
            'maxAmount' => '50000.00',
            'charge' => '0',
            'fixedCharge' => '0',
            'isManual' => true,
        ];

        return response()->json([
            'success' => true,
            'data' => [
                ...$methods,
                $pixMethod,
            ],
        ]);
    }

    /**
     * Initiate a deposit
     */
    public function initiateDeposit(Request $request)
    {
        $request->validate([
            'amount' => 'required|numeric|gt:0',
            'paymentMethod' => 'required|in:PIX,USDC',
        ]);

        $user = Auth::user();
        $amount = (float) $request->amount;

        // Minimum deposit amount
        if ($amount < 10) {
            return response()->json([
                'success' => false,
                'message' => 'Depósito mínimo é R$ 10,00',
            ], 400);
        }

        // Generate deposit record
        $deposit = new Deposit();
        $deposit->user_id = $user->id;
        $deposit->method_code = $request->paymentMethod;
        $deposit->method_currency = 'BRL';
        $deposit->amount = $amount;
        $deposit->charge = 0;
        $deposit->final_amount = $amount;
        $deposit->status = Status::PAYMENT_INITIATE;
        $deposit->trx = getTrx();
        $deposit->save();

        // Generate PIX QR code and code
        if ($request->paymentMethod === 'PIX') {
            // In production, integrate with PIX provider
            $pixCode = $this->generatePixCode($deposit);
            $pixQrCode = $this->generatePixQrCode($pixCode);

            $deposit->pix_code = $pixCode;
            $deposit->pix_qr_code = $pixQrCode;
            $deposit->save();

            return response()->json([
                'success' => true,
                'message' => 'PIX code generated',
                'data' => [
                    'id' => (string) $deposit->id,
                    'amount' => (string) $amount,
                    'pixCode' => $pixCode,
                    'pixQrCode' => $pixQrCode,
                    'expiresIn' => 3600, // 1 hour
                    'trx' => $deposit->trx,
                ],
            ]);
        }

        // USDC deposit - return wallet address
        if ($request->paymentMethod === 'USDC') {
            $walletAddress = $user->wallet_address ?? '0x742d35Cc6634C0532925a3b844Bc454e4438f44e'; // Default Solana address

            return response()->json([
                'success' => true,
                'message' => 'Wallet address generated',
                'data' => [
                    'id' => (string) $deposit->id,
                    'amount' => (string) $amount,
                    'walletAddress' => $walletAddress,
                    'network' => 'Solana',
                    'currency' => 'USDC',
                    'trx' => $deposit->trx,
                ],
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'Invalid payment method',
        ], 400);
    }

    /**
     * Confirm deposit (webhook for payment gateways)
     */
    public function confirmDeposit(Request $request)
    {
        $request->validate([
            'deposit_id' => 'required|exists:deposits,id',
            'status' => 'required|in:success,failed',
        ]);

        $deposit = Deposit::findOrFail($request->deposit_id);

        if ($deposit->status === Status::PAYMENT_SUCCESS) {
            return response()->json([
                'success' => false,
                'message' => 'Deposit already confirmed',
            ]);
        }

        if ($request->status === 'success') {
            $deposit->status = Status::PAYMENT_SUCCESS;
            $deposit->save();

            // Add to user balance
            $user = $deposit->user;
            $user->balance += $deposit->final_amount;
            $user->save();

            // Create transaction
            $transaction = new Transaction();
            $transaction->user_id = $user->id;
            $transaction->amount = $deposit->final_amount;
            $transaction->post_balance = $user->balance;
            $transaction->charge = 0;
            $transaction->trx_type = '+';
            $transaction->details = 'Deposit via ' . $deposit->method_code;
            $transaction->remark = 'deposit';
            $transaction->trx = $deposit->trx;
            $transaction->save();

            return response()->json([
                'success' => true,
                'message' => 'Deposit confirmed',
            ]);
        }

        $deposit->status = Status::PAYMENT_FAILED;
        $deposit->save();

        return response()->json([
            'success' => true,
            'message' => 'Deposit marked as failed',
        ]);
    }

    /**
     * Get available withdrawal methods
     */
    public function withdrawMethods()
    {
        $methods = \App\Models\WithdrawMethod::where('status', Status::ENABLE)
            ->latest()
            ->get()
            ->map(function ($method) {
                return [
                    'id' => (string) $method->id,
                    'name' => $method->name,
                    'image' => $method->image ? '/' . getFilePath('withdraw_method') . '/' . $method->image : null,
                    'minAmount' => (string) $method->min_limit,
                    'maxAmount' => (string) $method->max_limit,
                    'fixedCharge' => (string) $method->fixed_charge,
                    'percentCharge' => (string) $method->percent_charge,
                    'delay' => $method->delay,
                ];
            });

        // Add PIX as default
        $pixMethod = [
            'id' => 'pix',
            'name' => 'PIX',
            'image' => 'https://logopng.com.br/logos/pix-106.png',
            'minAmount' => '10.00',
            'maxAmount' => '10000.00',
            'fixedCharge' => '0',
            'percentCharge' => '1',
            'delay' => 'Instant',
            'isDefault' => true,
        ];

        return response()->json([
            'success' => true,
            'data' => [
                ...$methods,
                $pixMethod,
            ],
        ]);
    }

    /**
     * Request a withdrawal
     */
    public function withdraw(Request $request)
    {
        $request->validate([
            'method' => 'required',
            'amount' => 'required|numeric|gt:0',
            'pixKey' => 'required_if:method,pix',
            'walletAddress' => 'required_if:method,crypto',
        ]);

        $user = Auth::user();
        $amount = (float) $request->amount;

        // Check if KYC is required and completed
        if (gs()->kyc_verification) {
            if ($user->kv != Status::VERIFIED) {
                return response()->json([
                    'success' => false,
                    'message' => 'KYC verification required for withdrawals',
                    'kycStatus' => $user->kv,
                ], 403);
            }
        }

        // Check balance
        if ($user->balance < $amount) {
            return response()->json([
                'success' => false,
                'message' => 'Insufficient balance',
                'available' => (string) $user->balance,
            ], 400);
        }

        // Calculate fees
        $withdrawMethod = $request->method;
        $fixedCharge = 0;
        $percentCharge = 0;

        if ($withdrawMethod === 'pix') {
            $percentCharge = 1; // 1% fee
        }

        $fee = $fixedCharge + ($amount * ($percentCharge / 100));
        $finalAmount = $amount - $fee;

        // Minimum withdrawal check
        if ($finalAmount < 10) {
            return response()->json([
                'success' => false,
                'message' => 'Minimum withdrawal amount is R$ 10.00',
            ], 400);
        }

        // Create withdrawal request
        $withdrawal = new Withdrawal();
        $withdrawal->user_id = $user->id;
        $withdrawal->method_id = 0; // PIX default
        $withdrawal->amount = $amount;
        $withdrawal->charge = $fee;
        $withdrawal->final_amount = $finalAmount;
        $withdrawal->withdraw_information = json_encode([
            'pix_key' => $request->pixKey,
        ]);
        $withdrawal->status = Status::PAYMENT_PENDING;
        $withdrawal->trx = getTrx();
        $withdrawal->save();

        // Deduct from balance
        $user->balance -= $amount;
        $user->save();

        // Create transaction
        $transaction = new Transaction();
        $transaction->user_id = $user->id;
        $transaction->amount = $amount;
        $transaction->post_balance = $user->balance;
        $transaction->charge = $fee;
        $transaction->trx_type = '-';
        $transaction->details = 'Withdrawal via PIX';
        $transaction->remark = 'withdraw';
        $transaction->trx = $withdrawal->trx;
        $transaction->save();

        return response()->json([
            'success' => true,
            'message' => 'Withdrawal request submitted',
            'data' => [
                'id' => (string) $withdrawal->id,
                'amount' => (string) $amount,
                'fee' => (string) $fee,
                'finalAmount' => (string) $finalAmount,
                'pixKey' => $request->pixKey,
                'status' => 'PENDING',
                'trx' => $withdrawal->trx,
                'createdAt' => $withdrawal->created_at->toIso8601String(),
            ],
        ]);
    }

    /**
     * Get transaction history
     */
    public function transactions(Request $request)
    {
        $user = Auth::user();

        $query = Transaction::where('user_id', $user->id)->latest();

        // Apply filters
        if ($request->filled('type')) {
            $typeMap = [
                'DEPOSIT' => '+',
                'WITHDRAWAL' => '-',
                'PURCHASE' => '-',
            ];
            $query->where('trx_type', $typeMap[$request->type] ?? '+');
        }

        $page = $request->get('page', 1);
        $limit = $request->get('limit', 20);

        $transactions = $query->paginate($limit, ['*'], 'page', $page);

        $data = $transactions->map(function ($tx) {
            $type = 'OTHER';
            if (str_contains($tx->remark, 'deposit')) {
                $type = 'DEPOSIT';
            } elseif (str_contains($tx->remark, 'withdraw')) {
                $type = 'WITHDRAWAL';
            } elseif (str_contains($tx->remark, 'purchase')) {
                $type = 'PURCHASE';
            } elseif (str_contains($tx->remark, 'refund')) {
                $type = 'REFUND';
            }

            return [
                'id' => (string) $tx->id,
                'type' => $type,
                'amount' => (string) $tx->amount,
                'charge' => (string) $tx->charge,
                'postBalance' => (string) $tx->post_balance,
                'description' => $tx->details,
                'trx' => $tx->trx,
                'createdAt' => $tx->created_at->toIso8601String(),
            ];
        })->toArray();

        return response()->json([
            'success' => true,
            'message' => 'Success',
            'data' => [
                'data' => $data,
                'meta' => [
                    'total' => $transactions->total(),
                    'page' => $transactions->currentPage(),
                    'limit' => $transactions->perPage(),
                    'totalPages' => $transactions->lastPage(),
                ],
            ]
        ]);
    }

    /**
     * Generate PIX code (placeholder - integrate with actual PIX provider)
     */
    private function generatePixCode($deposit)
    {
        // In production, integrate with PIX provider like Banco do Brasil, Mercado Pago, etc.
        // For now, generate a mock code
        $userId = str_pad($deposit->user_id, 10, '0', STR_PAD_LEFT);
        $timestamp = now()->format('YmdHis');
        $random = rand(100, 999);

        return "00020126{$userId}5204000053039865406" . $timestamp . "5802BR5925Futurus Prediction Markets6009Sao Paulo62070503***6304E4DA";
    }

    /**
     * Generate PIX QR code (placeholder - integrate with actual PIX provider)
     */
    private function generatePixQrCode($pixCode)
    {
        // In production, use actual QR code generation service
        // For now, return a placeholder
        return "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=" . urlencode($pixCode);
    }
}
