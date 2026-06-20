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
        card.className = "card shadow-sm";

        card.innerHTML = `
            <div class="card-header bg-white">
                <h4 class="mb-0">Mis datos</h4>
            </div>
            <div class="card-body"></div>
        `;

        const cardBody = card.querySelector(".card-body");

        // Función para crear filas de datos de forma segura
        const crearFila = (label1, val1, label2, val2) => {
            const row = document.createElement("div");
            row.className = "row mb-3";
            
            const col1 = document.createElement("div");
            col1.className = "col-md-6";
            col1.innerHTML = `<strong>${label1}</strong>`;
            const p1 = document.createElement("p");
            p1.textContent = val1; // Seguro ante XSS
            col1.appendChild(p1);
            
            const col2 = document.createElement("div");
            col2.className = "col-md-6";
            col2.innerHTML = `<strong>${label2}</strong>`;
            const p2 = document.createElement("p");
            p2.textContent = val2; // Seguro ante XSS
            col2.appendChild(p2);
            
            row.appendChild(col1);
            row.appendChild(col2);
            return row;
        };

        // Construcción del contenido
        cardBody.appendChild(crearFila("Nombre", usuario.nombre, "Apellido", usuario.apellido));
        cardBody.appendChild(crearFila("Email", usuario.email, "Teléfono", usuario.telefono ?? '-'));
        
        // Agregar Domicilio y Rol
        const divDomicilio = document.createElement("div");
        divDomicilio.className = "mb-3";
        divDomicilio.innerHTML = `<strong>Domicilio</strong>`;
        const pDom = document.createElement("p");
        pDom.textContent = usuario.domicilio ?? '-';
        divDomicilio.appendChild(pDom);
        cardBody.appendChild(divDomicilio);

        const divRol = document.createElement("div");
        divRol.className = "mb-3";
        divRol.innerHTML = `<strong>Rol</strong>`;
        const pRol = document.createElement("p");
        pRol.textContent = usuario.rol;
        divRol.appendChild(pRol);
        cardBody.appendChild(divRol);

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