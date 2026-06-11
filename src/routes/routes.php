<?php

use App\Controllers\AutenticadorController;
use App\Controllers\UsuarioController;
use App\Controllers\CategoriaController;
use App\Controllers\ProvinciaController;
use App\Controllers\LocalidadController;
use App\Controllers\RolController;

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

/*
|--------------------------------------------------------------------------
| PROVINCIAS
|--------------------------------------------------------------------------
*/

$router->get('/api/provincias', [ProvinciaController::class, 'index']);

$router->get('/api/provincias/con-localidades',[ProvinciaController::class, 'indexWithCount']);

$router->get('/api/provincias/{id}',[ProvinciaController::class, 'show']);

$router->post('/api/provincias',[ProvinciaController::class, 'store']);

$router->put('/api/provincias/{id}',[ProvinciaController::class, 'update']);

$router->delete('/api/provincias/{id}',[ProvinciaController::class, 'delete']);

/*
|--------------------------------------------------------------------------	
| LOCALIDADES
|--------------------------------------------------------------------------
*/

$router->get('/api/localidades', [LocalidadController::class, 'index']);

$router->post('/api/localidades', [LocalidadController::class, 'store']);

$router->get('/api/localidades/{id}', [LocalidadController::class, 'show']);

$router->put('/api/localidades/{id}', [LocalidadController::class, 'update']);

$router->delete('/api/localidades/{id}', [LocalidadController::class, 'delete']);

/*
|--------------------------------------------------------------------------
| ROLES
|--------------------------------------------------------------------------
*/

$router->get('/api/roles', [RolController::class, 'index']);

$router->get('/api/roles/con-usuarios', [RolController::class, 'indexWithCount']);

$router->post('/api/roles', [RolController::class, 'store']);

$router->get('/api/roles/{id}', [RolController::class, 'show']);

$router->put('/api/roles/{id}', [RolController::class, 'update']);

$router->delete('/api/roles/{id}', [RolController::class, 'delete']);
