<?php

require_once __DIR__ . '/../Core/Router.php';

require_once __DIR__ . '/../Controllers/UserController.php';

use App\Core\Router;
use App\Controllers\UserController;

$router = new Router();

// UserController
$router->post('/login/try', [UserController::class, 'login'], [
    // No middleware
]);
$router->post('/user/{user_id}/username', [UserController::class, 'getUsername'], [
    // No middleware
]);

return $router;