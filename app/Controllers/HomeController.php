<?php

namespace App\Controllers;

require_once __DIR__ . '/../Core/Request.php';
require_once __DIR__ . '/../Core/LayoutEngine.php';

use App\Core\Request;
use App\Core\LayoutEngine;

class HomeController {
    
    public function index(Request $request) : bool {
        echo LayoutEngine::resolveWebLayout('index.html');
        return true;
    }
    
}