<?php

namespace App\Controllers;

require_once __DIR__ . '/../Core/Request.php';
require_once __DIR__ . '/../Core/LayoutEngine.php';

require_once __DIR__ . '/../Models/User.php';

use App\Core\Request;
use App\Core\LayoutEngine;

use App\Models\User;

class UserController {
    
    public function pageLogin(Request $request) : bool {
        echo LayoutEngine::resolveWebLayout('login.html');
        return true;
    }

    public function pageRegister(Request $request) : bool {
        echo LayoutEngine::resolveWebLayout('register.html');
        return true;
    }

    public function pageProfile(Request $request) : bool {
        // Temporary
        if (session_status() === PHP_SESSION_NONE) session_start();
        session_destroy();
        header('Location: /');
        exit();
        
        echo LayoutEngine::resolveWebLayout('profile.html');
        return true;
    }

    public function getUsername(Request $request) : bool {
        header('Content-Type: application/json');

        if (session_status() === PHP_SESSION_NONE) session_start();

        if($request->param('code') == 'current'){
            echo json_encode(["success" => true, 'username' => $_SESSION['user']['username'] ?? "", 'message' => '']);
            return true;
        }

        $user_id = $request->param('id');
        if($user_id === null){
            echo json_encode(["success" => false, 'message' => 'User ID is required']);
            return true;
        }
        
        echo json_encode(["success" => true, 'username' => "user_" . htmlspecialchars($user_id), 'message' => '']);
        return true;
    }

    public function login(Request $request) : bool {
        header('Content-Type: application/json');

        $username = $request->post('username');
        $password = $request->post('password');
        if($username === null || $password === null){
            echo json_encode(['success' => false, 'message' => 'Username and password are required']);
            return true;
        }

        // Try to login
        $user = User::login($username, $password);
        if($user === null){
            echo json_encode(['success' => false, 'message' => 'Invalid credentials']);
            return true;
        }

        // Set session
        if (session_status() === PHP_SESSION_NONE) session_start();
        $_SESSION['user'] = [
            'user_id' => $user->user_id,
            'username' => $user->username,
            'email' => $user->email,
            'created_at' => $user->created_at
        ];

        echo json_encode(['success' => true, 'message' => 'Login successful']);
        return true;
    }
}