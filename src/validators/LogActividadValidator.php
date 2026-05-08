<?php

namespace App\Validators;

class LogActividadValidator
{
    /**
     * Validar todos los datos de un log
     */
    public static function validar(array $data, bool $requerirId = false): array
    {
        $errores = [];

        // ID (solo si se requiere)
        if ($requerirId) {
            $error = self::validarId($data['id'] ?? null);
            if ($error) {
                $errores['id'] = $error;
            }
        }

        // usuario_id (opcional)
        if (isset($data['usuario_id']) && !empty($data['usuario_id'])) {
            $error = self::validarUsuarioId($data['usuario_id']);
            if ($error) {
                $errores['usuario_id'] = $error;
            }
        }

        // acción
        $error = self::validarAccion($data['accion'] ?? null);
        if ($error) {
            $errores['accion'] = $error;
        }

        // IP (opcional)
        if (isset($data['ip_address']) && !empty($data['ip_address'])) {
            $error = self::validarIp($data['ip_address']);
            if ($error) {
                $errores['ip_address'] = $error;
            }
        }

        // 🔥 FORMATO CORRECTO
        if (count($errores) > 0) {
            return [
                'success' => false,
                'message' => 'Error de validación',
                'errors' => $errores
            ];
        }

        return [
            'success' => true,
            'message' => 'Validación exitosa',
            'errors' => null
        ];
    }

    /**
     * Validar ID
     */
    public static function validarId($id): ?string
    {
        if ($id === null || $id === '') {
            return 'El ID de log es requerido';
        }

        if (!is_numeric($id)) {
            return 'El ID debe ser un número';
        }

        if ($id <= 0) {
            return 'El ID debe ser un número positivo';
        }

        return null;
    }

    /**
     * Validar usuario_id
     */
    public static function validarUsuarioId($id): ?string
    {
        if ($id === null || $id === '') {
            return null;
        }

        if (!is_numeric($id)) {
            return 'El ID de usuario debe ser un número';
        }

        if ($id <= 0) {
            return 'El ID de usuario debe ser un número positivo';
        }

        return null;
    }

    /**
     * Validar acción
     */
    public static function validarAccion($accion): ?string
    {
        if ($accion === null || $accion === '') {
            return 'La acción es requerida';
        }

        $accion = trim($accion);

        if (strlen($accion) < 3) {
            return 'La acción debe tener al menos 3 caracteres';
        }

        if (strlen($accion) > 255) {
            return 'La acción no puede exceder los 255 caracteres';
        }

        return null;
    }

    /**
     * Validar IP
     */
    public static function validarIp($ip): ?string
    {
        if ($ip === null || $ip === '') {
            return null;
        }

        if (!filter_var($ip, FILTER_VALIDATE_IP)) {
            return 'La dirección IP no es válida';
        }

        return null;
    }

    /**
     * Crear
     */
    public static function validarCrear(array $data): array
    {
        return self::validar($data, false);
    }

    /**
     * Solo ID
     */
    public static function validarSoloId($id): array
    {
        $error = self::validarId($id);

        if ($error) {
            return [
                'success' => false,
                'message' => 'ID inválido',
                'errors' => ['id' => $error]
            ];
        }

        return [
            'success' => true,
            'message' => 'ID válido',
            'errors' => null
        ];
    }
}