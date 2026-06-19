<?php
$tituloPagina = "Propiedades";
include SRC_PATH . 'views/layouts/header.php';
?>

<div class="container mt-4">

    <div class="d-flex justify-content-between align-items-center mb-3">
        <h3>Propiedades</h3>
        <a href="<?= BASE_URL ?>/propiedades/nuevo" class="btn btn-primary">
            + Nueva Propiedad
        </a>
    </div>

    <div id="alerta"></div>

    <div class="card shadow-sm">
        <div class="table-responsive">
            <table class="table table-striped table-hover align-middle mb-0">
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

</div>

<script>
// Usamos una ruta absoluta relativa al origen para evitar conflictos de base
const BASE = "<?= BASE_URL ?>";

/* ================= ALERTAS ================= */
function mostrarAlerta(tipo, msg) {
    const contenedorAlerta = document.getElementById("alerta");
    contenedorAlerta.innerHTML = `
        <div class="alert alert-${tipo} alert-dismissible fade show" role="alert">
            ${msg}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;
}

/* ================= LISTAR ================= */
async function cargarPropiedades() {
    const tbody = document.getElementById("tabla-propiedades");
    
    try {
        // IMPORTANTE: Asegúrate de que BASE_URL no tenga doble barra al final
        const url = `${BASE}/api/propiedades`.replace('//', '/');
        const resp = await fetch(url);
        
        if (!resp.ok) throw new Error("Error en la conexión");
        
        const json = await resp.json();
        console.log("Estructura recibida:", json);

        if (!json.data || json.data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" class="text-center">No hay propiedades registradas</td></tr>';
            return;
        }

        tbody.innerHTML = ""; // Limpiar tabla

        json.data.forEach(p => {
            const tr = document.createElement("tr");
            
            // Función auxiliar para celdas
            const createTd = (text) => {
                const td = document.createElement("td");
                td.textContent = text;
                return td;
            };

            tr.appendChild(createTd(p.id));
            tr.appendChild(createTd(p.titulo ?? '-'));
            tr.appendChild(createTd(p.direccion ?? '-'));
            tr.appendChild(createTd(`$${Number(p.precio).toLocaleString('es-AR')}`));
            tr.appendChild(createTd(p.categoria?.nombre ?? '-'));
            tr.appendChild(createTd(p.localidad?.nombre ?? '-'));
            tr.appendChild(createTd(p.cantidad_ambientes ?? '-'));

            // Acciones
            const tdAcciones = document.createElement("td");
            tdAcciones.innerHTML = `
                <button class="btn btn-sm btn-warning me-2" onclick="editar(${p.id})">Editar</button>
                <button class="btn btn-sm btn-danger" onclick="eliminar(${p.id})">Eliminar</button>
            `;
            tr.appendChild(tdAcciones);

            tbody.appendChild(tr);
        });

    } catch (err) {
        console.error(err);
        tbody.innerHTML = '<tr><td colspan="8" class="text-center text-danger">Error al cargar datos. Verifica la API.</td></tr>';
    }
}

/* ================= ACCIONES ================= */
async function eliminar(id) {
    if (!confirm("¿Seguro que querés eliminar esta propiedad?")) return;

    try {
        const resp = await fetch(`${BASE}/api/propiedades/${id}`, { method: "DELETE" });
        if (!resp.ok) throw new Error("No se pudo eliminar");
        
        mostrarAlerta("success", "Propiedad eliminada correctamente");
        cargarPropiedades();
    } catch (err) {
        mostrarAlerta("danger", "Error al eliminar la propiedad");
    }
}

function editar(id) {
    window.location.href = `${BASE}/propiedades/editar/${id}`;
}

document.addEventListener("DOMContentLoaded", cargarPropiedades);
</script>

<?php include SRC_PATH . 'views/layouts/footer.php'; ?>