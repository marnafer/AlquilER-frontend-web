
<nav class="navbar navbar-expand-lg navbar-dark mb-4 sticky-top">
    <div class="container">
        <a class="navbar-brand fw-bold" href="<?= BASE_URL ?>/home">
            <i class="bi bi-house-door-fill me-2"></i>Alquil-ER
        </a>

        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span class="navbar-toggler-icon"></span>
        </button>

        <div class="collapse navbar-collapse" id="navbarNav">
            <div class="navbar-nav ms-auto">
                <a class="nav-link d-none" id="menu-perfil" href="<?= BASE_URL ?>/perfil">
                    <i class="bi bi-person"></i> Mi perfil
                </a>
                <a class="nav-link d-none" id="menu-mis-propiedades" href="<?= BASE_URL ?>/mis-propiedades">
                    <i class="bi bi-house-gear"></i> Mis Propiedades
                </a>
                <a class="nav-link d-none" id="menu-favoritos" href="<?= BASE_URL ?>/favoritos">
                    <i class="bi bi-heart"></i> Favoritos
                </a>
                <a class="nav-link" id="menu-calculadora" href="<?= BASE_URL ?>/calculadora">
                    <i class="bi bi-calculator"></i> Calculadora de aumentos
                </a>
                <a class="nav-link d-none" id="menu-logout" href="#" onclick="logout()">
                    <i class="bi bi-box-arrow-right"></i> Cerrar Sesión
                </a>
                <a class="nav-link" id="menu-login" href="<?= BASE_URL ?>/login">
                    <i class="bi bi-box-arrow-in-right"></i> Iniciar Sesión
                </a>
            </div>
        </div>
    </div>
</nav>

<script>
// Función de logout reutilizable
function logout() {
    // 1. Borramos el token
    localStorage.removeItem("token");
    localStorage.removeItem("rol");

    // 2. Mostramos la alerta y esperamos
    if (window.Swal) {
        Swal.fire({
            icon: 'success',
            title: 'Sesión cerrada',
            text: 'Esperamos verte pronto.',
            showConfirmButton: false,
            timer: 2000
        }).then(() => {
            window.location.href = "<?= BASE_URL ?>/home";
        });
    } else {
        alert("Sesión cerrada correctamente.");
        setTimeout(() => {
            window.location.href = "<?= BASE_URL ?>/home";
        }, 2000);
    }
}

// Lógica de visibilidad del menú
document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token");
    const rol = localStorage.getItem("rol");

    const menuMisPropiedades = document.getElementById("menu-mis-propiedades");
    const menuPerfil = document.getElementById("menu-perfil");
    const menuFavoritos = document.getElementById("menu-favoritos");
    const menuLogout = document.getElementById("menu-logout");
    const menuLogin = document.getElementById("menu-login");

    if (token) {
        menuPerfil.classList.remove("d-none");
        menuLogout.classList.remove("d-none");
        menuLogin.classList.add("d-none");

        if (rol === "2") { 
            menuMisPropiedades.classList.remove("d-none");
        }

        if (rol === "1" || rol === "3") { 
            menuFavoritos.classList.remove("d-none");
        }
    }
});
</script>