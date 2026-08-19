<?php

namespace App\Controllers\View;

class DashboardController
{
    public function index()
    {
        // Verificar sesión
        if (!isset($_SESSION['usuario_id'])) {
            header('Location: /sistema-alquiler/login');
            exit;
        }

        $data = [
            'title' => 'Dashboard - AlquilER',
            'currentPage' => 'dashboard'
        ];
        
        $viewsPath = dirname(__DIR__, 2) . '/views/';
        
        require_once $viewsPath . 'layout/header.php';
        require_once $viewsPath . 'dashboard/index.php';
        require_once $viewsPath . 'layout/footer.php';
    }
}