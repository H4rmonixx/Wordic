<?php

namespace App\Middleware;

require_once __DIR__ . '/../Core/Request.php';
use App\Core\Request;

class GuestAuthMiddleware
{
    public function handle(Request $request, callable $next) {

        if (session_status() === PHP_SESSION_NONE) session_start();

        if(isset($_SESSION['user'])){
            header("Location: /profile");
            exit;
        }

        return $next($request);
    }
}
