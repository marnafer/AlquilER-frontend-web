<?php

namespace App\Controllers\View;

use App\Models\Propiedad;
use App\Models\Categoria;

class PropiedadesController
{
    public function index()
    {
        // Obtener filtros
        $ubicacion = $_GET['ubicacion'] ?? '';
        $categoriaId = $_GET['categoria_id'] ?? '';
        $precioMax = $_GET['precio_max'] ?? '';
        
        // Construir consulta
        $query = Propiedad::where('disponible', 1)
            ->whereNull('deleted_at');
        
        if (!empty($ubicacion)) {
            $query->where('direccion', 'LIKE', "%$ubicacion%");
        }
        
        if (!empty($categoriaId)) {
            $query->where('categoria_id', $categoriaId);
        }
        
        if (!empty($precioMax)) {
            $query->where('precio', '<=', $precioMax);
        }
        
        // Obtener propiedades
        $propiedades = $query->get();
        
        // Obtener categorías para el filtro
        $categorias = Categoria::all();
        
        // Preparar datos para la vista
        $data = [
            'title' => 'Propiedades - AlquilER',
            'currentPage' => 'propiedades',
            'propiedades' => $propiedades,
            'categorias' => $categorias,
            'filtros' => [
                'ubicacion' => $ubicacion,
                'categoria_id' => $categoriaId,
                'precio_max' => $precioMax
            ]
        ];
        
        // Cargar vistas
        $viewsPath = dirname(__DIR__, 2) . '/views/';
        
        require_once $viewsPath . 'layout/header.php';
        require_once $viewsPath . 'propiedades/index.php';
        require_once $viewsPath . 'layout/footer.php';
    }
}