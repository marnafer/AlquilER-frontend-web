<?php

namespace App\Controllers\View;

use App\Models\Propiedad;

class PropiedadesController
{
	// GET /propiedades
	public function index()
	{
		$tituloPagina = 'Propiedades';
		$propiedades = Propiedad::with([
			'categoria',
			'localidad',
			'imagenPrincipal',
			'usuario'
		])
		->get();
		require_once __DIR__ . '/../../Views/propiedades/index.php';
	}

	// GET /mis-propiedades
	public function misPropiedades()
    {
        // Solo definimos el título para el Header
        $tituloPagina = 'Mis Propiedades';

        // Levantamos la vista directo
        require_once __DIR__ . '/../../Views/propiedades/mis_propiedades.php';
    }
}