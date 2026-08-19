<?php

namespace App\Controllers\View;

use App\Models\Reserva;
use App\Models\Propiedad;
use App\Models\Usuario;

class ReservasController
{
    public function index()
    {
        if (!isset($_SESSION['usuario_id'])) {
            header('Location: /sistema-alquiler/login');
            exit;
        }

        $usuarioId = $_SESSION['usuario_id'];
        
        $reservas = Reserva::where('usuario_id', $usuarioId)
            ->with('propiedad')
            ->orderBy('fecha_reserva', 'desc')
            ->get();
        
        $data = [
            'title' => 'Mis Reservas - AlquilER',
            'currentPage' => 'reservas',
            'reservas' => $reservas
        ];
        
        $viewsPath = dirname(__DIR__, 2) . '/views/';
        
        require_once $viewsPath . 'layout/header.php';
        require_once $viewsPath . 'reservas/index.php';
        require_once $viewsPath . 'layout/footer.php';
    }

    public function show($id)
    {
        if (!isset($_SESSION['usuario_id'])) {
            header('Location: /sistema-alquiler/login');
            exit;
        }

        $reserva = Reserva::with('propiedad')
            ->where('id', $id)
            ->where('usuario_id', $_SESSION['usuario_id'])
            ->first();
        
        if (!$reserva) {
            $_SESSION['error'] = 'Reserva no encontrada';
            header('Location: /sistema-alquiler/reservas');
            exit;
        }

        $data = [
            'title' => 'Detalle Reserva - AlquilER',
            'currentPage' => 'reservas',
            'reserva' => $reserva
        ];
        
        $viewsPath = dirname(__DIR__, 2) . '/views/';
        
        require_once $viewsPath . 'layout/header.php';
        require_once $viewsPath . 'reservas/show.php';
        require_once $viewsPath . 'layout/footer.php';
    }

    public function create($propiedadId)
    {
        if (!isset($_SESSION['usuario_id'])) {
            header('Location: /sistema-alquiler/login');
            exit;
        }

        $propiedad = Propiedad::where('id', $propiedadId)
            ->where('disponible', 1)
            ->first();
        
        if (!$propiedad) {
            $_SESSION['error'] = 'Propiedad no disponible';
            header('Location: /sistema-alquiler/propiedades');
            exit;
        }

        $data = [
            'title' => 'Nueva Reserva - AlquilER',
            'currentPage' => 'reservas',
            'propiedad' => $propiedad
        ];
        
        $viewsPath = dirname(__DIR__, 2) . '/views/';
        
        require_once $viewsPath . 'layout/header.php';
        require_once $viewsPath . 'reservas/create.php';
        require_once $viewsPath . 'layout/footer.php';
    }

    public function store()
    {
        if (!isset($_SESSION['usuario_id'])) {
            header('Location: /sistema-alquiler/login');
            exit;
        }

        $propiedadId = $_POST['propiedad_id'] ?? 0;
        $fechaDesde = $_POST['fecha_desde'] ?? '';
        $fechaHasta = $_POST['fecha_hasta'] ?? '';
        
        if (empty($fechaDesde) || empty($fechaHasta)) {
            $_SESSION['error'] = 'Las fechas son requeridas';
            header('Location: /sistema-alquiler/reservas/crear/' . $propiedadId);
            exit;
        }

        // Verificar disponibilidad
        $existe = Reserva::where('propiedad_id', $propiedadId)
            ->whereIn('estado', ['pendiente', 'confirmada'])
            ->where(function($query) use ($fechaDesde, $fechaHasta) {
                $query->whereBetween('fecha_desde', [$fechaDesde, $fechaHasta])
                    ->orWhereBetween('fecha_hasta', [$fechaDesde, $fechaHasta])
                    ->orWhere(function($q) use ($fechaDesde, $fechaHasta) {
                        $q->where('fecha_desde', '<=', $fechaDesde)
                            ->where('fecha_hasta', '>=', $fechaHasta);
                    });
            })
            ->exists();
        
        if ($existe) {
            $_SESSION['error'] = 'La propiedad no está disponible en esas fechas';
            header('Location: /sistema-alquiler/reservas/crear/' . $propiedadId);
            exit;
        }

        try {
            Reserva::create([
                'propiedad_id' => $propiedadId,
                'usuario_id' => $_SESSION['usuario_id'],
                'fecha_desde' => $fechaDesde,
                'fecha_hasta' => $fechaHasta,
                'estado' => 'pendiente'
            ]);
            $_SESSION['success'] = 'Reserva creada exitosamente';
        } catch (\Exception $e) {
            $_SESSION['error'] = 'Error al crear reserva: ' . $e->getMessage();
        }
        
        header('Location: /sistema-alquiler/reservas');
        exit;
    }

    public function cancelar($id)
    {
        if (!isset($_SESSION['usuario_id'])) {
            header('Location: /sistema-alquiler/login');
            exit;
        }

        $reserva = Reserva::where('id', $id)
            ->where('usuario_id', $_SESSION['usuario_id'])
            ->first();
        
        if (!$reserva) {
            $_SESSION['error'] = 'Reserva no encontrada';
            header('Location: /sistema-alquiler/reservas');
            exit;
        }

        if ($reserva->estado != 'pendiente') {
            $_SESSION['error'] = 'Solo se pueden cancelar reservas pendientes';
            header('Location: /sistema-alquiler/reservas');
            exit;
        }

        try {
            $reserva->update(['estado' => 'cancelada']);
            $_SESSION['success'] = 'Reserva cancelada exitosamente';
        } catch (\Exception $e) {
            $_SESSION['error'] = 'Error al cancelar: ' . $e->getMessage();
        }
        
        header('Location: /sistema-alquiler/reservas');
        exit;
    }

    public function confirmar($id)
    {
        if (!isset($_SESSION['usuario_id'])) {
            header('Location: /sistema-alquiler/login');
            exit;
        }

        // Solo admin puede confirmar
        if ($_SESSION['rol_id'] != 3) {
            $_SESSION['error'] = 'No tienes permisos para esta acción';
            header('Location: /sistema-alquiler/reservas');
            exit;
        }

        $reserva = Reserva::find($id);
        
        if (!$reserva) {
            $_SESSION['error'] = 'Reserva no encontrada';
            header('Location: /sistema-alquiler/reservas');
            exit;
        }

        if ($reserva->estado != 'pendiente') {
            $_SESSION['error'] = 'La reserva ya fue procesada';
            header('Location: /sistema-alquiler/reservas');
            exit;
        }

        try {
            $reserva->update(['estado' => 'confirmada']);
            $_SESSION['success'] = 'Reserva confirmada exitosamente';
        } catch (\Exception $e) {
            $_SESSION['error'] = 'Error al confirmar: ' . $e->getMessage();
        }
        
        header('Location: /sistema-alquiler/reservas');
        exit;
    }
}