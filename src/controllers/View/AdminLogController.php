<?php

namespace App\Controllers\View;

use App\Models\LogActividad;

class AdminLogController
{
    public function index()
    {
        if (!isset($_SESSION['usuario_id']) || $_SESSION['rol_id'] != 3) {
            header('Location: /sistema-alquiler/login');
            exit;
        }

        $logs = LogActividad::with('usuario')
            ->orderBy('fecha', 'desc')
            ->paginate(20);
        
        $data = [
            'title' => 'Logs - Admin',
            'currentPage' => 'admin',
            'logs' => $logs
        ];
        
        $viewsPath = dirname(__DIR__, 2) . '/views/';
        
        require_once $viewsPath . 'layout/header.php';
        require_once $viewsPath . 'admin/logs/index.php';
        require_once $viewsPath . 'layout/footer.php';
    }

    public function delete($id)
    {
        if (!isset($_SESSION['usuario_id']) || $_SESSION['rol_id'] != 3) {
            header('Location: /sistema-alquiler/login');
            exit;
        }

        $log = LogActividad::find($id);
        
        if (!$log) {
            $_SESSION['error'] = 'Log no encontrado';
            header('Location: /sistema-alquiler/admin/logs');
            exit;
        }

        try {
            $log->delete();
            $_SESSION['success'] = 'Log eliminado exitosamente';
        } catch (\Exception $e) {
            $_SESSION['error'] = 'Error al eliminar: ' . $e->getMessage();
        }
        
        header('Location: /sistema-alquiler/admin/logs');
        exit;
    }

    public function limpiar()
    {
        if (!isset($_SESSION['usuario_id']) || $_SESSION['rol_id'] != 3) {
            header('Location: /sistema-alquiler/login');
            exit;
        }

        try {
            LogActividad::truncate();
            $_SESSION['success'] = 'Logs limpiados exitosamente';
        } catch (\Exception $e) {
            $_SESSION['error'] = 'Error al limpiar logs: ' . $e->getMessage();
        }
        
        header('Location: /sistema-alquiler/admin/logs');
        exit;
    }
}