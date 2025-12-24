<?php

namespace App\Middleware;

require_once __DIR__ . '/../Core/Request.php';
require_once __DIR__ . '/../Controllers/ErrorController.php';

require_once __DIR__ . '/../Models/Set.php';

use App\Core\Request;
use App\Controllers\ErrorController;

use App\Models\Set;

class SetOwnerOrPublicAuthMiddleware
{
    public function handle(Request $request, callable $next) {

        if (session_status() === PHP_SESSION_NONE) session_start();

        $setID = $request->param("id");
        if($setID === null){
            if($request->method() === 'GET'){
                ErrorController::$err_code = 404;
                return false;
            } else {
                echo json_encode(['success' => false, 'message' => 'ID is required']);
                exit;
            }
        }
            
        if(!Set::ifExists($setID)){
            if($request->method() === 'GET'){
                ErrorController::$err_code = 404;
                return false;
            } else {
                echo json_encode(['success' => false, 'message' => 'Set does not exist']);
                exit;
            }
        }

        $setAuthInfo = Set::getAuthInfo($setID);

        if($_SESSION['user']['user_id'] != $setAuthInfo['user_id'] && !$setAuthInfo['public']){
            if($request->method() === 'GET'){
                ErrorController::$err_code = 403;
                ErrorController::$err_msg = 'You have no permission to see this content!';
                return false;
            } else {
                echo json_encode(['success' => false, 'message' => 'You have no permission to see this content!']);
                exit;
            }
        }

        return $next($request);
    }
}
