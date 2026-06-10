<?php

use App\Controllers\AutenticadorController;
use App\Controllers\UsuarioController;

/*
|--------------------------------------------------------------------------
| AUTENTICADOR
|--------------------------------------------------------------------------
*/

$router->post('/api/autenticador/login', [AutenticadorController::class, 'login']);

$router->post('/api/autenticador/register', [AutenticadorController::class, 'register']);

$router->post('/api/autenticador/logout', [AutenticadorController::class, 'logout']);

/*
|--------------------------------------------------------------------------
| USUARIOS
|--------------------------------------------------------------------------
*/

$router->get('/api/usuarios', [UsuarioController::class, 'listarUsuariosApi']);

$router->get('/api/usuarios/{id}', [UsuarioController::class, 'mostrar']);

$router->put('/api/usuarios/{id}', [UsuarioController::class, 'actualizar']);

$router->delete('/api/usuarios/{id}', [UsuarioController::class, 'eliminar']);

$router->post('/api/usuarios/restaurar/{id}', [UsuarioController::class, 'restaurar']);