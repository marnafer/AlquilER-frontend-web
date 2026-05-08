<?php

namespace App\Helpers;

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class JwtHelper {

    private static function getConfig() {
        return require __DIR__ . '/../../config/jwt.php';
    }

    public static function generarToken($usuario) {

        $config = self::getConfig();

        $payload = [
            'iss' => 'sistema-alquiler',
            'iat' => time(),
            'exp' => time() + $config['exp'],
            'sub' => $usuario->id,
            'email' => $usuario->email,
            'rol_id' => $usuario->rol_id
        ];

        return JWT::encode($payload, $config['key'], $config['alg']);
    }

    public static function verificarToken($token) {

        $config = self::getConfig();

        try {
            return JWT::decode($token, new Key($config['key'], $config['alg']));
        } catch (\Exception $e) {
            return null;
        }
    }
}