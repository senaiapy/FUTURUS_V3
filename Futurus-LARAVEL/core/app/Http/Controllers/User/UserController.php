<?php

namespace App\Http\Controllers\User;

use App\Constants\Status;
use App\Http\Controllers\Controller;
use App\Lib\FormProcessor;
use App\Lib\GoogleAuthenticator;
use App\Models\Deposit;
use App\Models\DeviceToken;
use App\Models\Form;
use App\Models\Market;
use App\Models\Purchase;
use App\Models\ReferralSetting;
use App\Models\SupportTicket;
use App\Models\Transaction;
use App\Models\User;
use App\Models\Withdrawal;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class UserController extends Controller {

    public function home() {

        $data['pageTitle']        = 'Dashboard';
        $user                     = auth()->user();
        $data['user']             = $user;
        $data['totalWithdraw']    = Withdrawal::where('user_id', $user->id)->where('status', Status::PAYMENT_SUCCESS)->sum('amount');
        $data['lastWithdraw']     = Withdrawal::where('user_id', $user->id)->where('status', Status::PAYMENT_SUCCESS)->latest()->first('amount');
        $data['totalDeposit']     = Deposit::where('user_id', $user->id)->where('status', Status::PAYMENT_SUCCESS)->sum('amount');
        $data['lastDeposit']      = Deposit::where('user_id', $user->id)->where('status', Status::PAYMENT_SUCCESS)->latest()->first('amount');
        $data['totalTicket']      = SupportTicket::where('user_id', $user->id)->count();
        $data['transactions']     = $data['user']->transactions->sortByDesc('id')->take(8);
        $data['referralEarnings'] = Transaction::where('remark', 'referral_commission')->where('user_id', auth()->id())->sum('amount');

        $data['submittedDeposits']  = Deposit::where('status', '!=', Status::PAYMENT_INITIATE)->where('user_id', $user->id)->sum('amount');
        $data['successfulDeposits'] = Deposit::successful()->where('user_id', $user->id)->sum('amount');
        $data['requestedDeposits']  = Deposit::where('user_id', $user->id)->sum('amount');
        $data['initiatedDeposits']  = Deposit::initiated()->where('user_id', $user->id)->sum('amount');
        $data['pendingDeposits']    = Deposit::pending()->where('user_id', $user->id)->sum('amount');
        $data['rejectedDeposits']   = Deposit::rejected()->where('user_id', $user->id)->sum('amount');

        $data['submittedWithdrawals']  = Withdrawal::where('status', '!=', Status::PAYMENT_INITIATE)->where('user_id', $user->id)->sum('amount');
        $data['successfulWithdrawals'] = Withdrawal::approved()->where('user_id', $user->id)->sum('amount');
        $data['rejectedWithdrawals']   = Withdrawal::rejected()->where('user_id', $user->id)->sum('amount');
        $data['initiatedWithdrawals']  = Withdrawal::initiated()->where('user_id', $user->id)->sum('amount');
        $data['requestedWithdrawals']  = Withdrawal::where('user_id', $user->id)->sum('amount');
        $data['pendingWithdrawals']    = Withdrawal::pending()->where('user_id', $user->id)->sum('amount');

        $data['recentPurchases'] = Purchase::with('option')->where('user_id', auth()->id())->latest()->limit(4)->get();
        $data['markets']         = Market::running()->where('type', Status::SINGLE_MARKET)->latest()->limit(4)->get();

        $userPurchases              = $user->purchases;
        $data['purchaseAmount']     = $userPurchases->sum('amount');
        $data['marketTrades']       = $userPurchases->count();
        $data['waitingTrades']      = $userPurchases->where('status', Status::WAITING)->count();
        $data['waitingTradeAmount'] = $userPurchases->where('status', Status::WAITING)->sum('amount');

        return view('Template::user.dashboard', $data);
    }

    public function depositHistory(Request $request) {
        $pageTitle = 'Deposit History';
        $deposits  = auth()->user()->deposits()->searchable(['trx'])->with(['gateway'])->orderBy('id', 'desc')->paginate(getPaginate());
        return view('Template::user.deposit_history', compact('pageTitle', 'deposits'));
    }

    public function show2faForm() {
        $ga        = new GoogleAuthenticator();
        $user      = auth()->user();
        $secret    = $ga->createSecret();
        $qrCodeUrl = $ga->getQRCodeGoogleUrl($user->username . '@' . gs('site_name'), $secret);
        $pageTitle = '2FA Security';
        return view('Template::user.twofactor', compact('pageTitle', 'secret', 'qrCodeUrl'));
    }

    public function create2fa(Request $request) {
        $user = auth()->user();
        $request->validate([
            'key'  => 'required',
            'code' => 'required',
        ]);
        $response = verifyG2fa($user, $request->code, $request->key);
        if ($response) {
            $user->tsc = $request->key;
            $user->ts  = Status::ENABLE;
            $user->save();
            $notify[] = ['success', 'Two factor authenticator activated successfully'];
            return back()->withNotify($notify);
        } else {
            $notify[] = ['error', 'Wrong verification code'];
            return back()->withNotify($notify);
        }
    }

    public function disable2fa(Request $request) {
        $request->validate([
            'code' => 'required',
        ]);

        $user     = auth()->user();
        $response = verifyG2fa($user, $request->code);
        if ($response) {
            $user->tsc = null;
            $user->ts  = Status::DISABLE;
            $user->save();
            $notify[] = ['success', 'Two factor authenticator deactivated successfully'];
        } else {
            $notify[] = ['error', 'Wrong verification code'];
        }
        return back()->withNotify($notify);
    }

    public function transactions() {
        $pageTitle = 'Transactions';
        $remarks   = Transaction::distinct('remark')->orderBy('remark')->get('remark');

        $transactions = Transaction::where('user_id', auth()->id())->searchable(['trx'])->filter(['trx_type', 'remark'])->orderBy('id', 'desc')->paginate(getPaginate());

        return view('Template::user.transactions', compact('pageTitle', 'transactions', 'remarks'));
    }

    public function kycForm() {
        if (auth()->user()->kv == Status::KYC_PENDING) {
            $notify[] = ['error', 'Your KYC is under review'];
            return to_route('user.home')->withNotify($notify);
        }
        if (auth()->user()->kv == Status::KYC_VERIFIED) {
            $notify[] = ['error', 'You are already KYC verified'];
            return to_route('user.home')->withNotify($notify);
        }
        $pageTitle = 'KYC Form';
        $form      = Form::where('act', 'kyc')->first();
        return view('Template::user.kyc.form', compact('pageTitle', 'form'));
    }

    public function kycData() {
        $user      = auth()->user();
        $pageTitle = 'KYC Data';
        abort_if($user->kv == Status::VERIFIED, 403);
        return view('Template::user.kyc.info', compact('pageTitle', 'user'));
    }

    public function kycSubmit(Request $request) {
        $form           = Form::where('act', 'kyc')->firstOrFail();
        $formData       = $form->form_data;
        $formProcessor  = new FormProcessor();
        $validationRule = $formProcessor->valueValidation($formData);
        $request->validate($validationRule);

        $user = auth()->user();
        foreach (isset($user->kyc_data) ? $user->kyc_data : [] as $kycData) {
            if ($kycData->type == 'file') {
                fileManager()->removeFile(getFilePath('verify') . '/' . $kycData->value);
            }
        }
        $userData                   = $formProcessor->processFormData($request, $formData);
        $user->kyc_data             = $userData;
        $user->kyc_rejection_reason = null;
        $user->kv                   = Status::KYC_PENDING;
        $user->save();

        $notify[] = ['success', 'KYC data submitted successfully'];
        return to_route('user.home')->withNotify($notify);

    }

    public function userData() {
        $user = auth()->user();

        if ($user->profile_complete == Status::YES) {
            return to_route('user.home');
        }

        $pageTitle  = 'User Data';
        $info       = json_decode(json_encode(getIpInfo()), true);
        $mobileCode = 'BR';
        $countries  = json_decode(file_get_contents(resource_path('views/partials/country.json')));

        return view('Template::user.user_data', compact('pageTitle', 'user', 'countries', 'mobileCode'));
    }

    public function userDataSubmit(Request $request) {

        $user = auth()->user();

        if ($user->profile_complete == Status::YES) {
            return to_route('user.home');
        }

        $countryData  = (array) json_decode(file_get_contents(resource_path('views/partials/country.json')));
        $countryCodes = implode(',', array_keys($countryData));
        $mobileCodes  = implode(',', array_column($countryData, 'dial_code'));
        $countries    = implode(',', array_column($countryData, 'country'));

        $request->validate([
            'country_code' => 'required|in:' . $countryCodes,
            'country'      => 'required|in:' . $countries,
            'mobile_code'  => 'required|in:' . $mobileCodes,
            'username'     => 'required|unique:users|min:6',
            'mobile'       => ['required', 'regex:/^([0-9]*)$/', Rule::unique('users')->where('dial_code', $request->mobile_code)],
        ]);

        if (preg_match("/[^a-z0-9_]/", trim($request->username))) {
            $notify[] = ['info', 'Username can contain only small letters, numbers and underscore.'];
            $notify[] = ['error', 'No special character, space or capital letters in username.'];
            return back()->withNotify($notify)->withInput($request->all());
        }

        $user->country_code = $request->country_code;
        $user->mobile       = $request->mobile;
        $user->username     = $request->username;

        $user->address      = $request->address;
        $user->city         = $request->city;
        $user->state        = $request->state;
        $user->zip          = $request->zip;
        $user->country_name = isset($request->country) ? $request->country : '';
        $user->dial_code    = $request->mobile_code;

        $user->profile_complete = Status::YES;
        $user->save();

        if (gs('registration_commission')) {
            $refUser = $user->referrer;
            if ($refUser) {
                $refUser->balance += gs('register_bonus');
                $refUser->save();

                $transaction               = new Transaction();
                $transaction->user_id      = $refUser->id;
                $transaction->amount       = gs('register_bonus');
                $transaction->charge       = 0;
                $transaction->trx_type     = '+';
                $transaction->details      = 'You have got register bonus';
                $transaction->remark       = 'register_bonus';
                $transaction->trx          = getTrx();
                $transaction->post_balance = $refUser->balance;
                $transaction->save();

                notify($refUser, 'REGISTER_REFERRAL_BONUS', [
                    'username'     => $refUser->username,
                    'amount'       => getAmount(gs('register_bonus')),
                    'trx'          => $transaction->trx,
                    'post_balance' => showAmount($refUser->balance),
                ]);
            }
        }

        return to_route('user.home');
    }

    public function addDeviceToken(Request $request) {

        $validator = Validator::make($request->all(), [
            'token' => 'required',
        ]);

        if ($validator->fails()) {
            return ['success' => false, 'errors' => $validator->errors()->all()];
        }

        $deviceToken = DeviceToken::where('token', $request->token)->first();

        if ($deviceToken) {
            return ['success' => true, 'message' => 'Already exists'];
        }

        $deviceToken          = new DeviceToken();
        $deviceToken->user_id = auth()->user()->id;
        $deviceToken->token   = $request->token;
        $deviceToken->is_app  = Status::NO;
        $deviceToken->save();

        return ['success' => true, 'message' => 'Token saved successfully'];
    }

    public function downloadAttachment($fileHash) {
        $filePath  = decrypt($fileHash);
        $extension = pathinfo($filePath, PATHINFO_EXTENSION);
        $title     = slug(gs('site_name')) . '- attachments.' . $extension;
        try {
            $mimetype = mime_content_type($filePath);
        } catch (\Exception $e) {
            $notify[] = ['error', 'File does not exists'];
            return back()->withNotify($notify);
        }
        header('Content-Disposition: attachment; filename="' . $title);
        header("Content-Type: " . $mimetype);
        return readfile($filePath);
    }

    public function referrals() {
        $pageTitle = 'Referrals';
        $user      = User::where('id', auth()->id())->with('allReferrals')->firstOrFail();
        $maxLevel  = ReferralSetting::max('level');
        return view('Template::user.referrals', compact('pageTitle', 'user', 'maxLevel'));
    }

    public function gamify() {
        $pageTitle = 'Gamify Center';
        $user      = auth()->user();

        // Data matches what GameController API provides roughly
        $data['coinBalance']      = 0; // TODO: implement coin_balance if added to DB
        $data['totalCoinsEarned'] = 0;
        $data['referralCode']     = $user->referral_code ?? $user->username;
        $data['completedTasks']   = 0;
        $data['totalTasks']       = 3;
        $data['referralCount']    = $user->referrals()->count();

        // Tasks (could be fetched from a DB table if it existed, for now mock like API)
        $data['tasks'] = [
            [
                'id' => 'twitter_follow',
                'name' => 'Follow us on Twitter',
                'description' => 'Follow @FuturusMarkets to earn coins',
                'reward' => 50,
                'icon' => 'la la-twitter',
                'url' => 'https://twitter.com/futurus',
            ],
            [
                'id' => 'first_deposit',
                'name' => 'Make your first deposit',
                'description' => 'Deposit at least R$ 10 and get a bonus',
                'reward' => 200,
                'icon' => 'la la-wallet',
                'url' => route('user.deposit.index'),
            ]
        ];

        return view('Template::user.gamify', compact('pageTitle', 'user', 'data'));
    }
}

