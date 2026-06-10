<?php

namespace App\Middlewares;

use App\Helpers\JwtHelper;
use App\Helpers\Response;

class AutenticadorMiddleware {

   public static function verificar() {

        $authHeader = $_SERVER['HTTP_AUTHORIZATION'] 
            ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] 
            ?? null;

        // 1. Verificar que exista
        if (!$authHeader) {
            Response::unauthorized('Token requerido');
        }

        // 2. Verificar formato Bearer
        if (!str_starts_with($authHeader, 'Bearer ')) {
            Response::unauthorized('Formato de token inválido');
        }

        // 3. Extraer token
        $token = substr($authHeader, 7);

        // 4. Validar token
        $user = JwtHelper::verificarToken($token);

        if (!$user) {
            Response::unauthorized('Token inválido o expirado');
        }

        return $user;
    }

    public static function soloPropietario() {
        $user = self::verificar();

        if ($user->rol_id != 1) {
            Response::forbidden('Solo propietarios');
        }

        return $user;
    }

    public static function soloInquilino() {
        $user = self::verificar();

        if ($user->rol_id != 2) {
            Response::forbidden('Solo inquilinos');
        }

        return $user;
    }

    public static function soloAdmin() {
        $user = self::verificar();

        if ($user->rol_id != 3) {
            Response::forbidden('Solo administradores');
        }

        return $user;
    }
}