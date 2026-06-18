<?php
$tituloPagina = "Propiedades";
include SRC_PATH . 'views/partials/header.php';
?>

<div class="container mt-4">

    <div class="d-flex justify-content-between align-items-center mb-3">
        <h3>Propiedades</h3>

        <a href="<?= BASE_URL ?>/propiedades/nuevo" class="btn btn-primary">
            + Nueva Propiedad
        </a>
    </div>

<<<<<<< HEAD
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
=======
    <div id="alerta"></div>
>>>>>>> 4ad93a49aafe06e2454ad57b841b94bddc9cafc9

    <div class="table-responsive">
        <table class="table table-striped table-hover align-middle">
            <thead class="table-dark">
                <tr>
                    <th>ID</th>
                    <th>Título</th>
                    <th>Dirección</th>
                    <th>Precio</th>
                    <th>Categoría</th>
                    <th>Localidad</th>
                    <th>Ambientes</th>
                    <th>Acciones</th>
                </tr>
            </thead>

            <tbody id="tabla-propiedades">
                <tr>
                    <td colspan="8" class="text-center">Cargando propiedades...</td>
                </tr>
            </tbody>
        </table>
    </div>

</div>

<script>
const BASE = "<?= BASE_URL ?>";

/* ================= ALERTAS ================= */
function mostrarAlerta(tipo, msg) {
    document.getElementById("alerta").innerHTML = `
        <div class="alert alert-${tipo}">${msg}</div>
    `;

    setTimeout(() => {
        document.getElementById("alerta").innerHTML = "";
    }, 3000);
}

/* ================= LISTAR ================= */
async function cargarPropiedades() {

    const tbody = document.getElementById("tabla-propiedades");

    try {
        const resp = await fetch(BASE + "/api/propiedades");
        const json = await resp.json();

        if (!resp.ok) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" class="text-center text-danger">
                        Error al cargar propiedades
                    </td>
                </tr>
            `;
            return;
        }

        if (!json.data || json.data.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" class="text-center">
                        No hay propiedades registradas
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = json.data.map(p => `
            <tr>
                <td>${p.id}</td>
                <td>${p.titulo ?? '-'}</td>
                <td>${p.direccion ?? '-'}</td>
                <td>$${p.precio ?? 0}</td>
                <td>${p.categoria?.nombre ?? '-'}</td>
                <td>${p.localidad?.nombre ?? '-'}</td>
                <td>${p.cantidad_ambientes ?? '-'}</td>
                <td>
                    <button class="btn btn-sm btn-warning" onclick="editar(${p.id})">
                        Editar
                    </button>

                    <button class="btn btn-sm btn-danger" onclick="eliminar(${p.id})">
                        Eliminar
                    </button>
                </td>
            </tr>
        `).join("");

    } catch (err) {
        console.error(err);
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center text-danger">
                    Error de conexión
                </td>
            </tr>
        `;
    }
}

/* ================= ELIMINAR ================= */
async function eliminar(id) {

    if (!confirm("¿Seguro que querés eliminar esta propiedad?")) return;

    try {
        const resp = await fetch(BASE + "/api/propiedades/" + id, {
            method: "DELETE"
        });

        const json = await resp.json();

        if (!resp.ok) {
            mostrarAlerta("danger", json.error || "Error al eliminar");
            return;
        }

        mostrarAlerta("success", "Propiedad eliminada");
        cargarPropiedades();

    } catch (err) {
        console.error(err);
        mostrarAlerta("danger", "Error de conexión");
    }
}

/* ================= EDITAR (placeholder) ================= */
function editar(id) {
    window.location.href = BASE + "/propiedades/editar/" + id;
}

/* ================= INIT ================= */
document.addEventListener("DOMContentLoaded", cargarPropiedades);
</script>

<?php include SRC_PATH . 'views/partials/footer.php'; ?>