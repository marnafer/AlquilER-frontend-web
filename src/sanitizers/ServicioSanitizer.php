<?php

namespace App\Sanitizers;

class ServicioSanitizer
{
    /**
     * Sanitizar todos los datos
     */
    public static function sanitizar(array $data): array
    {
        return [
            'id' => self::sanitizarId($data['id'] ?? null),
            'nombre' => self::sanitizarNombre($data['nombre'] ?? null)
        ];
    }

    /**
     * ID
     */
    public static function sanitizarId($id): ?int
    {
        if ($id === null || $id === '') {
            return null;
        }

        $id = filter_var($id, FILTER_VALIDATE_INT);
        return ($id !== false && $id > 0) ? $id : null;
    }

    /**
     * Nombre
     */
    public static function sanitizarNombre($nombre): ?string
    {
        if ($nombre === null || $nombre === '') {
            return null;
        }

        $nombre = trim($nombre);
        $nombre = preg_replace('/\s+/', ' ', $nombre);
        $nombre = strtolower($nombre);
        $nombre = ucwords($nombre);
        $nombre = strip_tags($nombre);
        $nombre = htmlspecialchars($nombre, ENT_QUOTES, 'UTF-8');

        if (strlen($nombre) > 50) {
            $nombre = substr($nombre, 0, 50);
        }

        return $nombre;
    }

    /**
     * Solo nombre
     */
    public static function sanitizarSoloNombre($nombre): ?string
    {
        return self::sanitizarNombre($nombre);
    }
}