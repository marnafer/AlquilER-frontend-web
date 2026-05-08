<?php

namespace App\Validators;

class RolValidator
{
    /**
     * Validar todos los datos de un rol
     */
    public static function validar(array $data, bool $requerirId = false): array
    {
        $errores = [];

        // Validar ID (solo si se requiere)
        if ($requerirId) {
            $error = self::validarId($data['id'] ?? null);
            if ($error) {
                $errores['id'] = $error;
            }
        }

        // Validar nombre
        $error = self::validarNombre($data['nombre'] ?? null);
        if ($error) {
            $errores['nombre'] = $error;
        }

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
        ];
    }

    /**
     * Validar ID
     */
    public static function validarId($id): ?string
    {
        if ($id === null || $id === '') {
            return 'El ID de rol es requerido';
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
     * Validar nombre
     */
    public static function validarNombre($nombre): ?string
    {
        if ($nombre === null || $nombre === '') {
            return 'El nombre del rol es requerido';
        }

        $nombreLimpio = trim($nombre);
        $longitud = strlen($nombreLimpio);

        if ($longitud < 3) {
            return 'El nombre debe tener al menos 3 caracteres';
        }

        if ($longitud > 30) {
            return 'El nombre no puede exceder los 30 caracteres';
        }

        if (!preg_match('/^[a-zA-ZáéíóúñÁÉÍÓÚ\s]+$/u', $nombreLimpio)) {
            return 'El nombre solo puede contener letras y espacios';
        }

        // Roles predefinidos permitidos
        $rolesPermitidos = ['admin', 'administrador', 'inquilino', 'propietario', 'usuario'];
        $nombreLower = strtolower($nombreLimpio);

        if (!in_array($nombreLower, $rolesPermitidos)) {
            return 'Rol no permitido. Roles válidos: ' . implode(', ', $rolesPermitidos);
        }

        return null;
    }

    /**
     * Validar para crear nuevo rol
     */
    public static function validarCrear(array $data): array
    {
        return self::validar($data, false);
    }

    /**
     * Validar para actualizar rol existente
     */
    public static function validarActualizar(array $data): array
    {
        return self::validar($data, true);
    }

    /**
     * Validar solo ID
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