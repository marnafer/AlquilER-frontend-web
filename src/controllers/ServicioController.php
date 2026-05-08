<?php

namespace App\Controllers;

use App\Models\Servicio;
use App\Models\Propiedad;
use App\Validators\ServicioValidator;
use App\Sanitizers\ServicioSanitizer;
use Exception;

class ServicioController
{

    /**
     * GET /api/servicios
     */
    public function index()
    {
        try {
            $servicios = Servicio::all();

            return renderJson([
                'success' => true,
                'data' => $servicios,
                'total' => $servicios->count()
            ]);
        } catch (Exception $e) {
            return renderJson([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * GET /api/servicios/con-propiedades
     */
    public function indexWithCount()
    {
        try {
            $servicios = Servicio::withCount('propiedades')->get();

            return renderJson([
                'success' => true,
                'data' => $servicios,
                'total' => $servicios->count()
            ]);
        } catch (Exception $e) {
            return renderJson([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * GET /api/servicios/populares?limit=10
     */
    public function getPopulares()
    {
        $limit = isset($_GET['limit']) ? (int) $_GET['limit'] : 10;

        if ($limit < 1 || $limit > 50) {
            $limit = 10;
        }

        try {
            $servicios = Servicio::withCount('propiedades')
                ->orderByDesc('propiedades_count')
                ->limit($limit)
                ->get();

            return renderJson([
                'success' => true,
                'data' => $servicios,
                'total' => $servicios->count(),
                'limit' => $limit
            ]);
        } catch (Exception $e) {
            return renderJson([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * GET /api/servicios/propiedad/{id}
     */
    public function getByPropiedad($propiedadId)
    {
        try {
            $servicios = Servicio::whereHas('propiedades', function ($q) use ($propiedadId) {
                $q->where('propiedad_id', $propiedadId);
            })->get();

            return renderJson([
                'success' => true,
                'data' => $servicios,
                'total' => $servicios->count(),
                'propiedad_id' => (int) $propiedadId
            ]);
        } catch (Exception $e) {
            return renderJson([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * GET /api/servicios/{id}
     */
    public function show($id)
    {
        $validacion = ServicioValidator::validarSoloId($id);

        if (!$validacion['success']) {
            return renderJson($validacion, 400);
        }

        try {
            $servicio = Servicio::find($id);

            if (!$servicio) {
                return renderJson([
                    'success' => false,
                    'error' => 'Servicio no encontrado'
                ], 404);
            }

            return renderJson([
                'success' => true,
                'data' => $servicio
            ]);
        } catch (Exception $e) {
            return renderJson([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * POST /api/servicios
     */
    public function store()
    {
        $raw = json_decode(file_get_contents('php://input'), true) ?? [];

        if (!is_array($raw)) {
            return renderJson([
                'success' => false,
                'error' => 'JSON inválido'
            ], 400);
        }

        $san = ServicioSanitizer::sanitizar($raw);
        $validacion = ServicioValidator::validarCrear($san);

        if (!$validacion['success']) {
            return renderJson($validacion, 400);
        }

        try {
            if (Servicio::where('nombre', $san['nombre'])->exists()) {
                return renderJson([
                    'success' => false,
                    'error' => 'Ya existe un servicio con este nombre'
                ], 409);
            }

            $servicio = Servicio::create($san);

            return renderJson([
                'success' => true,
                'message' => 'Servicio creado exitosamente',
                'data' => $servicio
            ], 201);

        } catch (Exception $e) {
            return renderJson([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * PUT /api/servicios/{id}
     */
    public function update($id)
    {
        $raw = json_decode(file_get_contents('php://input'), true) ?? [];

        if (!is_array($raw)) {
            return renderJson([
                'success' => false,
                'error' => 'JSON inválido'
            ], 400);
        }

        $raw['id'] = $id;

        $san = ServicioSanitizer::sanitizar($raw);
        $validacion = ServicioValidator::validarActualizar($san);

        if (!$validacion['success']) {
            return renderJson($validacion, 400);
        }

        try {
            $servicio = Servicio::find($id);

            if (!$servicio) {
                return renderJson([
                    'success' => false,
                    'error' => 'Servicio no encontrado'
                ], 404);
            }

            if (Servicio::where('nombre', $san['nombre'])
                ->where('id', '!=', $id)
                ->exists()) {
                return renderJson([
                    'success' => false,
                    'error' => 'Ya existe otro servicio con este nombre'
                ], 409);
            }

            $servicio->update($san);

            return renderJson([
                'success' => true,
                'message' => 'Servicio actualizado exitosamente',
                'data' => $servicio
            ]);

        } catch (Exception $e) {
            return renderJson([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * DELETE /api/servicios/{id}
     */
    public function delete($id)
    {
        $validacion = ServicioValidator::validarSoloId($id);

        if (!$validacion['success']) {
            return renderJson($validacion, 400);
        }

        try {
            $servicio = Servicio::find($id);

            if (!$servicio) {
                return renderJson([
                    'success' => false,
                    'error' => 'Servicio no encontrado'
                ], 404);
            }

            // Verificar relación con propiedades
            if ($servicio->propiedades()->exists()) {
                return renderJson([
                    'success' => false,
                    'error' => 'No se puede eliminar porque tiene propiedades asociadas'
                ], 409);
            }

            $servicio->delete();

            return renderJson([
                'success' => true,
                'message' => 'Servicio eliminado exitosamente'
            ]);

        } catch (Exception $e) {
            return renderJson([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }
}