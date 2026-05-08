<?php

namespace App\Validators;

class ReservaValidator
{
    /**
     * Validar todos los datos de una reserva
     */
    public static function validar(array $data, bool $requerirId = false): array
    {
        $errores = [];

        // ID
        if ($requerirId) {
            $error = self::validarId($data['id'] ?? null);
            if ($error) $errores['id'] = $error;
        }

        // propiedad_id
        $error = self::validarPropiedadId($data['propiedad_id'] ?? null);
        if ($error) $errores['propiedad_id'] = $error;

        // inquilino_id
        $error = self::validarInquilinoId($data['inquilino_id'] ?? null);
        if ($error) $errores['inquilino_id'] = $error;

        // fechas
        $error = self::validarFechaDesde($data['fecha_desde'] ?? null);
        if ($error) $errores['fecha_desde'] = $error;

        $error = self::validarFechaHasta($data['fecha_hasta'] ?? null);
        if ($error) $errores['fecha_hasta'] = $error;

        // relación fechas
        if (!isset($errores['fecha_desde']) && !isset($errores['fecha_hasta'])) {
            $error = self::validarRelacionFechas(
                $data['fecha_desde'] ?? null,
                $data['fecha_hasta'] ?? null
            );
            if ($error) $errores['fechas'] = $error;
        }

        // precio
        $error = self::validarPrecio($data['precio_total'] ?? null);
        if ($error) $errores['precio_total'] = $error;

        // estado
        if (isset($data['estado'])) {
            $error = self::validarEstado($data['estado']);
            if ($error) $errores['estado'] = $error;
        }

        // ❗ FORMATO ESTÁNDAR
        if (!empty($errores)) {
            return [
                'success' => false,
                'message' => 'Error de validación',
                'errors' => $errores,
                'data' => null
            ];
        }

        return [
            'success' => true,
            'message' => 'Validación exitosa',
            'errors' => null,
            'data' => $data
        ];
    }

    public static function validarCrear(array $data): array
    {
        return self::validar($data, false);
    }

    public static function validarActualizar(array $data): array
    {
        return self::validar($data, true);
    }

    /**
     * VALIDAR SOLO ID
     */
    public static function validarSoloId($id): array
    {
        $error = self::validarId($id);

        if ($error) {
            return [
                'success' => false,
                'message' => 'ID inválido',
                'errors' => ['id' => $error],
                'data' => null
            ];
        }

        return [
            'success' => true,
            'message' => 'ID válido',
            'errors' => null,
            'data' => ['id' => $id]
        ];
    }

    /**
     * VALIDAR FECHAS DISPONIBILIDAD
     */
    public static function validarFechasDisponibilidad(array $data): array
    {
        $errores = [];

        $error = self::validarFechaDesde($data['fecha_desde'] ?? null);
        if ($error) $errores['fecha_desde'] = $error;

        $error = self::validarFechaHasta($data['fecha_hasta'] ?? null);
        if ($error) $errores['fecha_hasta'] = $error;

        if (!isset($errores['fecha_desde']) && !isset($errores['fecha_hasta'])) {
            $error = self::validarRelacionFechas(
                $data['fecha_desde'],
                $data['fecha_hasta']
            );
            if ($error) $errores['fechas'] = $error;
        }

        if (!empty($errores)) {
            return [
                'success' => false,
                'message' => 'Error de validación de fechas',
                'errors' => $errores,
                'data' => null
            ];
        }

        return [
            'success' => true,
            'message' => 'Fechas válidas',
            'errors' => null,
            'data' => $data
        ];
    }

    /**
     * VALIDAR SOLO ESTADO
     */
    public static function validarSoloEstado($estado): array
    {
        $error = self::validarEstado($estado);

        if ($error) {
            return [
                'success' => false,
                'message' => 'Estado inválido',
                'errors' => ['estado' => $error],
                'data' => null
            ];
        }

        return [
            'success' => true,
            'message' => 'Estado válido',
            'errors' => null,
            'data' => ['estado' => $estado]
        ];
    }

    // ================= VALIDACIONES BASE =================

    private static function validarId($id): ?string
    {
        if ($id === null || $id === '') return 'El ID es requerido';
        if (!is_numeric($id)) return 'El ID debe ser numérico';
        if ($id <= 0) return 'El ID debe ser positivo';
        return null;
    }

    private static function validarPropiedadId($id): ?string
    {
        return self::validarId($id) ? 'ID de propiedad inválido' : null;
    }

    private static function validarInquilinoId($id): ?string
    {
        return self::validarId($id) ? 'ID de inquilino inválido' : null;
    }

    private static function validarFechaDesde($fecha): ?string
    {
        if (!$fecha) return 'Fecha desde requerida';
        if (!strtotime($fecha)) return 'Fecha desde inválida';

        if (strtotime($fecha) < strtotime(date('Y-m-d'))) {
            return 'No puede ser anterior a hoy';
        }

        return null;
    }

    private static function validarFechaHasta($fecha): ?string
    {
        if (!$fecha) return 'Fecha hasta requerida';
        if (!strtotime($fecha)) return 'Fecha hasta inválida';
        return null;
    }

    private static function validarRelacionFechas($desde, $hasta): ?string
    {
        if (strtotime($hasta) <= strtotime($desde)) {
            return 'Fecha fin debe ser mayor a inicio';
        }
        return null;
    }

    private static function validarPrecio($precio): ?string
    {
        if ($precio === null) return 'Precio requerido';
        if (!is_numeric($precio)) return 'Precio inválido';
        if ($precio <= 0) return 'Debe ser mayor a 0';
        return null;
    }

    private static function validarEstado($estado): ?string
    {
        $validos = ['pendiente', 'confirmada', 'cancelada', 'finalizada'];
        if (!in_array($estado, $validos)) {
            return 'Estado inválido';
        }
        return null;
    }
}