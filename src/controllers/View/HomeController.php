<?php

namespace App\Controllers\View;

class HomeController
{
    public function index()
    {
        $basePath = dirname(__DIR__, 3);
        $viewsPath = $basePath . '/public/views/';
        
        // Verificar que los archivos existen
        if (!file_exists($viewsPath . 'layout/header.php')) {
            die('Error: No se encontró header.php en: ' . $viewsPath . 'layout/header.php');
        }
        
        if (!file_exists($viewsPath . 'home/index.php')) {
            die('Error: No se encontró home/index.php en: ' . $viewsPath . 'home/index.php');
        }
        
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