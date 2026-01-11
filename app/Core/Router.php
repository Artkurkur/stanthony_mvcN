<?php
// app/Core/Router.php

namespace App\Core;

class Router {
    private array $routes = [];

    public function get(string $path, callable $callback) { $this->routes['GET'][$path] = $callback; }
    public function post(string $path, callable $callback) { $this->routes['POST'][$path] = $callback; }
    public function put(string $path, callable $callback) { $this->routes['PUT'][$path] = $callback; }
    public function delete(string $path, callable $callback) { $this->routes['DELETE'][$path] = $callback; }

    public function dispatch(string $method, string $uri): void {
        $uri = parse_url($uri, PHP_URL_PATH);

        foreach ($this->routes[$method] ?? [] as $route => $callback) {
            $pattern = preg_replace('/\{(\w+)\}/', '(\w+)', $route);
            if (preg_match("#^$pattern$#", $uri, $matches)) {
                array_shift($matches);
                $params = $matches ? ['id' => $matches[0]] : [];
                $callback($params);
                return;
            }
        }

        http_response_code(404);
        echo json_encode(['error' => 'Route not found']);
    }
}
