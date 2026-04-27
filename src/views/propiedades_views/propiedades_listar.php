<?php
$tituloPagina = "Propiedades";
include SRC_PATH . 'views/partials/header.php';
?>

<div class="container mt-4">
    <div class="d-flex justify-content-between align-items-center mb-3">
        <h1 class="h4 mb-0">Propiedades</h1>
        <div>
            <a href="/propiedades/nuevo" class="btn btn-primary">Nueva Propiedad</a>
        </div>
    </div>

    <div class="card shadow-sm">
        <div class="card-body p-0">
            <table class="table table-striped mb-0">
                <thead class="table-light">
                    <tr>
                        <th style="width:60px;">ID</th>
                        <th>Título</th>
                        <th style="width:120px;">Precio</th>
                        <th>Dirección</th>
                        <th style="width:90px;">Amb.</th>
                        <th style="width:90px;">Dorm.</th>
                        <th style="width:90px;">Baños</th>
                        <th style="width:110px;">Disponible</th>
                        <th style="width:180px;">Acciones</th>
                    </tr>
                </thead>
                <tbody id="tabla-propiedades">
                    <?php if (!empty($propiedades)): ?>
                        <?php foreach ($propiedades as $p): ?>
                            <tr data-id="<?php echo htmlspecialchars($p->id) ?>">
                                <td><?php echo htmlspecialchars($p->id) ?></td>
                                <td><?php echo htmlspecialchars($p->titulo) ?></td>
                                <td><?php echo htmlspecialchars(number_format((float)$p->precio, 2, ',', '.')) ?></td>
                                <td><?php echo htmlspecialchars($p->direccion ?? '—') ?></td>
                                <td><?php echo htmlspecialchars($p->cantidad_ambientes ?? '—') ?></td>
                                <td><?php echo htmlspecialchars($p->cantidad_dormitorios ?? '—') ?></td>
                                <td><?php echo htmlspecialchars($p->cantidad_banos ?? '—') ?></td>
                                <td><?php echo ($p->disponible ? '<span class="badge bg-success">Sí</span>' : '<span class="badge bg-secondary">No</span>') ?></td>
                                <td>
                                    <button class="btn btn-sm btn-outline-primary btn-ver" data-id="<?php echo htmlspecialchars($p->id) ?>">Ver</button>
                                    <a href="/api/propiedades/nuevo?copiar=<?php echo htmlspecialchars($p->id) ?>" class="btn btn-sm btn-outline-secondary">Copiar</a>
                                    <button class="btn btn-sm btn-outline-danger btn-eliminar" data-id="<?php echo htmlspecialchars($p->id) ?>">Eliminar</button>
                                </td>
                            </tr>
                        <?php endforeach; ?>
                    <?php else: ?>
                        <tr><td colspan="9" class="text-center py-4">No hay propiedades registradas.</td></tr>
                    <?php endif; ?>
                </tbody>
            </table>
        </div>
    </div>
</div>

<!-- Modal: Ver Propiedad -->
<div class="modal fade" id="modalVerPropiedad" tabindex="-1" aria-hidden="true">
  <div class="modal-dialog modal-lg">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">Detalle Propiedad</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
      </div>
      <div class="modal-body">
        <dl class="row mb-0">
            <dt class="col-sm-3">ID</dt><dd class="col-sm-9" id="det-id"></dd>
            <dt class="col-sm-3">Título</dt><dd class="col-sm-9" id="det-titulo"></dd>
            <dt class="col-sm-3">Descripción</dt><dd class="col-sm-9" id="det-descripcion"></dd>
            <dt class="col-sm-3">Precio</dt><dd class="col-sm-9" id="det-precio"></dd>
            <dt class="col-sm-3">Dirección</dt><dd class="col-sm-9" id="det-direccion"></dd>
            <dt class="col-sm-3">Ambientes / Dorm / Baños</dt>
            <dd class="col-sm-9" id="det-cantidades"></dd>
            <dt class="col-sm-3">Capacidad</dt><dd class="col-sm-9" id="det-capacidad"></dd>
            <dt class="col-sm-3">Disponible</dt><dd class="col-sm-9" id="det-disponible"></dd>
            <dt class="col-sm-3">Categoria ID</dt><dd class="col-sm-9" id="det-categoria"></dd>
            <dt class="col-sm-3">Localidad ID</dt><dd class="col-sm-9" id="det-localidad"></dd>
        </dl>
      </div>
      <div class="modal-footer">
        <a id="btnVerImagenes" class="btn btn-outline-primary" href="#">Ver Imágenes</a>
        <button class="btn btn-light" data-bs-dismiss="modal">Cerrar</button>
      </div>
    </div>
  </div>
