<?php

namespace App\Controllers;

require_once __DIR__ . '/../Core/Request.php';
require_once __DIR__ . '/../Core/LayoutEngine.php';

use App\Core\Request;
use App\Core\LayoutEngine;

class ErrorController {

    public static int $err_code = 404;
    public static string $err_msg = 'Something gone wrong.<br>Try again later!';
    public static string $errorPath = __DIR__ . '/../Views/Error/';

    public function show(Request $request) : bool {

        http_response_code(self::$err_code);

        if(file_exists(self::$errorPath . self::$err_code . ".html")) $filename = self::$err_code.".html";
        else $filename = "default.html";

        echo LayoutEngine::resolveErrorLayout($filename, ['ERROR_CODE' => self::$err_code, 'ERROR_MSG' => self::$err_msg]);

        return true;
    }

}