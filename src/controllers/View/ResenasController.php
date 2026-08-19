<?php

namespace App\Controllers\View;

use App\Models\Resena;
use App\Models\Reserva;
use App\Models\Propiedad;

class ResenasController
{
    public function index()
    {
        $resenas = Resena::with('reserva.propiedad')
            ->orderBy('fecha_publicacion', 'desc')
            ->get();
        
        $data = [
            'title' => 'Reseñas - AlquilER',
            'currentPage' => 'resenas',
            'resenas' => $resenas
        ];
        
        $viewsPath = dirname(__DIR__, 2) . '/views/';
        
        require_once $viewsPath . 'layout/header.php';
        require_once $viewsPath . 'resenas/index.php';
        require_once $viewsPath . 'layout/footer.php';
    }

    public function show($id)
    {
        $resena = Resena::with('reserva.propiedad')->find($id);
        
        if (!$resena) {
            $_SESSION['error'] = 'Reseña no encontrada';
            header('Location: /sistema-alquiler/resenas');
            exit;
        }

        $data = [
            'title' => 'Detalle Reseña - AlquilER',
            'currentPage' => 'resenas',
            'resena' => $resena
        ];
        
        $viewsPath = dirname(__DIR__, 2) . '/views/';
        
        require_once $viewsPath . 'layout/header.php';
        require_once $viewsPath . 'resenas/show.php';
        require_once $viewsPath . 'layout/footer.php';
    }

    public function store()
    {
        if (!isset($_SESSION['usuario_id'])) {
            header('Location: /sistema-alquiler/login');
            exit;
        }

        $reservaId = $_POST['reserva_id'] ?? 0;
        $calificacion = $_POST['calificacion'] ?? 0;
        $comentario = $_POST['comentario'] ?? '';
        
        if ($calificacion < 1 || $calificacion > 5) {
            $_SESSION['error'] = 'La calificación debe ser entre 1 y 5';
            header('Location: /sistema-alquiler/reservas');
            exit;
        }

        // Verificar que la reserva existe y está finalizada
        $reserva = Reserva::where('id', $reservaId)
            ->where('usuario_id', $_SESSION['usuario_id'])
            ->where('estado', 'finalizada')
            ->first();
        
        if (!$reserva) {
            $_SESSION['error'] = 'No puedes reseñar esta reserva';
            header('Location: /sistema-alquiler/reservas');
            exit;
        }

        // Verificar que no existe reseña
        $existe = Resena::where('reserva_id', $reservaId)->exists();
        if ($existe) {
            $_SESSION['error'] = 'Ya has reseñado esta reserva';
            header('Location: /sistema-alquiler/reservas');
            exit;
        }

        try {
            Resena::create([
                'reserva_id' => $reservaId,
                'calificacion' => $calificacion,
                'comentario' => $comentario
            ]);
            $_SESSION['success'] = 'Reseña publicada exitosamente';
        } catch (\Exception $e) {
            $_SESSION['error'] = 'Error al publicar reseña: ' . $e->getMessage();
        }
        
        header('Location: /sistema-alquiler/resenas');
        exit;
    }

    public function update($id)
    {
        if (!isset($_SESSION['usuario_id'])) {
            header('Location: /sistema-alquiler/login');
            exit;
        }

        $resena = Resena::with('reserva')->find($id);
        
        if (!$resena) {
            $_SESSION['error'] = 'Reseña no encontrada';
            header('Location: /sistema-alquiler/resenas');
            exit;
        }

        // Verificar que es el dueño o admin
        if ($resena->reserva->usuario_id != $_SESSION['usuario_id'] && $_SESSION['rol_id'] != 3) {
            $_SESSION['error'] = 'No tienes permisos para editar esta reseña';
            header('Location: /sistema-alquiler/resenas');
            exit;
        }

        $calificacion = $_POST['calificacion'] ?? 0;
        $comentario = $_POST['comentario'] ?? '';
        
        if ($calificacion < 1 || $calificacion > 5) {
            $_SESSION['error'] = 'La calificación debe ser entre 1 y 5';
            header('Location: /sistema-alquiler/resenas');
            exit;
        }

        try {
            $resena->update([
                'calificacion' => $calificacion,
                'comentario' => $comentario
            ]);
            $_SESSION['success'] = 'Reseña actualizada exitosamente';
        } catch (\Exception $e) {
            $_SESSION['error'] = 'Error al actualizar: ' . $e->getMessage();
        }
        
        header('Location: /sistema-alquiler/resenas');
        exit;
    }

    public function delete($id)
    {
        if (!isset($_SESSION['usuario_id'])) {
            header('Location: /sistema-alquiler/login');
            exit;
        }

        $resena = Resena::with('reserva')->find($id);
        
        if (!$resena) {
            $_SESSION['error'] = 'Reseña no encontrada';
            header('Location: /sistema-alquiler/resenas');
            exit;
        }

        // Verificar que es el dueño o admin
        if ($resena->reserva->usuario_id != $_SESSION['usuario_id'] && $_SESSION['rol_id'] != 3) {
            $_SESSION['error'] = 'No tienes permisos para eliminar esta reseña';
            header('Location: /sistema-alquiler/resenas');
            exit;
        }

        try {
            $resena->delete();
            $_SESSION['success'] = 'Reseña eliminada exitosamente';
        } catch (\Exception $e) {
            $_SESSION['error'] = 'Error al eliminar: ' . $e->getMessage();
        }
        
        header('Location: /sistema-alquiler/resenas');
        exit;
    }
}