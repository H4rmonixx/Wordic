<?php

namespace App\Middleware;

require_once __DIR__ . '/../Core/Request.php';
use App\Core\Request;

class APIUserAuthMiddleware
{
    public function handle(Request $request, callable $next) {

        if (session_status() === PHP_SESSION_NONE) session_start();

        if(!isset($_SESSION['user'])){
            echo json_encode(['success' => false, 'message' => 'Unauthorized']);
            return true;
        }

        return $next($request);
    }
}
