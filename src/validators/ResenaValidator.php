<?php

namespace App\Validators;

class ResenaValidator
{
    /**
     * Validar todos los datos de una reseña
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

        // Validar reserva_id
        $error = self::validarReservaId($data['reserva_id'] ?? null);
        if ($error) {
            $errores['reserva_id'] = $error;
        }

        // Validar calificación
        $error = self::validarCalificacion($data['calificacion'] ?? null);
        if ($error) {
            $errores['calificacion'] = $error;
        }

        // Validar comentario (opcional)
        if (isset($data['comentario']) && !empty($data['comentario'])) {
            $error = self::validarComentario($data['comentario']);
            if ($error) {
                $errores['comentario'] = $error;
            }
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
     * Validar ID
     */
    public static function validarId($id): ?string
    {
        if ($id === null || $id === '') {
            return 'El ID de reseña es requerido';
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
     * Validar ID de reserva
     */
    public static function validarReservaId($id): ?string
    {
        if ($id === null || $id === '') {
            return 'El ID de reserva es requerido';
        }

        if (!is_numeric($id)) {
            return 'El ID de reserva debe ser un número';
        }

        if ($id <= 0) {
            return 'El ID de reserva debe ser un número positivo';
        }

        return null;
    }

    /**
     * Validar calificación
     */
    public static function validarCalificacion($calificacion): ?string
    {
        if ($calificacion === null || $calificacion === '') {
            return 'La calificación es requerida';
        }

        if (!is_numeric($calificacion)) {
            return 'La calificación debe ser un número';
        }

        $calificacion = (int)$calificacion;

        if ($calificacion < 1 || $calificacion > 5) {
            return 'La calificación debe ser entre 1 y 5 estrellas';
        }

        return null;
    }

    /**
     * Validar comentario
     */
    public static function validarComentario($comentario): ?string
    {
        if ($comentario === null || $comentario === '') {
            return null; // Comentario opcional
        }

        $comentarioLimpio = trim($comentario);

        if (strlen($comentarioLimpio) < 3) {
            return 'El comentario debe tener al menos 3 caracteres';
        }

        if (strlen($comentarioLimpio) > 1000) {
            return 'El comentario no puede exceder los 1000 caracteres';
        }

        return null;
    }

    /**
     * Validar para crear nueva reseña
     */
    public static function validarCrear(array $data): array
    {
        return self::validar($data, false);
    }

    /**
     * Validar para actualizar reseña existente
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

    /**
     * Validar solo calificación
     */
    public static function validarSoloCalificacion($calificacion): array
    {
        $error = self::validarCalificacion($calificacion);

        if ($error) {
            return [
                'success' => false,
                'message' => 'Calificación inválida',
                'errors' => ['calificacion' => $error]
            ];
        }

        return [
            'success' => true,
            'message' => 'Calificación válida',
            'errors' => null
        ];
    }
}