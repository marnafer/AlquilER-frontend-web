<?php

namespace App\Validators;

use App\Models\Provincia;

class ProvinciaValidator {

    /**
     * Validar todos los datos de una provincia
     */
    public static function validarProvincia($data, $requerirId = false): array {
        $errores = [];

        // ID
        if ($requerirId) {
            $resultado = self::validarIdRequerido($data['id'] ?? null, 'provincia');
            if (!$resultado['success']) {
                $errores['id'] = $resultado['error'];
            }
        }

        // Nombre
        if (!$requerirId || ($requerirId && array_key_exists('nombre', $data))) {
            $resultado = self::validarNombreProvincia($data['nombre'] ?? null);
            if (!$resultado['success']) {
                $errores['nombre'] = $resultado['error'];
            }
        }

        // errores
        if (!empty($errores)) {
            return [
                'success' => false,
                'message' => 'Error de validación',
                'errors' => $errores,
                'data' => null
            ];
        }

        // data limpia
        $dataLimpia = [
            'id' => $data['id'] ?? null,
            'nombre' => $data['nombre']
        ];

        return [
            'success' => true,
            'message' => 'Validación exitosa',
            'errors' => null,
            'data' => $dataLimpia
        ];
    }

    /**
     * Validar ID requerido
     */
    public static function validarIdRequerido($id, $campo = ''): array {
        if ($id === null || $id === '') {
            return [
                'success' => false,
                'error' => "El ID de $campo es requerido"
            ];
        }

        if (!filter_var($id, FILTER_VALIDATE_INT) || $id <= 0) {
            return [
                'success' => false,
                'error' => "El ID de $campo debe ser un entero positivo"
            ];
        }

        return ['success' => true, 'error' => null];
    }

    /**
     * Validar nombre
     */
    public static function validarNombreProvincia($nombre): array {
        if ($nombre === null || $nombre === '') {
            return [
                'success' => false,
                'error' => 'El nombre es requerido'
            ];
        }

        $nombre = trim($nombre);

        if (strlen($nombre) < 3) {
            return [
                'success' => false,
                'error' => 'El nombre debe tener al menos 3 caracteres'
            ];
        }

        if (strlen($nombre) > 100) {
            return [
                'success' => false,
                'error' => 'El nombre no puede exceder los 100 caracteres'
            ];
        }

        if (is_numeric($nombre)) {
            return [
                'success' => false,
                'error' => 'El nombre no puede ser solo números'
            ];
        }

        if (!preg_match('/^[a-zA-ZáéíóúñÑÁÉÍÓÚ\s]+$/u', $nombre)) {
            return [
                'success' => false,
                'error' => 'Solo letras y espacios'
            ];
        }

        return ['success' => true, 'error' => null];
    }

    public static function validarCrearProvincia($data): array {
        return self::validarProvincia($data, false);
    }

    public static function validarActualizarProvincia($data): array {
        return self::validarProvincia($data, true);
    }

    public static function validarSoloIdProvincia($id): array {
        $resultado = self::validarIdRequerido($id, 'provincia');

        if (!$resultado['success']) {
            return [
                'success' => false,
                'message' => 'ID inválido',
                'errors' => ['id' => $resultado['error']],
                'data' => null
            ];
        }

        return [
            'success' => true,
            'message' => 'ID válido',
            'errors' => null,
            'data' => null
        ];
    }
}