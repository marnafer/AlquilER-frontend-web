<?php

namespace App\Controllers;

use App\Models\Reserva;
use App\Models\Propiedad;
use App\Models\Usuario;
use App\Sanitizers\ReservaSanitizer;
use App\Validators\ReservaValidator;

class ReservaController
{
    /**
     * GET /api/reservas
     */
    public function index()
    {
        try {
            $reservas = Reserva::all();

            return renderJson([
                'success' => true,
                'data' => $reservas,
                'total' => $reservas->count()
            ], 200);

        } catch (\Exception $e) {
            return renderJson([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * GET /api/reservas/{id}
     */
    public function show($id)
    {
        // Sanitizar + validar ID
        $idSan = ReservaSanitizer::sanitizarId($id);
        $validacion = ReservaValidator::validarSoloId($idSan);

        if (!$validacion['success']) {
            return renderJson($validacion, 400);
        }

        try {
            $reserva = Reserva::find($idSan);

            if (!$reserva) {
                return renderJson([
                    'success' => false,
                    'error' => 'Reserva no encontrada'
                ], 404);
            }

            return renderJson([
                'success' => true,
                'data' => $reserva
            ], 200);

        } catch (\Exception $e) {
            return renderJson([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * GET /api/reservas/propiedad/{id}
     */
    public function getByPropiedad($propiedadId)
    {
        try {
            $reservas = Reserva::where('propiedad_id', $propiedadId)->get();

            return renderJson([
                'success' => true,
                'data' => $reservas,
                'total' => $reservas->count()
            ], 200);

        } catch (\Exception $e) {
            return renderJson([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * GET /api/reservas/inquilino/{id}
     */
    public function getByInquilino($inquilinoId)
    {
        try {
            $reservas = Reserva::where('inquilino_id', $inquilinoId)->get();

            return renderJson([
                'success' => true,
                'data' => $reservas,
                'total' => $reservas->count()
            ], 200);

        } catch (\Exception $e) {
            return renderJson([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * POST /api/reservas
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

        // 1. Sanitizar
        $san = ReservaSanitizer::sanitizar($raw);

        // 2. Validar
        $validacion = ReservaValidator::validarCrear($san);

        if (!$validacion['success']) {
            return renderJson([
                'success' => false,
                'errors' => $validacion['errors']
            ], 400);
        }

        $data = $validacion['data'];

        try {
            // Verificar propiedad
            if (!Propiedad::find($data['propiedad_id'])) {
                return renderJson([
                    'success' => false,
                    'error' => 'Propiedad no existe'
                ], 404);
            }

            // Verificar inquilino
            if (!Usuario::find($data['inquilino_id'])) {
                return renderJson([
                    'success' => false,
                    'error' => 'Inquilino no existe'
                ], 404);
            }

            // Verificar disponibilidad
            $existe = Reserva::where('propiedad_id', $data['propiedad_id'])
                ->where(function ($q) use ($data) {
                    $q->whereBetween('fecha_desde', [$data['fecha_desde'], $data['fecha_hasta']])
                      ->orWhereBetween('fecha_hasta', [$data['fecha_desde'], $data['fecha_hasta']]);
                })
                ->exists();

            if ($existe) {
                return renderJson([
                    'success' => false,
                    'error' => 'Propiedad no disponible en esas fechas'
                ], 409);
            }

            $reserva = Reserva::create($data);

            return renderJson([
                'success' => true,
                'message' => 'Reserva creada',
                'data' => $reserva
            ], 201);

        } catch (\Exception $e) {
            return renderJson([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * PUT /api/reservas/{id}
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

        $san = ReservaSanitizer::sanitizar($raw);
        $validacion = ReservaValidator::validarActualizar($san);

        if (!$validacion['success']) {
            return renderJson([
                'success' => false,
                'errors' => $validacion['errors']
            ], 400);
        }

        try {
            $reserva = Reserva::find($id);

            if (!$reserva) {
                return renderJson([
                    'success' => false,
                    'error' => 'Reserva no encontrada'
                ], 404);
            }

            $reserva->update($validacion['data']);

            return renderJson([
                'success' => true,
                'message' => 'Reserva actualizada',
                'data' => $reserva
            ], 200);

        } catch (\Exception $e) {
            return renderJson([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * PATCH /api/reservas/{id}/estado
     */
    public function changeStatus($id)
    {
        $raw = json_decode(file_get_contents('php://input'), true) ?? [];

        if (!isset($raw['estado'])) {
            return renderJson([
                'success' => false,
                'error' => 'Estado requerido'
            ], 400);
        }

        $estadoSan = ReservaSanitizer::sanitizarSoloEstado($raw['estado']);
        $validacion = ReservaValidator::validarSoloEstado($estadoSan);

        if (!$validacion['success']) {
            return renderJson($validacion, 400);
        }

        try {
            $reserva = Reserva::find($id);

            if (!$reserva) {
                return renderJson([
                    'success' => false,
                    'error' => 'Reserva no encontrada'
                ], 404);
            }

            $reserva->estado = $estadoSan;
            $reserva->save();

            return renderJson([
                'success' => true,
                'message' => 'Estado actualizado',
                'data' => $reserva
            ], 200);

        } catch (\Exception $e) {
            return renderJson([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * DELETE /api/reservas/{id}
     */
    public function delete($id)
    {
        $idSan = ReservaSanitizer::sanitizarId($id);
        $validacion = ReservaValidator::validarSoloId($idSan);

        if (!$validacion['success']) {
            return renderJson($validacion, 400);
        }

        try {
            $reserva = Reserva::find($idSan);

            if (!$reserva) {
                return renderJson([
                    'success' => false,
                    'error' => 'Reserva no encontrada'
                ], 404);
            }

            $reserva->delete();

            return renderJson([
                'success' => true,
                'message' => 'Reserva eliminada'
            ], 200);

        } catch (\Exception $e) {
            return renderJson([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * GET /api/reservas/disponibilidad
     */
    public function checkAvailability()
    {
        $propiedadId = $_GET['propiedad_id'] ?? null;
        $fechaDesde = $_GET['fecha_desde'] ?? null;
        $fechaHasta = $_GET['fecha_hasta'] ?? null;

        $sanFechas = ReservaSanitizer::sanitizarFechas([
            'fecha_desde' => $fechaDesde,
            'fecha_hasta' => $fechaHasta
        ]);

        $validacion = ReservaValidator::validarFechasDisponibilidad($sanFechas);

        if (!$validacion['success']) {
            return renderJson($validacion, 400);
        }

        try {
            $existe = Reserva::where('propiedad_id', $propiedadId)
            ->where(function ($query) use ($desde, $hasta) {
                $query->where('fecha_desde', '<', $hasta)
                      ->where('fecha_hasta', '>', $desde);
            })
            ->exists();

            return renderJson([
                'success' => true,
                'data' => [
                    'disponible' => !$existe
                ]
            ], 200);

        } catch (\Exception $e) {
            return renderJson([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }
}