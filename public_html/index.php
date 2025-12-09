<?php

require_once __DIR__ . '/../app/Core/Request.php';
require_once __DIR__ . '/../app/Controllers/ErrorController.php';
use App\Core\Request;
use App\Controllers\ErrorController;

$request = new Request();

// ROUTERS SETUP
$routers = [];
$routers[] = require __DIR__ . '/../app/Routes/web.php';
$routers[] = require __DIR__ . '/../app/Routes/api.php';

// ROUTING
foreach ($routers as $router) {
    if ($router->dispatch($request->method(), $request->path(), $request)) {
        exit;
    }
}

// ERROR HANDLER
header("Location: /errors/" . ErrorController::$err_code);
exit;