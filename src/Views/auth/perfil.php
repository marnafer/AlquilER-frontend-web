<?php

$tituloPagina = "Mis datos";

include SRC_PATH . 'views/layouts/header.php';
include SRC_PATH . 'views/layouts/menu.php';

?>

<div class="container mt-4">

    <div class="row justify-content-center">

        <div class="col-md-8">

            <div id="perfilContainer">

                <div class="card shadow-sm">
                    <div class="card-body text-center">
                        <div class="spinner-border" role="status"></div>
                        <p class="mt-3 mb-0">Cargando perfil...</p>
                    </div>
                </div>

            </div>

        </div>

    </div>

</div>

<script>

const BASE = "<?= BASE_URL ?>";

const token = localStorage.getItem("token");

if (!token) {

    window.location.href = BASE + "/login";

}

async function cargarPerfil() {
    try {
        const response = await fetch(BASE + "/api/usuarios/me", {
            headers: { "Authorization": `Bearer ${token}` }
        });

        const json = await response.json();

        if (!response.ok || !json.success) {
            localStorage.removeItem("token");
            window.location.href = BASE + "/login";
            return;
        }

        const usuario = json.data;
        const container = document.getElementById("perfilContainer");
        container.innerHTML = ""; // Limpiamos el spinner

        // Creamos la estructura base
        const card = document.createElement("div");
        card.className = "card shadow-sm border-0"; // border-0 le da un toque más moderno

        card.innerHTML = `
            <div class="card-header bg-white border-bottom-0 pt-4 pb-0">
                <h4 class="fw-bold text-dark mb-0">Mis datos personales</h4>
            </div>
            <div class="card-body p-4"></div>
        `;

        const cardBody = card.querySelector(".card-body");

        // Función optimizada para crear filas de datos
        const crearFila = (label1, val1, label2, val2) => {
            const row = document.createElement("div");
            row.className = "row mb-4"; // Un mb-4 da un respiro elegante entre filas
            
            // Columna 1
            const col1 = document.createElement("div");
            col1.className = "col-md-6 mb-3 mb-md-0"; // mb-3 solo en celulares para que no se peguen al apilarse
            col1.innerHTML = `<strong class="text-secondary d-block mb-1">${label1}</strong>`;
            const p1 = document.createElement("p");
            p1.className = "mb-0 fs-5 text-dark"; // mb-0 es la clave para anular el margen por defecto
            p1.textContent = val1; 
            col1.appendChild(p1);
            
            // Columna 2
            const col2 = document.createElement("div");
            col2.className = "col-md-6";
            col2.innerHTML = `<strong class="text-secondary d-block mb-1">${label2}</strong>`;
            const p2 = document.createElement("p");
            p2.className = "mb-0 fs-5 text-dark"; 
            p2.textContent = val2; 
            col2.appendChild(p2);
            
            row.appendChild(col1);
            row.appendChild(col2);
            return row;
        };

        // Construcción del contenido (todo usando la misma grilla)
        cardBody.appendChild(crearFila("Nombre", usuario.nombre, "Apellido", usuario.apellido));
        cardBody.appendChild(crearFila("Email", usuario.email, "Teléfono", usuario.telefono ?? '-'));
        
        // Agrupamos Domicilio y Rol en la misma fila para mantener la simetría
        cardBody.appendChild(crearFila("Domicilio", usuario.domicilio ?? '-', "Rol", usuario.rol));

        container.appendChild(card);

    } catch (error) {
        console.error(error);
        document.getElementById("perfilContainer").innerHTML = `
            <div class="alert alert-danger">Error al cargar el perfil.</div>
        `;
    }
}

cargarPerfil();

</script>

<?php include SRC_PATH . 'views/layouts/footer.php'; ?>