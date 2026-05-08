<?php

namespace App\Controllers;

use App\Models\Localidad;
use App\Sanitizers\LocalidadSanitizer;
use App\Validators\LocalidadValidator;

class LocalidadController
{
    /**
     * GET /api/localidades
     */
    public function indexApi()
    {
        try {
            $localidades = Localidad::all();

            return renderJson([
                'success' => true,
                'data' => $localidades,
                'total' => $localidades->count()
            ], 200);

        } catch (\Exception $e) {
            return renderJson([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * GET /api/localidades/{id}
     */
    public function mostrarApi($id)
    {
        try {
            // 1. Sanitizar + validar
            $idSan = LocalidadSanitizer::sanitizarId($id);
            $validacion = LocalidadValidator::validarId($idSan);

            if (!$validacion['success']) {
                return renderJson([
                    'success' => false,
                    'error' => $validacion['error']
                ], 400);
            }

            // 2. Buscar
            $localidad = Localidad::find($idSan);

            if (!$localidad) {
                return renderJson([
                    'success' => false,
                    'error' => 'Localidad no encontrada'
                ], 404);
            }

            return renderJson([
                'success' => true,
                'data' => $localidad
            ], 200);

        } catch (\Exception $e) {
            return renderJson([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * POST /api/localidades
     */
    public function crear()
    {
        $raw = json_decode(file_get_contents('php://input'), true) ?? [];

        if (!is_array($raw)) {
            return renderJson([
                'success' => false,
                'error' => 'JSON inválido'
            ], 400);
        }

        // Sanitizar
        $san = LocalidadSanitizer::sanitizarLocalidad($raw);

        // Validar
        $validacion = LocalidadValidator::validarLocalidad($san);

        if (!$validacion['success']) {
            return renderJson([
                'success' => false,
                'errors' => $validacion['errors']
            ], 400);
        }

        $dataValida = $validacion['data']; // Solo los campos validados

        try {
            $localidad = Localidad::create($dataValida);

            return renderJson([
                'success' => true,
                'message' => 'Localidad creada',
                'data' => $localidad
            ], 201);

        } catch (\Exception $e) {
            return renderJson([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * PUT /api/localidades/{id}
     */
    public function actualizar($id)
    {
        $idSan = LocalidadSanitizer::sanitizarId($id);

        $validacionId = LocalidadValidator::validarId($idSan);

        if (!$validacionId['success']) {
            return renderJson($validacionId, 400);
        }

        $localidad = Localidad::find($idSan);

        if (!$localidad) {
            return renderJson([
                'success' => false,
                'error' => 'Localidad no encontrada'
            ], 404);
        }

        $raw = json_decode(file_get_contents('php://input'), true) ?? [];

        if (!is_array($raw)) {
            return renderJson([
                'success' => false,
                'error' => 'JSON inválido'
            ], 400);
        }

        // Sanitizar
        $san = LocalidadSanitizer::sanitizarLocalidad($raw);

        // Validar (modo update)
        $validacion = LocalidadValidator::validarLocalidad($san, true);

        if (!$validacion['success']) {
            return renderJson([
                'success' => false,
                'errors' => $validacion['errors']
            ], 400);
        }

        // NO usar id del validator
        $dataValida = $validacion['data'];

        $localidad->update($dataValida);

        return renderJson([
            'success' => true,
            'message' => 'Localidad actualizada',
            'data' => $localidad
        ]);
    }

    /**
     * DELETE /api/localidades/{id}
     */
    public function eliminar($id)
    {
        try {
            $idSan = LocalidadSanitizer::sanitizarId($id);
            $validacion = LocalidadValidator::validarId($idSan);

            if (!$validacion['success']) {
                return renderJson([
                    'success' => false,
                    'error' => $validacion['error']
                ], 400);
            }

            $localidad = Localidad::find($idSan);

            if (!$localidad) {
                return renderJson([
                    'success' => false,
                    'error' => 'Localidad no encontrada'
                ], 404);
            }

            $localidad->delete();

            return renderJson([
                'success' => true,
                'message' => "Localidad #$idSan eliminada"
            ], 200);

        } catch (\Exception $e) {
            return renderJson([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }
}