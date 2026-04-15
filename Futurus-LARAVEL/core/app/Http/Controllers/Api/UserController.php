<?php

namespace App\Http\Controllers\Api;

use App\Constants\Status;
use App\Http\Controllers\Controller;
use App\Lib\GoogleAuthenticator;
use App\Models\DeviceToken;
use App\Models\Purchase;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class UserController extends Controller
{
    /**
     * Get user dashboard data
     */
    public function dashboard()
    {
        $user = Auth::user();
        
        $totalInvested = Purchase::where('user_id', $user->id)->sum('amount');
        $totalProfit = Purchase::where('user_id', $user->id)->where('status', 1)->sum('profit');
        $totalTransactions = Transaction::where('user_id', $user->id)->count();

        return response()->json([
            'success' => true,
            'data' => [
                'user' => $user,
                'stats' => [
                    'total_invested' => (string) $totalInvested,
                    'total_profit' => (string) $totalProfit,
                    'total_transactions' => $totalTransactions,
                    'balance' => (string) $user->balance,
                ]
            ]
        ]);
    }

    /**
     * Update user profile
     */
    public function profileUpdate(Request $request)
    {
        $user = Auth::user();
        
        $validator = Validator::make($request->all(), [
            'firstname' => 'required|max:40',
            'lastname' => 'required|max:40',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first(),
            ], 400);
        }

        $user->firstname = $request->firstname;
        $user->lastname = $request->lastname;
        
        $user->address = [
            'country' => $request->country,
            'address' => $request->address,
            'state' => $request->state,
            'zip' => $request->zip,
            'city' => $request->city,
        ];
        
        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'Profile updated successfully',
            'data' => [
                'user' => $user
            ]
        ]);
    }

    /**
     * Update user password
     */
    public function passwordUpdate(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'current_password' => 'required',
            'password' => 'required|min:5|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first(),
            ], 400);
        }

        $user = Auth::user();

        if (Hash::check($request->current_password, $user->password)) {
            $user->password = Hash::make($request->password);
            $user->save();
            
            return response()->json([
                'success' => true,
                'message' => 'Password changed successfully',
            ]);
        } else {
            return response()->json([
                'success' => false,
                'message' => 'The password doesn\'t match!',
            ], 400);
        }
    }

    /**
     * Save/Update device token for push notifications
     */
    public function saveDeviceToken(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'token' => 'required',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first(),
            ], 400);
        }

        $deviceToken = DeviceToken::where('token', $request->token)->first();
        if (!$deviceToken) {
            $deviceToken = new DeviceToken();
        }
        
        $deviceToken->user_id = Auth::id();
        $deviceToken->token = $request->token;
        $deviceToken->is_app = 1;
        $deviceToken->save();

        return response()->json([
            'success' => true,
            'message' => 'Token saved successfully',
        ]);
    }

    /**
     * Get 2FA data for setup
     */
    public function show2faForm()
    {
        $ga = new GoogleAuthenticator();
        $user = Auth::user();
        
        $secret = $user->tsc;
        if (!$secret) {
            $secret = $ga->createSecret();
            $user->tsc = $secret;
            $user->save();
        }

        $appName = gs('site_name');
        $label = $user->username . '@' . $appName;
        $qrCodeUrl = $ga->getQRCodeGoogleUrl($label, $secret, $appName);
        
        // Construct standard TOTP URI for mobile native QR generation
        $totpUri = "otpauth://totp/" . urlencode($label) . "?secret={$secret}&issuer=" . urlencode($appName);

        return responseSuccess('2FA setup data', null, [
            'enabled' => $user->ts == Status::ENABLE,
            'secret' => $secret,
            'qrCodeUrl' => $qrCodeUrl,
            'totpUri' => $totpUri
        ]);
    }

    /**
     * Enable 2FA
     */
    public function create2fa(Request $request)
    {
        $user = Auth::user();
        $validator = Validator::make($request->all(), [
            'key' => 'required',
            'code' => 'required',
        ]);

        if ($validator->fails()) {
            return responseError('Validation error', $validator->errors());
        }

        $response = verifyG2fa($user, $request->code, $request->key);
        if ($response) {
            $user->tsc = $request->key;
            $user->ts = Status::ENABLE;
            $user->save();
            return responseSuccess('2FA enabled successfully', null);
        } else {
            return responseError('Wrong verification code', null);
        }
    }

    /**
     * Disable 2FA
     */
    public function disable2fa(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'code' => 'required',
        ]);

        if ($validator->fails()) {
            return responseError('Validation error', $validator->errors());
        }

        $user = Auth::user();
        $response = verifyG2fa($user, $request->code);
        if ($response) {
            $user->tsc = null;
            $user->ts = Status::DISABLE;
            $user->save();
            return responseSuccess('2FA disabled successfully', null);
        } else {
            return responseError('Wrong verification code', null);
        }
    }
}
