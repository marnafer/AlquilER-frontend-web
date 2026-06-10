<?php

declare(strict_types=1);

namespace App\Routes;

use App\Helpers\Response;

class Router
{
    private array $routes = [];

    public function get(string $uri, callable|array $handler): void
    {
        $this->routes['GET'][$uri] = $handler;
    }

    public function post(string $uri, callable|array $handler): void
    {
        $this->routes['POST'][$uri] = $handler;
    }

    public function put(string $uri, callable|array $handler): void
    {
        $this->routes['PUT'][$uri] = $handler;
    }

    public function delete(string $uri, callable|array $handler): void
    {
        $this->routes['DELETE'][$uri] = $handler;
    }

    public function dispatch(string $method, string $path): void
    {
        // 1. Buscar coincidencia exacta
        if (isset($this->routes[$method][$path])) {

            $handler = $this->routes[$method][$path];

            if (is_array($handler)) {
                [$controller, $action] = $handler;

                $instance = new $controller();
                $instance->$action();

                return;
            }

            $handler();
            return;
        }

        // 2. Buscar rutas dinámicas
        foreach ($this->routes[$method] ?? [] as $route => $handler) {

            $pattern = preg_replace(
                '#\{([a-zA-Z_][a-zA-Z0-9_]*)\}#',
                '([^/]+)',
                $route
            );

            $pattern = '#^' . $pattern . '$#';

            if (preg_match($pattern, $path, $matches)) {

                array_shift($matches);

                if (is_array($handler)) {
                    [$controller, $action] = $handler;

                    $instance = new $controller();
                    $instance->$action(...$matches);

                    return;
                }

                $handler(...$matches);
                return;
            }
        }

        // 3. Verificar si existe la ruta con otro método
        foreach ($this->routes as $httpMethod => $routes) {

            foreach ($routes as $route => $handler) {

                $pattern = preg_replace(
                    '#\{([a-zA-Z_][a-zA-Z0-9_]*)\}#',
                    '([^/]+)',
                    $route
                );

                $pattern = '#^' . $pattern . '$#';

                if (preg_match($pattern, $path)) {
                    Response::methodNotAllowed();
                }
            }
        }

        Response::notFound();
    }
}