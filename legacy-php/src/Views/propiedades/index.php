<?php
$title = $data['title'] ?? 'Propiedades - AlquilER';
$currentPage = $data['currentPage'] ?? 'propiedades';
$propiedades = $data['propiedades'] ?? [];
$categorias = $data['categorias'] ?? [];
$filtros = $data['filtros'] ?? [];
?>

<!-- ============================================ -->
<!-- HEADER PROPIEDADES                           -->
<!-- ============================================ -->
<section class="header-propiedades">
    <div class="container">
        <div class="row align-items-center">
            <div class="col-lg-6 text-white">
                <h1 class="display-4 fw-bold mb-3">
                    <i class="fas fa-building"></i> Propiedades
                </h1>
                <p class="lead mb-0">
                    Encontrá la propiedad que buscás
                </p>
            </div>
            <div class="col-lg-6">
                <div class="search-box bg-white p-3 rounded-4 shadow-lg">
                    <form action="/sistema-alquiler/propiedades" method="GET">
                        <div class="row g-2">
                            <div class="col-12 col-md-4">
                                <input 
                                    type="text" 
                                    name="ubicacion" 
                                    class="form-control form-control-lg border-0" 
                                    placeholder="Ubicación"
                                    value="<?= htmlspecialchars($filtros['ubicacion'] ?? '') ?>"
                                >
                            </div>
                            <div class="col-6 col-md-3">
                                <select name="categoria_id" class="form-select form-select-lg border-0">
                                    <option value="">Categoría</option>
                                    <?php foreach ($categorias as $cat): ?>
                                        <option value="<?= $cat['id'] ?>" <?= ($filtros['categoria_id'] ?? '') == $cat['id'] ? 'selected' : '' ?>>
                                            <?= htmlspecialchars($cat['nombre']) ?>
                                        </option>
                                    <?php endforeach; ?>
                                </select>
                            </div>
                            <div class="col-6 col-md-3">
                                <input 
                                    type="number" 
                                    name="precio_max" 
                                    class="form-control form-control-lg border-0" 
                                    placeholder="Precio máx."
                                    value="<?= htmlspecialchars($filtros['precio_max'] ?? '') ?>"
                                >
                            </div>
                            <div class="col-12 col-md-2">
                                <button type="submit" class="btn btn-primary btn-lg w-100">
                                    <i class="fas fa-search"></i>
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</section>

<!-- ============================================ -->
<!-- LISTADO DE PROPIEDADES                       -->
<!-- ============================================ -->
<section class="propiedades-listado py-5">
    <div class="container">
        <!-- Resultados y contador -->
        <div class="row mb-4">
            <div class="col-12">
                <div class="d-flex justify-content-between align-items-center">
                    <h2 class="fw-bold text-teal-dark">
                        <i class="fas fa-list"></i> Resultados
                    </h2>
                    <span class="badge bg-teal-soft text-teal-dark px-4 py-2 rounded-pill">
                        <?= count($propiedades) ?> propiedades encontradas
                    </span>
                </div>
                <hr class="border-teal-soft">
            </div>
        </div>
        
        <!-- Grid de propiedades -->
        <div class="row" id="propiedadesContainer">
            <?php if (count($propiedades) > 0): ?>
                <?php foreach ($propiedades as $propiedad): ?>
                    <div class="col-md-4 mb-4">
                        <div class="card h-100 shadow-sm propiedad-card">
                            <div class="position-relative" style="height: 200px; overflow: hidden; background: #f0fdf4;">
                                <?php if (!empty($propiedad['imagen_principal'])): ?>
                                    <img 
                                        src="<?= $propiedad['imagen_principal'] ?>" 
                                        class="card-img-top" 
                                        alt="<?= htmlspecialchars($propiedad['titulo']) ?>"
                                        style="height: 200px; width: 100%; object-fit: cover;"
                                        onerror="this.style.display='none'; this.parentElement.innerHTML='<div style=\'height:200px;background:linear-gradient(135deg,#0f766e,#059669);display:flex;align-items:center;justify-content:center;color:white;font-size:4rem;\'><i class=\'fas fa-home\'></i></div>'"
                                    >
                                <?php else: ?>
                                    <div style="height:200px;background:linear-gradient(135deg,#0f766e,#059669);display:flex;align-items:center;justify-content:center;color:white;font-size:4rem;">
                                        <i class="fas fa-home"></i>
                                    </div>
                                <?php endif; ?>
                                
                                <?php if ($propiedad['disponible'] ?? true): ?>
                                    <span class="position-absolute top-0 end-0 badge bg-success m-2">
                                        <i class="fas fa-check-circle"></i> Disponible
                                    </span>
                                <?php else: ?>
                                    <span class="position-absolute top-0 end-0 badge bg-danger m-2">
                                        <i class="fas fa-times-circle"></i> No disponible
                                    </span>
                                <?php endif; ?>
                            </div>
                            <div class="card-body">
                                <h5 class="card-title"><?= htmlspecialchars($propiedad['titulo']) ?></h5>
                                <p class="card-text text-muted small">
                                    <i class="fas fa-map-marker-alt"></i> <?= htmlspecialchars($propiedad['direccion']) ?>
                                </p>
                                <p class="fw-bold text-teal-dark fs-4">
                                    $<?= number_format($propiedad['precio'], 0, ',', '.') ?>
                                    <?php if ($propiedad['expensas'] > 0): ?>
                                        <span class="text-muted small fw-normal">
                                            + expensas $<?= number_format($propiedad['expensas'], 0, ',', '.') ?>
                                        </span>
                                    <?php endif; ?>
                                </p>
                                <div class="d-flex justify-content-between text-muted small">
                                    <span><i class="fas fa-bed"></i> <?= $propiedad['cantidad_dormitorios'] ?> dorm.</span>
                                    <span><i class="fas fa-bath"></i> <?= $propiedad['cantidad_banos'] ?> baños</span>
                                    <span><i class="fas fa-arrows-alt"></i> <?= $propiedad['cantidad_ambientes'] ?> amb.</span>
                                </div>
                            </div>
                            <div class="card-footer bg-transparent border-0 d-grid gap-2">
                                <a href="/sistema-alquiler/propiedades/<?= $propiedad['id'] ?>" class="btn btn-teal">
                                    <i class="fas fa-eye me-1"></i> Ver más
                                </a>
                            </div>
                        </div>
                    </div>
                <?php endforeach; ?>
            <?php else: ?>
                <div class="col-12 text-center py-5">
                    <div style="font-size: 4rem; opacity: 0.3; margin-bottom: 20px;">
                        <i class="fas fa-building"></i>
                    </div>
                    <h3 class="text-muted">No se encontraron propiedades</h3>
                    <p class="text-muted">Probá con otros filtros de búsqueda</p>
                    <a href="/sistema-alquiler/propiedades" class="btn btn-teal">
                        <i class="fas fa-undo me-1"></i> Limpiar filtros
                    </a>
                </div>
            <?php endif; ?>
        </div>
    </div>
