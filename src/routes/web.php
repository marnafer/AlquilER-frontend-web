<?php

use App\Controllers\View\HomeController;

/*
|--------------------------------------------------------------------------
| HOME
|--------------------------------------------------------------------------
*/

$router->get('/home', [HomeController::class, 'index']);