<?php

namespace App\Middleware;

require_once __DIR__ . '/../Core/Request.php';
use App\Core\Request;

class UserAuthMiddleware
{
    public function handle(Request $request, callable $next) {

        if (session_status() === PHP_SESSION_NONE) session_start();

        if(!isset($_SESSION['user'])){
            if($request->method() === 'GET'){
                header("Location: /login");
                exit;
            } else {
                echo json_encode(['success' => false, 'message' => 'Unauthorized']);
                exit;
            }
        }

        $request->setParam("user_id", $_SESSION['user']['user_id']);

        return $next($request);
    }
}
