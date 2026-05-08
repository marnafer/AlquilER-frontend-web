<?php

namespace App\Controllers;

use App\Models\PropiedadImagen;
use App\Models\Propiedad;
use App\Sanitizers\PropiedadImagenSanitizer;
use App\Validators\PropiedadImagenValidator;

class PropiedadImagenController
{
    /**
     * GET /api/propiedad-imagenes
     * ?propiedad_id=
     */
    public function indexApi()
    {
        try {
            $propiedadId = isset($_GET['propiedad_id']) ? (int) $_GET['propiedad_id'] : null;

            $query = PropiedadImagen::query();

            if ($propiedadId) {
                $query->where('propiedad_id', $propiedadId);
            }

            $imagenes = $query->orderBy('id', 'desc')->get();

            return renderJson([
                'success' => true,
                'data' => $imagenes,
                'total' => $imagenes->count()
            ]);
        } catch (\Exception $e) {
            return renderJson([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * GET /api/propiedad-imagenes/{id}
     */
    public function mostrarApi($id)
    {
        $id = PropiedadImagenSanitizer::sanitizarId($id);

        $validacion = PropiedadImagenValidator::validarSoloId($id);
        if (!$validacion['success']) {
            return renderJson($validacion, 400);
        }

        try {
            $img = PropiedadImagen::find($id);

            if (!$img) {
                return renderJson([
                    'success' => false,
                    'error' => 'Imagen no encontrada'
                ], 404);
            }

            return renderJson([
                'success' => true,
                'data' => $img
            ]);
        } catch (\Exception $e) {
            return renderJson([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * POST /api/propiedad-imagenes
     */
    public function crear()
    {
        $inputRaw = file_get_contents('php://input');
        $json = json_decode($inputRaw, true);

        $payload = $json ?? $_POST;
        $file = $_FILES['imagen'] ?? null;

        $datos = PropiedadImagenSanitizer::sanitizarPropiedadImagen($payload);

        $validacion = PropiedadImagenValidator::validarCrear($datos, $file);
        if (!$validacion['success']) {
            return renderJson($validacion, 400);
        }

        try {
            $publicDir = dirname(dirname(__DIR__)) . '/public';
            $uploadDir = $publicDir . '/uploads/propiedades';

            if (!is_dir($uploadDir)) {
                mkdir($uploadDir, 0755, true);
            }

            $nombreArchivo = null;

            // Archivo
            if ($file && is_uploaded_file($file['tmp_name'])) {
                $ext = pathinfo($file['name'], PATHINFO_EXTENSION);
                $nombreArchivo = time() . '_' . bin2hex(random_bytes(6)) . '.' . strtolower($ext);

                $dest = $uploadDir . '/' . $nombreArchivo;

                if (!move_uploaded_file($file['tmp_name'], $dest)) {
                    throw new \Exception('Error al guardar archivo');
                }
            }
            // Base64
            elseif (!empty($datos['imagen_base64'])) {
                if (preg_match('/^data:(image\/[a-zA-Z]+);base64,(.+)$/', $datos['imagen_base64'], $m)) {
                    $ext = explode('/', $m[1])[1];

                    $nombreArchivo = time() . '_' . bin2hex(random_bytes(6)) . '.' . $ext;
                    $dest = $uploadDir . '/' . $nombreArchivo;

                    $bin = base64_decode($m[2]);

                    if (!$bin || file_put_contents($dest, $bin) === false) {
                        throw new \Exception('Error al guardar imagen base64');
                    }
                } else {
                    return renderJson([
                        'success' => false,
                        'error' => 'Formato base64 inválido'
                    ], 400);
                }
            } else {
                return renderJson([
                    'success' => false,
                    'error' => 'Debe enviar una imagen'
                ], 400);
            }

            $registro = PropiedadImagen::create([
                'propiedad_id' => $datos['propiedad_id'],
                'ruta' => '/uploads/propiedades/' . $nombreArchivo,
                'nombre' => $nombreArchivo,
                'descripcion' => $datos['descripcion'] ?? null
            ]);

            return renderJson([
                'success' => true,
                'message' => 'Imagen creada correctamente',
                'data' => $registro
            ], 201);

        } catch (\Exception $e) {
            return renderJson([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * DELETE /api/propiedad-imagenes/{id}
     */
    public function eliminar($id)
    {
        $id = PropiedadImagenSanitizer::sanitizarId($id);

        $validacion = PropiedadImagenValidator::validarSoloId($id);
        if (!$validacion['success']) {
            return renderJson($validacion, 400);
        }

        try {
            $img = PropiedadImagen::find($id);

            if (!$img) {
                return renderJson([
                    'success' => false,
                    'error' => 'Imagen no encontrada'
                ], 404);
            }

            // borrar archivo
            $publicPath = dirname(dirname(__DIR__)) . '/public';

            if (!empty($img->ruta)) {
                $file = $publicPath . $img->ruta;
                if (file_exists($file)) {
                    unlink($file);
                }
            }

            $img->delete();

            return renderJson([
                'success' => true,
                'message' => "Imagen eliminada correctamente"
            ]);

        } catch (\Exception $e) {
            return renderJson([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }
}