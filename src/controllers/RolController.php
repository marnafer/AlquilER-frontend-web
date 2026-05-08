<?php

namespace App\Controllers;

use App\Models\Rol;
use App\Sanitizers\RolSanitizer;
use App\Validators\RolValidator;
use Exception;

class RolController
{
    /**
     * GET /api/roles
     */
    public function index()
    {
        try {
            $roles = Rol::getAll();

            return renderJson([
                'success' => true,
                'data' => $roles,
                'total' => count($roles)
            ]);
        } catch (Exception $e) {
            return renderJson([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * GET /api/roles/con-usuarios
     */
    public function indexWithCount()
    {
        try {
            $roles = Rol::getAllWithCount();

            return renderJson([
                'success' => true,
                'data' => $roles,
                'total' => count($roles)
            ]);
        } catch (Exception $e) {
            return renderJson([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * GET /api/roles/default
     */
    public function getDefault()
    {
        try {
            $rol = Rol::getDefaultRol();

            if (!$rol) {
                return renderJson([
                    'success' => false,
                    'error' => 'No se encontró un rol por defecto'
                ], 404);
            }

            return renderJson([
                'success' => true,
                'data' => $rol
            ]);
        } catch (Exception $e) {
            return renderJson([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * GET /api/roles/{id}
     */
    public function show($id)
    {
        $validacion = RolValidator::validarSoloId($id);

        if (!$validacion['success']) {
            return renderJson($validacion, 400);
        }

        try {
            $rol = Rol::getById($id);

            if (!$rol) {
                return renderJson([
                    'success' => false,
                    'error' => 'Rol no encontrado'
                ], 404);
            }

            return renderJson([
                'success' => true,
                'data' => $rol
            ]);
        } catch (Exception $e) {
            return renderJson([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * POST /api/roles
     */
    public function store()
    {
        $data = json_decode(file_get_contents('php://input'), true);

        if (!$data) {
            return renderJson([
                'success' => false,
                'error' => 'Datos inválidos'
            ], 400);
        }

        $datos = RolSanitizer::sanitizar($data);
        $validacion = RolValidator::validarCrear($datos);

        if (!$validacion['success']) {
            return renderJson($validacion, 400);
        }

        try {
            if (Rol::existsByNombre($datos['nombre'])) {
                return renderJson([
                    'success' => false,
                    'error' => 'Ya existe un rol con este nombre'
                ], 409);
            }

            $id = Rol::createRol($datos);

            return renderJson([
                'success' => true,
                'message' => 'Rol creado exitosamente',
                'data' => ['id' => $id]
            ], 201);

        } catch (Exception $e) {
            return renderJson([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * PUT /api/roles/{id}
     */
    public function update($id)
    {
        $data = json_decode(file_get_contents('php://input'), true);

        if (!$data) {
            return renderJson([
                'success' => false,
                'error' => 'Datos inválidos'
            ], 400);
        }

        $data['id'] = $id;

        $datos = RolSanitizer::sanitizar($data);
        $validacion = RolValidator::validarActualizar($datos);

        if (!$validacion['success']) {
            return renderJson($validacion, 400);
        }

        try {
            if (!Rol::exists($id)) {
                return renderJson([
                    'success' => false,
                    'error' => 'Rol no encontrado'
                ], 404);
            }

            if (Rol::existsByNombre($datos['nombre'], $id)) {
                return renderJson([
                    'success' => false,
                    'error' => 'Ya existe otro rol con este nombre'
                ], 409);
            }

            Rol::updateRol($id, $datos);

            return renderJson([
                'success' => true,
                'message' => 'Rol actualizado exitosamente'
            ]);

        } catch (Exception $e) {
            return renderJson([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * DELETE /api/roles/{id}
     */
    public function delete($id)
    {
        $validacion = RolValidator::validarSoloId($id);

        if (!$validacion['success']) {
            return renderJson($validacion, 400);
        }

        try {
            if (!Rol::exists($id)) {
                return renderJson([
                    'success' => false,
                    'error' => 'Rol no encontrado'
                ], 404);
            }

            $rol = Rol::find($id);

            if ($rol && $rol->hasUsuarios()) {
                return renderJson([
                    'success' => false,
                    'error' => 'No se puede eliminar el rol porque tiene usuarios asociados'
                ], 409);
            }

            Rol::deleteRol($id);

            return renderJson([
                'success' => true,
                'message' => 'Rol eliminado exitosamente'
            ]);

        } catch (Exception $e) {
            return renderJson([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }
}