<?php

namespace App\Validators;

use App\Models\Propiedad;
use App\Models\PropiedadImagen;

class PropiedadImagenValidator
{
    // Tamaño máximo 5 MB
    private const MAX_SIZE = 5 * 1024 * 1024;
    private const ALLOWED_MIMES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

    public static function validarId($id): bool
    {
        return is_numeric($id) && (int)$id > 0;
    }

    /**
     * Valida payload y archivo opcional ($_FILES['imagen']).
     * Retorna array asociativo de errores por campo.
     */
    public static function validarPropiedadImagen(array $data, $file = null): array
    {
        $errores = [];

        $propiedadId = $data['propiedad_id'] ?? 0;
        if (!(is_numeric($propiedadId) && (int)$propiedadId > 0)) {
            $errores['propiedad_id'] = 'ID de propiedad inválido.';
        } elseif (!Propiedad::find((int)$propiedadId)) {
            $errores['propiedad_id'] = 'La propiedad indicada no existe.';
        }

        // Validar que exista al menos una fuente de imagen: multipart file o imagen_base64
        $hasFile = $file && isset($file['tmp_name']) && is_uploaded_file($file['tmp_name']);
        $hasBase64 = !empty($data['imagen_base64']);

        if (!$hasFile && !$hasBase64) {
            $errores['imagen'] = 'Se debe proporcionar una imagen (multipart o base64).';
            return $errores;
        }

        // Si hay archivo multipart, validar mime y tamaño
        if ($hasFile) {
            if (!isset($file['size']) || $file['size'] <= 0) {
                $errores['imagen'] = 'Archivo inválido.';
            } elseif ($file['size'] > self::MAX_SIZE) {
                $errores['imagen'] = 'La imagen supera el tamaño máximo de 5 MB.';
            } else {
                // Obtener mime real
                $finfo = finfo_open(FILEINFO_MIME_TYPE);
                $mime = finfo_file($finfo, $file['tmp_name']);
                finfo_close($finfo);
                if (!in_array($mime, self::ALLOWED_MIMES, true)) {
                    $errores['imagen'] = 'Tipo de archivo no permitido. Sólo JPG/PNG/GIF/WEBP.';
                }
            }
        }

        // Si hay base64 validar formato y tamaño aproximado
        if ($hasBase64 && empty($errores['imagen'])) {
            if (!preg_match('/^data:(image\/[a-zA-Z]+);base64,/', $data['imagen_base64'])) {
                $errores['imagen_base64'] = 'Formato base64 inválido.';
            } else {
                // estimación de tamaño: (base64_length * 3/4) - padding
                $b64 = preg_replace('#^data:.*;base64,#', '', $data['imagen_base64']);
                $estSize = (int) (strlen($b64) * 3 / 4);
                if ($estSize > self::MAX_SIZE) {
                    $errores['imagen_base64'] = 'La imagen base64 supera el tamaño máximo de 5 MB.';
                }
            }
        }

        // Descripción opcional: longitud
        if (isset($data['descripcion']) && $data['descripcion'] !== null) {
            if (mb_strlen($data['descripcion']) > 1000) {
                $errores['descripcion'] = 'La descripción es demasiado larga.';
            }
        }

        return $errores;
    }

    public static function validarSoloId($id): array
    {
        if (!self::validarId($id)) {
            return [
                'success' => false,
                'message' => 'ID inválido',
                'errors' => [
                    'id' => 'El ID debe ser un número positivo'
                ]
            ];
        }

        return [
            'success' => true,
            'message' => 'ID válido',
            'errors' => null
        ];
    }

    public static function validarCrear(array $data, $file = null): array
    {
        $errores = self::validarPropiedadImagen($data, $file);
        if (!empty($errores)) {
            return [
                'success' => false,
                'message' => 'Validación fallida',
                'errors' => $errores
            ];
        }
        return [
            'success' => true,
            'message' => 'Validación exitosa',
            'errors' => null
        ];
    }
}