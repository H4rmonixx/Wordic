<?php

namespace App\Core;

class Router
{
    private array $routes = [];

    // REGISTER GET ROUTE
    public function get(string $pattern, callable|array $handler, array $middleware = []): void {
        $this->routes['GET'][] = ['pattern' => $pattern, 'handler' => $handler, 'middleware' => $middleware];
    }
    
    // REGISTER POST ROUTE
    public function post(string $pattern, callable|array $handler, array $middleware = []): void {
        $this->routes['POST'][] = ['pattern' => $pattern, 'handler' => $handler, 'middleware' => $middleware];
    }

    // DISPATCH REQUEST
    public function dispatch(string $method, string $uri, Request $request): bool {
        $path = parse_url($uri, PHP_URL_PATH);

        foreach ($this->routes[$method] ?? [] as $route) {
            $regex = $this->convertPatternToRegex($route['pattern'], $params);

            if (preg_match($regex, $path, $matches)) {

                if($params != null){
                    foreach ($params as $name) {
                        if(!isset($matches[$name])) continue;
                        $request->setParam($name, $matches[$name]);
                    }
                }

                $handler = $route['handler'];

                $pipeline = array_reduce(
                    array_reverse($route['middleware']),
                    fn($next, $middleware) => function($request) use ($middleware, $next) {
                        $m = new $middleware();
                        return $m->handle($request, $next);
                    },
                    fn($request) => $this->callHandler($handler, $request)
                );
                
                return $pipeline($request);
            }
        }

        return false;
    }

    // CALL HANDLER
    private function callHandler($handler, $request){
        if (is_callable($handler)) {
            return $handler($request);
        }

        if (is_array($handler)) {
            [$class, $method] = $handler;
            $controller = new $class();
            return $controller->$method($request);
        }

        return false;
    }

    // CONVERT PATTERN TO REGEX
    private function convertPatternToRegex(string $pattern, &$params): string {
        $regex = preg_replace_callback('/\{(\w+)\}/', function ($matches) use (&$params) {
            $params[] = $matches[1];
            return '(?P<' . $matches[1] . '>[^/]+)';
        }, $pattern);

        return "#^" . $regex . "$#";
    }
}
