<?php
// Router RESTful para PropiedadImagen
/*
require_once SRC_PATH . 'controllers/PropiedadImagenController.php';

use App\Controllers\PropiedadImagenController;

$controller = new PropiedadImagenController();
$method = $_SERVER['REQUEST_METHOD'];

// 1. API: /api/propiedad-imagenes/{id}
if (preg_match('#^/api/propiedad-imagenes/([0-9]+)$#', $path, $matches)) {
    $id = $matches[1];

    switch ($method) {
        case 'GET':    $controller->mostrarApi($id); break;
        case 'DELETE': $controller->eliminar($id); break;
        default:
            http_response_code(405);
            echo json_encode(['error' => 'Método no permitido']);
            break;
    }
    exit;
}

// 2. API: /api/propiedad-imagenes
if (trim($path) === '/api/propiedad-imagenes') {
    switch ($method) {
        case 'GET':  $controller->indexApi(); break;
        case 'POST': $controller->crear(); break;
        default:
            http_response_code(405);
            echo json_encode(['error' => 'Método no permitido']);
            break;
    }
    exit;
}

// 3. Rutas HTML (mostrar galería de propiedades)

if ($path === '/propiedades/imagenes') {
    if ($method === 'GET') $controller->listarVistas();
    exit;
}
