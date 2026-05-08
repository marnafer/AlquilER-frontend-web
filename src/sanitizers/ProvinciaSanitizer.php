<?php

namespace App\Sanitizers;

class ProvinciaSanitizer {

    /**
     * Sanitizar provincia completa
     */
    public static function sanitizarProvincia($data): array {
        return [
            'id' => self::sanitizarIdProvincia($data['id'] ?? null),
            'nombre' => self::sanitizarNombreProvincia($data['nombre'] ?? null)
        ];
    }

    /**
     * Sanitizar ID
     */
    public static function sanitizarIdProvincia($id) {
        if ($id === null || $id === '') {
            return null;
        }

        $id = filter_var($id, FILTER_VALIDATE_INT);

        return ($id !== false && $id > 0) ? $id : null;
    }

    /**
     * Sanitizar nombre
     */
    public static function sanitizarNombreProvincia($nombre) {
        if ($nombre === null || $nombre === '') {
            return null;
        }

        $nombre = trim($nombre);
        $nombre = preg_replace('/\s+/', ' ', $nombre);
        $nombre = ucwords(strtolower($nombre));
        $nombre = preg_replace('/[^a-zA-ZáéíóúñÑÁÉÍÓÚ\s]/u', '', $nombre);
        $nombre = htmlspecialchars($nombre, ENT_QUOTES, 'UTF-8');

        if (strlen($nombre) > 100) {
            $nombre = substr($nombre, 0, 100);
        }

        return $nombre;
    }

    public static function sanitizarSoloNombreProvincia($nombre) {
        return self::sanitizarNombreProvincia($nombre);
    }
}