</div>

<script>
(function(){
    const tabla = document.getElementById('tabla-propiedades');
    const modalEl = document.getElementById('modalVerPropiedad');
    const modal = new bootstrap.Modal(modalEl);

    async function mostrar(id) {
        try {
            const resp = await fetch('/api/propiedades/' + id);
            const js = await resp.json();
            if (!resp.ok) {
                (window.Swal) ? Swal.fire('Error', js.message || 'No se pudo obtener la propiedad', 'error') : alert(js.message || 'No se pudo obtener la propiedad');
                return;
            }
            const p = js.data;
            document.getElementById('det-id').textContent = p.id;
            document.getElementById('det-titulo').textContent = p.titulo || '';
            document.getElementById('det-descripcion').textContent = p.descripcion || '';
            document.getElementById('det-precio').textContent = p.precio !== undefined ? Number(p.precio).toLocaleString('es-AR', {minimumFractionDigits:2}) : '—';
            document.getElementById('det-direccion').textContent = p.direccion || '—';
            document.getElementById('det-cantidades').textContent = (p.cantidad_ambientes || '—') + ' / ' + (p.cantidad_dormitorios || '—') + ' / ' + (p.cantidad_banos || '—');
            document.getElementById('det-capacidad').textContent = p.capacidad ?? '—';
            document.getElementById('det-disponible').innerHTML = p.disponible ? '<span class="badge bg-success">Sí</span>' : '<span class="badge bg-secondary">No</span>';
            document.getElementById('det-categoria').textContent = p.categoria_id ?? '—';
            document.getElementById('det-localidad').textContent = p.localidad_id ?? '—';

            const btnImgs = document.getElementById('btnVerImagenes');
            btnImgs.href = '/propiedades/imagenes?propiedad_id=' + p.id;
            modal.show();
        } catch (err) {
            if (window.Swal) Swal.fire('Error', 'Error de conexión', 'error'); else alert('Error de conexión');
        }
    }

    async function eliminar(id, row) {
        if (!confirm('¿Eliminar propiedad #' + id + '?')) return;
        try {
            const resp = await fetch('/api/propiedades/' + id, { method: 'DELETE' });
            const js = await resp.json();
            if (resp.ok) {
                if (window.Swal) Swal.fire({ icon:'success', title:'Eliminada', text: js.message || 'Propiedad eliminada' });
                row.remove();
            } else {
                if (window.Swal) Swal.fire('Error', js.message || 'No se pudo eliminar', 'error'); else alert(js.message || 'No se pudo eliminar');
            }
        } catch (err) {
            if (window.Swal) Swal.fire('Error', 'Error de conexión', 'error'); else alert('Error de conexión');
        }
    }

    tabla.addEventListener('click', function(e) {
        const btn = e.target.closest('button');
        if (!btn) return;
        const id = btn.getAttribute('data-id');
        const row = btn.closest('tr');

        if (btn.classList.contains('btn-ver')) {
            mostrar(id);
            return;
        }

        if (btn.classList.contains('btn-eliminar')) {
            eliminar(id, row);
            return;
        }
    });
})();
</script>

<?php include SRC_PATH . 'views/partials/footer.php'; ?>