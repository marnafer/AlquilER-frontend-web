<?php

namespace App\Controllers\View;

use App\Models\Usuario;

class AuthController
{
    // ============================================
    // LOGIN
    // ============================================

    public function login()
    {
        $data = [
            'title' => 'Iniciar Sesión - AlquilER',
            'currentPage' => 'login'
        ];
        
        $viewsPath = dirname(__DIR__, 2) . '/views/';
        
        require_once $viewsPath . 'layout/header.php';
        require_once $viewsPath . 'auth/login.php';
        require_once $viewsPath . 'layout/footer.php';
    }

    public function loginPost()
    {
        // Obtener datos del formulario
        $email = $_POST['email'] ?? '';
        $password = $_POST['password'] ?? '';
        
        // Validar campos vacíos
        if (empty($email) || empty($password)) {
            $_SESSION['error'] = '⚠️ Por favor, completá todos los campos';
            header('Location: /sistema-alquiler/login');
            exit;
        }

        // Buscar usuario por email
        $usuario = Usuario::where('email', $email)
            ->whereNull('deleted_at')
            ->first();

        // Verificar que el usuario existe
        if (!$usuario) {
            $_SESSION['error'] = '❌ Email o contraseña incorrectos';
            header('Location: /sistema-alquiler/login');
            exit;
        }

        // Verificar la contraseña
        if (!password_verify($password, $usuario->contrasena)) {
            $_SESSION['error'] = '❌ Email o contraseña incorrectos';
            header('Location: /sistema-alquiler/login');
            exit;
        }

        // Guardar datos en sesión
        $_SESSION['usuario_id'] = $usuario->id;
        $_SESSION['usuario_nombre'] = $usuario->nombre;
        $_SESSION['usuario_apellido'] = $usuario->apellido;
        $_SESSION['rol_id'] = $usuario->rol_id;
        $_SESSION['usuario_email'] = $usuario->email;

        // Redirigir al dashboard
        $_SESSION['success'] = '✅ ¡Bienvenido, ' . $usuario->nombre . '!';
        header('Location: /sistema-alquiler/dashboard');
        exit;
    }

    // ============================================
    // REGISTER
    // ============================================

    public function register()
    {
        $data = [
            'title' => 'Registrarse - AlquilER',
            'currentPage' => 'register'
        ];
        
        $viewsPath = dirname(__DIR__, 2) . '/views/';
        
        require_once $viewsPath . 'layout/header.php';
        require_once $viewsPath . 'auth/register.php';
        require_once $viewsPath . 'layout/footer.php';
    }

    public function registerPost()
    {
        // Obtener datos del formulario
        $nombre = $_POST['nombre'] ?? '';
        $apellido = $_POST['apellido'] ?? '';
        $email = $_POST['email'] ?? '';
        $telefono = $_POST['telefono'] ?? '';
        $domicilio = $_POST['domicilio'] ?? '';
        $password = $_POST['password'] ?? '';
        $passwordConfirm = $_POST['password_confirm'] ?? '';

        // Validar campos obligatorios
        if (empty($nombre) || empty($apellido) || empty($email) || empty($password)) {
            $_SESSION['error'] = '⚠️ Todos los campos obligatorios deben estar completos';
            header('Location: /sistema-alquiler/register');
            exit;
        }

        // Validar que las contraseñas coincidan
        if ($password !== $passwordConfirm) {
            $_SESSION['error'] = '❌ Las contraseñas no coinciden';
            header('Location: /sistema-alquiler/register');
            exit;
        }

        // Validar longitud de contraseña
        if (strlen($password) < 6) {
            $_SESSION['error'] = '❌ La contraseña debe tener al menos 6 caracteres';
            header('Location: /sistema-alquiler/register');
            exit;
        }

        // Validar formato de email
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $_SESSION['error'] = '❌ El email no es válido';
            header('Location: /sistema-alquiler/register');
            exit;
        }

        // Verificar que el email no esté registrado
        if (Usuario::where('email', $email)->exists()) {
            $_SESSION['error'] = '❌ El email ya está registrado';
            header('Location: /sistema-alquiler/register');
            exit;
        }

