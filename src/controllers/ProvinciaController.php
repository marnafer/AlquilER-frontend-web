<?php

namespace App\Controllers;

use App\Models\Provincia;
use App\Validators\ProvinciaValidator;
use App\Sanitizers\ProvinciaSanitizer;

class ProvinciaController {

    /**
     * GET /api/provincias
     */
    public function index() {
        try {
            $provincias = Provincia::all();

            return renderJson([
                'success' => true,
                'data' => $provincias,
                'total' => $provincias->count()
            ], 200);

        } catch (\Exception $e) {
            return renderJson([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * GET /api/provincias/con-localidades
     */
    public function indexWithCount() {
        try {
            $provincias = Provincia::withCount('localidades')->get();

            return renderJson([
                'success' => true,
                'data' => $provincias,
                'total' => $provincias->count()
            ], 200);

        } catch (\Exception $e) {
            return renderJson([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * GET /api/provincias/{id}
     */
    public function show($id) {

        $idSan = ProvinciaSanitizer::sanitizarIdProvincia($id);
        $validacion = ProvinciaValidator::validarSoloIdProvincia($idSan);

        if (!$validacion['success']) {
            return renderJson($validacion, 400);
        }

        try {
            $provincia = Provincia::find($idSan);

            if (!$provincia) {
                return renderJson([
                    'success' => false,
                    'error' => 'Provincia no encontrada'
                ], 404);
            }

            return renderJson([
                'success' => true,
                'data' => $provincia
            ], 200);

        } catch (\Exception $e) {
            return renderJson([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * POST /api/provincias
     */
    public function store() {

        $raw = json_decode(file_get_contents('php://input'), true);

        if (!is_array($raw)) {
            return renderJson([
                'success' => false,
                'error' => 'JSON inválido'
            ], 400);
        }

        // 1. Sanitizar
        $san = ProvinciaSanitizer::sanitizarProvincia($raw);

        // 2. Validar
        $validacion = ProvinciaValidator::validarCrearProvincia($san);

        if (!$validacion['success']) {
            return renderJson($validacion, 400);
        }

        try {

            if (Provincia::where('nombre', $san['nombre'])->exists()) {
                return renderJson([
                    'success' => false,
                    'error' => 'Ya existe una provincia con este nombre'
                ], 409);
            }

            $provincia = Provincia::create($san);

            return renderJson([
                'success' => true,
                'message' => 'Provincia creada exitosamente',
                'data' => $provincia
            ], 201);

        } catch (\Exception $e) {
            return renderJson([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * PUT /api/provincias/{id}
     */
    public function update($id) {

        $raw = json_decode(file_get_contents('php://input'), true);

        if (!is_array($raw)) {
            return renderJson([
                'success' => false,
                'error' => 'JSON inválido'
            ], 400);
        }

        $raw['id'] = $id;

        // 1. Sanitizar
        $san = ProvinciaSanitizer::sanitizarProvincia($raw);

        // 2. Validar
        $validacion = ProvinciaValidator::validarActualizarProvincia($san);

        if (!$validacion['success']) {
            return renderJson($validacion, 400);
        }

        try {

            $provincia = Provincia::find($san['id']);

            if (!$provincia) {
                return renderJson([
                    'success' => false,
                    'error' => 'Provincia no encontrada'
                ], 404);
            }

            if (Provincia::where('nombre', $san['nombre'])
                ->where('id', '!=', $san['id'])
                ->exists()) {

                return renderJson([
                    'success' => false,
                    'error' => 'Ya existe otra provincia con este nombre'
                ], 409);
            }

            $provincia->update($san);

            return renderJson([
                'success' => true,
                'message' => 'Provincia actualizada exitosamente',
                'data' => $provincia
            ], 200);

        } catch (\Exception $e) {
            return renderJson([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * DELETE /api/provincias/{id}
     */
    public function delete($id) {

        $idSan = ProvinciaSanitizer::sanitizarIdProvincia($id);
        $validacion = ProvinciaValidator::validarSoloIdProvincia($idSan);

        if (!$validacion['success']) {
            return renderJson($validacion, 400);
        }

        try {

            $provincia = Provincia::find($idSan);

            if (!$provincia) {
                return renderJson([
                    'success' => false,
                    'error' => 'Provincia no encontrada'
                ], 404);
            }

            // relación Eloquent: provincias -> localidades
            if ($provincia->localidades()->exists()) {
                return renderJson([
                    'success' => false,
                    'error' => 'No se puede eliminar la provincia porque tiene localidades asociadas'
                ], 409);
            }

            $provincia->delete();

            return renderJson([
                'success' => true,
                'message' => 'Provincia eliminada exitosamente'
            ], 200);

        } catch (\Exception $e) {
            return renderJson([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }
}