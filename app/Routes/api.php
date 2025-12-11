<?php

require_once __DIR__ . '/../Core/Router.php';

require_once __DIR__ . '/../Controllers/UserController.php';
require_once __DIR__ . '/../Controllers/SetController.php';

require_once __DIR__ . '/../Middleware/APIUserAuthMiddleware.php';

use App\Core\Router;

use App\Controllers\UserController;
use App\Controllers\SetController;

use App\Middleware\APIUserAuthMiddleware;

$router = new Router();

// UserController
$router->post('/login/try', [UserController::class, 'login'], [
    // No middleware
]);
$router->post('/user/{user_id}/username', [UserController::class, 'getUsername'], [
    // No middleware
]);

// SetController
$router->post('/user/{user_id}/sets', [SetController::class, 'getUserSets'], [
    APIUserAuthMiddleware::class
]);
$router->post('/set/{set_id}/words', [SetController::class, 'getSetWords'], [
    APIUserAuthMiddleware::class
]);

return $router;