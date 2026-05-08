<?php

namespace App\Validators;

class ConsultaValidator {

    public static function validarConsulta($data, $requerirId = false) {
        $errores = [];

        // ID
        if ($requerirId) {
            $res = self::validarConsultaId($data['id'] ?? null);
            if (!$res['success']) $errores['id'] = $res['error'];
        }

        // propiedad_id
        if (!$requerirId || isset($data['propiedad_id'])) {
            $res = self::validarPropiedadId($data['propiedad_id'] ?? null);
            if (!$res['success']) $errores['propiedad_id'] = $res['error'];
        }

        // inquilino_id
        if (!$requerirId || isset($data['inquilino_id'])) {
            $res = self::validarInquilinoId($data['inquilino_id'] ?? null);
            if (!$res['success']) $errores['inquilino_id'] = $res['error'];
        }

        // mensaje
        if (!$requerirId || isset($data['mensaje'])) {
            $res = self::validarMensajeConsulta($data['mensaje'] ?? null);
            if (!$res['success']) $errores['mensaje'] = $res['error'];
        }

        // fecha opcional
        if (isset($data['fecha_consulta']) && $data['fecha_consulta'] !== null) {
            $res = self::validarFechaConsulta($data['fecha_consulta']);
            if (!$res['success']) $errores['fecha_consulta'] = $res['error'];
        }

        if (!empty($errores)) {
            return [
                'success' => false,
                'errors' => $errores,
                'data' => null
            ];
        }

        return [
            'success' => true,
            'errors' => null,
            'data' => $data
        ];
    }

    public static function validarConsultaId($id) {
        if (!$id) return ['success' => false, 'error' => 'El ID es requerido'];
        if (!filter_var($id, FILTER_VALIDATE_INT) || $id <= 0)
            return ['success' => false, 'error' => 'El ID debe ser entero positivo'];

        return ['success' => true];
    }

    public static function validarPropiedadId($id) {
        if (!$id) return ['success' => false, 'error' => 'El ID de propiedad es requerido'];
        if (!filter_var($id, FILTER_VALIDATE_INT) || $id <= 0)
            return ['success' => false, 'error' => 'ID de propiedad inválido'];

        return ['success' => true];
    }

    public static function validarInquilinoId($id) {
        if (!$id) return ['success' => false, 'error' => 'El ID del inquilino es requerido'];
        if (!filter_var($id, FILTER_VALIDATE_INT) || $id <= 0)
            return ['success' => false, 'error' => 'ID de inquilino inválido'];

        return ['success' => true];
    }

    public static function validarMensajeConsulta($mensaje) {
        if (!$mensaje) return ['success' => false, 'error' => 'El mensaje es requerido'];

        $mensaje = trim($mensaje);

        if (strlen($mensaje) < 5)
            return ['success' => false, 'error' => 'Debe tener al menos 5 caracteres'];

        if (strlen($mensaje) > 5000)
            return ['success' => false, 'error' => 'Máximo 5000 caracteres'];

        return ['success' => true];
    }

    public static function validarFechaConsulta($fecha) {
        $timestamp = strtotime($fecha);

        if (!$timestamp)
            return ['success' => false, 'error' => 'Fecha inválida'];

        if ($timestamp > time())
            return ['success' => false, 'error' => 'No puede ser futura'];

        return ['success' => true];
    }

    public static function validarCrearConsulta($data) {
        return self::validarConsulta($data, false);
    }

    public static function validarActualizarConsulta($data) {
        return self::validarConsulta($data, true);
    }
}