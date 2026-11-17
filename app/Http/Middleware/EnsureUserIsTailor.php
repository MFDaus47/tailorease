<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsTailor
{
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->user()?->getAttribute('role') !== 'tailor') {
            abort(403);
        }

        return $next($request);
    }
}
