<?php

require_once SRC_PATH . 'controllers/ConsultaController.php';

use App\Controllers\ConsultaController;

$controller = new ConsultaController();

$method = $_SERVER['REQUEST_METHOD'];

switch (true) {

    /**
     * /api/consultas/propiedad/{id}
     */
    case preg_match('#^/api/consultas/propiedad/([0-9]+)$#', $path, $matches):
        $propiedadId = $matches[1];

        if ($method === 'GET') {
            $controller->listarPorPropiedad($propiedadId);
        } else {
            renderJson([
                'success' => false,
                'error' => "Método $method no permitido. Solo GET"
            ], 405);
        }
        break;

    /**
     * /api/consultas/inquilino/{id}
     */
    case preg_match('#^/api/consultas/inquilino/([0-9]+)$#', $path, $matches):
        $inquilinoId = $matches[1];

        if ($method === 'GET') {
            $controller->listarPorInquilino($inquilinoId);
        } else {
            renderJson([
                'success' => false,
                'error' => "Método $method no permitido. Solo GET"
            ], 405);
        }
        break;

    /**
     * /api/consultas/{id}
     */
    case preg_match('#^/api/consultas/([0-9]+)$#', $path, $matches):
        $consultaId = $matches[1];

        switch ($method) {
            case 'GET':
                $controller->obtener($consultaId);
                break;

            case 'PUT':
                $controller->actualizar($consultaId);
                break;

            case 'DELETE':
                $controller->eliminar($consultaId);
                break;

            default:
                renderJson([
                    'success' => false,
                    'error' => "Método $method no permitido"
                ], 405);
        }
        break;

    /**
     * /api/consultas
     */
    case $path === '/api/consultas':
        switch ($method) {
            case 'GET':
                $controller->listar();
                break;

            case 'POST':
                $controller->crear();
                break;

            default:
                renderJson([
                    'success' => false,
                    'error' => "Método $method no permitido"
                ], 405);
        }
        break;

    default:
        renderJson([
            'success' => false,
            'error' => 'Ruta no encontrada'
        ], 404);
}