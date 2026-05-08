<?php

namespace App\Validators;

use App\Models\Localidad;
use App\Models\Provincia;

class LocalidadValidator
{
    /**
     * Valida un ID recibido por URL o query string
     */
    public static function validarId($id) {

        if ($id === null) {
            return [
                'success' => false,
                'error' => 'El ID es requerido'
            ];
        }

        if (!is_int($id) || $id <= 0) {
            return [
                'success' => false,
                'error' => 'El ID debe ser un entero positivo'
            ];
        }

        return [
            'success' => true,
            'error' => null
        ];
    }
    public static function validarLocalidad(array $data, bool $isUpdate = false): array
    {
        $errores = [];

        // Nombre
        if (!$isUpdate || ($isUpdate && array_key_exists('nombre', $data))) {
            $nombre = $data['nombre'] ?? null;

            if (empty($nombre)) {
                $errores['nombre'] = 'El nombre es obligatorio.';
            } elseif (mb_strlen($nombre) > 150) {
                $errores['nombre'] = 'El nombre no puede superar 150 caracteres.';
            } else {
                if (!$isUpdate) {
                    $existe = \App\Models\Localidad::where('nombre', $nombre)->first();
                    if ($existe) {
                        $errores['nombre'] = 'Ya existe una localidad con ese nombre.';
                    }
                }
            }
        }

        // Código postal
        if (array_key_exists('codigo_postal', $data) && $data['codigo_postal'] !== null) {
            $cp = $data['codigo_postal'];

            if (mb_strlen($cp) > 20) {
                $errores['codigo_postal'] = 'El código postal es demasiado largo.';
            }

            if (!preg_match('/^[A-Za-z0-9\-\s]{1,20}$/u', $cp)) {
                $errores['codigo_postal'] = 'Formato inválido.';
            }
        }

        // Provincia
        if (!$isUpdate || ($isUpdate && array_key_exists('provincia_id', $data))) {
            $provinciaId = $data['provincia_id'] ?? null;

            if ($provinciaId === null) {
                $errores['provincia_id'] = 'La provincia es obligatoria.';
            } elseif (!filter_var($provinciaId, FILTER_VALIDATE_INT) || $provinciaId <= 0) {
                $errores['provincia_id'] = 'ID de provincia inválido.';
            } else {
                $existe = \App\Models\Provincia::find($provinciaId);
                if (!$existe) {
                    $errores['provincia_id'] = 'La provincia no existe.';
                }
            }
        }

        // Si hay errores
        if (!empty($errores)) {
            return [
                'success' => false,
                'message' => 'Error de validación',
                'errors' => $errores,
                'data' => null
            ];
        }

        // Data limpia lista para DB
        $dataLimpia = [
            'nombre' => $data['nombre'],
            'codigo_postal' => $data['codigo_postal'] ?? null,
            'provincia_id' => (int) $data['provincia_id']
        ];

        return [
            'success' => true,
            'message' => 'Validación exitosa',
            'errors' => null,
            'data' => $dataLimpia
        ];
    }
}