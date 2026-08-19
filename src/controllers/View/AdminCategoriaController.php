<?php

namespace App\Controllers\View;

use App\Models\Categoria;

class AdminCategoriaController
{
    public function index()
    {
        // Verificar admin
        if (!isset($_SESSION['usuario_id']) || $_SESSION['rol_id'] != 3) {
            header('Location: /sistema-alquiler/login');
            exit;
        }

        $categorias = Categoria::all();
        
        $data = [
            'title' => 'Categorías - Admin',
            'currentPage' => 'admin',
            'categorias' => $categorias
        ];
        
        $viewsPath = dirname(__DIR__, 2) . '/views/';
        
        require_once $viewsPath . 'layout/header.php';
        require_once $viewsPath . 'admin/categorias/index.php';
        require_once $viewsPath . 'layout/footer.php';
    }

    public function create()
    {
        if (!isset($_SESSION['usuario_id']) || $_SESSION['rol_id'] != 3) {
            header('Location: /sistema-alquiler/login');
            exit;
        }

        $data = [
            'title' => 'Nueva Categoría - Admin',
            'currentPage' => 'admin'
        ];
        
        $viewsPath = dirname(__DIR__, 2) . '/views/';
        
        require_once $viewsPath . 'layout/header.php';
        require_once $viewsPath . 'admin/categorias/create.php';
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
            header('Location: /sistema-alquiler/admin/categorias/crear');
            exit;
        }

        try {
            Categoria::create(['nombre' => $nombre]);
            $_SESSION['success'] = 'Categoría creada exitosamente';
        } catch (\Exception $e) {
            $_SESSION['error'] = 'Error al crear la categoría: ' . $e->getMessage();
        }
        
        header('Location: /sistema-alquiler/admin/categorias');
        exit;
    }

    public function edit($id)
    {
        if (!isset($_SESSION['usuario_id']) || $_SESSION['rol_id'] != 3) {
            header('Location: /sistema-alquiler/login');
            exit;
        }

        $categoria = Categoria::find($id);
        
        if (!$categoria) {
            $_SESSION['error'] = 'Categoría no encontrada';
            header('Location: /sistema-alquiler/admin/categorias');
            exit;
        }

        $data = [
            'title' => 'Editar Categoría - Admin',
            'currentPage' => 'admin',
            'categoria' => $categoria
        ];
        
        $viewsPath = dirname(__DIR__, 2) . '/views/';
        
        require_once $viewsPath . 'layout/header.php';
        require_once $viewsPath . 'admin/categorias/edit.php';
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
            header('Location: /sistema-alquiler/admin/categorias/' . $id . '/editar');
            exit;
        }

        $categoria = Categoria::find($id);
        
        if (!$categoria) {
            $_SESSION['error'] = 'Categoría no encontrada';
            header('Location: /sistema-alquiler/admin/categorias');
            exit;
        }

        try {
            $categoria->update(['nombre' => $nombre]);
            $_SESSION['success'] = 'Categoría actualizada exitosamente';
        } catch (\Exception $e) {
            $_SESSION['error'] = 'Error al actualizar: ' . $e->getMessage();
        }
        
        header('Location: /sistema-alquiler/admin/categorias');
        exit;
    }

    public function delete($id)
    {
        if (!isset($_SESSION['usuario_id']) || $_SESSION['rol_id'] != 3) {
            header('Location: /sistema-alquiler/login');
            exit;
        }

        $categoria = Categoria::find($id);
        
        if (!$categoria) {
            $_SESSION['error'] = 'Categoría no encontrada';
            header('Location: /sistema-alquiler/admin/categorias');
            exit;
        }

        try {
            $categoria->delete();
            $_SESSION['success'] = 'Categoría eliminada exitosamente';
        } catch (\Exception $e) {
            $_SESSION['error'] = 'Error al eliminar: ' . $e->getMessage();
        }
        
        header('Location: /sistema-alquiler/admin/categorias');
        exit;
    }
}