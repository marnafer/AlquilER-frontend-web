<?php include SRC_PATH . 'views/partials/header.php'; ?>

<div class="container mt-4">
    <div class="card">
        <div class="card-header bg-primary text-white">
            Detalle de Actividad #<?= $log->id ?>
        </div>
        <div class="card-body">
            <p><strong>Fecha:</strong> <?= $log->fecha ?></p>
            <p><strong>Usuario:</strong> <?= $log->usuario->nombre ?? 'N/A' ?> (ID: <?= $log->usuario_id ?>)</p>
            <p><strong>Acción realizada:</strong> <?= htmlspecialchars($log->accion) ?></p>
            <hr>
            <h5>Datos Técnicos / Detalle:</h5>
            <pre class="bg-light p-3 border"><?= htmlspecialchars($log->detalle) ?></pre>
            
            <p><strong>Dirección IP:</strong> <?= $log->ip ?? 'Desconocida' ?></p>
        </div>
        <div class="card-footer">
            <a href="/logs-actividad" class="btn btn-secondary">Volver al listado</a>
        </div>
    </div>
</div>

<?php include SRC_PATH . 'views/partials/footer.php'; ?>