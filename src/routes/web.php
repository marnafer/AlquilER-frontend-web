<?php

use App\Controllers\View\HomeController;
use App\Controllers\View\AuthController;
use App\Controllers\View\PropiedadesController;
use App\Controllers\View\CalculadoraController;
use App\Controllers\View\FavoritosController;

/*

| HOME

*/

// Ruta raíz y home
$router->get('/', [HomeController::class, 'index']);
$router->get('/home', [HomeController::class, 'index']);

/*

| AUTENTICACIÓN

*/

// Mostrar formularios
$router->get('/login', [AuthController::class, 'login']);
$router->get('/register', [AuthController::class, 'register']);

// Perfil (requiere autenticación)
$router->get('/perfil', [AuthController::class, 'perfil']);

/*

| PROPIEDADES

*/

// Listados
$router->get('/propiedades', [PropiedadesController::class, 'index']);
$router->get('/mis-propiedades', [PropiedadesController::class, 'misPropiedades']);

// Detalle de propiedad
$router->get('/propiedades/{id}', [PropiedadesController::class, 'show']);

// Crear propiedad (requiere autenticación)
$router->get('/propiedades/crear', [PropiedadesController::class, 'create']);
$router->post('/propiedades', [PropiedadesController::class, 'store']);

// Editar propiedad (requiere autenticación y ser propietario/admin)
$router->get('/propiedades/editar/{id}', [PropiedadesController::class, 'edit']);
$router->put('/propiedades/{id}', [PropiedadesController::class, 'update']);

// Eliminar propiedad (requiere autenticación y ser propietario/admin)
$router->delete('/propiedades/{id}', [PropiedadesController::class, 'delete']);
$router->patch('/propiedades/{id}/restaurar', [PropiedadesController::class, 'restore']);

/*
|--------------------------------------------------------------------------
| FAVORITOS
|--------------------------------------------------------------------------
*/

// Listado de favoritos (requiere autenticación)
$router->get('/favoritos', [FavoritosController::class, 'index']);

// Agregar/eliminar favoritos (requiere autenticación)
$router->post('/favoritos/agregar', [FavoritosController::class, 'agregar']);
$router->delete('/favoritos/eliminar/{id}', [FavoritosController::class, 'eliminar']);

/*
|--------------------------------------------------------------------------
| CALCULADORA
|--------------------------------------------------------------------------
*/

$router->get('/calculadora', [CalculadoraController::class, 'index']);