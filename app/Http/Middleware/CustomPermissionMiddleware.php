<?php

namespace App\Http\Middleware;

use App\Helper\Response as HelperResponse;
use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class CustomPermissionMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, $permission): Response
    {
        //check if the user is logged in
        if (!Auth::check()) {
            return HelperResponse::error(
                'You must be logged in to access this resource',
                'You are not authorized to access this resource, please login',
                401
            );
        }

        $user = Auth::user()->getAuthIdentifier();
        //check if the user has the required permission
        if (!User::find($user)->hasPermissionTo($permission)) {
            return HelperResponse::error(
                'You do not have permission to access this resource',
                'You are not authorized to access this resource, you need to permission',
                401
            );
        }

        return $next($request);
    }
}
