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

    <?php if (empty($propiedades)): ?>
        <div class="alert alert-info text-center">
            No hay propiedades disponibles por el momento.
        </div>
    <?php else: ?>
        <div class="row">
            <?php foreach ($propiedades as $p): ?>
                <?php
                // Mantenemos la lógica de imagen que ya funciona en tu home
                $imagenObj = $p->imagenPrincipal ?? ($p->imagenes->first() ?? null);

                $imagen = ($imagenObj && !empty($imagenObj->ruta))
                    ? BASE_URL . $imagenObj->ruta
                    : BASE_URL . '/assets/img/sin-imagen.jpg';
                ?>

                <div class="col-md-4 mb-4">
                    <div class="card h-100 shadow-sm border-0">
                        <img src="<?= htmlspecialchars($imagen) ?>" 
                             class="card-img-top" 
                             alt="<?= htmlspecialchars($p->titulo) ?>" 
                             style="height:220px; object-fit:cover;">

                        <div class="card-body d-flex flex-column">
                            <h5 class="card-title fw-bold"><?= htmlspecialchars($p->titulo) ?></h5>
                            
                            <ul class="list-unstyled text-muted mb-3">
                                <li><i class="bi bi-tag"></i> <?= htmlspecialchars($p->categoria?->nombre ?? 'Sin categoría') ?></li>
                                <li><i class="bi bi-geo-alt"></i> <?= htmlspecialchars($p->localidad?->nombre ?? 'Sin localidad') ?></li>
                                <li><i class="bi bi-house"></i> <?= htmlspecialchars($p->direccion) ?></li>
                            </ul>

                            <div class="mt-auto">
                                <h4 class="fw-bold text-primary mb-3">
                                    $<?= number_format((float)$p->precio, 0, ',', '.') ?>
                                </h4>
                                <a href="<?= BASE_URL ?>/propiedades/<?= $p->id ?>" 
                                   class="btn btn-outline-primary w-100">
                                   Ver detalle
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            <?php endforeach; ?>
        </div>
    <?php endif; ?>
</div>

<?php include SRC_PATH . 'views/layouts/footer.php'; ?>