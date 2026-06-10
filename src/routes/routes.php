<?php

use App\Controllers\AutenticadorController;

/*
|--------------------------------------------------------------------------
| AUTENTICADOR
|--------------------------------------------------------------------------
*/

$router->post(
    '/api/autenticador/login',
    [AutenticadorController::class, 'login']
);

$router->post(
    '/api/autenticador/register',
    [AutenticadorController::class, 'register']
);

$router->post(
    '/api/autenticador/logout',
    [AutenticadorController::class, 'logout']
);