<?php

namespace App\Sanitizers;

class LocalidadSanitizer
{
    /**
     * Sanitiza un ID recibido por URL o query string
     */
    public static function sanitizarId($id): int
    {
        return (int) filter_var($id, FILTER_SANITIZE_NUMBER_INT);
    }

    /**
     * Sanitiza el payload de una localidad
     * Devuelve valores limpios o null para campos opcionales
     */
    public static function sanitizarLocalidad(array $data): array
    {
        return [
            'nombre' => isset($data['nombre']) 
                ? htmlspecialchars(trim((string)$data['nombre']), ENT_QUOTES, 'UTF-8') 
                : null,

            'codigo_postal' => isset($data['codigo_postal']) && $data['codigo_postal'] !== '' 
                ? htmlspecialchars(trim((string)$data['codigo_postal']), ENT_QUOTES, 'UTF-8') 
                : null,

            'provincia_id' => isset($data['provincia_id']) && $data['provincia_id'] !== ''
                ? (int) $data['provincia_id']
                : null,
        ];
    }
}