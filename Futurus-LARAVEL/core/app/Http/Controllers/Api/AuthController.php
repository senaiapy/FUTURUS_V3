<?php

namespace App\Http\Controllers\Api;

use App\Constants\Status;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Illuminate\Support\Facades\Log;

class AuthController extends Controller
{
    /**
     * Login user and return token
     */
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|string|email',
            'password' => 'required|string|min:6',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $fieldType = filter_var($request->email, FILTER_VALIDATE_EMAIL) ? 'email' : 'username';

        $user = User::where($fieldType, $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid credentials',
            ], 401);
        }

        if ($user->status == Status::USER_BAN) {
            return response()->json([
                'success' => false,
                'message' => 'Your account has been banned',
            ], 403);
        }

        // Check if 2FA is enabled - require verification before returning token
        if ($user->ts == Status::ENABLE) {
            return response()->json([
                'success' => true,
                'message' => '2FA verification required',
                'requires2fa' => true,
                'userId' => $user->id,
            ]);
        }

        // Create token
        $token = $user->createToken('mobile-app');

        return response()->json([
            'success' => true,
            'message' => 'Login successful',
            'access_token' => $token->plainTextToken,
            'user' => $this->formatUser($user),
        ]);
    }

    /**
     * Register new user
     */
    public function register(Request $request)
    {
        Log::info('Registration attempt:', $request->all());
        if (!gs('registration')) {
            return response()->json([
                'success' => false,
                'message' => 'Registration is currently disabled',
            ], 403);
        }

        $passwordValidation = Password::min(6);
        if (gs('secure_password')) {
            $passwordValidation = $passwordValidation->mixedCase()->numbers()->symbols()->uncompromised();
        }

        $validator = Validator::make($request->all(), [
            'name' => 'nullable|string|max:100',
            'firstname' => 'required_without:name|string|max:50',
            'lastname' => 'required_without:name|string|max:50',
            'email' => 'required|string|email|unique:users',
            'password' => ['required', $passwordValidation],
            'phone' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        // Handle name splitting
        $firstname = $request->firstname;
        $lastname = $request->lastname;
        if ($request->name && (!$firstname || !$lastname)) {
            $nameParts = explode(' ', $request->name, 2);
            $firstname = $nameParts[0];
            $lastname = isset($nameParts[1]) ? $nameParts[1] : $firstname;
        }

        // Create user
        $user = new User();
        $user->email = $request->email;
        $user->firstname = $firstname;
        $user->lastname = $lastname;
        $user->username = explode('@', $request->email)[0] . rand(100, 999);
        $user->mobile = $request->phone ?? null;
        $user->dial_code = $request->dial_code ?? null;
        $user->password = Hash::make($request->password);
        $user->kv = gs('kv') ? Status::NO : Status::YES;
        $user->ev = gs('ev') ? Status::NO : Status::YES;
        $user->sv = gs('sv') ? Status::NO : Status::YES;
        $user->ts = Status::DISABLE;
        $user->tv = Status::ENABLE;
        $user->status = Status::USER_ACTIVE;
        $user->save();

        // Create token
        $token = $user->createToken('mobile-app');

        return response()->json([
            'success' => true,
            'message' => 'Registration successful',
            'access_token' => $token->plainTextToken,
            'user' => $this->formatUser($user),
        ], 201);
    }

    /**
     * Logout user
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Logged out successfully',
        ]);
    }

    /**
     * Get current user info
     */
    public function user(Request $request)
    {
        return response()->json([
            'success' => true,
            'data' => $this->formatUser($request->user()),
        ]);
    }

    /**
     * Check if token is valid
     */
    public function checkToken(Request $request)
    {
        if (!$request->user()) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid token',
            ], 401);
        }

        return response()->json([
            'success' => true,
            'message' => 'Token is valid',
        ]);
    }

    /**
     * Format user data for mobile app
     */
    private function formatUser(User $user): array
    {
        return [
            'id' => (string) $user->id,
            'email' => $user->email,
            'name' => trim($user->firstname . ' ' . $user->lastname),
            'firstname' => $user->firstname,
            'lastname' => $user->lastname,
            'phone' => $user->mobile,
            'dialCode' => $user->dial_code,
            'address' => $user->address,
            'city' => $user->city,
            'country' => $user->country,
            'postalCode' => $user->zip,
            'balance' => (string) $user->balance,
            'balanceBonus' => '0',
            'totalSharesBought' => (string) $user->total_shares_bought,
            'role' => 'USER',
            'emailVerified' => $user->ev == Status::VERIFIED,
            'phoneVerified' => $user->sv == Status::VERIFIED,
            'kycVerified' => $user->kv == Status::VERIFIED,
            'twoFactorEnabled' => $user->ts == Status::ENABLE,
            'createdAt' => $user->created_at->toIso8601String(),
            'updatedAt' => $user->updated_at->toIso8601String(),
        ];
    }

    /**
     * Verify 2FA code and complete login
     */
    public function verify2fa(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'userId' => 'required|integer',
            'code' => 'required|string|size:6',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = User::find($request->userId);

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found',
            ], 404);
        }

        // Verify 2FA code
        $isValid = verifyG2fa($user, $request->code);

        if (!$isValid) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid 2FA code',
            ], 401);
        }

        // Create token after successful 2FA verification
        $token = $user->createToken('mobile-app');

        return response()->json([
            'success' => true,
            'message' => 'Login successful',
            'access_token' => $token->plainTextToken,
            'user' => $this->formatUser($user),
        ]);
    }
}
