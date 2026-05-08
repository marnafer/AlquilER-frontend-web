<?php

namespace App\Controllers;

use App\Models\PropiedadServicio;
use App\Validators\PropiedadServicioValidator;
use App\Sanitizers\PropiedadServicioSanitizer;
use Exception;

class PropiedadServicioController
{
    /**
     * GET /api/propiedades-servicios
     */
    public function index()
    {
        try {
            $relaciones = PropiedadServicio::all();

            return renderJson([
                'success' => true,
                'data' => $relaciones,
                'total' => $relaciones->count()
            ]);
        } catch (Exception $e) {
            return renderJson([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * GET /api/propiedades-servicios/estadisticas
     */
    public function getEstadisticas()
    {
        try {
            $data = PropiedadServicio::getEstadisticas();

            return renderJson([
                'success' => true,
                'data' => $data
            ]);
        } catch (Exception $e) {
            return renderJson([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * GET /api/propiedades-servicios/propiedad/{id}
     */
    public function getByPropiedad($propiedadId)
    {
        try {
            $relaciones = PropiedadServicio::where('propiedad_id', $propiedadId)->get();

            return renderJson([
                'success' => true,
                'data' => $relaciones,
                'total' => $relaciones->count(),
                'propiedad_id' => (int)$propiedadId
            ]);
        } catch (Exception $e) {
            return renderJson([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * GET /api/propiedades-servicios/servicio/{id}
     */
    public function getByServicio($servicioId)
    {
        try {
            $relaciones = PropiedadServicio::where('servicio_id', $servicioId)->get();

            return renderJson([
                'success' => true,
                'data' => $relaciones,
                'total' => $relaciones->count(),
                'servicio_id' => (int)$servicioId
            ]);
        } catch (Exception $e) {
            return renderJson([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * GET /api/propiedades-servicios/{id}
     */
    public function show($id)
    {
        $validacion = PropiedadServicioValidator::validarSoloId($id);
        if (!$validacion['success']) {
            return renderJson($validacion, 400);
        }

        try {
            $relacion = PropiedadServicio::find($id);

            if (!$relacion) {
                return renderJson([
                    'success' => false,
                    'error' => 'Relación no encontrada'
                ], 404);
            }

            return renderJson([
                'success' => true,
                'data' => $relacion
            ]);
        } catch (Exception $e) {
            return renderJson([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * POST /api/propiedades-servicios
     */
    public function store()
    {
        $data = json_decode(file_get_contents('php://input'), true);

        if (!$data) {
            return renderJson([
                'success' => false,
                'error' => 'Datos inválidos'
            ], 400);
        }

        $data = PropiedadServicioSanitizer::sanitizar($data);
        $validacion = PropiedadServicioValidator::validarCrear($data);

        if (!$validacion['success']) {
            return renderJson($validacion, 400);
        }

        try {
            if (PropiedadServicio::where('propiedad_id', $data['propiedad_id'])
                ->where('servicio_id', $data['servicio_id'])
                ->exists()) {

                return renderJson([
                    'success' => false,
                    'error' => 'Esta propiedad ya tiene ese servicio'
                ], 409);
            }

            $relacion = PropiedadServicio::create($data);

            return renderJson([
                'success' => true,
                'message' => 'Servicio asignado correctamente',
                'data' => $relacion
            ], 201);

        } catch (Exception $e) {
            return renderJson([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * POST /api/propiedades-servicios/sync/{propiedadId}
     */
    public function sync($propiedadId)
    {
        $data = json_decode(file_get_contents('php://input'), true);

        if (!isset($data['servicios_ids']) || !is_array($data['servicios_ids'])) {
            return renderJson([
                'success' => false,
                'error' => 'Debe enviar un array de servicios_ids'
            ], 400);
        }

        try {
            // eliminar actuales
            PropiedadServicio::where('propiedad_id', $propiedadId)->delete();

            $insertados = [];

            foreach ($data['servicios_ids'] as $servicioId) {
                $insertados[] = PropiedadServicio::create([
                    'propiedad_id' => $propiedadId,
                    'servicio_id' => $servicioId
                ]);
            }

            return renderJson([
                'success' => true,
                'message' => 'Servicios sincronizados',
                'data' => [
                    'propiedad_id' => (int)$propiedadId,
                    'total' => count($insertados)
                ]
            ]);

        } catch (Exception $e) {
            return renderJson([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * DELETE /api/propiedades-servicios/{id}
     */
    public function delete($id)
    {
        $validacion = PropiedadServicioValidator::validarSoloId($id);
        if (!$validacion['success']) {
            return renderJson($validacion, 400);
        }

        try {
            $relacion = PropiedadServicio::find($id);

            if (!$relacion) {
                return renderJson([
                    'success' => false,
                    'error' => 'Relación no encontrada'
                ], 404);
            }

            $relacion->delete();

            return renderJson([
                'success' => true,
                'message' => 'Relación eliminada'
            ]);

        } catch (Exception $e) {
            return renderJson([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * DELETE /api/propiedades-servicios/propiedad/{id}
     */
    public function deleteByPropiedad($propiedadId)
    {
        try {
            $count = PropiedadServicio::where('propiedad_id', $propiedadId)->delete();

            return renderJson([
                'success' => true,
                'message' => 'Servicios eliminados',
                'data' => [
                    'propiedad_id' => (int)$propiedadId,
                    'eliminados' => $count
                ]
            ]);

        } catch (Exception $e) {
            return renderJson([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }
}