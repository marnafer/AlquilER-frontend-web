<?php

declare(strict_types=1);

require_once __DIR__ . '/../vendor/autoload.php';
require_once __DIR__ . '/../src/database.php';

$dotenv = Dotenv\Dotenv::createImmutable(dirname(__DIR__));
$dotenv->load();

date_default_timezone_set('America/Argentina/Buenos_Aires');
error_reporting(E_ALL);

define('SRC_PATH', dirname(__DIR__) . '/src/');

define('BASE_URL', rtrim(dirname($_SERVER['SCRIPT_NAME']), '/')); // Esto es útil para generar URLs relativas a la raíz del proyecto, 
                                                                  // especialmente si no está en la raíz del servidor web.  
ini_set('display_errors', 1);

// ============================================
// FUNCIONES GLOBALES DE RESPUESTA
// ============================================

/**
 * Enviar respuesta JSON exitosa
 */
function renderJson($data, $message = null, $statusCode = 200)
{
    // Limpiar output buffer
    if (ob_get_length()) {
        ob_clean();
    }
    
    http_response_code($statusCode);
    header('Content-Type: application/json; charset=utf-8');
    header('X-Content-Type-Options: nosniff');
    
    $response = [
        'success' => true,
        'data' => $data,
        'timestamp' => date('Y-m-d H:i:s')
    ];
    
    if ($message !== null) {
        $response['message'] = $message;
    }
    
    // Usar JSON_UNESCAPED_SLASHES para evitar escapes de barras
    $json = json_encode($response, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    
    echo $json;
    exit;
}

/**
 * Enviar respuesta JSON de error
 */
function renderError($error, $statusCode = 400, $details = null)
{
    // Limpiar output buffer
    if (ob_get_length()) {
        ob_clean();
    }
    
    http_response_code($statusCode);
    header('Content-Type: application/json; charset=utf-8');
    header('X-Content-Type-Options: nosniff');
    
    $response = [
        'success' => false,
        'error' => $error,
        'timestamp' => date('Y-m-d H:i:s')
    ];
    
    if ($details !== null) {
        $response['details'] = $details;
    }
    
    if (isset($GLOBALS['path'])) {
        $response['path'] = $GLOBALS['path'];
    }
    
    $json = json_encode($response, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    
    echo $json;
    exit;
}

/**
 * Enviar respuesta JSON con paginación
 */
function renderPaginated($data, $total, $page = 1, $limit = 10, $message = null)
{
    // Limpiar output buffer
    if (ob_get_length()) {
        ob_clean();
    }
    
    http_response_code(200);
    header('Content-Type: application/json; charset=utf-8');
    header('X-Content-Type-Options: nosniff');
    
    $response = [
        'success' => true,
        'data' => $data,
        'pagination' => [
            'total' => (int)$total,
            'page' => (int)$page,
            'limit' => (int)$limit,
            'last_page' => (int)ceil($total / $limit)
        ],
        'timestamp' => date('Y-m-d H:i:s')
    ];
    
    if ($message !== null) {
        $response['message'] = $message;
    }
    
    $json = json_encode($response, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    
    echo $json;
    exit;
}

// ============================================
// CONFIGURACIÓN
// ============================================

$method = strtoupper(trim($_SERVER['REQUEST_METHOD'] ?? 'GET'));
$requestUri = $_SERVER['REQUEST_URI'] ?? '/';

$path_bruto = parse_url($requestUri, PHP_URL_PATH);

$scriptName = $_SERVER['SCRIPT_NAME'];
$baseDir = str_replace('\\', '/', dirname(dirname($scriptName)));

if ($baseDir !== '/' && strpos($path_bruto, $baseDir) === 0) {
    $path_bruto = substr($path_bruto, strlen($baseDir));
}

if (strpos($path_bruto, '/public') === 0) {
    $path_bruto = substr($path_bruto, strlen('/public'));
}

$path = '/' . trim((string)$path_bruto, "/");

// Hacemos la variable $path global para que esté disponible en los routers
$GLOBALS['path'] = $path;

// ============================================
// DEBUG
// ============================================

require_once dirname(__DIR__) . '/src/debug/Debugger.php';

//use App\Debug\Debugger;

//if ($_SERVER['SERVER_NAME'] === 'localhost' || $_SERVER['SERVER_NAME'] === '127.0.0.1') {
//    Debugger::setEnabled(true);
//    Debugger::enableErrorReporting();
//}

// Debugger::request();

// ============================================
// RUTAS DEL SISTEMA (respuestas rápidas)
// ============================================

// Health
if ($path === '/health') {
    renderJson([
        'status' => 'ok',
        'timestamp' => date('Y-m-d H:i:s'),
        'php' => phpversion()
    ], 'API funcionando correctamente');
    exit;
}

if ($path === '/') {
    // Endpoints sin escapes
    $endpoints = [
        '/health',
        '/api/categorias',
        '/api/provincias',
        '/api/localidades',
        '/api/usuarios',
        '/api/propiedades',
        '/api/servicios',
        '/api/propiedades-servicios',
        '/api/reservas',
        '/api/resenas',
        '/api/consultas',
        '/api/favoritos',
        '/api/logs-actividad',
        '/api/roles',
        '/api/propiedad-imagenes',
        '/api/debug/stats',
        '/api/debug/test-db'
    ];
    
    renderJson([
        'message' => 'API Alquiler Permanente funcionando',
        'endpoints' => $endpoints
    ], 'Bienvenido a la API');
    exit;
}

// ============================================
// RUTAS DE LA API
// ============================================

// --- PROPIEDADES ---
if (strpos($path, '/api/propiedades') === 0) {
    require_once SRC_PATH . 'routes/propiedad_router.php';
    exit;
}

// --- FAVORITOS (por usuario) ---
elseif (preg_match('#^/api/usuarios/\d+/favoritos$#', $path)) {
    require_once SRC_PATH . 'routes/favorito_router.php';
    exit;
}

// --- FAVORITOS (general) ---
elseif (strpos($path, '/api/favoritos') === 0) {
    require_once SRC_PATH . 'routes/favorito_router.php';
    exit;
}

// --- USUARIOS ---
elseif (strpos($path, '/api/usuarios') === 0) {
    require_once SRC_PATH . 'routes/usuario_router.php';
    exit;
}

// --- LOGS ACTIVIDAD (más específico primero) ---
elseif (strpos($path, '/api/logs-actividad') === 0) {
    require_once SRC_PATH . 'routes/logactividad_router.php';
    exit;
}

// --- LOGS (más general después) ---
elseif (strpos($path, '/api/logs') === 0) {
    require_once SRC_PATH . 'routes/logactividad_router.php';
    exit;
}

// --- LOCALIDADES ---
elseif (strpos($path, '/api/localidades') === 0) {
    require_once SRC_PATH . 'routes/localidad_router.php';
    exit;
}

// --- PROPIEDAD IMÁGENES ---
elseif (strpos($path, '/api/propiedad-imagenes') === 0) {
    require_once SRC_PATH . 'routes/propiedadImagen_router.php';
    exit;
}

// --- CATEGORÍAS ---
elseif (strpos($path, '/api/categorias') === 0) {
    require_once SRC_PATH . 'routes/categoria_router.php';
    exit;
}

// --- PROVINCIAS ---
elseif (strpos($path, '/api/provincias') === 0) {
    require_once SRC_PATH . 'routes/provincia_router.php';
    exit;
}

// --- PROPIEDADES-SERVICIOS ---
elseif (strpos($path, '/api/propiedades-servicios') === 0) {
    require_once SRC_PATH . 'routes/propiedadservicio_router.php';
    exit;
}

// --- SERVICIOS ---
elseif (strpos($path, '/api/servicios') === 0) {
    require_once SRC_PATH . 'routes/servicio_router.php';
    exit;
}

// --- PROPIEDAD SERVICIO ---
elseif (strpos($path, '/api/propiedades-servicios') === 0) {
    $routerPath = SRC_PATH . 'routes/propiedadservicio_router.php';
    if (file_exists($routerPath)) {
        require_once $routerPath;
    } else {
        renderError("Archivo de rutas no encontrado: propiedadservicio_router.php", 500);
    }
    exit;
}

// --- RESERVAS ---
elseif (strpos($path, '/api/reservas') === 0) {
    $routerPath = SRC_PATH . 'routes/reserva_router.php';
    if (file_exists($routerPath)) {
        require_once $routerPath;
    } else {
        renderError("Archivo de rutas no encontrado: reserva_router.php", 500);
    }
    exit;
}

// --- RESEÑAS ---
elseif (strpos($path, '/api/resenas') === 0) {
    $routerPath = SRC_PATH . 'routes/resena_router.php';
    if (file_exists($routerPath)) {
        require_once $routerPath;
    } else {
        renderError("Archivo de rutas no encontrado: resena_router.php", 500);
    }
    exit;
}

// --- CONSULTAS ---
elseif (strpos($path, '/api/consultas') === 0) {
    $routerPath = SRC_PATH . 'routes/consulta_router.php';
    if (file_exists($routerPath)) {
        require_once $routerPath;
    } else {
        renderError("Archivo de rutas no encontrado: consulta_router.php", 500);
    }
    exit;
}

// --- ROLES ---
elseif (strpos($path, '/api/roles') === 0) {
    $routerPath = SRC_PATH . 'routes/rol_router.php';
    if (file_exists($routerPath)) {
        require_once $routerPath;
    } else {
        renderError("Archivo de rutas no encontrado: rol_router.php", 500);
    }
    exit;
}

// --- DEBUG ---
elseif (strpos($path, '/debug') === 0 || strpos($path, '/api/debug') === 0) {
    $routerPath = SRC_PATH . 'routes/debug_router.php';
    if (file_exists($routerPath)) {
        require_once $routerPath;
    } else {
        renderError("Archivo de rutas no encontrado: debug_router.php", 500);
    }
    exit;
}

// ============================================
// RUTA NO ENCONTRADA (404)
// ============================================

renderError("Ruta no encontrada", 404);