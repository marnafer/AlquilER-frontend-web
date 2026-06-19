<?php require_once __DIR__ . '/../layouts/header.php'; ?>
<?php require_once __DIR__ . '/../layouts/menu.php'; ?>

<div class="container">

    <div class="mb-4">
        <h1>Propiedades destacadas</h1>
        <p class="text-muted">
            Tu proximo hogar a solo un click.
        </p>
    </div>

    <?php if ($propiedades->isEmpty()): ?>

        <div class="alert alert-info">
            No hay propiedades disponibles actualmente.
        </div>

    <?php else: ?>

        <div class="row">

            <?php foreach ($propiedades as $propiedad): ?>

                <?php
                $imagen = $propiedad->imagenPrincipal
                    ? BASE_URL . $propiedad->imagenPrincipal->ruta
                    : BASE_URL . '/assets/img/sin-imagen.jpg';
                ?>

                <div class="col-md-4 mb-4">

                    <div class="card h-100 shadow-sm">

                        <img
                            src="<?= $imagen ?>"
                            class="card-img-top"
                            alt="<?= htmlspecialchars($propiedad->titulo) ?>"
                            style="height:220px; object-fit:cover;"
                        >

                        <div class="card-body d-flex flex-column">

                            <h5 class="card-title">
                                <?= htmlspecialchars($propiedad->titulo) ?>
                            </h5>

                            <p class="text-muted mb-2">
                                <i class="bi bi-tag"></i>
                                <?= htmlspecialchars($propiedad->categoria?->nombre ?? 'Sin categoría') ?>
                            </p>

                            <p class="text-muted mb-2">
                                <i class="bi bi-geo-alt"></i>
                                <?= htmlspecialchars($propiedad->localidad?->nombre ?? 'Sin localidad') ?>
                            </p>

                            <p class="card-text">
                                <?= htmlspecialchars($propiedad->direccion) ?>
                            </p>

                            <div class="mt-auto">

                                <h4 class="fw-bold text-primary">
                                    $<?= number_format($propiedad->precio, 0, ',', '.') ?>
                                </h4>

                                <a
                                    href="<?= BASE_URL ?>/propiedades/<?= $propiedad->id ?>"
                                    class="btn btn-primary w-100"
                                >
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

<?php require_once __DIR__ . '/../layouts/footer.php'; ?>