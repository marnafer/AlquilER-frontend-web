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
        $handler = $this->routes[$method][$path] ?? null;

        if ($handler) {

            if (is_array($handler)) {
                [$controller, $action] = $handler;

                $instance = new $controller();
                $instance->$action();

                return;
            }

            $handler();
            return;
        }

        // Verificar si existe la ruta con otro método
        foreach ($this->routes as $httpMethod => $routes) {
            if (isset($routes[$path])) {
                Response::methodNotAllowed();
            }
        }

        Response::notFound();
    }
}