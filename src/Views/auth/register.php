<?php
$tituloPagina = "Registrarse";
include SRC_PATH . 'views/layouts/header.php';
?>

<div class="container mt-4">
    <div class="row justify-content-center">
        <div class="col-md-6">
            <div class="card shadow-sm">
                <div class="card-body">
                    <h4 class="mb-3">Crear Cuenta</h4>
                    <form id="formRegister" novalidate>
                        <?php 
                        $campos = [
                            ['nombre', 'Nombre', 'text'],
                            ['apellido', 'Apellido', 'text'],
                            ['email', 'Email', 'email'],
                            ['telefono', 'Teléfono', 'text'],
                            ['domicilio', 'Domicilio', 'text'],
                            ['contrasena', 'Contraseña', 'password']
                        ];
                        foreach($campos as $c): ?>
                            <div class="mb-3">
                                <label><?= $c[1] ?> *</label>
                                <input type="<?= $c[2] ?>" name="<?= $c[0] ?>" class="form-control">
                                <div class="text-danger small" id="error-<?= $c[0] ?>"></div>
                            </div>
                        <?php endforeach; ?>

                        <div class="mb-3">
                            <label>Tipo de usuario *</label>
                            <select name="rol_id" class="form-control">
                                <option value="">— Seleccionar —</option>
                                <option value="1">Usuario</option>
                                <option value="2">Propietario</option>
                            </select>
                            <div class="text-danger small" id="error-rol_id"></div>
                        </div>

                        <button class="btn btn-success w-100" type="submit" id="btn-submit">Registrarse</button>
                    </form>
                </div>
            </div>
        </div>
    </div>
</div>

<script>
const BASE = "<?= BASE_URL ?>"; // Mejor usar la constante PHP
const form = document.getElementById("formRegister");

const setError = (name, msg) => {
    const el = document.getElementById("error-" + name);
    if (el) el.textContent = msg; // Uso de textContent para prevenir XSS
};

const clearErrors = () => {
    document.querySelectorAll('[id^="error-"]').forEach(e => e.textContent = "");
};

form.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearErrors();
    
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    
    // Validación básica en cliente
    if (!data.email.includes('@')) {
        setError("email", "Ingrese un email válido");
        return;
    }

    const btn = document.getElementById("btn-submit");
    btn.disabled = true;
    btn.textContent = "Procesando...";

    try {
        const resp = await fetch(`${BASE}/api/autenticador/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        const json = await resp.json();

        if (!resp.ok) {
            // Manejo seguro de errores del backend
            if (json.errors) {
                Object.keys(json.errors).forEach(key => setError(key, json.errors[key]));
            } else {
                alert(json.message || "Error al registrar");
            }
            return;
        }

        Swal.fire({
            icon: 'success',
            title: '¡Registro exitoso!',
            text: 'Tu cuenta ha sido creada correctamente.',
            confirmButtonColor: '#28a745', // Verde Bootstrap
            confirmButtonText: 'Ir al Login'
        }).then(() => {
            window.location.href = `${BASE}/login`;
        });

    } catch (err) {
        alert("Error de conexión con el servidor");
    } finally {
        btn.disabled = false;
        btn.textContent = "Registrarse";
    }
});
</script>

<?php include SRC_PATH . 'views/layouts/footer.php'; ?>