<?php

namespace App\Controllers;

require_once SRC_PATH . 'sanitizers/PropiedadSanitizer.php';
require_once SRC_PATH . 'validators/PropiedadValidator.php';

use App\Models\Propiedad;
use App\Sanitizers\PropiedadSanitizer;
use App\Validators\PropiedadValidator;

class PropiedadController {

    /**
     * VISTA: Muestra el formulario de carga (HTML)
     */
    public function mostrarFormulario() {
        header('Content-Type: text/html; charset=utf-8');
        require_once SRC_PATH . 'views/propiedades_views/propiedades_form.php';
        exit;
    }

    /**
     * VISTA (opcional): listado HTML
     */
    public function listarPropiedades() {
        try {
            $propiedades = Propiedad::all();
            // Ajusta la ruta de la vista si tu estructura es distinta
            header('Content-Type: text/html; charset=utf-8');
            require_once SRC_PATH . 'views/propiedades_views/propiedades_listar.php';
        } catch (\Exception $e) {
            die("Error al listar propiedades: " . $e->getMessage());
        }
    }

    /**
     * API: Listar todas las propiedades (GET /api/propiedades)
     */
    public function indexApi() {
        header('Content-Type: application/json; charset=utf-8');
        try {
            $propiedades = Propiedad::all();
            http_response_code(200);
            echo json_encode(['status' => 'success', 'data' => $propiedades], JSON_UNESCAPED_UNICODE);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
        }
    }

    /**
     * API: Mostrar una propiedad (GET /api/propiedades/{id})
     */
    public function mostrarApi($id) {
        header('Content-Type: application/json; charset=utf-8');
        try {
            $propiedad = Propiedad::find($id);
            if (!$propiedad) {
                http_response_code(404);
                echo json_encode(['status' => 'error', 'message' => 'Propiedad no encontrada']);
                return;
            }
            echo json_encode(['status' => 'success', 'data' => $propiedad], JSON_UNESCAPED_UNICODE);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
        }
    }

    /**
     * API: Crear propiedad (POST /api/propiedades)
     */
    public function crear() {
        header('Content-Type: application/json; charset=utf-8');

        $inputRaw = file_get_contents("php://input");
        $inputData = json_decode($inputRaw, true) ?? $_POST;

        $datosLimpios = PropiedadSanitizer::sanitizarPropiedad($inputData);

        try {
            $propiedad = Propiedad::create($datosLimpios);
            http_response_code(201);
            echo json_encode([
                'status' => 'success',
                'message' => 'Propiedad creada con éxito',
                'data' => ['id' => $propiedad->id]
            ], JSON_UNESCAPED_UNICODE);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
        }
    }

    /**
     * API: Actualizar propiedad (PUT /api/propiedades/{id})
     * Nota: espera payload completo; adaptar si se quiere soportar PATCH parcial.
     */
    public function actualizar($id) {
        header('Content-Type: application/json; charset=utf-8');

        $propiedad = Propiedad::find($id);
        if (!$propiedad) {
            http_response_code(404);
            echo json_encode(['status' => 'error', 'message' => 'Propiedad no encontrada']);
            return;
        }

        $inputRaw = file_get_contents("php://input");
        $inputData = json_decode($inputRaw, true) ?? $_POST;

        $datosLimpios = PropiedadSanitizer::sanitizarPropiedad($inputData);

        try {
            $propiedad->fill($datosLimpios);
            $propiedad->save();

            echo json_encode(['status' => 'success', 'message' => 'Propiedad actualizada', 'data' => ['id' => $propiedad->id]], JSON_UNESCAPED_UNICODE);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
        }
    }

    /**
     * API: Eliminar propiedad (DELETE /api/propiedades/{id})
     */
    public function eliminar($id) {
        header('Content-Type: application/json; charset=utf-8');
        try {
            $propiedad = Propiedad::find($id);
            if (!$propiedad) {
                http_response_code(404);
                echo json_encode(['status' => 'error', 'message' => 'Propiedad no encontrada']);
                return;
            }
            $propiedad->delete();
            echo json_encode(['status' => 'success', 'message' => "Propiedad #$id eliminada"]);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
        }
    }
}