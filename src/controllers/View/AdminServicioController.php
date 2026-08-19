<?php

namespace App\Controllers\View;

use App\Models\Servicio;

class AdminServicioController
{
    public function index()
    {
        if (!isset($_SESSION['usuario_id']) || $_SESSION['rol_id'] != 3) {
            header('Location: /sistema-alquiler/login');
            exit;
        }

        $servicios = Servicio::all();
        
        $data = [
            'title' => 'Servicios - Admin',
            'currentPage' => 'admin',
            'servicios' => $servicios
        ];
        
        $viewsPath = dirname(__DIR__, 2) . '/views/';
        
        require_once $viewsPath . 'layout/header.php';
        require_once $viewsPath . 'admin/servicios/index.php';
        require_once $viewsPath . 'layout/footer.php';
    }

    public function create()
    {
        if (!isset($_SESSION['usuario_id']) || $_SESSION['rol_id'] != 3) {
            header('Location: /sistema-alquiler/login');
            exit;
        }

        $data = [
            'title' => 'Nuevo Servicio - Admin',
            'currentPage' => 'admin'
        ];
        
        $viewsPath = dirname(__DIR__, 2) . '/views/';
        
        require_once $viewsPath . 'layout/header.php';
        require_once $viewsPath . 'admin/servicios/create.php';
        require_once $viewsPath . 'layout/footer.php';
    }

    public function store()
    {
        if (!isset($_SESSION['usuario_id']) || $_SESSION['rol_id'] != 3) {
            header('Location: /sistema-alquiler/login');
            exit;
        }

        $nombre = $_POST['nombre'] ?? '';
        
        if (empty($nombre)) {
            $_SESSION['error'] = 'El nombre es requerido';
            header('Location: /sistema-alquiler/admin/servicios/crear');
            exit;
        }

        try {
            Servicio::create(['nombre' => $nombre]);
            $_SESSION['success'] = 'Servicio creado exitosamente';
        } catch (\Exception $e) {
            $_SESSION['error'] = 'Error al crear: ' . $e->getMessage();
        }
        
        header('Location: /sistema-alquiler/admin/servicios');
        exit;
    }

    public function edit($id)
    {
        if (!isset($_SESSION['usuario_id']) || $_SESSION['rol_id'] != 3) {
            header('Location: /sistema-alquiler/login');
            exit;
        }

        $servicio = Servicio::find($id);
        
        if (!$servicio) {
            $_SESSION['error'] = 'Servicio no encontrado';
            header('Location: /sistema-alquiler/admin/servicios');
            exit;
        }

        $data = [
            'title' => 'Editar Servicio - Admin',
            'currentPage' => 'admin',
            'servicio' => $servicio
        ];
        
        $viewsPath = dirname(__DIR__, 2) . '/views/';
        
        require_once $viewsPath . 'layout/header.php';
        require_once $viewsPath . 'admin/servicios/edit.php';
        require_once $viewsPath . 'layout/footer.php';
    }

    public function update($id)
    {
        if (!isset($_SESSION['usuario_id']) || $_SESSION['rol_id'] != 3) {
            header('Location: /sistema-alquiler/login');
            exit;
        }

        $nombre = $_POST['nombre'] ?? '';
        
        if (empty($nombre)) {
            $_SESSION['error'] = 'El nombre es requerido';
            header('Location: /sistema-alquiler/admin/servicios/' . $id . '/editar');
            exit;
        }

        $servicio = Servicio::find($id);
        
        if (!$servicio) {
            $_SESSION['error'] = 'Servicio no encontrado';
            header('Location: /sistema-alquiler/admin/servicios');
            exit;
        }

        try {
            $servicio->update(['nombre' => $nombre]);
            $_SESSION['success'] = 'Servicio actualizado exitosamente';
        } catch (\Exception $e) {
            $_SESSION['error'] = 'Error al actualizar: ' . $e->getMessage();
        }
        
        header('Location: /sistema-alquiler/admin/servicios');
        exit;
    }

    public function delete($id)
    {
        if (!isset($_SESSION['usuario_id']) || $_SESSION['rol_id'] != 3) {
            header('Location: /sistema-alquiler/login');
            exit;
        }

        $servicio = Servicio::find($id);
        
        if (!$servicio) {
            $_SESSION['error'] = 'Servicio no encontrado';
            header('Location: /sistema-alquiler/admin/servicios');
            exit;
        }

        try {
            $servicio->delete();
            $_SESSION['success'] = 'Servicio eliminado exitosamente';
        } catch (\Exception $e) {
            $_SESSION['error'] = 'Error al eliminar: ' . $e->getMessage();
        }
        
        header('Location: /sistema-alquiler/admin/servicios');
        exit;
    }
}