<?php
$tituloPagina = "Localidades";
include SRC_PATH . 'views/partials/header.php';
?>

<div class="container mt-4">
    <div class="d-flex justify-content-between align-items-center mb-3">
        <h1 class="h4 mb-0">Localidades</h1>
        <div>
            <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#modalCrear">Crear Localidad</button>
        </div>
    </div>

    <div class="card shadow-sm">
        <div class="card-body p-0">
            <table class="table table-striped mb-0">
                <thead class="table-light">
                    <tr>
                        <th style="width:60px;">ID</th>
                        <th>Nombre</th>
                        <th style="width:160px;">Código postal</th>
                        <th style="width:180px;">Acciones</th>
                    </tr>
                </thead>
                <tbody id="tabla-localidades">
                    <?php if (!empty($localidades)): ?>
                        <?php foreach ($localidades as $loc): ?>
                            <tr data-id="<?= htmlspecialchars($loc->id) ?>">
                                <td><?= htmlspecialchars($loc->id) ?></td>
                                <td><?= htmlspecialchars($loc->nombre) ?></td>
                                <td><?= htmlspecialchars($loc->codigo_postal ?? '—') ?></td>
                                <td>
                                    <button class="btn btn-sm btn-outline-primary btn-ver" data-id="<?= htmlspecialchars($loc->id) ?>">Ver</button>
                                    <button class="btn btn-sm btn-outline-danger btn-eliminar" data-id="<?= htmlspecialchars($loc->id) ?>">Eliminar</button>
                                </td>
                            </tr>
                        <?php endforeach; ?>
                    <?php else: ?>
                        <tr><td colspan="4" class="text-center py-4">No hay localidades registradas.</td></tr>
                    <?php endif; ?>
                </tbody>
            </table>
        </div>
    </div>
</div>

<!-- Modal: Crear / Editar -->
<div class="modal fade" id="modalCrear" tabindex="-1" aria-hidden="true">
  <div class="modal-dialog">
    <form id="formLocalidad" class="modal-content" novalidate>
      <div class="modal-header">
        <h5 class="modal-title" id="modalTitle">Crear Localidad</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
      </div>
      <div class="modal-body">
        <div id="form-errors" class="alert alert-danger d-none"></div>

        <div class="mb-3">
          <label class="form-label">Nombre <span class="text-danger">*</span></label>
          <input type="text" name="nombre" class="form-control" id="input-nombre" maxlength="150" required>
          <div class="invalid-feedback" id="error-nombre"></div>
        </div>

        <div class="mb-3">
          <label class="form-label">Código postal</label>
          <input type="text" name="codigo_postal" class="form-control" id="input-cp" maxlength="20">
          <div class="invalid-feedback" id="error-codigo_postal"></div>
        </div>

        <input type="hidden" id="localidad-id" value="">
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-light" data-bs-dismiss="modal">Cancelar</button>
        <button type="submit" class="btn btn-primary" id="btnGuardar">
            <span id="spinner" class="spinner-border spinner-border-sm d-none" role="status" aria-hidden="true"></span>
            Guardar
        </button>
      </div>
    </form>
  </div>
</div>

<!-- Modal: Ver detalle -->
<div class="modal fade" id="modalVer" tabindex="-1" aria-hidden="true">
  <div class="modal-dialog modal-md">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">Detalle de Localidad</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
      </div>
      <div class="modal-body" id="detalle-body">
        <!-- Contenido cargado por JS -->
        <dl class="row mb-0">
            <dt class="col-sm-4">ID</dt><dd class="col-sm-8" id="det-id"></dd>
            <dt class="col-sm-4">Nombre</dt><dd class="col-sm-8" id="det-nombre"></dd>
            <dt class="col-sm-4">Código postal</dt><dd class="col-sm-8" id="det-cp"></dd>
        </dl>
      </div>
      <div class="modal-footer">
        <button class="btn btn-light" data-bs-dismiss="modal">Cerrar</button>
      </div>
    </div>
  </div>
</div>

