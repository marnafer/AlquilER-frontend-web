<?php

namespace App\Controllers;

use App\Models\LogActividad;
use App\Sanitizers\LogActividadSanitizer;
use App\Validators\LogActividadValidator;
use Exception;

class LogActividadController
{
    /**
     * GET /api/logs-actividad
     */
    public function index()
    {
        try {
            $logs = LogActividad::getAll();

            return renderJson([
                'success' => true,
                'data' => $logs,
                'total' => $logs->count()
            ]);
        } catch (Exception $e) {
            return renderJson([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * GET /api/logs-actividad/{id}
     */
    public function show($id)
    {
        $validacion = LogActividadValidator::validarSoloId($id);
        if (!$validacion['success']) {
            return renderJson($validacion, 400);
        }

        try {
            $log = LogActividad::find($id);

            if (!$log) {
                return renderJson([
                    'success' => false,
                    'error' => 'Log no encontrado'
                ], 404);
            }

            return renderJson([
                'success' => true,
                'data' => $log
            ]);
        } catch (Exception $e) {
            return renderJson([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * GET /api/logs-actividad/usuario/{id}
     */
    public function getByUsuario($usuarioId)
    {
        try {
            $logs = LogActividad::where('usuario_id', $usuarioId)->get();

            return renderJson([
                'success' => true,
                'data' => $logs,
                'total' => $logs->count(),
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
     * GET /api/logs-actividad/fecha?desde=X&hasta=Y
     */
    public function getByFecha()
    {
        $desde = $_GET['desde'] ?? null;
        $hasta = $_GET['hasta'] ?? null;

        if (!$desde || !$hasta) {
            return renderJson([
                'success' => false,
                'error' => 'Las fechas desde y hasta son requeridas'
            ], 400);
        }

        try {
            $logs = LogActividad::whereBetween('fecha', [
                $desde,
                $hasta . ' 23:59:59'
            ])->get();

            return renderJson([
                'success' => true,
                'data' => $logs,
                'total' => $logs->count(),
                'fecha_desde' => $desde,
                'fecha_hasta' => $hasta
            ]);
        } catch (Exception $e) {
            return renderJson([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * GET /api/logs-actividad/buscar?q=texto
     */
    public function search()
    {
        $q = $_GET['q'] ?? null;

        if (!$q) {
            return renderJson([
                'success' => false,
                'error' => 'El término de búsqueda es requerido'
            ], 400);
        }

        try {
            $logs = LogActividad::where('accion', 'LIKE', "%$q%")->get();

            return renderJson([
                'success' => true,
                'data' => $logs,
                'total' => $logs->count(),
                'busqueda' => $q
            ]);
        } catch (Exception $e) {
            return renderJson([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * GET /api/logs-actividad/estadisticas
     */
    public function getEstadisticas()
    {
        try {
            $total = LogActividad::count();

            return renderJson([
                'success' => true,
                'data' => [
                    'total_logs' => $total
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
     * POST /api/logs-actividad/registrar
     */
    public function registrar()
    {
        $data = json_decode(file_get_contents('php://input'), true) ?? [];

        if (!is_array($data)) {
            return renderJson([
                'success' => false,
                'error' => 'JSON inválido'
            ], 400);
        }

        $san = LogActividadSanitizer::sanitizar($data);
        $validacion = LogActividadValidator::validarCrear($san);

        if (!$validacion['success']) {
            return renderJson([
                'success' => false,
                'errors' => $validacion['errors']
            ], 400);
        }

        if (empty($san['ip_address'])) {
            $san['ip_address'] = LogActividadSanitizer::getClientIp();
        }

        try {
            $log = LogActividad::create($san);

            return renderJson([
                'success' => true,
                'message' => 'Log registrado',
                'data' => $log
            ], 201);
        } catch (Exception $e) {
            return renderJson([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * DELETE /api/logs-actividad/limpiar/antiguos?dias=30
     */
    public function limpiarAntiguos()
    {
        $dias = $_GET['dias'] ?? 30;

        if (!is_numeric($dias) || $dias <= 0) {
            return renderJson([
                'success' => false,
                'error' => 'El número de días debe ser positivo'
            ], 400);
        }

        try {
            $fechaLimite = date('Y-m-d H:i:s', strtotime("-{$dias} days"));

            $eliminados = LogActividad::where('fecha', '<', $fechaLimite)->delete();

            return renderJson([
                'success' => true,
                'message' => "Se eliminaron {$eliminados} logs",
                'data' => [
                    'dias' => (int)$dias,
                    'eliminados' => $eliminados
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
     * DELETE /api/logs-actividad/usuario/{id}
     */
    public function limpiarPorUsuario($usuarioId)
    {
        try {
            $eliminados = LogActividad::where('usuario_id', $usuarioId)->delete();

            return renderJson([
                'success' => true,
                'message' => "Logs eliminados",
                'data' => [
                    'usuario_id' => (int)$usuarioId,
                    'eliminados' => $eliminados
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
     * DELETE /api/logs-actividad/{id}
     */
    public function delete($id)
    {
        $validacion = LogActividadValidator::validarSoloId($id);
        if (!$validacion['success']) {
            return renderJson($validacion, 400);
        }

        try {
            $log = LogActividad::find($id);

            if (!$log) {
                return renderJson([
                    'success' => false,
                    'error' => 'Log no encontrado'
                ], 404);
            }

            $log->delete();

            return renderJson([
                'success' => true,
                'message' => 'Log eliminado'
            ]);
        } catch (Exception $e) {
            return renderJson([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }
}