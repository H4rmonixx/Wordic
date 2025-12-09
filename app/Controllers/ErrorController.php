<?php

namespace App\Controllers;

require_once __DIR__ . '/../Core/Request.php';
require_once __DIR__ . '/../Core/LayoutEngine.php';

use App\Core\Request;
use App\Core\LayoutEngine;

class ErrorController {

    public static int $err_code = 404;
    public static string $errorPath = __DIR__ . '/../Views/Error/';

    public function show(Request $request) : bool {

        $err = $request->param('error_code') ?? 404;
        http_response_code($err);
        if(file_exists(self::$errorPath . $err . ".html")) $filename = $err.".html";
        else $filename = "default.html";

        echo LayoutEngine::resolveErrorLayout($filename, ['ERROR_CODE' => $err]);

        return true;
    }

}