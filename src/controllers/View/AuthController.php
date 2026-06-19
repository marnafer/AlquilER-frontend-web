<?php

namespace App\Controllers\View;

class AuthController
{
    public function login()
    {
        require_once SRC_PATH . 'views/auth/login.php';
    }

    public function register()
    {
        require_once SRC_PATH . 'views/auth/register.php';
    }

    public function perfil()
    {
        require_once SRC_PATH . 'views/auth/perfil.php';
    }
}