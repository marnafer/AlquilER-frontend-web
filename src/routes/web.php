<?php

use App\Controllers\View\HomeController;
use App\Controllers\View\LoginController;
use App\Controllers\View\AuthController;
use App\Controllers\View\PropiedadesController;

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