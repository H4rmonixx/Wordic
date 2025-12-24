<?php

namespace App\Middleware;

require_once __DIR__ . '/../Core/Request.php';
require_once __DIR__ . '/../Controllers/ErrorController.php';

use App\Core\Request;
use App\Controllers\ErrorController;

class RetrieveIDMiddleware
{
    public function handle(Request $request, callable $next) {

        if (session_status() === PHP_SESSION_NONE) session_start();

        $code = $request->param("code");
        if($code === null){
            if($request->method() === 'GET'){
                ErrorController::$err_code = 404;
                return false;
            } else {
                echo json_encode(['success' => false, 'message' => 'ID is required']);
                exit;
            }
        }

        if($code == 'current'){
            $request->setParam("id", $_SESSION['user']['user_id'] ?? null);
            $request->setParam("public_only", false);
        } else if (preg_match('/^(\d+)(?:-|$)/', $code, $matches)) {
            $id = (int) $matches[1];
            $request->setParam("id", $id);
        } else {
            if($request->method() === 'GET'){
                ErrorController::$err_code = 404;
                return false;
            } else {
                echo json_encode(['success' => false, 'message' => 'Wrong ID passed']);
                exit;
            }
        }

        return $next($request);
    }
}
