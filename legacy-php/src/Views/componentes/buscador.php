<div class="card shadow-sm border-0 rounded-4 p-3 mx-auto"
     style="max-width: <?= ($modoBuscador ?? 'simple') === 'avanzado' ? '1150px' : '850px' ?>; margin-top: -20px; z-index: 10;">

    <form action="<?= BASE_URL ?>/propiedades" method="GET">

        <div class="row g-2 align-items-stretch">

            <div class="<?= ($modoBuscador ?? 'simple') === 'avanzado' ? 'col-md-4' : 'col-md-5' ?>">
                <div class="input-group h-100">
                    <span class="input-group-text border-0 bg-light text-secondary px-3">
                        <i class="bi bi-tags"></i>
                    </span>
                    <select id="categoria" name="categoria_id" class="form-select border-0 bg-light shadow-none h-100">
                        <option value="">Todas las categorías</option>
                    </select>
                </div>
            </div>

            <div class="<?= ($modoBuscador ?? 'simple') === 'avanzado' ? 'col-md-4' : 'col-md-5' ?>">
                <div class="input-group h-100">
                    <span class="input-group-text border-0 bg-light text-secondary px-3">
                        <i class="bi bi-geo-alt"></i>
                    </span>
                    <select id="localidad" name="localidad_id" class="form-select border-0 bg-light shadow-none h-100">
                        <option value="">Todas las localidades</option>
                    </select>
                </div>
            </div>

            <?php if (($modoBuscador ?? 'simple') === 'avanzado'): ?>
                <div class="col-md-2">
                    <button class="btn btn-light text-dark border-0 w-100 h-100 shadow-none d-flex align-items-center justify-content-center" type="button" data-bs-toggle="collapse" data-bs-target="#filtrosAvanzados">
                        <i class="bi bi-sliders me-2"></i> Filtros
                    </button>
                </div>
            <?php endif; ?>

            <div class="<?= ($modoBuscador ?? 'simple') === 'avanzado' ? 'col-md-2' : 'col-md-2' ?>">
                <button type="submit" class="btn btn-primary fw-bold w-100 h-100 d-flex align-items-center justify-content-center gap-2 py-2">
                    <i class="bi bi-search"></i>
                    <span>Buscar</span>
                </button>
            </div>

        </div>

        <?php if (($modoBuscador ?? 'simple') === 'avanzado'): ?>

<div class="collapse mt-3" id="filtrosAvanzados">

    <div class="card card-body bg-light border-0 rounded-3">

        <div class="row g-3">

            <div class="col-md-4">
                <label class="form-label text-secondary small mb-1">
                    Dormitorios (Mínimo)
                </label>

                <input
                    type="number"
                    class="form-control"
                    name="dormitorios"
                    min="1">
            </div>

            <div class="col-md-4">
                <label class="form-label text-secondary small mb-1">
                    Ambientes (Mínimo)
                </label>

                <input
                    type="number"
                    class="form-control"
                    name="ambientes"
                    min="1">
            </div>

            <div class="col-md-4">
                <label class="form-label text-secondary small mb-1">
                    Precio Máximo ($)
                </label>

                <input
                    type="number"
                    class="form-control"
                    name="precio_max">
            </div>

            <div class="col-md-4">
                <label class="form-label text-secondary small mb-1">
                    Expensas Máximas ($)
                </label>

                <input
                    type="number"
                    class="form-control"
                    name="expensas_max">
            </div>

            <div class="col-md-4">
                <label class="form-label text-secondary small mb-1">
                    Capacidad (Personas)
                </label>

                <input
                    type="number"
                    class="form-control"
                    name="capacidad"
                    min="1">
            </div>

        </div>

    </div>

</div>

<?php endif; ?>

<script>
document.addEventListener('DOMContentLoaded', async () => {

    try {

        const response = await fetch(
            '<?= BASE_URL ?>/api/categorias'
        );

        const resultado = await response.json();

        if (!resultado.success) {
            throw new Error('No se pudieron cargar las categorías');
        }

        const select = document.getElementById('categoria');

        resultado.data.items.forEach(categoria => {

            const option = document.createElement('option');

            option.value = categoria.id;
            option.textContent = categoria.nombre;

            select.appendChild(option);

        });

    } catch (error) {

        console.error(
            'Error al cargar categorías:',
            error
        );

    }

    try {

        const response = await fetch(
            '<?= BASE_URL ?>/api/localidades'
        );

        const resultado = await response.json();

        if (!resultado.success) {
            throw new Error('No se pudieron cargar las localidades');
        }

        const select = document.getElementById('localidad');

        resultado.data.items.forEach(localidad => {

            const option = document.createElement('option');

            option.value = localidad.id;
            option.textContent = localidad.nombre;

            select.appendChild(option);

        });

    } catch (error) {

        console.error(
            'Error al cargar localidades:',
            error
        );

    }

});
</script>