<?php

namespace App\Controllers\View;

use App\Models\Propiedad;
use App\Helpers\JwtHelper;

class HomeController
{
    // GET/home
    public function index()
    {
        $tituloPagina = 'Inicio';

        $propiedades = Propiedad::with([
            'categoria',
            'localidad',
            'imagenPrincipal',
            'usuario'
        ])
        ->where('disponible', true)
        ->limit(6)
        ->get();

        require_once __DIR__ . '/../../Views/home/home.php';
    }
}