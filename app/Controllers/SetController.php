<?php

namespace App\Controllers;

require_once __DIR__ . '/../Core/Request.php';
require_once __DIR__ . '/../Core/LayoutEngine.php';

require_once __DIR__ . '/../Models/Set.php';

use App\Core\Request;
use App\Core\LayoutEngine;

use App\Models\Set;

class SetController {
    
    public function getSetWords(Request $request) : bool {
        header('Content-Type: application/json');

        $set_id = $request->param('set_id');
        if($set_id === null){
            echo json_encode(['success' => false, 'words' => [], 'message' => 'Set ID is required']);
            return true;
        }

        if(!Set::ifExists((int)$set_id)){
            echo json_encode(['success' => false, 'words' => [], 'message' => 'Set not found']);
            return true;
        }

        if (session_status() === PHP_SESSION_NONE) session_start();
        $user_id = (int)($_SESSION['user']['user_id'] ?? null);
        $set = Set::getByID((int)$set_id);
        if(!$set->public && $set->user_id !== $user_id){
            echo json_encode(['success' => false, 'words' => [], 'message' => 'Set is private']);
            return true;
        }

        $words = Set::getWords((int)$set_id);
        echo json_encode(['success' => true, 'words' => $words, 'message' => '']);
        return true;
    }
    
    public function getUserSets(Request $request) : bool {
        header('Content-Type: application/json');

        $user_id = $request->param('user_id');
        if($user_id === null){
            echo json_encode(['success' => false, 'sets' => [], 'message' => 'User ID is required']);
            return true;
        }

        // Logged user
        if($user_id == 'current'){
            if (session_status() === PHP_SESSION_NONE) session_start();
            if(!isset($_SESSION['user'])){
                echo json_encode(['success' => false, 'sets' => [], 'message' => 'No user logged in']);
                return true;
            }
            echo json_encode(['success' => true, 'sets' => Set::getByUserID($_SESSION['user']['user_id']), 'message' => '']);
            return true;
        }
        
        // Specific user
        echo json_encode(['success' => true, 'sets' => Set::getByUserID((int)$user_id, true), 'message' => '']);
        return true;
    }
    
}