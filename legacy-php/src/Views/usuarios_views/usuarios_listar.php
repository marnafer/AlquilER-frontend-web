<?php 
$tituloPagina = "Gestión de Usuarios";
include SRC_PATH . 'views/partials/header.php'; 
?>

<div class="container mt-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
        <h1><i class="bi bi-people-fill me-2"></i>Usuarios</h1>
        <a href="/usuarios/nuevo" class="btn btn-primary">
            <i class="bi bi-plus-circle me-1"></i> Nuevo Usuario
        </a>
    </div>

    <div class="card shadow-sm border-0">
        <div class="card-body p-0">
            <div class="table-responsive">
                <table class="table table-hover mb-0">
                    <thead class="table-light">
                        <tr>
                            <th>ID</th>
                            <th>Nombre</th>
                            <th>Email</th>
                            <th>Rol</th>
                            <th class="text-end">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($usuarios as $u): ?>
                            <tr id="user-row-<?= $u->id ?>">
                                <td class="align-middle fw-bold"><?= $u->id ?></td>
                                <td class="align-middle"><?= htmlspecialchars($u->nombre) ?></td>
                                <td class="align-middle"><?= htmlspecialchars($u->email) ?></td>
                                <td class="align-middle">
                                    <span class="badge bg-info text-dark">
                                        <?= $u->rol_id == 1 ? 'Administrador' : 'Usuario' ?>
                                    </span>
                                </td>
                                <td class="text-end">
                                    <button class="btn btn-outline-danger btn-sm" 
                                            onclick="eliminarUsuario(<?= $u->id ?>)">
                                        <i class="bi bi-trash"></i>
                                    </button>
                                </td>
                            </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</div>

<script>
async function eliminarUsuario(id) {
    const confirmacion = await Swal.fire({
        title: '¿Eliminar usuario?',
        text: "Esta acción no se puede deshacer.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
        reverseButtons: true
    });

    if (!confirmacion.isConfirmed) return;

    try {
        const response = await fetch(`/api/usuarios/${id}`, { method: 'DELETE' });
        const resultado = await response.json();

        if (response.ok) {
            // Borramos la fila del DOM con una pequeña transición
            const fila = document.getElementById(`user-row-${id}`);
            fila.style.opacity = '0';
            setTimeout(() => fila.remove(), 300);

            Swal.fire({
                icon: 'success',
                title: 'Eliminado',
                text: resultado.message,
                timer: 1500,
                showConfirmButton: false,
                toast: true,
                position: 'top-end'
            });
        } else {
            Swal.fire('Error', resultado.message, 'error');
        }
    } catch (error) {
        Swal.fire('Error', 'No se pudo conectar con el servidor', 'error');
    }
}
</script>

<?php include SRC_PATH . 'views/partials/footer.php'; ?>