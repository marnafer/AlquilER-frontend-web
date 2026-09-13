<?php
// Por si querés usar la variable de título que maneja tu layout principal
$tituloPagina = 'Mis Propiedades'; 
include SRC_PATH . 'views/layouts/header.php';
include SRC_PATH . 'views/layouts/menu.php';
?>

<div class="container d-flex align-items-center justify-content-center" style="min-height: 75vh;">
    <div class="text-center p-5 rounded-4 shadow-sm bg-white" style="max-width: 550px;">
        
        <div class="position-relative d-inline-block mb-4">
            <div class="bg-primary-subtle rounded-circle d-flex align-items-center justify-content-center text-primary mx-auto animate__animated animate__pulse animate__infinite" 
                 style="width: 100px; height: 100px;">
                <i class="bi bi-building-gear display-4"></i>
            </div>
            <span class="position-absolute bottom-0 end-0 bg-warning rounded-circle p-2 d-flex shadow-sm">
                <i class="bi bi-tools text-white small"></i>
            </span>
        </div>

        <h2 class="fw-extrabold text-dark mb-2">¡Espacio en construcción!</h2>
        <p class="text-secondary fs-6 mb-4">
            Estamos programando el panel de control desde donde vas a poder publicar, editar y pausar tus alquileres de forma súper rápida. ¡Falta muy poco!
        </p>

        <div class="mb-4 px-4">
            <div class="d-flex justify-content-between text-muted small mb-1">
                <span class="fw-semibold text-primary">Estructurando base de datos...</span>
                <span>75%</span>
            </div>
            <div class="progress rounded-pill" style="height: 8px;">
                <div class="progress-bar progress-bar-striped progress-bar-animated bg-primary" 
                     role="progressbar" 
                     style="width: 75%;" 
                     aria-valuenow="75" 
                     aria-valuemin="0" 
                     aria-valuemax="100">
                </div>
            </div>
        </div>

        <div class="d-grid gap-2 d-sm-flex justify-content-sm-center">
            <a href="<?= BASE_URL ?>/home" class="btn btn-primary rounded-pill px-4 fw-bold shadow-none">
                <i class="bi bi-house-door me-2"></i>Volver al Inicio
            </a>
            <a href="<?= BASE_URL ?>/propiedades" class="btn btn-outline-secondary rounded-pill px-4 fw-bold shadow-none">
                <i class="bi bi-search me-2"></i>Ver Catálogo
            </a>
        </div>

    </div>
</div>

<?php include SRC_PATH . 'views/layouts/footer.php'; ?>