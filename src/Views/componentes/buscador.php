<div class="card shadow-sm border-0 rounded-4 p-3 mx-auto" style="max-width: 950px; margin-top: -20px; z-index: 10;">
    <form action="<?= BASE_URL ?>/propiedades" method="GET">
        
        <div class="row g-2 align-items-center">
            
            <div class="col-md-5">
                <div class="input-group">
                    <span class="input-group-text border-0 bg-light"><i class="bi bi-tags"></i></span>
                    <select class="form-select border-0 bg-light" name="categoria">
                        <option value="">Todas las categorías</option>
                        <option value="casa">Casa</option>
                        <option value="departamento">Departamento</option>
                        <option value="local">Local Comercial</option>
                        <option value="terreno">Terreno</option>
                    </select>
                </div>
            </div>

            <div class="col-md-4 d-grid">
                <button class="btn btn-light text-dark border-0" type="button" data-bs-toggle="collapse" data-bs-target="#filtrosAvanzados">
                    <i class="bi bi-sliders me-1"></i> Filtros Avanzados
                </button>
            </div>

            <div class="col-md-3 d-grid">
                <button type="submit" class="btn btn-primary fw-bold">
                    <i class="bi bi-search me-1"></i> Buscar
                </button>
            </div>
            
        </div>

        <div class="collapse mt-3" id="filtrosAvanzados">
            <div class="card card-body bg-light border-0 rounded-3">
                <div class="row g-3">
                    
                    <div class="col-md-4">
                        <label class="form-label text-secondary small mb-1">Ciudad</label>
                        <input type="text" class="form-control" name="ciudad" placeholder="Ej: Crespo, Paraná...">
                    </div>
                    
                    <div class="col-md-4">
                        <label class="form-label text-secondary small mb-1">Dormitorios (Mínimo)</label>
                        <input type="number" class="form-control" name="dormitorios" min="1" placeholder="Ej: 2">
                    </div>

                    <div class="col-md-4">
                        <label class="form-label text-secondary small mb-1">Ambientes (Mínimo)</label>
                        <input type="number" class="form-control" name="ambientes" min="1" placeholder="Ej: 3">
                    </div>

                    <div class="col-md-4">
                        <label class="form-label text-secondary small mb-1">Precio Máximo ($)</label>
                        <input type="number" class="form-control" name="precio_max">
                    </div>

                    <div class="col-md-4">
                        <label class="form-label text-secondary small mb-1">Expensas Máximas ($)</label>
                        <input type="number" class="form-control" name="expensas_max">
                    </div>

                    <div class="col-md-4">
                        <label class="form-label text-secondary small mb-1">Capacidad (Personas)</label>
                        <input type="number" class="form-control" name="capacidad" min="1">
                    </div>

                </div>
            </div>
        </div>

    </form>
</div>