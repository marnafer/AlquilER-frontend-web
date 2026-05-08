<?php

namespace App\Controllers;

use App\Models\Favorito;
use App\Models\Usuario;
use App\Models\Propiedad;
use App\Sanitizers\FavoritoSanitizer;
use App\Validators\FavoritoValidator;
use Exception;

// Futuras implementaciones: Autenticacion + DELETE tipo : DELETE /favoritos/{usuario_id}/{propiedad_id} 

class FavoritoController {

    public function listarTodos() {
        try {
            $favoritos = Favorito::with(['usuario', 'propiedad'])->get();

            return renderJson([
                'success' => true,
                'data' => $favoritos,
                'total' => $favoritos->count()
            ], 200);

        } catch (Exception $e) {
            return renderJson([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function listarFavoritos($usuario_id) {
        try {
            $usuario = Usuario::find($usuario_id);

            if (!$usuario) {
                return renderJson([
                    'success' => false,
                    'error' => 'Usuario no encontrado'
                ], 404);
            }

            $favoritos = Favorito::where('usuario_id', $usuario_id)
                ->with('propiedad')
                ->get();

            return renderJson([
                'success' => true,
                'data' => $favoritos,
                'total' => $favoritos->count()
            ], 200);

        } catch (Exception $e) {
            return renderJson([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function agregarFavorito() {

        $raw = json_decode(file_get_contents("php://input"), true);

        if (!is_array($raw)) {
            return renderJson([
                'success' => false,
                'error' => 'JSON inválido'
            ], 400);
        }

        $datosLimpios = FavoritoSanitizer::sanitizarFavorito($raw);
        $errores = FavoritoValidator::validarFavorito($datosLimpios);

        if (!empty($errores)) {
            return renderJson([
                'success' => false,
                'errors' => $errores
            ], 400);
        }

        try {
            $usuario = Usuario::find($datosLimpios['usuario_id']);
            if (!$usuario) {
                return renderJson([
                    'success' => false,
                    'error' => 'Usuario no encontrado'
                ], 404);
            }

            $propiedad = Propiedad::find($datosLimpios['propiedad_id']);
            if (!$propiedad) {
                return renderJson([
                    'success' => false,
                    'error' => 'Propiedad no encontrada'
                ], 404);
            }

            $existe = Favorito::where('usuario_id', $datosLimpios['usuario_id'])
                ->where('propiedad_id', $datosLimpios['propiedad_id'])
                ->first();

            if ($existe) {
                return renderJson([
                    'success' => false,
                    'error' => 'Ya está en favoritos'
                ], 409);
            }

            $favorito = Favorito::create($datosLimpios);

            return renderJson([
                'success' => true,
                'message' => 'Agregado a favoritos',
                'data' => $favorito
            ], 201);

        } catch (Exception $e) {
            return renderJson([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function eliminarFavorito() {

        $raw = json_decode(file_get_contents('php://input'), true);

        if (!is_array($raw)) {
            return renderJson([
                'success' => false,
                'error' => 'JSON inválido'
            ], 400);
        }

        $datosLimpios = FavoritoSanitizer::sanitizarFavorito($raw);
        $errores = FavoritoValidator::validarQuitarFavorito($datosLimpios);

        if (!empty($errores)) {
            return renderJson([
                'success' => false,
                'errors' => $errores
            ], 400);
        }

        try {
            $existe = Favorito::where('usuario_id', $datosLimpios['usuario_id'])
                ->where('propiedad_id', $datosLimpios['propiedad_id'])
                ->first();

            if (!$existe) {
                return renderJson([
                    'success' => false,
                    'error' => 'Favorito no encontrado'
                ], 404);
            }

            $existe->delete();

            return renderJson([
                'success' => true,
                'message' => 'Favorito eliminado correctamente'
            ], 200);

        } catch (Exception $e) {
            return renderJson([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function eliminarFavoritoPorId($id) {

        try {
            $idSan = FavoritoSanitizer::sanitizarId($id);
            $validacion = FavoritoValidator::validarId($idSan);

            if (!$validacion['success']) {
                return renderJson([
                    'success' => false,
                    'error' => $validacion['error']
                ], 400);
            }

            $favorito = Favorito::find($idSan);

            if (!$favorito) {
                return renderJson([
                    'success' => false,
                    'error' => 'Favorito no encontrado'
                ], 404);
            }

            $favorito->delete();

            return renderJson([
                'success' => true,
                'message' => 'Favorito eliminado exitosamente'
            ], 200);

        } catch (Exception $e) {
            return renderJson([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }
}