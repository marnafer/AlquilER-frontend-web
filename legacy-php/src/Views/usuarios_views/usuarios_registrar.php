<?php 
$tituloPagina = "Registrar Nuevo Usuario";
include SRC_PATH . 'views/partials/header.php'; 
?>

<div class="container mt-4">
    <div class="row justify-content-center">
        <div class="col-md-6">
            <div class="card shadow-sm border-0">
                <div class="card-header bg-white py-3">
                    <h4 class="mb-0"><i class="bi bi-person-plus me-2"></i>Nuevo Usuario</h4>
                </div>
                <div class="card-body p-4">
                    <form id="formRegistro">
                        <div class="mb-3">
                            <label class="form-label fw-bold">Nombre Completo</label>
                            <input type="text" name="nombre" class="form-control" placeholder="Ej: Juan Pérez" required>
                        </div>

                        <div class="mb-3">
                            <label class="form-label fw-bold">Correo Electrónico</label>
                            <input type="email" name="email" class="form-control" placeholder="juan@ejemplo.com" required>
                        </div>

                        <div class="mb-3">
                            <label class="form-label fw-bold">Contraseña</label>
                            <input type="password" name="password" class="form-control" placeholder="Mínimo 8 caracteres" required>
                        </div>

                        <div class="mb-4">
                            <label class="form-label fw-bold">Rol del Usuario</label>
                            <select name="rol_id" class="form-select" required>
                                <option value="" selected disabled>Seleccionar rol...</option>
                                <option value="1">Administrador</option>
                                <option value="2">Usuario Estándar</option>
                            </select>
                        </div>

                        <div class="d-grid gap-2">
                            <button type="submit" class="btn btn-primary py-2" id="btnGuardar">
                                <span id="spinner" class="spinner-border spinner-border-sm d-none" role="status"></span>
                                Guardar Usuario
                            </button>
                            <a href="/usuarios" class="btn btn-light">Cancelar</a>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</div>

<script>
document.getElementById('formRegistro').addEventListener('submit', async (e) => {
    e.preventDefault();

    const btn = document.getElementById('btnGuardar');
    const spinner = document.getElementById('spinner');
    
    // Bloqueamos el botón para evitar doble envío
    btn.disabled = true;
    spinner.classList.remove('d-none');

    const formData = new FormData(e.target);
    const datos = Object.fromEntries(formData.entries());

    try {
        const response = await fetch('/api/usuarios', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos)
        });

        const resultado = await response.json();

        if (response.ok) {
            await Swal.fire({
                icon: 'success',
                title: '¡Usuario Creado!',
                text: resultado.message,
                confirmButtonColor: '#0d6efd'
            });
            window.location.href = '/usuarios';
        } else {
            // Manejo de errores del Validador
            let listaErrores = '<div class="text-start mt-2"><ul>';
            if (resultado.errors) {
                Object.values(resultado.errors).forEach(err => {
                    listaErrores += `<li>${err}</li>`;
                });
            } else {
                listaErrores += `<li>${resultado.message}</li>`;
            }
            listaErrores += '</ul></div>';

            Swal.fire({
                title: 'No se pudo guardar',
                html: listaErrores,
                icon: 'error'
            });
        }
    } catch (error) {
        Swal.fire('Error', 'Error de conexión con el servidor', 'error');
    } finally {
        btn.disabled = false;
        spinner.classList.add('d-none');
    }
});
</script>

<?php include SRC_PATH . 'views/partials/footer.php'; ?>