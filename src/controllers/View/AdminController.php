<?php

namespace App\Controllers\View;

use App\Models\Usuario;
use App\Models\Propiedad;
use App\Models\Reserva;
use App\Models\Categoria;
use App\Models\Servicio;

class AdminController
{
    public function index()
    {
        // Verificar autenticación y rol admin
        if (!isset($_SESSION['usuario_id']) || $_SESSION['rol_id'] != 3) {
            header('Location: /sistema-alquiler/login');
            exit;
        }

        $totalUsuarios = Usuario::count();
        $totalPropiedades = Propiedad::count();
        $totalReservas = Reserva::count();
        $totalCategorias = Categoria::count();
        $totalServicios = Servicio::count();
        
        // Reservas pendientes
        $reservasPendientes = Reserva::where('estado', 'pendiente')->count();
        
        // Últimos usuarios registrados
        $ultimosUsuarios = Usuario::orderBy('id', 'desc')->limit(5)->get();
        
        $data = [
            'title' => 'Admin - AlquilER',
            'currentPage' => 'admin',
            'totalUsuarios' => $totalUsuarios,
            'totalPropiedades' => $totalPropiedades,
            'totalReservas' => $totalReservas,
            'totalCategorias' => $totalCategorias,
            'totalServicios' => $totalServicios,
            'reservasPendientes' => $reservasPendientes,
            'ultimosUsuarios' => $ultimosUsuarios
        ];
        
        $viewsPath = dirname(__DIR__, 2) . '/views/';
        
        require_once $viewsPath . 'layout/header.php';
        require_once $viewsPath . 'admin/index.php';
        require_once $viewsPath . 'layout/footer.php';
    }
}