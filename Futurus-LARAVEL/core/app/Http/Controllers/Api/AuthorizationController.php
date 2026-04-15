<?php

namespace App\Http\Controllers\Api;

use Carbon\Carbon;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Constants\Status;

class AuthorizationController extends Controller
{
    protected function checkCodeValidity($user, $addMin = 2)
    {
        if (!$user->ver_code_send_at) {
            return false;
        }
        if ($user->ver_code_send_at->addMinutes($addMin) < Carbon::now()) {
            return false;
        }
        return true;
    }

    public function authorization()
    {
        $user = auth()->user();

        $data = [
            'is_banned' => !$user->status,
            'email_verified' => (bool) $user->ev,
            'mobile_verified' => (bool) $user->sv,
            'two_factor_verified' => (bool) $user->tv,
        ];

        if (!$user->status) {
            return response()->json([
                'success' => false,
                'message' => 'Your account has been banned',
                'data' => $data
            ], 403);
        }

        if (!$user->ev || !$user->sv || !$user->tv) {
            return response()->json([
                'success' => true,
                'message' => 'Authorization required',
                'data' => $data
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'User is fully authorized',
            'data' => $data
        ]);
    }

    public function sendVerifyCode($type)
    {
        $user = auth()->user();

        if ($this->checkCodeValidity($user)) {
            $targetTime = $user->ver_code_send_at->addMinutes(2)->timestamp;
            $delay = $targetTime - time();
            return response()->json([
                'success' => false,
                'message' => 'Please try after ' . $delay . ' seconds'
            ], 429);
        }

        $user->ver_code = verificationCode(6);
        $user->ver_code_send_at = Carbon::now();
        $user->save();

        if ($type == 'email') {
            $notifyTemplate = 'EVER_CODE';
        } else {
            $notifyTemplate = 'SVER_CODE';
        }

        notify($user, $notifyTemplate, [
            'code' => $user->ver_code
        ], [$type]);

        return response()->json([
            'success' => true,
            'message' => 'Verification code sent successfully'
        ]);
    }

    public function emailVerification(Request $request)
    {
        $request->validate([
            'code' => 'required'
        ]);

        $user = auth()->user();

        if ($user->ver_code == $request->code) {
            $user->ev = Status::VERIFIED;
            $user->ver_code = null;
            $user->ver_code_send_at = null;
            $user->save();

            return response()->json([
                'success' => true,
                'message' => 'Email verified successfully'
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'Verification code didn\'t match!'
        ], 422);
    }

    public function mobileVerification(Request $request)
    {
        $request->validate([
            'code' => 'required',
        ]);

        $user = auth()->user();

        if ($user->ver_code == $request->code) {
            $user->sv = Status::VERIFIED;
            $user->ver_code = null;
            $user->ver_code_send_at = null;
            $user->save();

            return response()->json([
                'success' => true,
                'message' => 'Mobile verified successfully'
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'Verification code didn\'t match!'
        ], 422);
    }

    public function g2faVerification(Request $request)
    {
        $user = auth()->user();
        $request->validate([
            'code' => 'required',
        ]);

        $response = verifyG2fa($user, $request->code);

        if ($response) {
            return response()->json([
                'success' => true,
                'message' => '2FA verified successfully'
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'Wrong verification code'
        ], 422);
    }
}
