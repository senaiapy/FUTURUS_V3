<?php

use Illuminate\Support\Facades\Route;

// SECURITY FIX: Cache clear endpoint now requires admin authentication
Route::middleware(['admin'])->get('/clear', function () {
    \Illuminate\Support\Facades\Artisan::call('optimize:clear');
    return response()->json(['success' => true, 'message' => 'Cache cleared successfully']);
});

Route::get('cron', 'CronController@cron')->name('cron');

// User Support Ticket
Route::controller('TicketController')->prefix('ticket')->name('ticket.')->group(function () {
    Route::get('/', 'supportTicket')->name('index');
    Route::get('new', 'openSupportTicket')->name('open');
    Route::post('create', 'storeSupportTicket')->name('store');
    Route::get('view/{ticket}', 'viewTicket')->name('view');
    Route::post('reply/{id}', 'replyTicket')->name('reply');
    Route::post('close/{id}', 'closeTicket')->name('close');
    Route::get('download/{attachment_id}', 'ticketDownload')->name('download');
});

Route::controller('SiteController')->group(function () {
    Route::get('/contact', 'contact')->name('contact');
    Route::post('/contact', 'contactSubmit');

    Route::get('/account-removal', 'accountRemoval')->name('account.removal');
    Route::post('/account-removal', 'accountRemovalSubmit');

    Route::get('/leaderboard', 'leaderboard')->name('leaderboard');
    Route::get('leaderboard/filter', 'leaderboardFilter')->name('leaderboard.filter');
    Route::get('/change/{lang?}', 'changeLanguage')->name('lang');

    Route::get('cookie-policy', 'cookiePolicy')->name('cookie.policy');

    Route::get('/cookie/accept', 'cookieAccept')->name('cookie.accept');

    Route::get('blogs', 'blogs')->name('blogs');

    Route::get('blog/{slug}', 'blogDetails')->name('blog.details');

    Route::post('/subscribe', 'subscribe')->name('subscribe');

    Route::get('policy/{slug}', 'policyPages')->name('policy.pages');

    Route::get('placeholder-image/{size}', 'placeholderImage')->withoutMiddleware('maintenance')->name('placeholder.image');
    Route::get('maintenance-mode', 'maintenance')->withoutMiddleware('maintenance')->name('maintenance');

    Route::get('/{slug}', 'pages')->name('pages');
    Route::get('/', 'index')->name('home');
});

Route::middleware(['auth', 'check.status', 'registration.complete'])->controller('MarketController')->prefix('user/markets')->name('markets.')->group(function () {
    Route::get('list/{category_slug?}', 'markets')->name('index');
    Route::get('filter', 'filterMarket')->name('filter');
    Route::post('search', 'searchMarkets')->name('search');
    Route::get('{slug}', 'marketDetails')->name('details');
    Route::get('/option/{option}/details', 'getOptionDetails')->name('option.details');
    Route::get('/multi/options/{id?}', 'getMultiOption')->name('multi.options');
    Route::get('/trending/{category_id?}', 'getTrendingMarkets')->name('trending');
    Route::get('/bookmarked', 'bookmarked')->name('bookmarked');
});
