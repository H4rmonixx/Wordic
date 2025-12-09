<?php

namespace App\Core;

class LayoutEngine {

    public static array $enabledExtensions = [];
    private static string $userPath = __DIR__ . '/../Views/Web/';
    private static string $adminPath = __DIR__ . '/../Views/Admin/';
    private static string $errorPath = __DIR__ . '/../Views/Error/';
    private static string $extensionsPath = __DIR__ . '/../Views/Extensions/';

    // RESOLVE LAYOUTS
    public static function resolveWebLayout(string $viewName, array $vars = []) : ?string {

        if(!file_exists(self::$userPath . $viewName)){
            return null;
        }
        $view = file_get_contents(self::$userPath . $viewName);

        // Process Variables
        foreach($vars as $var => $val){
            $view = str_replace("{{" . $var . "}}", $val, $view);
        }
        $view = preg_replace('/\{\{([.]+)\}\}/', "", $view);
        return self::resolve($view, file_get_contents(self::$userPath . 'layout.html'));
    }

    public static function resolveAdminLayout(string $viewName, array $vars = []) : ?string {

        if(!file_exists(self::$adminPath . $viewName)){
            return null;
        }
        $view = file_get_contents(self::$adminPath . $viewName);

        // Process Variables
        foreach($vars as $var => $val){
            $view = str_replace("{{" . $var . "}}", $val, $view);
        }
        $view = preg_replace('/\{\{([.]+)\}\}/', "", $view);
        return self::resolve($view, file_get_contents(self::$adminPath . 'layout.html'));
    }

    public static function resolveErrorLayout(string $viewName, array $vars = []) : ?string {

        if(!file_exists(self::$errorPath . $viewName)){
            return null;
        }
        $view = file_get_contents(self::$errorPath . $viewName);

        // Process Variables
        foreach($vars as $var => $val){
            $view = str_replace("{{" . $var . "}}", $val, $view);
        }
        $view = preg_replace('/\{\{([.]+)\}\}/', "", $view);
        return self::resolve($view, file_get_contents(self::$errorPath . 'layout.html'));
    }

    // BUILD LAYOUT
    private static function resolve(string $view, string $website) : string {
        
        // Process Extensions
        foreach(self::$enabledExtensions as $extension){
            $tmp = file_get_contents(self::$extensionsPath . $extension['file']);
            foreach($extension['vars'] as $var => $val){
                $tmp = str_replace("{{" . $var . "}}", $val, $tmp);
            }
            $tmp = preg_replace('/\{\{([.]+)\}\}/', "", $tmp);
            $website = str_replace("@extension(\"".$extension['name']."\")", $tmp, $website);
        }
        $website = preg_replace('/@extension\(\"([^"]+)\"\)/', "", $website);

        // Process Sections
        $sectionPattern = '/@section\("([^"]+)"\)\s*(.*?)\s*@endsection/s';
        preg_match_all($sectionPattern, $view, $matches);
        foreach($matches[1] as $index => $name){
            $website = str_replace("@showsection(\"$name\")", $matches[2][$index], $website);
        }
        $website = preg_replace('/@showsection\(\"([^"]+)\"\)/', "", $website);

        return $website;
    }

    // ENABLE EXTENSION
    public static function enableExtension(string $name, string $file, array $vars = []) : void {
        array_push(self::$enabledExtensions, ["name" => $name, "file" => $file, "vars" => $vars]);
    }

};