<?php

namespace App\Sanitizers;

class ReservaSanitizer
{
    /**
     * Sanitizar todos los datos de una reserva
     */
    public static function sanitizar(array $data): array
    {
        return [
            'id' => self::sanitizarId($data['id'] ?? null),
            'propiedad_id' => self::sanitizarPropiedadId($data['propiedad_id'] ?? null),
            'inquilino_id' => self::sanitizarInquilinoId($data['inquilino_id'] ?? null),
            'fecha_desde' => self::sanitizarFecha($data['fecha_desde'] ?? null),
            'fecha_hasta' => self::sanitizarFecha($data['fecha_hasta'] ?? null),
            'precio_total' => self::sanitizarPrecio($data['precio_total'] ?? null),
            'estado' => self::sanitizarEstado($data['estado'] ?? null),
            'fecha_reserva' => self::sanitizarFechaHora($data['fecha_reserva'] ?? null)
        ];
    }

    /**
     * Sanitizar ID de reserva
     */
    public static function sanitizarId($id): ?int
    {
        if ($id === null || $id === '') {
            return null;
        }
        $idSanitizado = filter_var($id, FILTER_VALIDATE_INT);
        return ($idSanitizado !== false && $idSanitizado > 0) ? $idSanitizado : null;
    }

    /**
     * Sanitizar ID de propiedad
     */
    public static function sanitizarPropiedadId($id): ?int
    {
        if ($id === null || $id === '') {
            return null;
        }
        $idSanitizado = filter_var($id, FILTER_VALIDATE_INT);
        return ($idSanitizado !== false && $idSanitizado > 0) ? $idSanitizado : null;
    }

    /**
     * Sanitizar ID de inquilino
     */
    public static function sanitizarInquilinoId($id): ?int
    {
        if ($id === null || $id === '') {
            return null;
        }
        $idSanitizado = filter_var($id, FILTER_VALIDATE_INT);
        return ($idSanitizado !== false && $idSanitizado > 0) ? $idSanitizado : null;
    }

    /**
     * Sanitizar fecha (formato Y-m-d)
     */
    public static function sanitizarFecha($fecha): ?string
    {
        if ($fecha === null || $fecha === '') {
            return null;
        }
        $timestamp = strtotime($fecha);
        return $timestamp ? date('Y-m-d', $timestamp) : null;
    }

    /**
     * Sanitizar fecha y hora (formato Y-m-d H:i:s)
     */
    public static function sanitizarFechaHora($fecha): ?string
    {
        if ($fecha === null || $fecha === '') {
            return null;
        }
        $timestamp = strtotime($fecha);
        return $timestamp ? date('Y-m-d H:i:s', $timestamp) : null;
    }

    /**
     * Sanitizar precio
     */
    public static function sanitizarPrecio($precio): ?float
    {
        if ($precio === null || $precio === '') {
            return null;
        }
        
        // Reemplazar coma por punto
        $precio = str_replace(',', '.', $precio);
        
        // Eliminar cualquier cosa que no sea número o punto
        $precio = preg_replace('/[^0-9\.]/', '', $precio);
        
        $precioSanitizado = filter_var($precio, FILTER_VALIDATE_FLOAT);
        
        if ($precioSanitizado !== false && $precioSanitizado > 0) {
            return round($precioSanitizado, 2);
        }
        
        return null;
    }

    /**
     * Sanitizar estado
     */
    public static function sanitizarEstado($estado): ?string
    {
        if ($estado === null || $estado === '') {
            return null;
        }

        $estado = strtolower(trim($estado));
        return htmlspecialchars($estado, ENT_QUOTES, 'UTF-8');
    }

    /**
     * Sanitizar solo fechas (para verificar disponibilidad)
     */
    public static function sanitizarFechas(array $data): array
    {
        return [
            'fecha_desde' => self::sanitizarFecha($data['fecha_desde'] ?? null),
            'fecha_hasta' => self::sanitizarFecha($data['fecha_hasta'] ?? null)
        ];
    }

    /**
     * Sanitizar solo estado
     */
    public static function sanitizarSoloEstado($estado): string
    {
        return self::sanitizarEstado($estado);
    }

    /**
     * Sanitizar solo IDs
     */
    public static function sanitizarIds(array $data): array
    {
        return [
            'id' => self::sanitizarId($data['id'] ?? null),
            'propiedad_id' => self::sanitizarPropiedadId($data['propiedad_id'] ?? null),
            'inquilino_id' => self::sanitizarInquilinoId($data['inquilino_id'] ?? null)
        ];
    }
}