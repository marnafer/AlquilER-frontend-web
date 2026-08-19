<?php

use App\Controllers\View\HomeController;
use App\Controllers\View\AuthController;
use App\Controllers\View\PropiedadesController;
use App\Controllers\View\CalculadoraController;
use App\Controllers\View\FavoritosController;
use App\Controllers\View\DashboardController;
use App\Controllers\View\AdminController;
use App\Controllers\View\AdminCategoriaController;
use App\Controllers\View\AdminServicioController;
use App\Controllers\View\AdminUbicacionController;
use App\Controllers\View\AdminLogController;
use App\Controllers\View\ReservasController;
use App\Controllers\View\ResenasController;
use App\Controllers\View\ConsultasController;

/*
|--------------------------------------------------------------------------
| HOME
|--------------------------------------------------------------------------
*/

$router->get('/', [HomeController::class, 'index']);
$router->get('/home', [HomeController::class, 'index']);

/*
|--------------------------------------------------------------------------
| AUTENTICACIÓN
|--------------------------------------------------------------------------
*/

// Mostrar formularios (GET)
$router->get('/login', [AuthController::class, 'login']);
$router->get('/register', [AuthController::class, 'register']);

// Procesar formularios (POST)
$router->post('/login', [AuthController::class, 'loginPost']);
$router->post('/register', [AuthController::class, 'registerPost']);

// Perfil (requiere autenticación)
$router->get('/perfil', [AuthController::class, 'perfil']);
$router->post('/perfil/actualizar', [AuthController::class, 'actualizarPerfil']); // ← AGREGAR ESTA

// Cerrar sesión
$router->get('/logout', [AuthController::class, 'logout']);

/*
|--------------------------------------------------------------------------
| PROPIEDADES
|--------------------------------------------------------------------------
*/

$router->get('/propiedades', [PropiedadesController::class, 'index']);
$router->get('/mis-propiedades', [PropiedadesController::class, 'misPropiedades']);
$router->get('/propiedades/{id}', [PropiedadesController::class, 'show']);
$router->get('/propiedades/crear', [PropiedadesController::class, 'create']);
$router->post('/propiedades', [PropiedadesController::class, 'store']);
$router->get('/propiedades/editar/{id}', [PropiedadesController::class, 'edit']);
$router->put('/propiedades/{id}', [PropiedadesController::class, 'update']);
$router->delete('/propiedades/{id}', [PropiedadesController::class, 'delete']);
$router->patch('/propiedades/{id}/restaurar', [PropiedadesController::class, 'restore']);

/*
|--------------------------------------------------------------------------
| DASHBOARD
|--------------------------------------------------------------------------
*/

$router->get('/dashboard', [DashboardController::class, 'index']);

/*
|--------------------------------------------------------------------------
| ADMINISTRACIÓN (solo administradores)
|--------------------------------------------------------------------------
*/

$router->get('/admin', [AdminController::class, 'index']);

// Categorías
$router->get('/admin/categorias', [AdminCategoriaController::class, 'index']);
$router->get('/admin/categorias/crear', [AdminCategoriaController::class, 'create']);
$router->post('/admin/categorias', [AdminCategoriaController::class, 'store']);
$router->get('/admin/categorias/{id}/editar', [AdminCategoriaController::class, 'edit']);
$router->put('/admin/categorias/{id}', [AdminCategoriaController::class, 'update']);
$router->delete('/admin/categorias/{id}', [AdminCategoriaController::class, 'delete']);

// Servicios
$router->get('/admin/servicios', [AdminServicioController::class, 'index']);
$router->get('/admin/servicios/crear', [AdminServicioController::class, 'create']);
$router->post('/admin/servicios', [AdminServicioController::class, 'store']);
$router->get('/admin/servicios/{id}/editar', [AdminServicioController::class, 'edit']);
$router->put('/admin/servicios/{id}', [AdminServicioController::class, 'update']);
$router->delete('/admin/servicios/{id}', [AdminServicioController::class, 'delete']);

// Ubicaciones (Provincias y Localidades)
$router->get('/admin/ubicaciones', [AdminUbicacionController::class, 'index']);
$router->post('/admin/ubicaciones/provincia', [AdminUbicacionController::class, 'storeProvincia']);
$router->put('/admin/ubicaciones/provincia/{id}', [AdminUbicacionController::class, 'updateProvincia']);
$router->delete('/admin/ubicaciones/provincia/{id}', [AdminUbicacionController::class, 'deleteProvincia']);
$router->post('/admin/ubicaciones/localidad', [AdminUbicacionController::class, 'storeLocalidad']);
$router->put('/admin/ubicaciones/localidad/{id}', [AdminUbicacionController::class, 'updateLocalidad']);
$router->delete('/admin/ubicaciones/localidad/{id}', [AdminUbicacionController::class, 'deleteLocalidad']);

// Logs
$router->get('/admin/logs', [AdminLogController::class, 'index']);
$router->delete('/admin/logs/{id}', [AdminLogController::class, 'delete']);
$router->delete('/admin/logs/limpiar', [AdminLogController::class, 'limpiar']);

/*
|--------------------------------------------------------------------------
| RESERVAS
|--------------------------------------------------------------------------
*/

$router->get('/reservas', [ReservasController::class, 'index']);
$router->get('/reservas/{id}', [ReservasController::class, 'show']);
$router->get('/reservas/crear/{propiedadId}', [ReservasController::class, 'create']);
$router->post('/reservas', [ReservasController::class, 'store']);
$router->put('/reservas/{id}/cancelar', [ReservasController::class, 'cancelar']);
$router->put('/reservas/{id}/confirmar', [ReservasController::class, 'confirmar']);

/*
|--------------------------------------------------------------------------
| RESEÑAS
|--------------------------------------------------------------------------
*/

$router->get('/resenas', [ResenasController::class, 'index']);
$router->get('/resenas/{id}', [ResenasController::class, 'show']);
$router->post('/resenas', [ResenasController::class, 'store']);
$router->put('/resenas/{id}', [ResenasController::class, 'update']);
$router->delete('/resenas/{id}', [ResenasController::class, 'delete']);

/*
|--------------------------------------------------------------------------
| CONSULTAS
|--------------------------------------------------------------------------
*/

$router->get('/consultas', [ConsultasController::class, 'index']);
$router->get('/consultas/{id}', [ConsultasController::class, 'show']);
$router->post('/consultas', [ConsultasController::class, 'store']);
$router->delete('/consultas/{id}', [ConsultasController::class, 'delete']);

/*
|--------------------------------------------------------------------------
| FAVORITOS
|--------------------------------------------------------------------------
*/

$router->get('/favoritos', [FavoritosController::class, 'index']);
$router->post('/favoritos/agregar', [FavoritosController::class, 'agregar']);
$router->delete('/favoritos/eliminar/{id}', [FavoritosController::class, 'eliminar']);

/*
|--------------------------------------------------------------------------
| CALCULADORA
|--------------------------------------------------------------------------
*/

$router->get('/calculadora', [CalculadoraController::class, 'index']);