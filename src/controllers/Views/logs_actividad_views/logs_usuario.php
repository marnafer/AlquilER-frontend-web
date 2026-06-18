<?php include SRC_PATH . 'views/partials/header.php'; ?>

<div class="container mt-4">
    <h2>Actividad del Usuario: <?= count($logs) > 0 ? htmlspecialchars($logs[0]->usuario->nombre) : 'Sin registros' ?></h2>
    
    <div class="mb-3">
        <a href="/logs-actividad" class="btn btn-outline-secondary btn-sm">Ver todos los logs</a>
    </div>

    <table class="table table-hover">
        <thead class="table-dark">
            <tr>
                <th>Fecha</th>
                <th>Acción</th>
                <th>Ver</th>
            </tr>
        </thead>
        <tbody>
            <?php foreach ($logs as $log): ?>
                <tr>
                    <td><?= $log->fecha ?></td>
                    <td><?= htmlspecialchars($log->accion) ?></td>
                    <td><a href="/logs-actividad/detalle?id=<?= $log->id ?>">🔍</a></td>
                </tr>
            <?php endforeach; ?>
        </tbody>
    </table>
</div>

<?php include SRC_PATH . 'views/partials/footer.php'; ?>