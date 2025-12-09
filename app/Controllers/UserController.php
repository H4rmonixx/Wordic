<?php

namespace App\Controllers;

require_once __DIR__ . '/../Core/Request.php';
require_once __DIR__ . '/../Core/LayoutEngine.php';

use App\Core\Request;
use App\Core\LayoutEngine;

class UserController {
    
    public function login(Request $request) : bool {
        echo LayoutEngine::resolveWebLayout('login.html');
        return true;
    }

    public function register(Request $request) : bool {
        echo LayoutEngine::resolveWebLayout('register.html');
        return true;
    }

    public function profile(Request $request) : bool {
        echo LayoutEngine::resolveWebLayout('profile.html');
        return true;
    }

    public function getUsername(Request $request) : bool {
        $user_id = $request->param('user_id');

        // Logged user
        if($user_id === null){
            echo json_encode(['username' => ""]);
            return true;
        }
        if($user_id == 'current'){
            if (session_status() === PHP_SESSION_NONE) session_start();
            if(!isset($_SESSION['user'])){
                echo json_encode(['username' => ""]);
                return true;
            }
            echo json_encode(['username' => $_SESSION['user']['username']]);
            return true;
        }
        
        // Specific user
        echo json_encode(['username' => "user_" . htmlspecialchars($user_id)]);
        return true;
    }
}