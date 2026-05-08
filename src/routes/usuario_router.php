<?php

require_once SRC_PATH . 'controllers/UsuarioController.php';

use App\Controllers\UsuarioController;
use App\Middlewares\AutenticadorMiddleware;

$controller = new UsuarioController();

switch (true) {

    case $path === '/api/usuarios':

        switch ($method) {

            case 'GET':
                AutenticadorMiddleware::soloAdmin();
                $controller->listarUsuariosApi();
                break;

            case 'POST':
                $controller->registrar();
                break;

            default:
                renderJson([
                    'success' => false,
                    'error' => "Método $method no permitido"
                ], 405);
        }
        break;

    case $path === '/api/usuarios/login' && $method === 'POST':
        $controller->login();
        break;

    case preg_match('#^/api/usuarios/(\d+)$#', $path, $m):

        switch ($method) {

            case 'GET':
                AutenticadorMiddleware::verificar();
                $controller->mostrar($m[1]);
                break;

            case 'PUT':
                AutenticadorMiddleware::verificar();
                $controller->actualizar($m[1]);
                break;

            case 'DELETE':
                AutenticadorMiddleware::soloAdmin();
                $controller->eliminar($m[1]);
                break;

            default:
                renderJson([
                    'success' => false,
                    'error' => "Método $method no permitido"
                ], 405);
        }
        break;

    case preg_match('#^/api/usuarios/restaurar/(\d+)$#', $path, $m):
        if ($method === 'POST') {
            AutenticadorMiddleware::soloAdmin();
            $controller->restaurar($m[1]);
        } else {
            renderJson(['error' => 'Método no permitido'], 405);
        }
        break;

    default:
        renderJson(['error' => 'Ruta no encontrada'], 404);
}