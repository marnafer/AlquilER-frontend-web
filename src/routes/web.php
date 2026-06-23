<?php

use App\Controllers\View\HomeController;
use App\Controllers\View\LoginController;
use App\Controllers\View\AuthController;
use App\Controllers\View\PropiedadesController;
use App\Controllers\View\CalculadoraController;
use App\Controllers\View\FavoritosController;

/*
|--------------------------------------------------------------------------
| HOME
|--------------------------------------------------------------------------
*/

$router->get('/home', [HomeController::class, 'index']);

/*
|--------------------------------------------------------------------------
| LOGIN
|--------------------------------------------------------------------------
*/

$router->get('/login', [AuthController::class, 'login']);

$router->get('/register', [AuthController::class, 'register']);

$router->get('/perfil', [AuthController::class, 'perfil']);

/*
|--------------------------------------------------------------------------
| PROPIEDADES
|--------------------------------------------------------------------------
*/

$router->get('/propiedades', [PropiedadesController::class, 'index']);
$router->get('/mis-propiedades', [PropiedadesController::class, 'misPropiedades']);

/*
|--------------------------------------------------------------------------
| CALCULADORA
|--------------------------------------------------------------------------
*/

$router->get('/calculadora', [CalculadoraController::class, 'index']);

/*
|--------------------------------------------------------------------------
| FAVORITOS
|--------------------------------------------------------------------------
*/

$router->get('/favoritos', [FavoritosController::class, 'index']);