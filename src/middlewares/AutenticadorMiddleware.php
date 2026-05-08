<?php

namespace App\Middlewares;

use App\Helpers\JwtHelper;

class AutenticadorMiddleware {

   public static function verificar() {

        $authHeader = $_SERVER['HTTP_AUTHORIZATION'] 
            ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] 
            ?? null;

        // 1. Verificar que exista
        if (!$authHeader) {
            renderJson([
                'success' => false,
                'error' => 'Token requerido'
            ], 401);
        }

        // 2. Verificar formato Bearer
        if (!str_starts_with($authHeader, 'Bearer ')) {
            renderJson([
                'success' => false,
                'error' => 'Formato de token inválido'
            ], 401);
        }

        // 3. Extraer token
        $token = substr($authHeader, 7);

        // 4. Validar token
        $user = JwtHelper::verificarToken($token);

        if (!$user) {
            renderJson([
                'success' => false,
                'error' => 'Token inválido o expirado'
            ], 401);
        }

        return $user;
    }

    public static function soloPropietario() {
        $user = self::verificar();

        if ($user->rol_id != 1) {
            renderJson([
                'success' => false,
                'error' => 'Solo propietarios'
            ], 403);
        }

        return $user;
    }

    public static function soloInquilino() {
        $user = self::verificar();

        if ($user->rol_id != 2) {
            renderJson([
                'success' => false,
                'error' => 'Solo inquilinos'
            ], 403);
        }

        return $user;
    }

    public static function soloAdmin() {
        $user = self::verificar();

        if ($user->rol_id != 3) {
            renderJson([
                'success' => false,
                'error' => 'Solo administradores'
            ], 403);
        }

        return $user;
    }
}