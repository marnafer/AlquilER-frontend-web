<?php

namespace App\Controllers;

use App\Sanitizers\CategoriaSanitizer;
use App\Validators\CategoriaValidator;
use App\Models\Categoria;

class CategoriaController {

    public function listar() {
        try {
            $categorias = Categoria::all();

            renderJson([
                'success' => true,
                'data' => $categorias,
                'total' => count($categorias)
            ], 200);

        } catch (\Exception $e) {
            renderJson([
                'success' => false,
                'error' => 'Error interno del servidor'
            ], 500);
        }
    }

    public function obtener($id) {
        $idS = CategoriaSanitizer::sanitizeId($id);
        $validacion = CategoriaValidator::validarId($idS);

        if (!$validacion['success']) {
            renderJson($validacion, 400);
        }

        try {
            $categoria = Categoria::find($idS);

            if (!$categoria) {
                renderJson([
                    'success' => false,
                    'error' => 'Categoría no encontrada'
                ], 404);
            }

            renderJson([
                'success' => true,
                'data' => $categoria
            ], 200);

        } catch (\Exception $e) {
            renderJson([
                'success' => false,
                'error' => 'Error interno del servidor'
            ], 500);
        }
    }

    public function crear() {
        $raw = json_decode(file_get_contents('php://input'), true) ?? [];

        $san = CategoriaSanitizer::sanitizarCategoria($raw);
        $validacion = CategoriaValidator::validarCategoria($san, false);

        if (!$validacion['success']) {
            renderJson([
                'success' => false,
                'errors' => $validacion['errors']
            ], 400);
        }

        try {
            if (Categoria::where('nombre', $san['nombre'])->exists()) {
                renderJson([
                    'success' => false,
                    'error' => 'Ya existe una categoría con este nombre'
                ], 409);
            }

            $categoria = Categoria::create($san);

            renderJson([
                'success' => true,
                'message' => 'Categoría creada exitosamente',
                'data' => $categoria
            ], 201);

        } catch (\Exception $e) {
            renderJson([
                'success' => false,
                'error' => 'Error interno del servidor'
            ], 500);
        }
    }

    public function actualizar($id) {
        $raw = json_decode(file_get_contents('php://input'), true) ?? [];
        $raw['id'] = $id;

        $san = CategoriaSanitizer::sanitizarCategoria($raw);
        $validacion = CategoriaValidator::validarCategoria($san, true);

        if (!$validacion['success']) {
            renderJson([
                'success' => false,
                'errors' => $validacion['errors']
            ], 400);
        }

        try {
            $categoria = Categoria::find($san['id']);

            if (!$categoria) {
                renderJson([
                    'success' => false,
                    'error' => 'Categoría no encontrada'
                ], 404);
            }

            if (Categoria::where('nombre', $san['nombre'])
                ->where('id', '!=', $san['id'])
                ->exists()) {

                renderJson([
                    'success' => false,
                    'error' => 'Ya existe otra categoría con este nombre'
                ], 409);
            }

            $categoria->update($san);

            renderJson([
                'success' => true,
                'message' => 'Categoría actualizada exitosamente',
                'data' => $categoria
            ], 200);

        } catch (\Exception $e) {
            renderJson([
                'success' => false,
                'error' => 'Error interno del servidor'
            ], 500);
        }
    }

    public function eliminar($id) {
        $idS = CategoriaSanitizer::sanitizeId($id);
        $validacion = CategoriaValidator::validarId($idS);

        if (!$validacion['success']) {
            renderJson([
                'success' => false,
                'error' => $validacion['error']
            ], 400);
        }

        try {
            $categoria = Categoria::find($idS);

            if (!$categoria) {
                renderJson([
                    'success' => false,
                    'error' => 'Categoría no encontrada'
                ], 404);
            }

            if ($categoria->propiedades()->exists()) {
                renderJson([
                    'success' => false,
                    'error' => 'No se puede eliminar porque tiene propiedades asociadas'
                ], 409);
            }

            $categoria->delete();

            renderJson([
                'success' => true,
                'message' => 'Categoría eliminada exitosamente'
            ], 200);

        } catch (\Exception $e) {
            renderJson([
                'success' => false,
                'error' => 'Error interno del servidor'
            ], 500);
        }
    }
}