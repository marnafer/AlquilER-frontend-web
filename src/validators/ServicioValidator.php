<?php

namespace App\Validators;

class ServicioValidator
{
    /**
     * Validar todos los datos de un servicio
     */
    public static function validar(array $data, bool $requerirId = false): array
    {
        $errores = [];

        // ID (solo en update)
        if ($requerirId) {
            $resultado = self::validarId($data['id'] ?? null);
            if (!$resultado['valido']) {
                $errores['id'] = $resultado['error'];
            }
        }

        // Nombre
        $resultado = self::validarNombre($data['nombre'] ?? null);
        if (!$resultado['valido']) {
            $errores['nombre'] = $resultado['error'];
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
            'errors' => null,
            'data' => $data
        ];
    }

    /**
     * Validar ID
     */
    public static function validarId($id): array
    {
        if ($id === null || $id === '') {
            return ['valido' => false, 'error' => 'El ID es requerido'];
        }

        if (!is_numeric($id)) {
            return ['valido' => false, 'error' => 'El ID debe ser un número'];
        }

        if ($id <= 0) {
            return ['valido' => false, 'error' => 'El ID debe ser positivo'];
        }

        return ['valido' => true, 'error' => null];
    }

    /**
     * Validar nombre
     */
    public static function validarNombre($nombre): array
    {
        if ($nombre === null || $nombre === '') {
            return ['valido' => false, 'error' => 'El nombre del servicio es requerido'];
        }

        $nombre = trim($nombre);
        $longitud = strlen($nombre);

        if ($longitud < 3) {
            return ['valido' => false, 'error' => 'El nombre debe tener al menos 3 caracteres'];
        }

        if ($longitud > 50) {
            return ['valido' => false, 'error' => 'El nombre no puede exceder los 50 caracteres'];
        }

        if (is_numeric($nombre)) {
            return ['valido' => false, 'error' => 'El nombre no puede ser solo números'];
        }

        if (!preg_match('/^[a-zA-ZáéíóúñÑÁÉÍÓÚ0-9\s]+$/u', $nombre)) {
            return ['valido' => false, 'error' => 'El nombre solo puede contener letras, números y espacios'];
        }

        return ['valido' => true, 'error' => null];
    }

    /**
     * Crear
     */
    public static function validarCrear(array $data): array
    {
        return self::validar($data, false);
    }

    /**
     * Actualizar
     */
    public static function validarActualizar(array $data): array
    {
        return self::validar($data, true);
    }

    /**
     * Solo ID
     */
    public static function validarSoloId($id): array
    {
        $resultado = self::validarId($id);

        if (!$resultado['valido']) {
            return [
                'success' => false,
                'message' => 'ID inválido',
                'errors' => ['id' => $resultado['error']]
            ];
        }

        return [
            'success' => true,
            'message' => 'ID válido',
            'errors' => null
        ];
    }
}