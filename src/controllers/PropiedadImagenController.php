<?php

namespace App\Controllers;

use App\Models\PropiedadImagen;
use App\Sanitizers\PropiedadImagenSanitizer;
use App\Validators\PropiedadImagenValidator;
use App\Helpers\Response;

class PropiedadImagenController
{
    /**
     * GET /api/propiedad-imagenes
     */
    public function indexApi()
    {
        try {

            $propiedadId = $_GET['propiedad_id'] ?? null;

            $query = PropiedadImagen::query();

            if ($propiedadId) {

                $propiedadId = (int) $propiedadId;

                $query->where(
                    'propiedad_id',
                    $propiedadId
                );
            }

            $imagenes = $query
                ->orderBy('id', 'desc')
                ->get();

            Response::success([
                'data' => $imagenes,
                'total' => $imagenes->count()
            ]);

        } catch (\Exception $e) {

            Response::serverError();
        }
    }

    /**
     * GET /api/propiedad-imagenes/{id}
     */
    public function mostrarApi($id)
    {
        $idSan = PropiedadImagenSanitizer::sanitizarIdPropiedadImagen($id);

        if ($idSan === null) {
            Response::validationError([
                'id' => 'El ID de imagen es requerido, debe ser un entero positivo.'
            ]);
            return;
        }

        try {

            $img = PropiedadImagen::find($idSan);

            if (!$img) {
                Response::notFound('Imagen no encontrada');
                return;
            }

            Response::success([
                'data' => $img
            ]);

        } catch (\Exception $e) {
            Response::serverError();
        }
    }

    /**
     * POST /api/propiedad-imagenes
     */
    public function crear()
    {
        $raw = $_POST;
        $file = $_FILES['imagen'] ?? null;

        $san = PropiedadImagenSanitizer::sanitizarPropiedadImagen($raw);

        $validacion = PropiedadImagenValidator::validarCrearPropiedadImagen($san, $file);

        if (!$validacion['success']) {
            Response::validationError($validacion['errors']);
        }

        try {

            $uploadDir = dirname(dirname(__DIR__)) . '/public/uploads/propiedades';

            if (!is_dir($uploadDir)) {
                mkdir($uploadDir, 0755, true);
            }

            $ext = pathinfo($file['name'], PATHINFO_EXTENSION);

            $nombreArchivo =
                time() . '_' . bin2hex(random_bytes(6)) . '.' . strtolower($ext);

            $destino = $uploadDir . '/' . $nombreArchivo;

            if (!move_uploaded_file($file['tmp_name'], $destino)) {
                throw new \Exception('Error al guardar imagen');
            }

            $registro = PropiedadImagen::create([
                'propiedad_id' => $san['propiedad_id'],
                'ruta' => '/uploads/propiedades/' . $nombreArchivo,
                'descripcion' => $san['descripcion'],
                'es_principal' => 0
            ]);

            Response::created($registro->toArray(), 'Imagen creada correctamente');

        } catch (\Exception $e) {
            Response::serverError();
        }
    }

    /**
     * DELETE /api/propiedad-imagenes/{id}
     */
    public function eliminar($id)
    {
        $idSan = PropiedadImagenSanitizer::sanitizarIdPropiedadImagen($id);

        if ($idSan === null) {
            Response::validationError([
                'id' => 'El ID de imagen es requerido'
            ]);
            return;
        }

        try {

            $img = PropiedadImagen::find($idSan);

            if (!$img) {
                Response::notFound('Imagen no encontrada');
                return;
            }

            $rutaFisica = dirname(dirname(__DIR__)) . '/public' . $img->ruta;

            if (file_exists($rutaFisica)) {
                unlink($rutaFisica);
            }

            // NO PASAR STRING EN EL 2DO PARAMETRO
            Response::success([
                'message' => 'Imagen eliminada correctamente'
            ]);

        } catch (\Exception $e) {
            Response::serverError();
        }
    }
}