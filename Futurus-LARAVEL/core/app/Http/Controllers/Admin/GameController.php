<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class GameController extends Controller
{
    public function tasksIndex()
    {
        $pageTitle = "Game Tasks";
        $tasks = [
            [
                'id' => 1,
                'name' => 'Complete Profile',
                'description' => 'Fill in your profile information to get started',
                'type' => 'ONE_TIME',
                'coin_reward' => 100,
                'status' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 2,
                'name' => 'Make First Trade',
                'description' => 'Complete your first prediction market trade',
                'type' => 'ONE_TIME',
                'coin_reward' => 200,
                'status' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 3,
                'name' => 'Refer a Friend',
                'description' => 'Invite a friend using your referral code',
                'type' => 'REFERRAL',
                'coin_reward' => 500,
                'status' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        return view('admin.game.tasks.index', compact('pageTitle', 'tasks'));
    }

    public function tasksCreate()
    {
        $pageTitle = "Create New Task";
        return view('admin.game.tasks.create', compact('pageTitle'));
    }

    public function tasksStore(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'type' => 'required|in:ONE_TIME,DAILY,WEEKLY,REFERRAL',
            'coin_reward' => 'required|numeric|min:0',
        ]);

        $notification = 'Task created successfully.';
        $notify[] = ['success', $notification];

        return redirect()->route('admin.game.tasks.index')->withNotify($notify);
    }

    public function tasksEdit($id)
    {
        $pageTitle = "Edit Task";
        $task = [
            'id' => $id,
            'name' => 'Sample Task',
            'description' => 'Sample task description',
            'type' => 'ONE_TIME',
            'coin_reward' => 100,
            'status' => 1,
        ];

        return view('admin.game.tasks.edit', compact('pageTitle', 'task'));
    }

    public function tasksUpdate(Request $request, $id)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'type' => 'required|in:ONE_TIME,DAILY,WEEKLY,REFERRAL',
            'coin_reward' => 'required|numeric|min:0',
        ]);

        $notification = 'Task updated successfully.';
        $notify[] = ['success', $notification];

        return redirect()->route('admin.game.tasks.index')->withNotify($notify);
    }

    public function tasksStatus($id)
    {
        $notification = 'Task status updated successfully.';
        $notify[] = ['success', $notification];
        return back()->withNotify($notify);
    }

    public function tasksDelete($id)
    {
        $notification = 'Task deleted successfully.';
        $notify[] = ['success', $notification];
        return redirect()->route('admin.game.tasks.index')->withNotify($notify);
    }

    public function referralsIndex()
    {
        $pageTitle = "Referrals";
        $referrals = User::whereNotNull('referral_code')
            ->select('id', 'username', 'email', 'referral_code', 'created_at')
            ->latest()
            ->paginate(getPaginate());

        return view('admin.game.referrals.index', compact('pageTitle', 'referrals'));
    }

    public function referralsShow($id)
    {
        $pageTitle = "Referral Details";
        $referral = User::find($id);

        if (!$referral) {
            return redirect()->route('admin.game.referrals.index');
        }

        return view('admin.game.referrals.show', compact('pageTitle', 'referral'));
    }

    public function referralsApprove($id)
    {
        $notification = 'Referral approved successfully.';
        $notify[] = ['success', $notification];
        return back()->withNotify($notify);
    }

    public function referralsReject($id)
    {
        $notification = 'Referral rejected successfully.';
        $notify[] = ['success', $notification];
        return back()->withNotify($notify);
    }

    public function coinsTransactions()
    {
        $pageTitle = "Coin Transactions";
        $transactions = [
            [
                'id' => 1,
                'user_id' => 1,
                'amount' => 100,
                'type' => 'EARNED',
                'source' => 'TASK_COMPLETION',
                'reference' => 'Complete Profile',
                'created_at' => now(),
            ],
            [
                'id' => 2,
                'user_id' => 1,
                'amount' => 200,
                'type' => 'EARNED',
                'source' => 'TASK_COMPLETION',
                'reference' => 'Make First Trade',
                'created_at' => now()->subDay(),
            ],
            [
                'id' => 3,
                'user_id' => 2,
                'amount' => 500,
                'type' => 'EARNED',
                'source' => 'REFERRAL',
                'reference' => 'Referral Bonus',
                'created_at' => now()->subDays(2),
            ],
        ];

        return view('admin.game.coins.transactions', compact('pageTitle', 'transactions'));
    }

    public function coinsTransactionShow($id)
    {
        $pageTitle = "Transaction Details";
        $transaction = [
            'id' => $id,
            'user_id' => 1,
            'amount' => 100,
            'type' => 'EARNED',
            'source' => 'TASK_COMPLETION',
            'reference' => 'Complete Profile',
            'created_at' => now(),
        ];

        return view('admin.game.coins.show', compact('pageTitle', 'transaction'));
    }

    public function statistics()
    {
        $pageTitle = "Game Statistics";
        $stats = [
            'total_users' => User::count(),
            'total_coins_earned' => 50000,
            'total_tasks_completed' => 1250,
            'total_referrals' => 85,
            'pending_verifications' => 0,
        ];

        return view('admin.game.statistics', compact('pageTitle', 'stats'));
    }
}