<script>
(function(){
    // Helpers
    const tabla = document.getElementById('tabla-localidades');
    const modalCrear = new bootstrap.Modal(document.getElementById('modalCrear'));
    const modalVer = new bootstrap.Modal(document.getElementById('modalVer'));
    const form = document.getElementById('formLocalidad');
    const spinner = document.getElementById('spinner');
    const btnGuardar = document.getElementById('btnGuardar');
    const formErrors = document.getElementById('form-errors');

    // Mostrar detalle
    async function verLocalidad(id) {
        try {
            const resp = await fetch('/api/localidades/' + id);
            const js = await resp.json();
            if (!resp.ok) {
                (window.Swal) ? Swal.fire('Error', js.message || 'No se pudo obtener', 'error') : alert(js.message || 'No se pudo obtener');
                return;
            }
            const data = js.data;
            document.getElementById('det-id').textContent = data.id;
            document.getElementById('det-nombre').textContent = data.nombre;
            document.getElementById('det-cp').textContent = data.codigo_postal || '—';
            modalVer.show();
        } catch (err) {
            if (window.Swal) Swal.fire('Error', 'Error de conexión', 'error'); else alert('Error de conexión');
        }
    }

    // Eliminar
    async function eliminarLocalidad(id, row) {
        if (!confirm('¿Eliminar localidad #' + id + '?')) return;
        try {
            const resp = await fetch('/api/localidades/' + id, { method: 'DELETE' });
            const js = await resp.json();
            if (resp.ok) {
                if (window.Swal) Swal.fire({ icon: 'success', title: 'Eliminada', text: js.message || 'Localidad eliminada' });
                row.remove();
            } else {
                if (window.Swal) Swal.fire('Error', js.message || 'No se pudo eliminar', 'error'); else alert(js.message || 'No se pudo eliminar');
            }
        } catch (err) {
            if (window.Swal) Swal.fire('Error', 'Error de conexión', 'error'); else alert('Error de conexión');
        }
    }

    // Reset form
    function resetForm() {
        form.reset();
        document.getElementById('localidad-id').value = '';
        formErrors.classList.add('d-none'); formErrors.innerHTML = '';
        ['nombre','codigo_postal'].forEach(f => {
            const el = document.getElementById('error-' + f);
            if (el) el.textContent = '';
            const inp = document.querySelector('[name="' + f + '"]');
            if (inp) inp.classList.remove('is-invalid');
        });
        document.getElementById('modalTitle').textContent = 'Crear Localidad';
    }

    // Submit create (supports create only for now)
    form.addEventListener('submit', async function(e){
        e.preventDefault();
        formErrors.classList.add('d-none'); formErrors.innerHTML = '';
        ['nombre','codigo_postal'].forEach(f => {
            const el = document.getElementById('error-' + f);
            if (el) el.textContent = '';
            const inp = document.querySelector('[name="' + f + '"]');
            if (inp) inp.classList.remove('is-invalid');
        });

        const id = document.getElementById('localidad-id').value;
        const payload = {
            nombre: document.getElementById('input-nombre').value.trim(),
            codigo_postal: document.getElementById('input-cp').value.trim()
        };

        btnGuardar.disabled = true;
        spinner.classList.remove('d-none');

        try {
            const method = id ? 'PUT' : 'POST';
            const url = id ? '/api/localidades/' + id : '/api/localidades';
            const resp = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const js = await resp.json();

            if (resp.ok) {
                if (window.Swal) await Swal.fire({ icon: 'success', title: 'Guardado', text: js.message || 'Operación exitosa' });
                // Si es creación, insertar fila en la tabla; si es edición, actualizar fila
                if (!id) {
                    // simple append: reload la página para reflejar orden real en servidor
                    location.reload();
                } else {
                    location.reload();
                }
            } else {
                if (js.errors && typeof js.errors === 'object') {
                    // mostrar errores por campo
                    Object.keys(js.errors).forEach(field => {
                        const span = document.getElementById('error-' + field);
                        const inp = document.querySelector('[name="' + field + '"]');
                        if (span) span.textContent = js.errors[field];
                        if (inp) inp.classList.add('is-invalid');
                    });
                } else if (js.message) {
                    formErrors.classList.remove('d-none');
                    formErrors.textContent = js.message;
                } else {
                    formErrors.classList.remove('d-none');
                    formErrors.textContent = 'Error desconocido del servidor';
                }
            }
        } catch (err) {
            if (window.Swal) Swal.fire('Error', 'Error de conexión', 'error'); else alert('Error de conexión');
        } finally {
            btnGuardar.disabled = false;
            spinner.classList.add('d-none');
        }
    });

    // Delegación de eventos en la tabla
    tabla.addEventListener('click', function(e){
        const btn = e.target.closest('button');
        if (!btn) return;
        const id = btn.getAttribute('data-id');
        const row = btn.closest('tr');

        if (btn.classList.contains('btn-ver')) {
            verLocalidad(id);
            return;
        }
        if (btn.classList.contains('btn-eliminar')) {
            eliminarLocalidad(id, row);
            return;
        }
    });

    // Reset modal al abrir
    document.getElementById('modalCrear').addEventListener('show.bs.modal', resetForm);
})();
</script>

<?php include SRC_PATH . 'views/partials/footer.php'; ?>