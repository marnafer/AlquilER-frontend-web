<?php
/**
 * Router RESTful del módulo de PropiedadServicio
 */

use App\Controllers\PropiedadServicioController;

$controller = new PropiedadServicioController();
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

// 1. --- RUTA ESPECIAL: Estadísticas (debe ir antes de las rutas con ID) ---
if ($path === '/api/propiedades-servicios/estadisticas') {
    if ($method === 'GET') {
        $controller->getEstadisticas();
    } else {
        http_response_code(405);
        echo json_encode(['error' => "Método $method no permitido en esta ruta"]);
    }
    exit;
}

// 2. --- RUTA ESPECIAL: Relaciones por servicio ---
if (preg_match('#^/api/propiedades-servicios/servicio/([0-9]+)$#', $path, $matches)) {
    $servicioId = (int)$matches[1];
    if ($method === 'GET') {
        $controller->getByServicio($servicioId);
    } else {
        http_response_code(405);
        echo json_encode(['error' => "Método $method no permitido en esta ruta"]);
    }
    exit;
}

// 3. --- RUTA ESPECIAL: Relaciones por propiedad ---
if (preg_match('#^/api/propiedades-servicios/propiedad/([0-9]+)$#', $path, $matches)) {
    $propiedadId = (int)$matches[1];
    
    if ($method === 'GET') {
        $controller->getByPropiedad($propiedadId);
    } elseif ($method === 'DELETE') {
        $controller->deleteByPropiedad($propiedadId);
    } else {
        http_response_code(405);
        echo json_encode(['error' => "Método $method no permitido en esta ruta"]);
    }
    exit;
}

// 4. --- RUTA ESPECIAL: Sincronizar servicios de una propiedad ---
if (preg_match('#^/api/propiedades-servicios/sync/([0-9]+)$#', $path, $matches)) {
    $propiedadId = $matches[1];
    if ($method === 'POST') {
        $controller->sync($propiedadId);
    } else {
        http_response_code(405);
        echo json_encode(['error' => "Método $method no permitido en esta ruta"]);
    }
    exit;
}

// 5. GET: propiedad-servicio por ID y DELETE: propiedad-servicio por ID
if (preg_match('#^/api/propiedades-servicios/([0-9]+)$#', $path, $matches)) {
    if ($method === 'GET') {
        $controller->show($matches[1]);
    } elseif ($method === 'DELETE') {
        $controller->delete($matches[1]);
    } else {
        renderError("Método no permitido. Use GET o DELETE", 405);
    }
    exit;
}

// 6. --- API: PropiedadServicio General (/api/propiedades-servicios) ---
if (trim($path) === '/api/propiedades-servicios') {
    if ($method === 'GET') {
        $controller->index();
    } elseif ($method === 'POST') {
        $controller->store();
    } else {
        http_response_code(405);
        echo json_encode(['error' => "Método $method no permitido"]);
    }
    exit;


}

