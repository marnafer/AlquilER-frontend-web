<div class="row g-4">
    <?php if (empty($propiedades) || $propiedades->isEmpty()): ?>
        <div class="col-12 text-center text-muted py-4">
            <p class="fs-5 mb-0">No hay propiedades disponibles en este momento.</p>
        </div>
    <?php else: ?>
        
        <?php foreach ($propiedades as $p): ?>
            <?php 
                // 1. Ejecutamos la función (con paréntesis) y guardamos el resultado
                $img = $p->imagenDestacada();

                // 2. Evaluamos la variable
                $imagenUrl = (!empty($img) && !empty($img->ruta))
                    ? BASE_URL . $img->ruta
                    : BASE_URL . '/assets/img/sin-imagen.jpg'; 
            ?>
            
            <div class="col-md-4">
                <div class="card h-100 border-0 shadow-sm rounded-4 overflow-hidden position-relative bg-white">
                    
                    <div class="position-relative bg-light" style="height: 220px;">
                        
                        <span class="badge <?= $p->disponible ? 'bg-success' : 'bg-danger' ?> position-absolute top-0 start-0 m-3 px-3 py-2 rounded-pill fw-bold shadow-sm z-1">
                            <?= $p->disponible ? 'Disponible' : 'Alquilada' ?>
                        </span>
                        
                        <img src="<?= $imagenUrl ?>" class="w-100 h-100" alt="<?= htmlspecialchars($p->titulo) ?>" style="object-fit: cover;">
                        
                        <span class="badge bg-dark position-absolute bottom-0 end-0 m-3 px-2 py-1 shadow-sm opacity-75 z-1">
                            <?= $p->categoria ? $p->categoria->nombre : 'Inmueble' ?>
                        </span>

                    </div>
                    
                    <div class="card-body p-4 d-flex flex-column">
                        
                        <h4 class="fw-extrabold text-dark mb-1">
                            $<?= number_format($p->precio, 0, ',', '.') ?> 
                            <span class="fs-6 fw-normal text-muted">/mes</span>
                        </h4>

                        <h5 class="card-title fw-bold text-truncate mb-1 mt-2">
                            <?= htmlspecialchars($p->titulo) ?>
                        </h5>
                        <p class="text-muted small mb-3">
                            <i class="bi bi-geo-alt-fill text-danger me-1"></i>
                            <?= $p->localidad ? $p->localidad->nombre : 'Ubicación a consultar' ?>
                        </p>

                        <div class="d-flex gap-3 text-secondary small mb-3">
                            <span title="Ambientes"><i class="bi bi-door-open text-primary me-1"></i><?= $p->cantidad_ambientes ?></span>
                            <span title="Capacidad"><i class="bi bi-people text-primary me-1"></i><?= $p->capacidad ?></span>
                        </div>

                        <div class="mt-auto pt-3 border-top d-flex align-items-center justify-content-between gap-2">
    
                            <div class="d-flex align-items-center gap-2 flex-grow-1 text-truncate" title="Propietario">
        
                                <div class="bg-light rounded-circle d-flex align-items-center justify-content-center text-primary flex-shrink-0" style="width: 32px; height: 32px;">
                                    <i class="bi bi-person-fill"></i>
                                </div>
        
                                <span class="small fw-semibold text-dark text-truncate">
                                    <?= $p->usuario ? htmlspecialchars($p->usuario->nombre) : 'Anónimo' ?>
                                </span>
                            </div>

                            <a href="<?= BASE_URL ?>/propiedades/<?= $p->id ?>" class="btn btn-outline-primary btn-sm rounded-pill px-3 fw-bold text-nowrap flex-shrink-0">
                                Ver más
                            </a>
                        </div>
                    </div>

                </div>
            </div>
        <?php endforeach; ?>

    <?php endif; ?>
</div>