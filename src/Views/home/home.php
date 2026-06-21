<?php
$tituloPagina = "Inicio - Alquil-ER";
include SRC_PATH . 'views/layouts/header.php';
include SRC_PATH . 'views/layouts/menu.php';
?>

<div class="container-fluid mt-4 mb-5">
    
    <div class="text-white" 
         style="background-image: linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('<?= BASE_URL ?>/assets/img/banner-home.jpg'); 
                background-size: cover; 
                background-position: center; 
                padding-top: 120px; 
                padding-bottom: 140px;">
        
        <div class="text-center px-3">
            <h1 class="fw-bold text-light display-4 mb-3">Encontrá tu próximo hogar</h1>
            <p class="fs-5 text-light mb-0">La forma más fácil y segura de alquilar propiedades.</p>
        </div>
    </div>

    <div class="mx-auto" style="max-width: 950px;">
        <?php include SRC_PATH . 'views/componentes/buscador.php'; ?>
    </div>

</div>

<div class="container mb-5">
    <div class="d-flex justify-content-between align-items-center mb-4">
        <h3 class="fw-bold mb-0">Últimos ingresos</h3>
        <a href="<?= BASE_URL ?>/propiedades" class="text-primary text-decoration-none">Ver todo <i class="bi bi-arrow-right"></i></a>
    </div>
    
    <div id="contenedor-destacados">
        </div>
</div>

<?php include SRC_PATH . 'views/layouts/footer.php'; ?>