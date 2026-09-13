<?php
$title = $data['title'] ?? 'Dashboard - AlquilER';
$currentPage = $data['currentPage'] ?? 'dashboard';
?>

<div class="container py-5">
    <div class="card shadow">
        <div class="card-header bg-success text-white">
            <h3><i class="fas fa-check-circle"></i> Dashboard</h3>
        </div>
        <div class="card-body text-center py-5">
            <h2>✅ ¡Login exitoso!</h2>
            <p class="lead">Bienvenido al panel de control</p>
            <p>Usuario: <strong><?= $_SESSION['usuario_nombre'] ?? 'Usuario' ?></strong></p>
            <a href="/sistema-alquiler/logout" class="btn btn-danger mt-3">
                <i class="fas fa-sign-out-alt"></i> Cerrar Sesión
            </a>
        </div>
    </div>
</div>