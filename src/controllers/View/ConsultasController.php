<?php

namespace App\Controllers\View;

use App\Models\Consulta;
use App\Models\Propiedad;

class ConsultasController
{
    public function index()
    {
        if (!isset($_SESSION['usuario_id'])) {
            header('Location: /sistema-alquiler/login');
            exit;
        }

        $consultas = Consulta::with('propiedad')
            ->where('usuario_id', $_SESSION['usuario_id'])
            ->orderBy('fecha_consulta', 'desc')
            ->get();
        
        // Si es admin, ver todas
        if ($_SESSION['rol_id'] == 3) {
            $consultas = Consulta::with(['propiedad', 'usuario'])
                ->orderBy('fecha_consulta', 'desc')
                ->get();
        }
        
        $data = [
            'title' => 'Consultas - AlquilER',
            'currentPage' => 'consultas',
            'consultas' => $consultas
        ];
        
        $viewsPath = dirname(__DIR__, 2) . '/views/';
        
        require_once $viewsPath . 'layout/header.php';
        require_once $viewsPath . 'consultas/index.php';
        require_once $viewsPath . 'layout/footer.php';
    }

    public function show($id)
    {
        if (!isset($_SESSION['usuario_id'])) {
            header('Location: /sistema-alquiler/login');
            exit;
        }

        $consulta = Consulta::with('propiedad')
            ->where('id', $id)
            ->first();
        
        if (!$consulta) {
            $_SESSION['error'] = 'Consulta no encontrada';
            header('Location: /sistema-alquiler/consultas');
            exit;
        }

        // Verificar que es el dueño o admin
        if ($consulta->usuario_id != $_SESSION['usuario_id'] && $_SESSION['rol_id'] != 3) {
            $_SESSION['error'] = 'No tienes permisos para ver esta consulta';
            header('Location: /sistema-alquiler/consultas');
            exit;
        }

        $data = [
            'title' => 'Detalle Consulta - AlquilER',
            'currentPage' => 'consultas',
            'consulta' => $consulta
        ];
        
        $viewsPath = dirname(__DIR__, 2) . '/views/';
        
        require_once $viewsPath . 'layout/header.php';
        require_once $viewsPath . 'consultas/show.php';
        require_once $viewsPath . 'layout/footer.php';
    }

    public function store()
    {
        if (!isset($_SESSION['usuario_id'])) {
            header('Location: /sistema-alquiler/login');
            exit;
        }

        $propiedadId = $_POST['propiedad_id'] ?? 0;
        $mensaje = $_POST['mensaje'] ?? '';
        
        if (empty($mensaje)) {
            $_SESSION['error'] = 'El mensaje es requerido';
            header('Location: /sistema-alquiler/propiedades/' . $propiedadId);
            exit;
        }

        try {
            Consulta::create([
                'propiedad_id' => $propiedadId,
                'usuario_id' => $_SESSION['usuario_id'],
                'mensaje' => $mensaje
            ]);
            $_SESSION['success'] = 'Consulta enviada exitosamente';
        } catch (\Exception $e) {
            $_SESSION['error'] = 'Error al enviar consulta: ' . $e->getMessage();
        }
        
        header('Location: /sistema-alquiler/propiedades/' . $propiedadId);
        exit;
    }

    public function delete($id)
    {
        if (!isset($_SESSION['usuario_id'])) {
            header('Location: /sistema-alquiler/login');
            exit;
        }

        $consulta = Consulta::find($id);
        
        if (!$consulta) {
            $_SESSION['error'] = 'Consulta no encontrada';
            header('Location: /sistema-alquiler/consultas');
            exit;
        }

        // Verificar que es el dueño o admin
        if ($consulta->usuario_id != $_SESSION['usuario_id'] && $_SESSION['rol_id'] != 3) {
            $_SESSION['error'] = 'No tienes permisos para eliminar esta consulta';
            header('Location: /sistema-alquiler/consultas');
            exit;
        }

        try {
            $consulta->delete();
            $_SESSION['success'] = 'Consulta eliminada exitosamente';
        } catch (\Exception $e) {
            $_SESSION['error'] = 'Error al eliminar: ' . $e->getMessage();
        }
        
        header('Location: /sistema-alquiler/consultas');
        exit;
    }
}