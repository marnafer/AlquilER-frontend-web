<?php
$tituloPagina = "Mis Favoritos";
include SRC_PATH . 'views/layouts/header.php';
include SRC_PATH . 'views/layouts/menu.php';
?>

<div class="container-fluid d-flex align-items-center justify-content-center" style="min-height: 70vh;">
    <div class="text-center p-5 shadow-sm rounded-4 bg-white border" style="max-width: 600px; margin: 20px;">
        
        <div class="mb-4 text-danger">
            <i class="bi bi-heart-fill" style="font-size: 4rem;"></i>
        </div>

        <h2 class="fw-bold text-dark mb-3">Tus Propiedades Favoritas</h2>
        
        <span class="badge bg-warning text-dark px-3 py-2 rounded-pill fw-bold uppercase letter-spacing mb-4">
            PRÓXIMAMENTE
        </span>

        <p class="text-muted fs-5 mb-4">
            Próximamente vas a poder guardar y ver tus propiedades favoritas aquí. ¡Así no vas a perder de vista el alquiler perfecto!
        </p>

        <div class="p-3 bg-light rounded-3 text-start border-start border-danger border-4 mb-4">
            <small class="text-secondary d-block">
                <i class="bi bi-info-circle-fill me-2 text-danger"></i>
                Estamos trabajando para que puedas armar tu propia lista personalizada y consultarla en cualquier momento desde tu cuenta.
            </small>
        </div>

        <a href="<?= BASE_URL ?>/propiedades" class="btn btn-outline-danger px-4 py-2">
            <i class="bi bi-search me-2"></i> Seguir explorando
        </a>
    </div>
</div>

<?php include SRC_PATH . 'views/layouts/footer.php'; ?>