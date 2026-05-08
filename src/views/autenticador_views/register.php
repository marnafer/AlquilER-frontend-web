<?php
$tituloPagina = "Registrarse";
include SRC_PATH . 'views/partials/header.php';
?>

<div class="container mt-4">
    <div class="row justify-content-center">
        <div class="col-md-6">

            <div class="card shadow-sm">
                <div class="card-body">

                    <h4 class="mb-3">Crear Cuenta</h4>

                    <form id="formRegister">

                        <div class="mb-3">
                            <label>Nombre *</label>
                            <input type="text" name="nombre" class="form-control">
                            <div class="text-danger small" id="error-nombre"></div>
                        </div>

                        <div class="mb-3">
                            <label>Apellido *</label>
                            <input type="text" name="apellido" class="form-control">
                            <div class="text-danger small" id="error-apellido"></div>
                        </div>

                        <div class="mb-3">
                            <label>Email *</label>
                            <input type="email" name="email" class="form-control">
                            <div class="text-danger small" id="error-email"></div>
                        </div>

                        <div class="mb-3">
                            <label>Teléfono *</label>
                            <input type="text" name="telefono" class="form-control">
                            <div class="text-danger small" id="error-telefono"></div>
                        </div>

                        <div class="mb-3">
                            <label>Domicilio *</label>
                            <input type="text" name="domicilio" class="form-control">
                            <div class="text-danger small" id="error-domicilio"></div>
                        </div>

                        <div class="mb-3">
                            <label>Contraseña *</label>
                            <input type="password" name="contrasena" class="form-control">
                            <div class="text-danger small" id="error-contrasena"></div>
                        </div>

                        <div class="mb-3">
                            <label>Tipo de usuario *</label>
                            <select name="rol_id" class="form-control">
                                <option value="">— Seleccionar —</option>
                                <option value="1">Propietario</option>
                                <option value="2">Inquilino</option>
                            </select>
                            <div class="text-danger small" id="error-rol_id"></div>
                        </div>

                        <button class="btn btn-success w-100" type="submit" id="btn-submit">
                            Registrarse
                        </button>

                    </form>

                </div>
            </div>

        </div>
    </div>
</div>

<script>
const BASE = "http://localhost/sistema-alquiler/public";
const form = document.getElementById("formRegister");

/* ================= DEBUG IMPORTANTE ================= */
console.log("BASE URL:", BASE);

/* ================= HELPERS ================= */

function setError(name, msg) {
    const el = document.getElementById("error-" + name);
    if (el) el.textContent = msg;
}

function clearAllErrors() {
    document.querySelectorAll('[id^="error-"]').forEach(e => e.textContent = "");
}

function empty(v) {
    return !v || v.trim() === "";
}

/* ================= VALIDACIÓN ================= */

function validate(data) {

    let ok = true;
    clearAllErrors();

    if (empty(data.nombre)) {
        setError("nombre", "Nombre obligatorio");
        ok = false;
    }

    if (empty(data.apellido)) {
        setError("apellido", "Apellido obligatorio");
        ok = false;
    }

    if (empty(data.email)) {
        setError("email", "Email obligatorio");
        ok = false;
    }

    if (empty(data.telefono)) {
        setError("telefono", "Teléfono obligatorio");
        ok = false;
    }

    if (empty(data.domicilio)) {
        setError("domicilio", "Domicilio obligatorio");
        ok = false;
    }

    if (empty(data.contrasena) || data.contrasena.length < 6) {
        setError("contrasena", "Mínimo 6 caracteres");
        ok = false;
    }

    if (empty(data.rol_id)) {
        setError("rol_id", "Seleccioná un rol");
        ok = false;
    }

    return ok;
}

/* ================= SUBMIT ================= */

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    console.log("SUBMIT ACTIVADO");

    const data = Object.fromEntries(new FormData(form));

    console.log("DATA ENVIADA:", data); // 🔥 CLAVE PARA DEBUG

    if (!validate(data)) return;

    const btn = document.getElementById("btn-submit");
    btn.disabled = true;
    btn.textContent = "Registrando...";

    try {
        const resp = await fetch(BASE + "/api/usuarios", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        const text = await resp.text();
        console.log("RAW RESPONSE:", text);

        let json;
        try {
            json = JSON.parse(text);
        } catch {
            alert("El backend devolvió HTML o error fatal");
            return;
        }

        console.log("JSON:", json);

        if (!resp.ok) {

            if (json.errors) {
                for (const campo in json.errors) {
                    setError(campo, json.errors[campo]);
                }
            } else {
                alert(json.error || "Error");
            }

            return;
        }

        alert("Usuario creado correctamente");
        window.location.href = BASE + "/login";

    } catch (err) {
        console.error("FETCH ERROR:", err);
        alert("Error de conexión");
    } finally {
        btn.disabled = false;
        btn.textContent = "Registrarse";
    }
});
</script>

<?php include SRC_PATH . 'views/partials/footer.php'; ?>