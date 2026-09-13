<?php include SRC_PATH . 'views/partials/header.php'; ?>

<div class="container mt-4">
    <h2>Historial de Actividad</h2>
    <table class="table table-striped">
        <thead>
            <tr>
                <th>Fecha</th>
                <th>Usuario</th>
                <th>Acción</th>
                <th>Acciones</th>
            </tr>
        </thead>
        <tbody>
            <?php foreach ($logs as $log): ?>
                <tr>
                    <td><?= date('d/m/Y H:i', strtotime($log->fecha)) ?></td>
                    <td><?= htmlspecialchars($log->usuario->nombre ?? 'Sistema') ?></td>
                    <td><?= htmlspecialchars($log->accion) ?></td>
                    <td>
                        <a href="/logs-actividad/detalle?id=<?= $log->id ?>" class="btn btn-sm btn-info">Ver Detalle</a>
                    </td>
                </tr>
            <?php endforeach; ?>
        </tbody>
    </table>
</div>

<?php include SRC_PATH . 'views/partials/footer.php'; ?>