<?php

namespace App\Controllers\View;

use App\Models\Provincia;
use App\Models\Localidad;

class AdminUbicacionController
{
    public function index()
    {
        if (!isset($_SESSION['usuario_id']) || $_SESSION['rol_id'] != 3) {
            header('Location: /sistema-alquiler/login');
            exit;
        }

        $provincias = Provincia::withCount('localidades')->get();
        $localidades = Localidad::with('provincia')->get();
        
        $data = [
            'title' => 'Ubicaciones - Admin',
            'currentPage' => 'admin',
            'provincias' => $provincias,
            'localidades' => $localidades
        ];
        
        $viewsPath = dirname(__DIR__, 2) . '/views/';
        
        require_once $viewsPath . 'layout/header.php';
        require_once $viewsPath . 'admin/ubicaciones/index.php';
        require_once $viewsPath . 'layout/footer.php';
    }

    public function storeProvincia()
    {
        if (!isset($_SESSION['usuario_id']) || $_SESSION['rol_id'] != 3) {
            header('Location: /sistema-alquiler/login');
            exit;
        }

        $nombre = $_POST['nombre'] ?? '';
        
        if (empty($nombre)) {
            $_SESSION['error'] = 'El nombre es requerido';
            header('Location: /sistema-alquiler/admin/ubicaciones');
            exit;
        }

        try {
            Provincia::create(['nombre' => $nombre]);
            $_SESSION['success'] = 'Provincia creada exitosamente';
        } catch (\Exception $e) {
            $_SESSION['error'] = 'Error al crear: ' . $e->getMessage();
        }
        
        header('Location: /sistema-alquiler/admin/ubicaciones');
        exit;
    }

    public function updateProvincia($id)
    {
        if (!isset($_SESSION['usuario_id']) || $_SESSION['rol_id'] != 3) {
            header('Location: /sistema-alquiler/login');
            exit;
        }

        $nombre = $_POST['nombre'] ?? '';
        
        if (empty($nombre)) {
            $_SESSION['error'] = 'El nombre es requerido';
            header('Location: /sistema-alquiler/admin/ubicaciones');
            exit;
        }

        $provincia = Provincia::find($id);
        
        if (!$provincia) {
            $_SESSION['error'] = 'Provincia no encontrada';
            header('Location: /sistema-alquiler/admin/ubicaciones');
            exit;
        }

        try {
            $provincia->update(['nombre' => $nombre]);
            $_SESSION['success'] = 'Provincia actualizada exitosamente';
        } catch (\Exception $e) {
            $_SESSION['error'] = 'Error al actualizar: ' . $e->getMessage();
        }
        
        header('Location: /sistema-alquiler/admin/ubicaciones');
        exit;
    }

    public function deleteProvincia($id)
    {
        if (!isset($_SESSION['usuario_id']) || $_SESSION['rol_id'] != 3) {
            header('Location: /sistema-alquiler/login');
            exit;
        }

        $provincia = Provincia::find($id);
        
        if (!$provincia) {
            $_SESSION['error'] = 'Provincia no encontrada';
            header('Location: /sistema-alquiler/admin/ubicaciones');
            exit;
        }

        try {
            $provincia->delete();
            $_SESSION['success'] = 'Provincia eliminada exitosamente';
        } catch (\Exception $e) {
            $_SESSION['error'] = 'Error al eliminar: ' . $e->getMessage();
        }
        
        header('Location: /sistema-alquiler/admin/ubicaciones');
        exit;
    }

    public function storeLocalidad()
    {
        if (!isset($_SESSION['usuario_id']) || $_SESSION['rol_id'] != 3) {
            header('Location: /sistema-alquiler/login');
            exit;
        }

        $nombre = $_POST['nombre'] ?? '';
        $codigoPostal = $_POST['codigo_postal'] ?? '';
        $provinciaId = $_POST['provincia_id'] ?? '';
        
        if (empty($nombre) || empty($provinciaId)) {
            $_SESSION['error'] = 'Nombre y provincia son requeridos';
            header('Location: /sistema-alquiler/admin/ubicaciones');
            exit;
        }

        try {
            Localidad::create([
                'nombre' => $nombre,
                'codigo_postal' => $codigoPostal,
                'provincia_id' => $provinciaId
            ]);
            $_SESSION['success'] = 'Localidad creada exitosamente';
        } catch (\Exception $e) {
            $_SESSION['error'] = 'Error al crear: ' . $e->getMessage();
        }
        
        header('Location: /sistema-alquiler/admin/ubicaciones');
        exit;
    }

    public function updateLocalidad($id)
    {
        if (!isset($_SESSION['usuario_id']) || $_SESSION['rol_id'] != 3) {
            header('Location: /sistema-alquiler/login');
            exit;
        }

        $nombre = $_POST['nombre'] ?? '';
        $codigoPostal = $_POST['codigo_postal'] ?? '';
        $provinciaId = $_POST['provincia_id'] ?? '';
        
        if (empty($nombre) || empty($provinciaId)) {
            $_SESSION['error'] = 'Nombre y provincia son requeridos';
            header('Location: /sistema-alquiler/admin/ubicaciones');
            exit;
        }

        $localidad = Localidad::find($id);
        
        if (!$localidad) {
            $_SESSION['error'] = 'Localidad no encontrada';
            header('Location: /sistema-alquiler/admin/ubicaciones');
            exit;
        }

        try {
            $localidad->update([
                'nombre' => $nombre,
                'codigo_postal' => $codigoPostal,
                'provincia_id' => $provinciaId
            ]);
            $_SESSION['success'] = 'Localidad actualizada exitosamente';
        } catch (\Exception $e) {
            $_SESSION['error'] = 'Error al actualizar: ' . $e->getMessage();
        }
        
        header('Location: /sistema-alquiler/admin/ubicaciones');
        exit;
    }

    public function deleteLocalidad($id)
    {
        if (!isset($_SESSION['usuario_id']) || $_SESSION['rol_id'] != 3) {
            header('Location: /sistema-alquiler/login');
            exit;
        }

        $localidad = Localidad::find($id);
        
        if (!$localidad) {
            $_SESSION['error'] = 'Localidad no encontrada';
            header('Location: /sistema-alquiler/admin/ubicaciones');
            exit;
        }

        try {
            $localidad->delete();
            $_SESSION['success'] = 'Localidad eliminada exitosamente';
        } catch (\Exception $e) {
            $_SESSION['error'] = 'Error al eliminar: ' . $e->getMessage();
        }
        
        header('Location: /sistema-alquiler/admin/ubicaciones');
        exit;
    }
}