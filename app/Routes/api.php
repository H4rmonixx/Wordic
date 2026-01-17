<?php

require_once __DIR__ . '/../Core/Router.php';

require_once __DIR__ . '/../Controllers/UserController.php';
require_once __DIR__ . '/../Controllers/SetController.php';

require_once __DIR__ . '/../Middleware/UserAuthMiddleware.php';
require_once __DIR__ . '/../Middleware/RetrieveIDMiddleware.php';
require_once __DIR__ . '/../Middleware/SetOwnerOrPublicAuthMiddleware.php';
require_once __DIR__ . '/../Middleware/SetOwnerAuthMiddleware.php';

use App\Core\Router;

use App\Controllers\UserController;
use App\Controllers\SetController;

use App\Middleware\UserAuthMiddleware;
use App\Middleware\RetrieveIDMiddleware;
use App\Middleware\SetOwnerOrPublicAuthMiddleware;
use App\Middleware\SetOwnerAuthMiddleware;

$router = new Router();

// UserController
$router->post('/login/try', [UserController::class, 'login'], [
    // No middleware
]);
$router->post('/user/{code}/username', [UserController::class, 'getUsername'], [
    RetrieveIDMiddleware::class
]);

// SetController
$router->post('/user/{code}/sets', [SetController::class, 'getUserSets'], [
    UserAuthMiddleware::class,
    RetrieveIDMiddleware::class
]);
$router->post('/user/{code}/sets/count', [SetController::class, 'getUserSetsCount'], [
    UserAuthMiddleware::class,
    RetrieveIDMiddleware::class
]);
$router->post('/set/new', [SetController::class, 'createNewSet'], [
    UserAuthMiddleware::class
]);
$router->post('/set/{code}/delete', [SetController::class, 'deleteSet'], [
    UserAuthMiddleware::class,
    RetrieveIDMiddleware::class,
    SetOwnerAuthMiddleware::class
]);
$router->post('/set/{code}/info', [SetController::class, 'getSetInfo'], [
    UserAuthMiddleware::class,
    RetrieveIDMiddleware::class,
    SetOwnerOrPublicAuthMiddleware::class
]);
$router->post('/set/{code}/words', [SetController::class, 'getSetWords'], [
    UserAuthMiddleware::class,
    RetrieveIDMiddleware::class,
    SetOwnerOrPublicAuthMiddleware::class
]);
$router->post('/set/{code}/words/rehearse', [SetController::class, 'getSetWordsToRehearse'], [
    UserAuthMiddleware::class,
    RetrieveIDMiddleware::class,
    SetOwnerOrPublicAuthMiddleware::class
]);
$router->post('/set/{code}/nearest-review-date', [SetController::class, 'getNearestReviewDate'], [
    UserAuthMiddleware::class,
    RetrieveIDMiddleware::class,
    SetOwnerOrPublicAuthMiddleware::class
]);
$router->post('/set/{code}/reset/progress', [SetController::class, 'resetProgress'], [
    UserAuthMiddleware::class,
    RetrieveIDMiddleware::class,
    SetOwnerAuthMiddleware::class
]);


$router->post('/set/{code}/edit/info', [SetController::class, 'editInfo'], [
    UserAuthMiddleware::class,
    RetrieveIDMiddleware::class,
    SetOwnerAuthMiddleware::class
]);
$router->post('/set/{code}/edit/image', [SetController::class, 'editImage'], [
    UserAuthMiddleware::class,
    RetrieveIDMiddleware::class,
    SetOwnerAuthMiddleware::class
]);
$router->post('/set/{code}/edit/words', [SetController::class, 'editWords'], [
    UserAuthMiddleware::class,
    RetrieveIDMiddleware::class,
    SetOwnerAuthMiddleware::class
]);

$router->post('/word/{code}/update/progress', [SetController::class, 'updateWordProgress'], [
    UserAuthMiddleware::class,
    RetrieveIDMiddleware::class,
]);

return $router;