<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class CorsMethod
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
        // return $next($request);
        return $next($request)->header('Access-Control-Allow-Origin','http://localhost:19006')->header('Access-Control-Allow-Methods','*');
    
    }
}
