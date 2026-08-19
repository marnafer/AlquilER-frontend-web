<?php

namespace App\Controllers\View;

class HomeController
{
    public function index()
    {
        // Las vistas están en src/views/
        $viewsPath = dirname(__DIR__, 2) . '/views/';
        
        $data = [
            'title' => 'AlquilER - Encontrá tu propiedad ideal',
            'currentPage' => 'home',
            'description' => 'Las mejores propiedades en alquiler'
        ];
        
        require_once $viewsPath . 'layout/header.php';
        require_once $viewsPath . 'home/index.php';
        require_once $viewsPath . 'layout/footer.php';
    }
}