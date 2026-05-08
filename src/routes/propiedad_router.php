<?php

use App\controllers\PropiedadController;
use App\middlewares\AutenticadorMiddleware;

$controller = new PropiedadController();

switch (true) {

    case $path === '/api/propiedades':
        switch ($method) {

            case 'GET':
                $controller->indexApi();
                break;

            case 'POST':
                $controller->crear();
                break;

            default:
                http_response_code(405);
                renderJson([
                    'success' => false,
                    'error' => "Método $method no permitido"
                ], 405);
        }
        break;

    case preg_match('#^/api/propiedades/(\d+)$#', $path, $matches):

        switch ($method) {

            case 'GET':
                $controller->mostrarApi($matches[1]);
                break;

            case 'PUT':
                $controller->actualizar($matches[1]);
                break;

            case 'DELETE':
                $controller->eliminar($matches[1]);
                break;
            case 'PATCH':
                $controller->restaurar($matches[1]);
                break;
            default:
                http_response_code(405);
                renderJson([
                    'success' => false,
                    'error' => "Método $method no permitido"
                ], 405);
        }
        break;

    case $path === '/api/propiedades/nuevo':
        if ($method === 'GET') {
            $controller->mostrarFormulario();
        } else {
            http_response_code(405);
            renderJson([
                'success' => false,
                'error' => "Método $method no permitido"
            ], 405);
        }
        break;

    default:
        http_response_code(404);
        renderJson([
            'success' => false,
            'error' => 'Ruta no encontrada'
        ], 404);
}