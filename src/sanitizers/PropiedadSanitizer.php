<?php

namespace App\Sanitizers;

class PropiedadSanitizer
{
    /**
     * Sanitizar todos los datos de una propiedad
     */
    public static function sanitizarPropiedad(array $data): array
    {
        return [
            'titulo' => self::sanitizarTitulo($data['titulo'] ?? null),
            'descripcion' => self::sanitizarDescripcion($data['descripcion'] ?? null),
            'precio' => self::sanitizarPrecio($data['precio'] ?? null),
            'expensas' => self::sanitizarExpensas($data['expensas'] ?? null),
            'direccion' => self::sanitizarDireccion($data['direccion'] ?? null),
            'cantidad_ambientes' => self::sanitizarEntero($data['cantidad_ambientes'] ?? null),
            'cantidad_dormitorios' => self::sanitizarEntero($data['cantidad_dormitorios'] ?? null),
            'cantidad_banos' => self::sanitizarEntero($data['cantidad_banos'] ?? null),
            'capacidad' => self::sanitizarEntero($data['capacidad'] ?? null),
            'disponible' => self::sanitizarDisponible($data['disponible'] ?? null),
            'categoria_id' => self::sanitizarEntero($data['categoria_id'] ?? null),
            'localidad_id' => self::sanitizarEntero($data['localidad_id'] ?? null)
        ];
    }

    /**
     * Sanitizar título
     */
    private static function sanitizarTitulo($titulo): ?string
    {
        if ($titulo === null || $titulo === '') {
            return null;
        }
        $titulo = trim($titulo);
        $titulo = preg_replace('/\s+/', ' ', $titulo);
        $titulo = htmlspecialchars($titulo, ENT_QUOTES, 'UTF-8');
        $titulo = strip_tags($titulo);
        
        if (strlen($titulo) > 150) {
            $titulo = substr($titulo, 0, 150);
        }
        
        return $titulo;
    }

    /**
     * Sanitizar descripción
     */
    private static function sanitizarDescripcion($descripcion): ?string
    {
        if ($descripcion === null || $descripcion === '') {
            return null;
        }
        $descripcion = trim($descripcion);
        $descripcion = preg_replace('/\s+/', ' ', $descripcion);
        $descripcion = htmlspecialchars($descripcion, ENT_QUOTES, 'UTF-8');
        $descripcion = strip_tags($descripcion);
        
        if (strlen($descripcion) > 5000) {
            $descripcion = substr($descripcion, 0, 5000);
        }
        
        return $descripcion;
    }

    /**
     * Sanitizar precio
     */
    private static function sanitizarPrecio($precio): ?float
    {
        if ($precio === null || $precio === '') {
            return null;
        }
        $precio = str_replace(',', '.', $precio);
        $precio = preg_replace('/[^0-9\.]/', '', $precio);
        $precio = filter_var($precio, FILTER_VALIDATE_FLOAT);
        
        return $precio !== false ? round($precio, 2) : null;
    }

    /**
     * Sanitizar expensas
     */
    private static function sanitizarExpensas($expensas): ?float
    {
        if ($expensas === null || $expensas === '') {
            return 0.00;
        }
        $expensas = str_replace(',', '.', $expensas);
        $expensas = preg_replace('/[^0-9\.]/', '', $expensas);
        $expensas = filter_var($expensas, FILTER_VALIDATE_FLOAT);
        
        return $expensas !== false ? round($expensas, 2) : 0.00;
    }

    /**
     * Sanitizar dirección
     */
    private static function sanitizarDireccion($direccion): ?string
    {
        if ($direccion === null || $direccion === '') {
            return null;
        }
        $direccion = trim($direccion);
        $direccion = preg_replace('/\s+/', ' ', $direccion);
        $direccion = htmlspecialchars($direccion, ENT_QUOTES, 'UTF-8');
        
        if (strlen($direccion) > 125) {
            $direccion = substr($direccion, 0, 125);
        }
        
        return $direccion;
    }

    /**
     * Sanitizar entero
     */
    private static function sanitizarEntero($valor): ?int
    {
        if ($valor === null || $valor === '') {
            return null;
        }
        $valor = filter_var($valor, FILTER_VALIDATE_INT);
        return $valor !== false && $valor > 0 ? $valor : null;
    }

    /**
     * Sanitizar disponible (booleano)
     */
    private static function sanitizarDisponible($disponible): int
    {
        if ($disponible === null || $disponible === '') {
            return 1;
        }
        return filter_var($disponible, FILTER_VALIDATE_BOOLEAN) ? 1 : 0;
    }
}