<?php

require_once SRC_PATH . 'controllers/AutenticadorController.php';

use App\Controllers\AutenticadorController;

$controller = new AutenticadorController();
$method = $_SERVER['REQUEST_METHOD'];

// LOGIN
if ($path === '/api/autenticador/login') {
    if ($method === 'POST') {
        $controller->login();
    }
    exit;
}

// REGISTER
if ($path === '/api/autenticador/register') {
    if ($method === 'POST') {
        $controller->register();
    }
    exit;
}

// LOGOUT
if ($path === '/api/autenticador/logout') {
    if ($method === 'POST') {
        $controller->logout();
    }
    exit;
}