<?php
$tituloPagina = "Todas las Propiedades";
include SRC_PATH . 'views/layouts/header.php';
include SRC_PATH . 'views/layouts/menu.php';
?>

<div class="container mt-5">
    <div class="mb-4 text-center">
        <h1>Catálogo de Propiedades</h1>
        <p class="text-muted">Explorá todas nuestras opciones disponibles.</p>
    </div>

    <div class="mx-auto" style="max-width: 950px; padding-top: 20px;">
        <?php $modoBuscador = 'avanzado'; include SRC_PATH . 'views/componentes/buscador.php';?>
    </div>

    <div class="container-fluid px-4 px-lg-5" style="padding-top: 50px;">
        <h2>Resultados de búsqueda</h2>
        <?php include SRC_PATH . 'views/componentes/grid_propiedades.php'; ?>
    </div>
</div>

<?php include SRC_PATH . 'views/layouts/footer.php'; ?>