<?php

namespace App\Middleware;

require_once __DIR__ . '/../Core/Request.php';
require_once __DIR__ . '/../Controllers/ErrorController.php';

require_once __DIR__ . '/../Models/User.php';

use App\Core\Request;
use App\Controllers\ErrorController;

use App\Models\User;

class UserExistsMiddleware
{
    public function handle(Request $request, callable $next) {

        $userID = $request->param("id");
        if($userID === null){
            if($request->method() === 'GET'){
                ErrorController::$err_code = 404;
                return false;
            } else {
                echo json_encode(['success' => false, 'message' => 'ID is required']);
                exit;
            }
        }
            
        if(!User::ifExists($userID)){
            if($request->method() === 'GET'){
                ErrorController::$err_code = 404;
                return false;
            } else {
                echo json_encode(['success' => false, 'message' => 'User does not exist']);
                exit;
            }
        }

        return $next($request);
    }
}