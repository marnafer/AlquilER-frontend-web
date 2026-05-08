<?php

$path = $GLOBALS['path'];

// ============================================
// HOME
// ============================================
if ($path === '/' || $path === '/home') {
    require SRC_PATH . 'views/home.php';
    exit;
}

// ============================================
// PROPIEDADES
// ============================================
elseif ($path === '/propiedades') {
    require SRC_PATH . 'views/propiedades_views/propiedades_listar.php';
    exit;
}

elseif ($path === '/propiedades/nuevo') {
    require SRC_PATH . 'views/propiedades_views/propiedades_form.php';
    exit;
}

// ============================================
// FAVORITOS
// ============================================
elseif ($path === '/favoritos') {
    require SRC_PATH . 'views/favoritos_views/index.php';
    exit;
}

// ============================================
// AUTH
// ============================================
elseif ($path === '/login') {
    require SRC_PATH . 'views/autenticador_views/login.php';
    exit;
}

elseif ($path === '/register') {
    require SRC_PATH . 'views/autenticador_views/register.php';
    exit;
}

// ============================================
// 404
// ============================================
else {
    http_response_code(404);
    echo "<h1>404</h1><p>Página no encontrada</p>";
    exit;
}