        try {
            // Crear el usuario
            $usuario = Usuario::create([
                'nombre' => $nombre,
                'apellido' => $apellido,
                'email' => $email,
                'telefono' => $telefono,
                'domicilio' => $domicilio,
                'contrasena' => password_hash($password, PASSWORD_DEFAULT),
                'rol_id' => 1 // 1 = inquilino
            ]);

            $_SESSION['success'] = '✅ ¡Usuario registrado exitosamente! Ya puedes iniciar sesión.';
            header('Location: /sistema-alquiler/login');
            exit;

        } catch (\Exception $e) {
            $_SESSION['error'] = '❌ Error al registrar usuario: ' . $e->getMessage();
            header('Location: /sistema-alquiler/register');
            exit;
        }
    }

    // ============================================
    // PERFIL
    // ============================================

    public function perfil()
    {
        // Verificar autenticación
        if (!isset($_SESSION['usuario_id'])) {
            $_SESSION['error'] = '⚠️ Debes iniciar sesión para ver tu perfil';
            header('Location: /sistema-alquiler/login');
            exit;
        }

        $usuario = Usuario::find($_SESSION['usuario_id']);
        
        if (!$usuario) {
            session_destroy();
            $_SESSION['error'] = '❌ Usuario no encontrado';
            header('Location: /sistema-alquiler/login');
            exit;
        }

        $data = [
            'title' => 'Mi Perfil - AlquilER',
            'currentPage' => 'perfil',
            'usuario' => $usuario
        ];
        
        $viewsPath = dirname(__DIR__, 2) . '/views/';
        
        require_once $viewsPath . 'layout/header.php';
        require_once $viewsPath . 'auth/perfil.php';
        require_once $viewsPath . 'layout/footer.php';
    }

    public function actualizarPerfil()
    {
        // Verificar autenticación
        if (!isset($_SESSION['usuario_id'])) {
            $_SESSION['error'] = '⚠️ Debes iniciar sesión para actualizar tu perfil';
            header('Location: /sistema-alquiler/login');
            exit;
        }

        $usuarioId = $_SESSION['usuario_id'];
        $usuario = Usuario::find($usuarioId);

        if (!$usuario) {
            $_SESSION['error'] = '❌ Usuario no encontrado';
            header('Location: /sistema-alquiler/perfil');
            exit;
        }

        // Obtener datos del formulario
        $nombre = $_POST['nombre'] ?? '';
        $apellido = $_POST['apellido'] ?? '';
        $email = $_POST['email'] ?? '';
        $telefono = $_POST['telefono'] ?? '';
        $domicilio = $_POST['domicilio'] ?? '';
        $password = $_POST['password'] ?? '';
        $passwordConfirm = $_POST['password_confirm'] ?? '';

        // Validar campos obligatorios
        if (empty($nombre) || empty($apellido) || empty($email)) {
            $_SESSION['error'] = '⚠️ Nombre, apellido y email son obligatorios';
            header('Location: /sistema-alquiler/perfil');
            exit;
        }

        // Validar formato de email
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $_SESSION['error'] = '❌ El email no es válido';
            header('Location: /sistema-alquiler/perfil');
            exit;
        }

        // Verificar email duplicado
        if ($email !== $usuario->email) {
            $existe = Usuario::where('email', $email)->where('id', '!=', $usuarioId)->exists();
            if ($existe) {
                $_SESSION['error'] = '❌ El email ya está registrado por otro usuario';
                header('Location: /sistema-alquiler/perfil');
                exit;
            }
        }

        // Validar contraseña si se quiere cambiar
        if (!empty($password) || !empty($passwordConfirm)) {
            if ($password !== $passwordConfirm) {
                $_SESSION['error'] = '❌ Las contraseñas no coinciden';
                header('Location: /sistema-alquiler/perfil');
                exit;
            }
            if (strlen($password) < 6) {
                $_SESSION['error'] = '❌ La contraseña debe tener al menos 6 caracteres';
                header('Location: /sistema-alquiler/perfil');
                exit;
            }
            $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
        }

        try {
            // Actualizar datos
            $usuario->nombre = $nombre;
            $usuario->apellido = $apellido;
            $usuario->email = $email;
            $usuario->telefono = $telefono;
            $usuario->domicilio = $domicilio;
            
            if (isset($hashedPassword)) {
                $usuario->contrasena = $hashedPassword;
            }
            
            $usuario->save();

            // Actualizar sesión
            $_SESSION['usuario_nombre'] = $usuario->nombre;
            $_SESSION['usuario_email'] = $usuario->email;

            $_SESSION['success'] = '✅ Perfil actualizado exitosamente';
            header('Location: /sistema-alquiler/perfil');
            exit;

        } catch (\Exception $e) {
            $_SESSION['error'] = '❌ Error al actualizar perfil: ' . $e->getMessage();
            header('Location: /sistema-alquiler/perfil');
            exit;
        }
    }

    // ============================================
    // LOGOUT
    // ============================================

    public function logout()
    {
        session_destroy();
        $_SESSION['success'] = '✅ Has cerrado sesión correctamente';
        header('Location: /sistema-alquiler/home');
        exit;
    }
}