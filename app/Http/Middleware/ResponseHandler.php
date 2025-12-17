<?php

namespace App\Http\Middleware;

use App\Helper\Response as HelperResponse;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class ResponseHandler
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        if ($response->getStatusCode() < 200 || $response->getStatusCode() >= 300) {
            $content = $response->getContent();
            $content = json_decode($content, true);
            return HelperResponse::error($content['errors'] ?? null, $content['message'] ?? null, $response->getStatusCode());
        }
        return $response;
    }
}
