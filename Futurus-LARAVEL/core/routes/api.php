<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::namespace('Api')->name('api.')->group(function(){

    Route::controller('AppController')->group(function () {
        Route::get('general-setting','generalSetting');
        Route::get('get-countries','getCountries');
        Route::get('language/{key?}','getLanguage');
        Route::get('policies', 'policies');
        Route::get('policy/{slug}', 'policyContent');
        Route::get('faq', 'faq');
        Route::get('seo', 'seo');
        Route::get('get-extension/{act}','getExtension');
        Route::post('contact', 'submitContact');
        Route::get('cookie', 'cookie');
        Route::post('cookie/accept', 'cookieAccept');
        Route::get('custom-pages', 'customPages');
        Route::get('custom-page/{slug}', 'customPageData');
        Route::get('sections/{key?}', 'allSections');
        Route::get('ticket/{ticket}', 'viewTicket');
        Route::post('ticket/ticket-reply/{id}', 'replyTicket');
    });

    // Public Market Routes
    Route::controller('MarketController')->group(function(){
        Route::get('markets', 'index');
        Route::get('markets/{slug}', 'show');
        Route::get('market/categories', 'categories');
        Route::get('market/{id}/trends', 'trends');
    });

    // SECURITY FIX: Rate limiting for authentication endpoints to prevent brute force
    Route::prefix('auth')->group(function(){
        Route::controller('AuthController')->group(function(){
            // Rate limit: 5 attempts per minute for login/register
            Route::post('login', 'login')->middleware('throttle:5,1');
            Route::post('verify-2fa', 'verify2fa')->middleware('throttle:5,1');
            Route::post('register', 'register')->middleware('throttle:5,1');
            Route::post('logout', 'logout')->middleware('auth:sanctum');
            Route::get('user', 'user')->middleware('auth:sanctum');
            Route::get('profile', 'user')->middleware('auth:sanctum');
            Route::post('check-token', 'checkToken')->middleware('throttle:10,1');
        });

        Route::controller('ForgotPasswordController')->group(function(){
            // Rate limit: 3 attempts per minute for password reset
            Route::post('forgot-password', 'sendResetCodeEmail')->middleware('throttle:3,1');
            Route::post('verify-code', 'verifyCode')->middleware('throttle:5,1');
            Route::post('reset-password', 'reset')->middleware('throttle:3,1');
        });
    });

    Route::middleware('auth:sanctum')->group(function () {

        Route::post('user-data-submit', 'UserController@userDataSubmit');

        //authorization
        Route::middleware('registration.complete')->controller('AuthorizationController')->group(function(){
            Route::get('authorization', 'authorization');
            Route::get('resend-verify/{type}', 'sendVerifyCode');
            Route::post('verify-email', 'emailVerification');
            Route::post('verify-mobile', 'mobileVerification');
            Route::post('verify-g2fa', 'g2faVerification');
        });

        Route::middleware(['check.status'])->group(function () {

            // Asaas Payment API (Mobile) - Allow without profile completion for testing
            Route::controller('AsaasController')->prefix('asaas')->group(function () {
                // Balance
                Route::get('balance', 'balance');

                // Deposit
                Route::get('deposit/methods', 'depositMethods');
                Route::post('deposit/pix', 'depositPix');
                Route::post('deposit/card', 'depositCard');
                Route::post('deposit/status', 'depositStatus');

                // Withdraw
                Route::middleware('kyc')->group(function () {
                    Route::get('withdraw/methods', 'withdrawMethods');
                    Route::post('withdraw/pix', 'withdrawPix');
                    Route::post('withdraw/transfer', 'withdrawTransfer');
                });
                Route::post('withdraw/status', 'withdrawStatus');
            });

            // Wallet API (Mobile) - Allow without profile completion for testing
            Route::controller('WalletController')->prefix('wallet')->group(function(){
                Route::get('/', 'index');
                Route::get('/deposit-methods', 'depositMethods');
                Route::post('/deposit', 'initiateDeposit');
                Route::post('/deposit/confirm', 'confirmDeposit');
                Route::get('/withdraw-methods', 'withdrawMethods');
                Route::post('/withdraw', 'withdraw');
                Route::get('/transactions', 'transactions');
            });

            // Purchase/Bets API (Mobile) - Allow without profile completion for testing
            Route::controller('PurchaseController')->prefix('bets')->group(function(){
                Route::post('buy', 'store');
                Route::get('my-bets', 'index');
                Route::get('my-positions', 'positions');
            });

            Route::controller('PurchaseController')->prefix('purchase')->group(function(){
                Route::post('/', 'store');
                Route::get('/', 'index');
                Route::get('/positions', 'positions');
            });

            // 2FA Routes - Allow without profile completion (security feature)
            Route::controller('UserController')->group(function(){
                Route::prefix('users')->group(function() {
                    Route::get('2fa', 'show2faForm');
                    Route::get('2fa-mobile', 'show2faForm');
                    Route::post('2fa/enable', 'create2fa');
                    Route::post('2fa/disable', 'disable2fa');
                });
                Route::get('twofactor', 'show2faForm');
                Route::get('twofactor-mobile', 'show2faForm');
                Route::post('twofactor/enable', 'create2fa');
                Route::post('twofactor/disable', 'disable2fa');
            });

            Route::middleware('registration.complete')->group(function(){
                Route::controller('UserController')->group(function(){
                    Route::get('dashboard', 'dashboard');
                    Route::post('profile/update', 'profileUpdate');
                    Route::post('password/update', 'passwordUpdate');
                    Route::post('save/device/token', 'saveDeviceToken');
                    Route::get('user-info','userInfo');
                    //KYC
                    Route::get('kyc-form','kycForm');
                    Route::get('kyc-data','kycData');
                    Route::post('kyc-submit','kycSubmit');

                    //Report
                    Route::any('deposit/history', 'depositHistory');
                    Route::get('transactions','transactions');

                    Route::post('add-device-token', 'addDeviceToken');
                    Route::get('push-notifications', 'pushNotifications');
                    Route::post('push-notifications/read/{id}', 'pushNotificationsRead');

                    Route::post('delete-account', 'deleteAccount');

                });

                // Withdraw
                Route::controller('WithdrawController')->group(function(){
                    Route::middleware('kyc')->group(function(){
                        Route::get('withdraw-method', 'withdrawMethod');
                        Route::post('withdraw-request', 'withdrawStore');
                        Route::post('withdraw-request/confirm', 'withdrawSubmit');
                    });
                    Route::get('withdraw/history', 'withdrawLog');
                });

                // Payment
                Route::controller('PaymentController')->group(function(){
                    Route::get('deposit/methods', 'methods');
                    Route::post('deposit/insert', 'depositInsert');
                    Route::post('app/payment/confirm', 'appPaymentConfirm');
                    Route::post('manual/confirm', 'manualDepositConfirm');
                });

                // Private Market Routes
                Route::controller('MarketController')->group(function(){
                    Route::get('market/bookmarks', 'bookmarks');
                    Route::post('market/{marketId}/bookmark', 'toggleBookmark');
                });


                Route::controller('TicketController')->prefix('ticket')->group(function () {
                    Route::get('/', 'supportTicket');
                    Route::post('create', 'storeSupportTicket');
                    Route::get('view/{ticket}', 'viewTicket');
                    Route::post('reply/{id}', 'replyTicket');
                    Route::post('close/{id}', 'closeTicket');
                    Route::get('download/{attachment_id}', 'ticketDownload');
                });

                // Game (Gamification)
                Route::controller('GameController')->prefix('game')->group(function () {
                    Route::get('progress/dashboard', 'dashboard');
                    Route::get('coins/balance', 'coinBalance');
                    Route::get('coins/transactions', 'coinTransactions');
                    Route::get('tasks', 'allTasks');
                    Route::get('tasks/user/my-tasks', 'userTasks');
                    Route::post('progress/start/{taskId}', 'startTask');
                    Route::post('progress/complete/{taskId}', 'completeTask');
                    Route::prefix('referrals')->group(function(){
                        Route::get('/', 'referrals');
                        Route::post('generate', 'generateReferralCode');
                        Route::get('{code}', 'referralByCode');
                    });
                });

            });
        });

    });
});
