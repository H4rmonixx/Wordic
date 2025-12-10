<?php

require_once __DIR__ . '/../Core/Router.php';

require_once __DIR__ . '/../Controllers/ErrorController.php';
require_once __DIR__ . '/../Controllers/HomeController.php';
require_once __DIR__ . '/../Controllers/UserController.php';

require_once __DIR__ . '/../Middleware/UserAuthMiddleware.php';
require_once __DIR__ . '/../Middleware/GuestAuthMiddleware.php';

use App\Core\Router;

use App\Controllers\ErrorController;
use App\Controllers\HomeController;
use App\Controllers\UserController;

use App\Middleware\UserAuthMiddleware;
use App\Middleware\GuestAuthMiddleware;

$router = new Router();

// ErrorController
$router->get('/errors/{error_code}', [ErrorController::class, 'show'], [
    // No middleware for the error page
]);

// HomeController
$router->get('/', [HomeController::class, 'pageIndex'], [
    // No middleware for the home page
]);
$router->get('/dashboard', [HomeController::class, 'pageDashboard'], [
    UserAuthMiddleware::class
]);

// UserController
$router->get('/login', [UserController::class, 'pageLogin'], [
    GuestAuthMiddleware::class
]);
$router->get('/register', [UserController::class, 'pageRegister'], [
    GuestAuthMiddleware::class
]);
$router->get('/profile', [UserController::class, 'pageProfile'], [
    UserAuthMiddleware::class
]);

return $router;