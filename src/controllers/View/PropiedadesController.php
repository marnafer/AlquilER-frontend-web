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
			'imagenPrincipal'
		])
		->where('disponible', true)
		->get();
		require_once __DIR__ . '/../../Views/propiedades/index.php';
	}
}