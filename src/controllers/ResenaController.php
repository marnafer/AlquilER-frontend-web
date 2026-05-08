<?php

namespace App\Controllers;

use App\Models\Resena;
use App\Sanitizers\ResenaSanitizer;
use App\Validators\ResenaValidator;
use Exception;

class ResenaController
{
    /**
     * GET /api/resenas
     */
    public function index()
    {
        try {
            $resenas = Resena::getAll();

            return renderJson([
                'success' => true,
                'data' => $resenas,
                'total' => count($resenas)
            ]);
        } catch (Exception $e) {
            return renderJson([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * GET /api/resenas/{id}
     */
    public function show($id)
    {
        $validacion = ResenaValidator::validarSoloId($id);

        if (!$validacion['success']) {
            return renderJson($validacion, 400);
        }

        try {
            $resena = Resena::getById($id);

            if (!$resena) {
                return renderJson([
                    'success' => false,
                    'error' => 'Reseña no encontrada'
                ], 404);
            }

            return renderJson([
                'success' => true,
                'data' => $resena
            ]);
        } catch (Exception $e) {
            return renderJson([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * GET /api/resenas/propiedad/{id}
     */
    public function getByPropiedad($propiedadId)
    {
        try {
            $resenas = Resena::getByPropiedad($propiedadId);
            $promedio = Resena::getPromedioByPropiedad($propiedadId);

            return renderJson([
                'success' => true,
                'data' => $resenas,
                'total' => count($resenas),
                'promedio' => $promedio['promedio'],
                'total_resenas' => $promedio['total'],
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
     * GET /api/resenas/usuario/{id}
     */
    public function getByUsuario($usuarioId)
    {
        try {
            $resenas = Resena::getByUsuario($usuarioId);

            return renderJson([
                'success' => true,
                'data' => $resenas,
                'total' => count($resenas),
                'usuario_id' => (int)$usuarioId
            ]);
        } catch (Exception $e) {
            return renderJson([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * GET /api/resenas/estadisticas
     */
    public function getEstadisticas()
    {
        try {
            $estadisticas = Resena::getEstadisticas();

            return renderJson([
                'success' => true,
                'data' => $estadisticas
            ]);
        } catch (Exception $e) {
            return renderJson([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * POST /api/resenas
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

        $datos = ResenaSanitizer::sanitizar($data);
        $validacion = ResenaValidator::validarCrear($datos);

        if (!$validacion['success']) {
            return renderJson($validacion, 400);
        }

        try {
            if (!Resena::reservaExistsAndFinalizada($datos['reserva_id'])) {
                return renderJson([
                    'success' => false,
                    'error' => 'La reserva no existe o no está finalizada'
                ], 404);
            }

            if (Resena::existePorReserva($datos['reserva_id'])) {
                return renderJson([
                    'success' => false,
                    'error' => 'Ya existe una reseña para esta reserva'
                ], 409);
            }

            $id = Resena::createResena($datos);

            return renderJson([
                'success' => true,
                'message' => 'Reseña creada exitosamente',
                'data' => ['id' => $id]
            ], 201);

        } catch (Exception $e) {
            return renderJson([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * PUT /api/resenas/{id}
     */
    public function update($id)
    {
        $data = json_decode(file_get_contents('php://input'), true);

        if (!$data) {
            return renderJson([
                'success' => false,
                'error' => 'Datos inválidos'
            ], 400);
        }

        $data['id'] = $id;

        $datos = ResenaSanitizer::sanitizar($data);
        $validacion = ResenaValidator::validarActualizar($datos);

        if (!$validacion['success']) {
            return renderJson($validacion, 400);
        }

        try {
            if (!Resena::exists($id)) {
                return renderJson([
                    'success' => false,
                    'error' => 'Reseña no encontrada'
                ], 404);
            }

            Resena::updateResena($id, $datos);

            return renderJson([
                'success' => true,
                'message' => 'Reseña actualizada exitosamente'
            ]);

        } catch (Exception $e) {
            return renderJson([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * DELETE /api/resenas/{id}
     */
    public function delete($id)
    {
        $validacion = ResenaValidator::validarSoloId($id);

        if (!$validacion['success']) {
            return renderJson($validacion, 400);
        }

        try {
            if (!Resena::exists($id)) {
                return renderJson([
                    'success' => false,
                    'error' => 'Reseña no encontrada'
                ], 404);
            }

            Resena::deleteResena($id);

            return renderJson([
                'success' => true,
                'message' => 'Reseña eliminada exitosamente'
            ]);

        } catch (Exception $e) {
            return renderJson([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }
}