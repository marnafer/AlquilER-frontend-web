<?php

namespace App\Controllers;

require_once SRC_PATH . 'sanitizers/PropiedadSanitizer.php';
require_once SRC_PATH . 'validators/PropiedadValidator.php';

use App\Models\Propiedad;
use App\Sanitizers\PropiedadSanitizer;
use App\Validators\PropiedadValidator;
use App\Middlewares\AutenticadorMiddleware;

class PropiedadController {

    /**
     * VISTA: formulario HTML (solo propietarios)
     */
    public function mostrarFormulario() {

        AutenticadorMiddleware::soloPropietario();

        header('Content-Type: text/html; charset=utf-8');
        require_once SRC_PATH . 'views/propiedades_views/propiedades_form.php';
        exit;
    }

    /**
     * VISTA: listado HTML (opcional)
     */
    public function listarPropiedades() {
        try {
            $propiedades = Propiedad::all();

            header('Content-Type: text/html; charset=utf-8');
            require_once SRC_PATH . 'views/propiedades_views/propiedades_listar.php';

        } catch (\Exception $e) {
            die("Error al listar propiedades: " . $e->getMessage());
        }
    }

    /**
     * API: listar propiedades (PÚBLICO)
     */
    public function indexApi() {

        try {
            $propiedades = Propiedad::whereNull('deleted_at')->get();

            renderJson([
                'status' => 'success',
                'data' => $propiedades
            ], 200);

        } catch (\Exception $e) {

            renderJson([
                'status' => 'error',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * API: ver propiedad (PÚBLICO)
     */
    public function mostrarApi($id) {

        try {
            $propiedad = Propiedad::find($id);

            if (!$propiedad) {
                return renderJson([
                    'status' => 'error',
                    'message' => 'Propiedad no encontrada'
                ], 404);
            }

            return renderJson([
                'status' => 'success',
                'data' => $propiedad
            ], 200);

        } catch (\Exception $e) {

            return renderJson([
                'status' => 'error',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * API: crear propiedad (SOLO PROPIETARIO)
     */
    public function crear() {

        $user = AutenticadorMiddleware::soloPropietario();

        $inputRaw = file_get_contents("php://input");
        $inputData = json_decode($inputRaw, true) ?? $_POST;

        $datosLimpios = PropiedadSanitizer::sanitizarPropiedad($inputData);
<<<<<<< HEAD
=======

        unset($datosLimpios['id']); // no permitir ID en creación (autoincremental)

        $errores = PropiedadValidator::validarPropiedad($datosLimpios);

        if (!empty($errores)) {
            return renderJson([
                'status' => 'error',
                'errors' => $errores
            ], 400);
        }
>>>>>>> 4ad93a49aafe06e2454ad57b841b94bddc9cafc9

        try {
            $datosLimpios['usuario_id'] = $user->sub;

            $propiedad = Propiedad::create($datosLimpios);

            return renderJson([
                'status' => 'success',
                'message' => 'Propiedad creada con éxito',
                'data' => [
                    'id' => $propiedad->id
                ]
            ], 201);

        } catch (\Exception $e) {

            return renderJson([
                'status' => 'error',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * API: actualizar propiedad (SOLO PROPIETARIO + dueño)
     */
    public function actualizar($id) {

        $user = AutenticadorMiddleware::soloPropietario();

        $propiedad = Propiedad::find($id);

        if (!$propiedad) {
            return renderJson([
                'status' => 'error',
                'message' => 'Propiedad no encontrada'
            ], 404);
        }

        // control de dueño
        if ($propiedad->usuario_id != $user->sub) {
            return renderJson([
                'status' => 'error',
                'message' => 'No tienes permiso para modificar esta propiedad'
            ], 403);
        }

        $inputRaw = file_get_contents("php://input");
        $inputData = json_decode($inputRaw, true) ?? $_POST;

        $datosLimpios = PropiedadSanitizer::sanitizarPropiedad($inputData);
<<<<<<< HEAD
=======
        $errores = PropiedadValidator::validarPropiedad($datosLimpios);

        if (!empty($errores)) {
            return renderJson([
                'status' => 'error',
                'errors' => $errores
            ], 400);
        }
>>>>>>> 4ad93a49aafe06e2454ad57b841b94bddc9cafc9

        try {
            $propiedad->fill($datosLimpios);
            $propiedad->save();

            return renderJson([
                'status' => 'success',
                'message' => 'Propiedad actualizada',
                'data' => [
                    'id' => $propiedad->id
                ]
            ], 200);

        } catch (\Exception $e) {

            return renderJson([
                'status' => 'error',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * API: eliminar propiedad (SOLO PROPIETARIO + dueño)
     */
    public function eliminar($id) {

        $user = AutenticadorMiddleware::soloPropietario();

        try {
            $propiedad = Propiedad::find($id);

            if (!$propiedad || $propiedad->deleted_at !== null) { // Checkear soft delete si ya fue eliminada
                return renderJson([
                    'status' => 'error',
                    'message' => 'Propiedad no encontrada'
                ], 404);
            }

            // control de dueño
            if ($propiedad->usuario_id != $user->sub) {
                return renderJson([
                    'status' => 'error',
                    'message' => 'No tienes permiso para eliminar esta propiedad'
                ], 403);
            }

            $propiedad->delete();

            return renderJson([
                'status' => 'success',
                'message' => "Propiedad #$id eliminada correctamente"
            ], 200);

        } catch (\Exception $e) {

            return renderJson([
                'status' => 'error',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * API: restaurar propiedad (SOLO PROPIETARIO + dueño)
     */
     public function restaurar($id) {
        $user = AutenticadorMiddleware::soloPropietario();
        try {
            $propiedad = Propiedad::withTrashed()->find($id);
            if (!$propiedad) {
                return renderJson([
                    'status' => 'error',
                    'message' => 'Propiedad no encontrada'
                ], 404);
            }
            // control de dueño
            if ($propiedad->usuario_id != $user->sub) {
                return renderJson([
                    'status' => 'error',
                    'message' => 'No tienes permiso para restaurar esta propiedad'
                ], 403);
            }
            if ($propiedad->deleted_at === null) {
                return renderJson([
                    'status' => 'error',
                    'message' => 'La propiedad no está eliminada'
                ], 400);
            }
            $propiedad->restore();
            return renderJson([
                'status' => 'success',
                'message' => "Propiedad #$id restaurada correctamente"
            ], 200);
        } catch (\Exception $e) {
            return renderJson([
                'status' => 'error',
                'message' => $e->getMessage()
            ], 500);
        }
     }    
}