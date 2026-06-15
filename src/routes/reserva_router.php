<?php

require_once SRC_PATH . 'controllers/ReservaController.php';

use App\Controllers\ReservaController;

$controller = new ReservaController();
$method = $_SERVER['REQUEST_METHOD'];

global $path;

// 1. Disponibilidad
if ($path === '/api/reservas/disponibilidad' && $method === 'GET') {
    $controller->checkAvailability();
    exit;
}

// 2. Por propiedad
if (preg_match('#^/api/reservas/propiedad/([0-9]+)$#', $path, $matches) && $method === 'GET') {
    $controller->getByPropiedad($matches[1]);
    exit;
}

// 3. Por usuario
if (preg_match('#^/api/reservas/usuario/([0-9]+)$#', $path, $matches) && $method === 'GET') {
    $controller->getByusuario($matches[1]);
    exit;
}

// 4. Cambiar estado
if (preg_match('#^/api/reservas/([0-9]+)/estado$#', $path, $matches) && $method === 'PATCH') {
    $controller->changeStatus($matches[1]);
    exit;
}

// 5. CRUD general
if ($path === '/api/reservas') {
    if ($method === 'GET') {
        $controller->index();
    } elseif ($method === 'POST') {
        $controller->store();
    } else {
        http_response_code(405);
        echo json_encode(["error" => "Método no permitido"]);
    }
    exit;
}

// 6. CRUD con ID
if (preg_match('#^/api/reservas/([0-9]+)$#', $path, $matches)) {
    $id = $matches[1];

    if ($method === 'GET') {
        $controller->show($id);
    } elseif ($method === 'PUT') {
        $controller->update($id);
    } elseif ($method === 'DELETE') {
        $controller->delete($id);
    } else {
        http_response_code(405);
        echo json_encode(["error" => "Método no permitido"]);
    }
    exit;
}

http_response_code(404);
echo json_encode(["error" => "Ruta no encontrada"]);