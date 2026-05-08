<?php

namespace App\Validators;

class PropiedadServicioValidator
{
    /**
     * Validar todos los datos de una relación propiedad-servicio
     */
    public static function validar(array $data, bool $requerirId = false): array
    {
        $errores = [];

        // Validar ID (solo si se requiere para actualizaciones)
        if ($requerirId) {
            $error = self::validarId($data['id'] ?? null);
            if ($error) {
                $errores['id'] = $error;
            }
        }

        // Validar propiedad_id
        $error = self::validarPropiedadId($data['propiedad_id'] ?? null);
        if ($error) {
            $errores['propiedad_id'] = $error;
        }

        // Validar servicio_id
        $error = self::validarServicioId($data['servicio_id'] ?? null);
        if ($error) {
            $errores['servicio_id'] = $error;
        }

        if (!empty($errores)) {
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
     * Validar ID de relación
     */
    public static function validarId($id): ?string
    {
        if ($id === null || $id === '') {
            return 'El ID de la relación es requerido';
        }

        if (!is_numeric($id)) {
            return 'El ID debe ser un número';
        }

        if ($id <= 0) {
            return 'El ID debe ser un número positivo';
        }

        if (filter_var($id, FILTER_VALIDATE_INT) === false) {
            return 'El ID debe ser un número entero';
        }

        return null;
    }

    /**
     * Validar ID de propiedad
     */
    public static function validarPropiedadId($id): ?string
    {
        if ($id === null || $id === '') {
            return 'El ID de propiedad es requerido';
        }

        if (!is_numeric($id)) {
            return 'El ID de propiedad debe ser un número';
        }

        if ($id <= 0) {
            return 'El ID de propiedad debe ser un número positivo';
        }

        if (filter_var($id, FILTER_VALIDATE_INT) === false) {
            return 'El ID de propiedad debe ser un número entero';
        }

        return null;
    }

    /**
     * Validar ID de servicio
     */
    public static function validarServicioId($id): ?string
    {
        if ($id === null || $id === '') {
            return 'El ID de servicio es requerido';
        }

        if (!is_numeric($id)) {
            return 'El ID de servicio debe ser un número';
        }

        if ($id <= 0) {
            return 'El ID de servicio debe ser un número positivo';
        }

        if (filter_var($id, FILTER_VALIDATE_INT) === false) {
            return 'El ID de servicio debe ser un número entero';
        }

        return null;
    }

    /**
     * Validar para crear nueva relación
     */
    public static function validarCrear(array $data): array
    {
        return self::validar($data, false);
    }

    /**
     * Validar para actualizar relación existente
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