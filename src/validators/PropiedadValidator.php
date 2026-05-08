<?php

namespace App\Validators;

// Importamos los modelos para verificar la existencia en la DB
use App\Models\Categoria;
use App\Models\Localidad;
use App\Models\Usuario;

class PropiedadValidator {

    /**
     * Validador robusto para la tabla PROPIEDADES
     * @param array $data Datos ya sanitizados
     * @return array Lista de errores (vacía si todo está ok)
     */
    public static function validarPropiedad(array $data): array {

        $errores = [];

        // 1. VALIDACIÓN DE TEXTOS
        if (empty($data['titulo'])) {
            $errores['titulo'] = "El título es obligatorio.";
        } elseif (strlen($data['titulo']) > 150) {
            $errores['titulo'] = "El título no puede superar los 150 caracteres.";
        }

        if (empty($data['direccion'])) {
            $errores['direccion'] = "La dirección exacta es obligatoria.";
        } elseif (strlen($data['direccion']) > 125) {
            $errores['direccion'] = "La dirección es demasiado larga (máximo 125 caracteres).";
        }

        // 2. VALIDACIÓN DE NÚMEROS
        if (!is_numeric($data['precio']) || $data['precio'] <= 0) {
            $errores['precio'] = "El precio debe ser un número positivo válido.";
        }

        if (!is_numeric($data['expensas']) || $data['expensas'] < 0) {
            $errores['expensas'] = "Las expensas deben ser un número (0 o más).";
        }

        // Cantidades
        $campos_numericos = [
            'cantidad_ambientes'   => 'ambientes',
            'cantidad_dormitorios' => 'dormitorios',
            'cantidad_banos'       => 'baños'
        ];

        foreach ($campos_numericos as $campo => $nombre) {
            if (!isset($data[$campo]) || $data[$campo] < 1) {
                $errores[$campo] = "La cantidad de $nombre debe ser al menos 1.";
            }
        }

        // Capacidad (opcional)
        if (isset($data['capacidad']) && $data['capacidad'] !== null && $data['capacidad'] <= 0) {
            $errores['capacidad'] = "Si se define la capacidad, debe ser mayor a 0.";
        }

        // 3. INTEGRIDAD REFERENCIAL
        if (!Categoria::find($data['categoria_id'])) {
            $errores['categoria_id'] = "La categoría seleccionada no existe en el sistema.";
        }

        if (!Localidad::find($data['localidad_id'])) {
            $errores['localidad_id'] = "La localidad seleccionada no es válida.";
        }

        // 4. DISPONIBILIDAD
        if (!in_array($data['disponible'], [0, 1])) {
            $errores['disponible'] = "El estado de disponibilidad no es válido.";
        }

        return $errores;
    }
}