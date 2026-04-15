<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class Check2FA
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle(Request $request, Closure $next)
    {
        $admin = auth('admin')->user();
        if ($admin && $admin->ts && !$admin->tv) {
            if (!$request->routeIs('admin.twofactor.verify') && !$request->routeIs('admin.twofactor.verify.submit') && !$request->routeIs('admin.logout')) {
                return to_route('admin.twofactor.verify');
            }
        }

        $user = auth()->user();
        if ($user && $user->ts && !$user->tv) {
            if (!$request->routeIs('user.authorization') && !$request->routeIs('user.2fa.verify') && !$request->routeIs('user.logout')) {
                return to_route('user.authorization');
            }
        }

        return $next($request);
    }
}
