<?php

namespace App\Http\Controllers\Api;

use App\Constants\Status;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class GameController extends Controller
{
    /**
     * Get game dashboard data
     */
    public function dashboard()
    {
        $user = Auth::user();

        return response()->json([
            'success' => true,
            'data'    => [
                'coinBalance'        => 0, // TODO: implement coin_balance field
                'totalCoinsEarned'   => 0,
                'referralCode'       => $user->referral_code ?? $user->username,
                'onboardingComplete' => true,
                'completedTasks'     => 0,
                'totalTasks'         => 3,
                'referralCount'      => $user->referrals()->count(),
                'recentTransactions' => [],
            ]
        ]);
    }

    /**
     * Get user's coin balance
     */
    public function coinBalance()
    {
        return response()->json([
            'success' => true,
            'data'    => [
                'balance' => 150
            ]
        ]);
    }

    /**
     * Get coin transactions
     */
    public function coinTransactions(Request $request)
    {
        return response()->json([
            'success' => true,
            'data'    => [
                'transactions' => [
                    [
                        'id' => '1',
                        'amount' => 50,
                        'type' => 'TASK_REWARD',
                        'description' => 'Follow on Twitter',
                        'createdAt' => now()->subDays(1)->toIso8601String(),
                        'balanceAfter' => 150
                    ]
                ]
            ]
        ]);
    }

    /**
     * Get all available tasks
     */
    public function allTasks()
    {
        return response()->json([
            'success' => true,
            'data'    => [
                'tasks' => [
                    [
                        'id' => 'twitter_follow',
                        'name' => 'Follow us on Twitter',
                        'description' => 'Follow @FuturusMarkets to earn coins',
                        'coinReward' => 50,
                        'taskType' => 'SOCIAL',
                        'delayHours' => 0,
                        'isActive' => true,
                        'verificationRequired' => true,
                        'externalUrl' => 'https://twitter.com/futurus',
                    ],
                    [
                        'id' => 'first_deposit',
                        'name' => 'Make your first deposit',
                        'description' => 'Deposit at least R$ 10 and get a bonus',
                        'coinReward' => 200,
                        'taskType' => 'ACTION',
                        'delayHours' => 0,
                        'isActive' => true,
                        'verificationRequired' => true,
                    ]
                ]
            ]
        ]);
    }

    /**
     * Get user's active tasks
     */
    public function userTasks()
    {
        return response()->json([
            'success' => true,
            'data'    => [
                'userTasks' => [
                    [
                        'id' => 'ut_1',
                        'taskId' => 'twitter_follow',
                        'status' => 'AVAILABLE',
                        'task' => [
                            'id' => 'twitter_follow',
                            'name' => 'Follow us on Twitter',
                            'coinReward' => 50,
                            'taskType' => 'SOCIAL'
                        ]
                    ]
                ]
            ]
        ]);
    }

    /**
     * Start a task
     */
    public function startTask($taskId)
    {
        return response()->json([
            'success' => true,
            'data'    => [
                'userTask' => [
                    'taskId' => $taskId,
                    'status' => 'IN_PROGRESS'
                ]
            ]
        ]);
    }

    /**
     * Complete a task
     */
    public function completeTask(Request $request, $taskId)
    {
        // Mock success
        return response()->json([
            'success' => true,
            'message' => 'Task completed! Coins will be verified shortly.',
            'data'    => [
                'userTask' => [
                    'taskId' => $taskId,
                    'status' => 'PENDING_VERIFY'
                ]
            ]
        ]);
    }

    /**
     * Get user's referrals
     */
    public function referrals()
    {
        $user = Auth::user();
        $referrals = $user->referrals()->get();

        return response()->json([
            'success' => true,
            'data'    => [
                'referrals' => $referrals->map(function ($ref) {
                    return [
                        'id'           => (string) $ref->id,
                        'referrerId'   => (string) $ref->ref_by,
                        'referredUserId' => (string) $ref->id,
                        'code'         => $ref->referral_code ?? $ref->username,
                        'status'       => 'COMPLETED',
                        'bonusAwarded' => true,
                        'createdAt'    => $ref->created_at->toIso8601String(),
                        'referred'     => [
                            'id'    => (string) $ref->id,
                            'email' => $ref->email,
                            'name'  => $ref->firstname . ' ' . $ref->lastname,
                        ],
                    ];
                })
            ]
        ]);
    }

    /**
     * Generate referral code
     */
    public function generateReferralCode()
    {
        $user = Auth::user();

        // If user already has a code, return it; otherwise generate and save
        if (!$user->referral_code) {
            $code = strtoupper(substr($user->username, 0, 6)) . str_pad($user->id, 4, '0', STR_PAD_LEFT);
            $user->referral_code = $code;
            $user->save();
        }

        return response()->json([
            'success' => true,
            'data'    => [
                'code' => $user->referral_code
            ]
        ]);
    }

    /**
     * Get referral details by code
     */
    public function referralByCode($code)
    {
        return response()->json([
            'isValid' => true,
            'bonusAmount' => 50
        ]);
    }
}
