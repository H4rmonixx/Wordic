<?php

namespace App\Core;

class Request
{
    private array $get = [];
    private array $post = [];
    private array $server = [];
    private array $files = [];
    private array $routeParams = [];

    // Redirect if URI ends with a trailing slash (except for root)
    public function __construct() {
        $this->get = $_GET ?? [];
        $this->post = $_POST ?? [];
        $this->server = $_SERVER ?? [];
        $this->files = $_FILES ?? [];
        
        if($this->uri() !== '/' && str_ends_with($this->uri(), '/')){
            $cleanUri = rtrim($this->uri(), '/');
            header("Location: $cleanUri", true, 301);
            exit;
        }
    }

    // Get HTTP method
    public function method(): string {
        return strtoupper($this->server['REQUEST_METHOD'] ?? 'GET');
    }

    // Get full URI
    public function uri(): string {
        return $this->server['REQUEST_URI'] ?? '/';
    }

    // Get path without query string
    public function path(): string {
        return parse_url($this->uri(), PHP_URL_PATH) ?? '/';
    }

    // Get GET parameter
    public function get(string $key, $default = null) {
        return $this->get[$key] ?? $default;
    }

    // Get POST parameter
    public function post(string $key, $default = null) {
        return $this->post[$key] ?? $default;
    }

    // Get FILE parameter
    public function file(string $key, $default = null) {
        return $this->files[$key] ?? $default;
    }

    // Get JSON body as array
    public function json(): ?array {
        $input = file_get_contents('php://input');
        return $input ? json_decode($input, true) : null;
    }

    // Get route parameter
    public function param(string $key, $default = null) {
        return $this->routeParams[$key] ?? $default;
    }

    // Set route parameter
    public function setParam(string $key, $value): void {
        $this->routeParams[$key] = $value;
    }
}
