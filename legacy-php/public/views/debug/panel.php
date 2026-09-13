<?php
require_once dirname(__DIR__, 3) . '/src/debug/Debugger.php';

use App\Debug\Debugger;

// Habilitar debug
Debugger::setEnabled(true);
Debugger::enableErrorReporting();
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Panel de Debug</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>
        .debug-card { margin-bottom: 20px; }
        .debug-card pre { background: #f8f9fa; padding: 15px; border-radius: 5px; overflow-x: auto; }
        .status-ok { color: green; }
        .status-error { color: red; }
        .status-warning { color: orange; }
    </style>
</head>
<body>
    <div class="container mt-4">
        <h1 class="mb-4">Panel de Debug</h1>
        
        <!-- Botones de acción -->
        <div class="row mb-4">
            <div class="col-md-12">
                <button id="testApi" class="btn btn-primary">Probar API</button>
                <button id="testDB" class="btn btn-success">Probar DB</button>
                <button id="clearLog" class="btn btn-danger">Limpiar Log</button>
                <button id="refreshStats" class="btn btn-info">Actualizar Stats</button>
            </div>
        </div>
        
        <!-- Estadísticas -->
        <div class="card debug-card">
            <div class="card-header">
                <h3>Estadísticas del Sistema</h3>
            </div>
            <div class="card-body" id="stats">
                Cargando estadísticas...
            </div>
        </div>
        
        <!-- Logs recientes -->
        <div class="card debug-card">
            <div class="card-header">
                <h3>Logs Recientes</h3>
            </div>
            <div class="card-body">
                <pre id="logs">Cargando logs...</pre>
            </div>
        </div>
        
        <!-- Test de API -->
        <div class="card debug-card">
            <div class="card-header">
                <h3>Test de API</h3>
            </div>
            <div class="card-body">
                <div id="apiResult"></div>
            </div>
        </div>
        
        <!-- Información del servidor -->
        <div class="card debug-card">
            <div class="card-header">
                <h3>Información del Servidor</h3>
            </div>
            <div class="card-body">
                <pre><?php
                echo "PHP Version: " . phpversion() . "\n";
                echo "Server Software: " . ($_SERVER['SERVER_SOFTWARE'] ?? 'N/A') . "\n";
                echo "Memory Limit: " . ini_get('memory_limit') . "\n";
                echo "Max Execution Time: " . ini_get('max_execution_time') . "s\n";
                echo "Upload Max Size: " . ini_get('upload_max_filesize') . "\n";
                echo "Post Max Size: " . ini_get('post_max_size') . "\n";
                echo "Timezone: " . date_default_timezone_get() . "\n";
                ?></pre>
            </div>
        </div>
    </div>
    
    <script>
        // Cargar estadísticas
        function cargarStats() {
            fetch('/api/debug/stats')
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        const html = `
                            <div class="row">
                                <div class="col-md-3">
                                    <div class="alert alert-info">
                                        <strong>Total Entidades</strong><br>
                                        ${data.data.total_entidades}
                                    </div>
                                </div>
                                <div class="col-md-3">
                                    <div class="alert alert-success">
                                        <strong>Total Registros</strong><br>
                                        ${data.data.total_registros}
                                    </div>
                                </div>
                                <div class="col-md-3">
                                    <div class="alert alert-warning">
                                        <strong>Logs Totales</strong><br>
                                        ${data.data.total_logs}
                                    </div>
                                </div>
                                <div class="col-md-3">
                                    <div class="alert alert-primary">
                                        <strong>Debug Activo</strong><br>
                                        ${data.data.debug_enabled ? 'Sí' : 'No'}
                                    </div>
                                </div>
                            </div>
                        `;
                        document.getElementById('stats').innerHTML = html;
                    }
                });
        }
        
        // Cargar logs
        function cargarLogs() {
            fetch('/api/debug/logs')
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        document.getElementById('logs').innerHTML = JSON.stringify(data.data, null, 2);
                    }
                });
        }
        
        // Probar API
        document.getElementById('testApi').addEventListener('click', () => {
            fetch('/api/categorias')
                .then(res => res.json())
                .then(data => {
                    const html = `
                        <div class="alert alert-success">
                            <strong>API Test Exitosa!</strong>
                            <pre>${JSON.stringify(data, null, 2)}</pre>
                        </div>
                    `;
                    document.getElementById('apiResult').innerHTML = html;
                })
                .catch(error => {
                    document.getElementById('apiResult').innerHTML = `
                        <div class="alert alert-danger">
                            <strong>Error:</strong> ${error.message}
                        </div>
                    `;
                });
        });
        
        // Probar DB
        document.getElementById('testDB').addEventListener('click', () => {
            fetch('/api/debug/test-db')
                .then(res => res.json())
                .then(data => {
                    const html = `
                        <div class="alert ${data.success ? 'alert-success' : 'alert-danger'}">
                            <strong>DB Test:</strong> ${data.message}
                            ${data.data ? `<pre>${JSON.stringify(data.data, null, 2)}</pre>` : ''}
                        </div>
                    `;
                    document.getElementById('apiResult').innerHTML = html;
                });
        });
        
        // Limpiar log
        document.getElementById('clearLog').addEventListener('click', () => {
            fetch('/api/debug/clear-log', { method: 'POST' })
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        alert('Log limpiado exitosamente');
                        cargarLogs();
                    }
                });
        });
        
        // Actualizar stats
        document.getElementById('refreshStats').addEventListener('click', () => {
            cargarStats();
            cargarLogs();
        });
        
        // Cargar datos iniciales
        cargarStats();
        cargarLogs();
    </script>
</body>
</html>