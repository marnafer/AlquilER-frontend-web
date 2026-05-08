<?php

namespace App\Controllers;

use App\Models\Usuario;
use App\Helpers\JwtHelper;
use App\Middlewares\AutenticadorMiddleware;
use App\Sanitizers\UsuarioSanitizer;
use App\Validators\UsuarioValidator;

class UsuarioController
{
    /**
     * SOLO ADMIN
     * GET /api/usuarios
     */
    public function listarUsuariosApi()
    {
        $user = AutenticadorMiddleware::verificar();

        if ($user->rol_id != 3) {
            renderJson([
                'success' => false,
                'error' => 'Solo administradores'
            ], 403);
        }

        try {
            $usuarios = Usuario::all();

            renderJson([
                'success' => true,
                'data' => $usuarios,
                'total' => $usuarios->count()
            ], 200);

        } catch (\Exception $e) {
            renderJson([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * GET /api/usuarios/{id}
     */
    public function mostrar($id)
    {
        $user = AutenticadorMiddleware::verificar();

        $idSan = (int)$id;

        if ($user->rol_id != 3 && $user->sub != $idSan) {
            renderJson([
                'success' => false,
                'error' => 'No autorizado'
            ], 403);
        }

        try {
            $usuario = Usuario::find($idSan);

            if (!$usuario) {
                renderJson([
                    'success' => false,
                    'error' => 'Usuario no encontrado'
                ], 404);
            }

            renderJson([
                'success' => true,
                'data' => $usuario
            ], 200);

        } catch (\Exception $e) {
            renderJson([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * POST /api/usuarios
     * REGISTRO
     */
    public function registrar()
    {
        $raw = json_decode(file_get_contents('php://input'), true);

        if (!$raw || !is_array($raw)) {
            renderJson([
                'success' => false,
                'error' => 'Datos inválidos'
            ], 400);
        }

        // 1. Sanitizar
        $data = UsuarioSanitizer::sanitizarUsuario($raw);

        // 2. Validar
        $validacion = UsuarioValidator::validarCrearUsuario($data);

        if (!$validacion['success']) {
            renderJson([
                'success' => false,
                'errors' => $validacion['errors']
            ], 400);
        }

        // 3. Verificar email duplicado
        $usuarioModel = new Usuario();

        if ($usuarioModel->existePorEmail($data['email'])) {
            renderJson([
                'success' => false,
                'error' => 'Email ya registrado'
            ], 409);
        }

        try {
            // 4. Hashear contraseña
            $data['contrasena'] = password_hash($data['contrasena'], PASSWORD_DEFAULT);

            // 5. Crear usuario
            $usuario = Usuario::create($data);

            renderJson([
                'success' => true,
                'message' => 'Usuario creado correctamente',
                'data' => [
                    'id' => $usuario->id,
                    'email' => $usuario->email
                ]
            ], 201);

        } catch (\Exception $e) {
            renderJson([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * POST /api/autenticador/login
     */
    public static function login()
    {
        $raw = json_decode(file_get_contents('php://input'), true);

        $email = $raw['email'] ?? null;
        $contrasena = $raw['contrasena'] ?? null;

        if (!$email || !$contrasena) {
            renderJson([
                'success' => false,
                'error' => 'Datos incompletos'
            ], 400);
        }

        // Sanitizar email
        $email = UsuarioSanitizer::sanitizarSoloEmail($email);

        // Validar email
        $validEmail = UsuarioValidator::validarEmailLoginUsuario($email);
        if (!$validEmail['success']) {
            renderJson($validEmail, 400);
        }

        // Validar contraseña
        $validPass = UsuarioValidator::validarContrasenaUsuario($contrasena);
        if (!$validPass['success']) {
            renderJson($validPass, 400);
        }

        $usuarioModel = new Usuario();
        $usuario = $usuarioModel->verificarCredenciales($email, $contrasena);

        if (!$usuario) {
            renderJson([
                'success' => false,
                'error' => 'Credenciales inválidas'
            ], 401);
        }

        $token = JwtHelper::generarToken($usuario);

        renderJson([
            'success' => true,
            'message' => 'Login exitoso',
            'token' => $token,
            'user' => [
                'id' => $usuario->id,
                'email' => $usuario->email,
                'rol_id' => $usuario->rol_id
            ]
        ], 200);
    }

    /**
     * LOGOUT
     */
    public function logout()
    {
        renderJson([
            'success' => true,
            'message' => 'Logout (el cliente elimina el token)'
        ], 200);
    }

    /**
     * DELETE /api/usuarios/{id}
     */
    public function eliminar($id)
    {
        $user = AutenticadorMiddleware::verificar();

        if ($user->rol_id != 3) {
            renderJson([
                'success' => false,
                'error' => 'Solo administradores'
            ], 403);
        }

        try {
            $usuario = Usuario::find((int)$id);

            if (!$usuario) {
                renderJson([
                    'success' => false,
                    'error' => 'Usuario no encontrado'
                ], 404);
            }

            $usuario->delete();

            renderJson([
                'success' => true,
                'message' => 'Usuario eliminado'
            ], 200);

        } catch (\Exception $e) {
            renderJson([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * PUT /api/usuarios/{id}
     */
    public function actualizar($id)
    {
        $user = AutenticadorMiddleware::verificar();

        $id = (int)$id;

        if ($user->rol_id != 3 && $user->sub != $id) {
            renderJson([
                'success' => false,
                'error' => 'No autorizado'
            ], 403);
        }

        $raw = json_decode(file_get_contents('php://input'), true);

        if (!is_array($raw)) {
            renderJson([
                'success' => false,
                'error' => 'Datos inválidos'
            ], 400);
        }

        $data = UsuarioSanitizer::sanitizarUsuario($raw);
        $validacion = UsuarioValidator::validarActualizarUsuario($data);

        if (!$validacion['success']) {
            renderJson([
                'success' => false,
                'errors' => $validacion['errors']
            ], 400);
        }

        try {
            $usuario = Usuario::find($id);

            if (!$usuario) {
                renderJson([
                    'success' => false,
                    'error' => 'Usuario no encontrado'
                ], 404);
            }

            if (!empty($data['contrasena'])) {
                $data['contrasena'] = password_hash($data['contrasena'], PASSWORD_DEFAULT);
            }

            $usuario->update($data);

            renderJson([
                'success' => true,
                'message' => 'Usuario actualizado correctamente'
            ], 200);

        } catch (\Exception $e) {
            renderJson([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }
}