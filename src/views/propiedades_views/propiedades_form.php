<?php 
$tituloPagina="Crear Propiedad";
include SRC_PATH . 'views/partials/header.php'; 
?>

<div class="container mt-4">

<h3>Crear Propiedad</h3>

<form id="form-propiedad">

<!-- ================= PRINCIPALES ================= -->
<p class="seccion">Datos Principales</p>

<div class="grid">

    <div class="campo full">
        <label>Título *</label>
        <input type="text" name="titulo">
        <span class="msg-error" id="error-titulo"></span>
    </div>

    <div class="campo full">
        <label>Descripción</label>
        <textarea name="descripcion"></textarea>
    </div>

</div>

<!-- ================= UBICACIÓN ================= -->
<p class="seccion">Ubicación</p>

<div class="grid">

    <div class="campo">
        <label>Dirección *</label>
        <input type="text" name="direccion">
        <span class="msg-error" id="error-direccion"></span>
    </div>

    <div class="campo">
        <label>Localidad *</label>
        <select name="localidad_id">
            <option value="">— Seleccionar —</option>
            <option value="1">Crespo</option>
        </select>
        <span class="msg-error" id="error-localidad_id"></span>
    </div>

</div>

<!-- ================= COSTOS ================= -->
<p class="seccion">Costos</p>

<div class="grid">

    <div class="campo">
        <label>Precio *</label>
        <input type="number" name="precio" min="1" step="0.01">
        <span class="msg-error" id="error-precio"></span>
    </div>

    <div class="campo">
        <label>Expensas</label>
        <input type="number" name="expensas" value="0" min="0" step="0.01">
        <span class="msg-error" id="error-expensas"></span>
    </div>

</div>

<!-- ================= CARACTERÍSTICAS ================= -->
<p class="seccion">Características</p>

<div class="grid">

    <div class="campo">
        <label>Categoría *</label>
        <select name="categoria_id">
            <option value="">— Seleccionar —</option>
            <option value="1">Departamento</option>
            <option value="2">Casa</option>
        </select>
        <span class="msg-error" id="error-categoria_id"></span>
    </div>

    <div class="campo">
        <label>Ambientes *</label>
        <input type="number" name="cantidad_ambientes" min="1">
        <span class="msg-error" id="error-cantidad_ambientes"></span>
    </div>

    <div class="campo">
        <label>Dormitorios *</label>
        <input type="number" name="cantidad_dormitorios" min="1">
        <span class="msg-error" id="error-cantidad_dormitorios"></span>
    </div>

    <div class="campo">
        <label>Baños *</label>
        <input type="number" name="cantidad_banos" min="1">
        <span class="msg-error" id="error-cantidad_banos"></span>
    </div>

</div>

<button type="submit" id="btn-submit">Guardar Propiedad</button>

</form>
</div>

<script>
document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("form-propiedad");

    const required = [
        "titulo",
        "direccion",
        "localidad_id",
        "precio",
        "categoria_id",
        "cantidad_ambientes",
        "cantidad_dormitorios",
        "cantidad_banos"
    ];

    function setError(field, msg) {
        const el = document.getElementById("error-" + field);
        if (!el) return;
        el.innerText = msg;
        el.style.display = "block";
        el.style.color = "#dc3545";
        el.style.fontWeight = "bold";
    }

    function clearError(field) {
        const el = document.getElementById("error-" + field);
        if (!el) return;
        el.innerText = "";
    }

    function validateField(name, value) {

    let error = "";

    value = (value ?? "").toString().trim();
    const num = Number(value);

    // ================= OBLIGATORIOS =================
    const required = [
        "titulo",
        "direccion",
        "localidad_id",
        "precio",
        "categoria_id",
        "cantidad_ambientes",
        "cantidad_dormitorios",
        "cantidad_banos"
    ];

    if (required.includes(name) && value === "") {
        error = "Campo obligatorio";
    }

    // ================= NUMÉRICOS BASE =================
    if (name === "precio") {
        if (value === "" || num <= 0) error = "Precio inválido";
    }

    if (name === "cantidad_ambientes") {
        if (value === "" || num < 1) error = "Mínimo 1 ambiente";
    }

    if (name === "cantidad_dormitorios") {
        if (value === "" || num < 1) error = "Mínimo 1 dormitorio";
    }

    if (name === "cantidad_banos") {
        if (value === "" || num < 1) error = "Mínimo 1 baño";
    }

    if (name === "expensas") {
        if (value !== "" && num < 0) error = "Expensas inválidas";
    }

    // ================= REGLAS DE NEGOCIO (IMPORTANTE) =================
    const ambientes = Number(document.querySelector("[name='cantidad_ambientes']").value || 0);
    const dormitorios = Number(document.querySelector("[name='cantidad_dormitorios']").value || 0);
    const banos = Number(document.querySelector("[name='cantidad_banos']").value || 0);

    // Solo validar coherencia si hay datos cargados
    if (ambientes > 0) {

        if (dormitorios > ambientes) {
            setError("cantidad_dormitorios", "No puede superar los ambientes");
            return false;
        }

        if (banos > ambientes) {
            setError("cantidad_banos", "No puede superar los ambientes");
            return false;
        }
    }

    // ================= RESULTADO =================
    if (error) {
        setError(name, error);
        return false;
    } else {
        clearError(name);
        return true;
    }
}

    // TIEMPO REAL REAL (input + change + blur)
    form.querySelectorAll("input, select, textarea").forEach(el => {

        ["input", "change", "blur"].forEach(evt => {
            el.addEventListener(evt, () => {
                validateField(el.name, el.value);
            });
        });

    });

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const data = Object.fromEntries(new FormData(form));

        let ok = true;

        for (const k in data) {
            if (!validateField(k, data[k])) ok = false;
        }

        if (!ok) return;

        try {
            const resp = await fetch(BASE_URL + "/api/propiedades", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + localStorage.getItem("token")
                },
                body: JSON.stringify(data)
            });

            const json = await resp.json();

            if (!resp.ok) {
                alert(json.message || "Error al guardar");
                return;
            }

            alert("Propiedad creada correctamente");
            window.location.reload();

        } catch (err) {
            console.error(err);
            alert("Error de conexión");
        }
    });

});
</script>

<?php include SRC_PATH . 'views/partials/footer.php'; ?>