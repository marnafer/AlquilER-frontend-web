<?php

use App\Controllers\AutenticadorController;
use App\Controllers\UsuarioController;
use App\Controllers\CategoriaController;

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

/*
|--------------------------------------------------------------------------
| CATEGORIAS
|--------------------------------------------------------------------------
*/

$router->get('/api/categorias',[CategoriaController::class, 'listar']);

$router->post('/api/categorias',[CategoriaController::class, 'crear']);

$router->get('/api/categorias/{id}',[CategoriaController::class, 'obtener']);

$router->put('/api/categorias/{id}',[CategoriaController::class, 'actualizar']);

$router->delete('/api/categorias/{id}',[CategoriaController::class, 'eliminar']);

