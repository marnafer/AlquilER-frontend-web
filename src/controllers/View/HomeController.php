<?php

namespace App\Controllers\View;

use App\Models\Propiedad;

class HomeController
{
    // GET/home
    public function index()
    {
        $tituloPagina = 'Inicio';

        $propiedades = Propiedad::with([
            'categoria',
            'localidad',
            'imagenPrincipal'
        ])
        ->where('disponible', true)
        ->limit(6)
        ->get();

        require_once __DIR__ . '/../../Views/home/home.php';
    }
}