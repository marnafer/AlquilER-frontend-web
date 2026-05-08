<?php

use App\Controllers\LogActividadController;

$controller = new LogActividadController();
$method = $_SERVER['REQUEST_METHOD'];

global $path;

// 1. Estadísticas
if ($path === '/api/logs-actividad/estadisticas' && $method === 'GET') {
    $controller->getEstadisticas();
    exit;
}

// 2. Búsqueda
if ($path === '/api/logs-actividad/buscar' && $method === 'GET') {
    $controller->search();
    exit;
}

// 3. Por fechas
if ($path === '/api/logs-actividad/fecha' && $method === 'GET') {
    $controller->getByFecha();
    exit;
}

// 4. Limpiar logs antiguos
if ($path === '/api/logs-actividad/limpiar/antiguos' && $method === 'DELETE') {
    $controller->limpiarAntiguos();
    exit;
}

// 5. Por usuario (GET y DELETE)
if (preg_match('#^/api/logs-actividad/usuario/([0-9]+)$#', $path, $matches)) {
    if ($method === 'GET') {
        $controller->getByUsuario($matches[1]);
    } elseif ($method === 'DELETE') {
        $controller->limpiarPorUsuario($matches[1]);
    } else {
        http_response_code(405);
        echo json_encode(["error" => "Método no permitido"]);
    }
    exit;
}

// 6. Registrar log manual
if ($path === '/api/logs-actividad/registrar' && $method === 'POST') {
    $controller->registrar();
    exit;
}

// 7. CRUD general
if ($path === '/api/logs-actividad') {
    if ($method === 'GET') {
        $controller->index();
    } else {
        http_response_code(405);
        echo json_encode(["error" => "Método no permitido. Use GET"]);
    }
    exit;
}

// 8. CRUD con ID
if (preg_match('#^/api/logs-actividad/([0-9]+)$#', $path, $matches)) {
    $id = $matches[1];
    
    if ($method === 'GET') {
        $controller->show($id);
    } elseif ($method === 'DELETE') {
        $controller->delete($id);
    } else {
        http_response_code(405);
        echo json_encode(["error" => "Método no permitido. Use GET o DELETE"]);
    }
    exit;
}

http_response_code(404);
echo json_encode(["error" => "Ruta no encontrada"]);