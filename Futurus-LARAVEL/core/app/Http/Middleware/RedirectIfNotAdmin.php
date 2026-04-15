<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Support\Facades\Auth;
class RedirectIfNotAdmin
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle($request, Closure $next, $guard = 'admin')
    {
        if (!Auth::guard($guard)->check()) {
            return to_route('admin.login');
        }

        $admin = auth('admin')->user();
        if ($admin->ts && !$admin->tv) {
            if (!$request->routeIs('admin.twofactor.verify') && !$request->routeIs('admin.twofactor.verify.submit') && !$request->routeIs('admin.logout')) {
                return to_route('admin.twofactor.verify');
            }
        }

        return $next($request);
    }
}
