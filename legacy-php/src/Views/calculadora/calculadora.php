<?php
$tituloPagina = "Calculadora de Aumentos";
include SRC_PATH . 'views/layouts/header.php';
include SRC_PATH . 'views/layouts/menu.php';
?>

<div class="container-fluid d-flex align-items-center justify-content-center" style="min-height: 70vh;">
    <div class="text-center p-5 shadow-sm rounded-4 bg-white border" style="max-width: 600px; margin: 20px;">
        
        <div class="mb-4 text-primary">
            <i class="bi bi-calculator" style="font-size: 4rem;"></i>
        </div>

        <h2 class="fw-bold text-dark mb-3">Calculadora de Aumentos</h2>
        
        <span class="badge bg-warning text-dark px-3 py-2 rounded-pill fw-bold uppercase letter-spacing mb-4">
            PRÓXIMAMENTE
        </span>

        <p class="text-muted fs-5 mb-4">
            Vas a poder calcular los ajustes de tus contratos de alquiler de forma automática, precisa y oficial, utilizando los índices <strong>IPC</strong> (Inflación) o <strong>ICL</strong> (Banco Central).
        </p>

        <div class="p-3 bg-light rounded-3 text-start border-start border-primary border-4 mb-4">
            <small class="text-secondary d-block">
                <i class="bi bi-info-circle-fill me-2 text-primary"></i>
                La herramienta se conectará directamente con las APIs oficiales para garantizar que los cálculos utilicen los últimos datos publicados.
            </small>
        </div>
    </div>
</div>

<?php include SRC_PATH . 'views/layouts/footer.php'; ?>