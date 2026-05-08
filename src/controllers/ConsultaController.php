<?php
/**
 * Controlador del módulo de Consultas
 * TODAS las respuestas son en JSON
 */

namespace App\Controllers;

use App\Models\Consulta;
use App\Models\Propiedad;
use App\Models\Usuario;
use App\Sanitizers\ConsultaSanitizer;
use App\Validators\ConsultaValidator;
use App\Middlewares\AutenticadorMiddleware;
use SoftDeletes;

class ConsultaController {
    
    /**
     * Listar todas las consultas
     * GET /api/consultas
     */

   public function listar() {

        AutenticadorMiddleware::soloAdmin();

        try {
            $consultas = Consulta::all();

            renderJson([
                'success' => true,
                'data' => $consultas,
                'total' => $consultas->count()
            ], 200);

        } catch (\Exception $e) {
            renderJson(['error' => $e->getMessage()], 500);
        }
    }
    
    /**
     * Obtener una consulta específica
     * GET /api/consultas/{id}
     */
   public function obtener($id) {

        $user = AutenticadorMiddleware::verificar();

        try {
            // 1. Sanitizar + validar ID
            $idSan = ConsultaSanitizer::sanitizarId($id);
            $validacion = ConsultaValidator::validarConsultaId($idSan);

            if (!$validacion['success']) {
                return renderJson([
                    'success' => false,
                    'error' => $validacion['error']
                ], 400);
            }

            // 2. Buscar
            $consulta = Consulta::find($idSan);

            if (!$consulta) {
                return renderJson([
                    'success' => false,
                    'error' => 'Consulta no encontrada'
                ], 404);
            }

            // REGLA DE ACCESO
            if ($user->rol != 3 && $consulta->inquilino_id != $user->sub) {
                return renderJson(['error' => 'No autorizado'], 403);
            }

            renderJson([
                'success' => true,
                'data' => $consulta
            ], 200);

        } catch (\Exception $e) {
            renderJson(['error' => $e->getMessage()], 500);
        }
    }
    
    /**
     * Listar consultas por propiedad
     * GET /api/consultas/propiedad/{id}
     */
    public function listarPorPropiedad($propiedadId) {

        $user = AutenticadorMiddleware::verificar();

        try {

            $propiedad = Propiedad::find($propiedadId);

            if (!$propiedad) {
                return renderJson(['error' => 'Propiedad no encontrada'], 404);
            }

            // propietario dueño o admin
            if ($user->rol_id != 3 && $propiedad->usuario_id != $user->sub) {
                return renderJson(['error' => 'No autorizado'], 403);
            }

            $consultas = Consulta::where('propiedad_id', $propiedadId)->get();

            renderJson([
                'success' => true,
                'data' => $consultas,
                'total' => $consultas->count()
            ], 200);

        } catch (\Exception $e) {
            renderJson(['error' => $e->getMessage()], 500);
        }
    }
    
    /**
     * Listar consultas por inquilino
     * GET /api/consultas/inquilino/{id}
     */
    public function listarPorInquilino($inquilinoId) {

        $user = AutenticadorMiddleware::verificar();

        try {

            if ($user->rol_id != 3 && $user->sub != $inquilinoId) {
                return renderJson(['error' => 'No autorizado'], 403);
            }

            $consultas = Consulta::where('inquilino_id', $inquilinoId)->get();

            renderJson([
                'success' => true,
                'data' => $consultas,
                'total' => $consultas->count()
            ], 200);

        } catch (\Exception $e) {
            renderJson(['error' => $e->getMessage()], 500);
        }
    }
    
    /**
     * Crear una nueva consulta
     * POST /api/consultas
     */
    public function crear() {

        $user = AutenticadorMiddleware::soloInquilino();

        $raw = json_decode(file_get_contents('php://input'), true);

        // Validar JSON primero
        if (!is_array($raw)) {
            return renderJson([
                'success' => false,
                'error' => 'JSON inválido'
            ], 400);
        }

        // 1. SANITIZAR
        $san = ConsultaSanitizer::sanitizarConsulta($raw);

        // 2. VALIDAR
        $validacion = ConsultaValidator::validarCrearConsulta($san);

        if (!$validacion['success']) {
            return renderJson([
                'success' => false,
                'errors' => $validacion['errors']
            ], 400);
        }

        // 3. DATOS LIMPIOS
        $dataValida = $validacion['data'];

        try {

            $propiedad = Propiedad::find($dataValida['propiedad_id']);

            if (!$propiedad) {
                return renderJson(['error' => 'Propiedad no existe'], 404);
            }

            // INQUILINO REAL = TOKEN (NO DEL BODY)
            $consulta = Consulta::create([
                'propiedad_id'   => $dataValida['propiedad_id'],
                'inquilino_id'   => $user->sub,
                'mensaje'        => $dataValida['mensaje'],
                'fecha_consulta' => date('Y-m-d H:i:s')
            ]);

            renderJson([
                'success' => true,
                'message' => 'Consulta creada',
                'data' => $consulta
            ], 201);

        } catch (\Exception $e) {
            renderJson(['error' => $e->getMessage()], 500);
        }
    }
    
    /**
 * Actualizar una consulta
 * PUT /api/consultas/{id}
 */
public function actualizar($id) {

        $user = AutenticadorMiddleware::verificar();

        $consulta = Consulta::find($id);

        if (!$consulta) {
            return renderJson(['error' => 'No existe'], 404);
        }

        if ($user->rol != 3 && $consulta->inquilino_id != $user->sub) {
            return renderJson(['error' => 'No autorizado'], 403);
        }

       $raw = json_decode(file_get_contents('php://input'), true) ?? [];

        // 1. AGREGAR ID
        $raw['id'] = $id;

        // 2. SANITIZAR
        $san = ConsultaSanitizer::sanitizarConsulta($raw);

        // 3. VALIDAR
        $validacion = ConsultaValidator::validarActualizarConsulta($san);

        if (!$validacion['success']) {
            return renderJson([
                'success' => false,
                'errors' => $validacion['errors']
            ], 400);
        }

        // 4. ACTUALIZAR
        $consulta->update($validacion['data']);

        renderJson([
            'success' => true,
            'message' => 'Actualizada',
            'data' => $consulta
        ]);
    }
    
    /**
 * Eliminar una consulta (soft delete)
 * DELETE /api/consultas/{id}
 */
public function eliminar($id) {

        AutenticadorMiddleware::soloAdmin();

        $consulta = Consulta::find($id);

        $idSan = ConsultaSanitizer::sanitizarId($id);
        $validacion = ConsultaValidator::validarConsultaId($idSan);

        if (!$validacion['success']) {
            return renderJson($validacion, 400);
        }

        $consulta->delete();

        renderJson([
            'success' => true,
            'message' => 'Eliminada'
        ]);
    }
}