</section>

<!-- ============================================ -->
<!-- ESTILOS ADICIONALES                          -->
<!-- ============================================ -->
<style>
/* ========== HEADER PROPIEDADES ========== */
.header-propiedades {
    background: linear-gradient(135deg, #0f766e 0%, #059669 50%, #0d9488 100%);
    padding-top: 100px !important;
    padding-bottom: 40px !important;
    margin-top: -20px;
}

.header-propiedades .search-box {
    border-radius: 60px !important;
    box-shadow: 0 20px 60px rgba(0,0,0,0.15) !important;
    padding: 6px !important;
}

.header-propiedades .search-box .form-control,
.header-propiedades .search-box .form-select {
    border-radius: 60px !important;
    background: #f8f9fa;
    height: 48px;
    font-size: 0.95rem;
}

.header-propiedades .search-box .form-control:focus,
.header-propiedades .search-box .form-select:focus {
    background: white;
    box-shadow: none;
    border-color: #0f766e;
}

.header-propiedades .search-box .btn-primary {
    height: 48px;
    border-radius: 60px !important;
    background: linear-gradient(135deg, #0f766e, #059669);
    border: none;
    color: white;
    transition: all 0.3s ease;
}

.header-propiedades .search-box .btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(5, 150, 105, 0.4);
}

/* ========== BADGES ========== */
.bg-teal-soft {
    background-color: #ccfbf1 !important;
}

.text-teal-dark {
    color: #0f766e !important;
}

.border-teal-soft {
    border-color: #ccfbf1 !important;
}

/* ========== BOTONES ========== */
.btn-teal {
    background: linear-gradient(135deg, #0f766e 0%, #059669 100%);
    border: none;
    color: #fff;
    padding: 0.5rem 1rem;
    border-radius: 10px;
    transition: all 0.3s ease;
}

.btn-teal:hover {
    background: linear-gradient(135deg, #0d9488 0%, #10b981 100%);
    color: #fff;
    transform: translateY(-2px);
    box-shadow: 0 5px 20px rgba(5, 150, 105, 0.4);
}

/* ========== PROPIEDAD CARD ========== */
.propiedad-card {
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    border: none;
    border-radius: 16px;
    overflow: hidden;
}

.propiedad-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 40px rgba(15, 118, 110, 0.15) !important;
}

.propiedad-card .card-footer {
    background: transparent;
    border-top: 1px solid rgba(15, 118, 110, 0.05);
}

/* ========== RESPONSIVE ========== */
@media (max-width: 768px) {
    .header-propiedades {
        padding-top: 80px !important;
        padding-bottom: 30px !important;
    }
    
    .header-propiedades .search-box {
        border-radius: 20px !important;
        padding: 15px !important;
    }
    
    .header-propiedades .search-box .form-control,
    .header-propiedades .search-box .form-select {
        border-radius: 12px !important;
        height: 42px;
        margin-bottom: 8px;
    }
    
    .header-propiedades .search-box .btn-primary {
        height: 42px;
        border-radius: 12px !important;
    }
    
    .propiedad-card .position-relative {
        height: 150px !important;
    }
}
</style>