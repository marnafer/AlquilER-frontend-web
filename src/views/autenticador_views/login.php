<?php
$tituloPagina = "Iniciar Sesión";
include SRC_PATH . 'views/partials/header.php';
?>

<div class="container mt-4">
    <div class="row justify-content-center">
        <div class="col-md-5">
            <div class="card shadow-sm border-0">
                <div class="card-header bg-white py-3">
                    <h4 class="mb-0">Acceder</h4>
                </div>
                <div class="card-body p-4">
                    <?php if (isset($_GET['error']) && $_GET['error'] === 'auth'): ?>
                        <div class="alert alert-danger" role="alert">
                            Usuario o contraseña incorrectos. Intente nuevamente.
                        </div>
                    <?php endif; ?>

                    <form method="POST" action="" id="formLogin" novalidate>
                        <div class="mb-3">
                            <label class="form-label fw-bold">Correo electrónico</label>
                            <input type="email" name="email" class="form-control" placeholder="usuario@ejemplo.com" required>
                        </div>

                        <div class="mb-3">
                            <label class="form-label fw-bold">Contraseña</label>
                            <input type="password" name="contrasena" class="form-control" placeholder="Contraseña" required>
                        </div>

                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" value="1" id="remember" name="remember">
                                <label class="form-check-label" for="remember">Recuérdame</label>
                            </div>
                            <a href="#" class="small">¿Olvidaste tu contraseña?</a>
                        </div>

                        <div class="d-grid">
                            <button type="submit" class="btn btn-primary py-2">Entrar</button>
                        </div>
                    </form>
                </div>
            </div>

            <p class="text-center text-muted mt-3 small">
                ¿No tienes cuenta?
                <a href="<?= BASE_URL ?>/register">Registrate acá</a>
            </p>
        </div>
    </div>
</div>

<script>
const BASE = "http://localhost/sistema-alquiler/public";
const form = document.getElementById('formLogin');

// autofocus
const first = form.querySelector('[name="email"]');
if (first) first.focus();

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = form.querySelector('[name="email"]').value.trim();
    const pass = form.querySelector('[name="contrasena"]').value;

    if (!email || !pass) {
        if (window.Swal) {
            Swal.fire({ icon: 'warning', title: 'Faltan datos', text: 'Completa correo y contraseña.' });
        } else {
            alert('Completa correo y contraseña.');
        }
        return;
    }

    const btn = form.querySelector('button');
    btn.disabled = true;
    btn.textContent = "Ingresando...";

    try {

       const resp = await fetch(BASE + "/api/usuarios/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: email,
                contrasena: pass
            })
        });

        const raw = await resp.text();
        console.log("RAW LOGIN:", raw);

        let json;
        try {
            json = JSON.parse(raw);
        } catch {
            alert("Error del servidor (no JSON)");
            return;
        }

        if (!resp.ok) {
            if (window.Swal) {
                Swal.fire({ icon: 'error', title: 'Error', text: json.error || 'Credenciales inválidas' });
            } else {
                alert(json.error || 'Credenciales inválidas');
            }
            return;
        }

        // ✅ guardar token
        localStorage.setItem("token", json.token);

        if (window.Swal) {
            Swal.fire({ icon: 'success', title: 'Login exitoso' });
        } else {
            alert("Login exitoso");
        }

        // redirección
        window.location.href = BASE + "/propiedades";

    } catch (err) {
        console.error("ERROR:", err);
        alert("Error de conexión");
    } finally {
        btn.disabled = false;
        btn.textContent = "Entrar";
    }
});
</script>

<?php include SRC_PATH . 'views/partials/footer.php'; ?>