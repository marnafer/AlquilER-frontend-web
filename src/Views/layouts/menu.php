
<nav class="navbar navbar-expand-lg navbar-dark bg-dark mb-4">
    <div class="container">
        <a class="navbar-brand fw-bold" href="<?= BASE_URL ?>">
            <i class="bi bi-house-door-fill me-2"></i>Alquil-ER
        </a>

        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span class="navbar-toggler-icon"></span>
        </button>

        <div class="collapse navbar-collapse" id="navbarNav">
            <div class="navbar-nav ms-auto">
                <a class="nav-link" href="<?= BASE_URL ?>/propiedades">
                    <i class="bi bi-building"></i> Propiedades
                </a>
                
                <a class="nav-link d-none" id="menu-favoritos" href="<?= BASE_URL ?>/favoritos">
                    <i class="bi bi-heart"></i> Favoritos
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
    localStorage.removeItem("token");
    window.location.href = "<?= BASE_URL ?>/home";
}

// Lógica de visibilidad del menú
document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token");
    const menuFavoritos = document.getElementById("menu-favoritos");
    const menuLogout = document.getElementById("menu-logout");
    const menuLogin = document.getElementById("menu-login");

    if (token) {
        menuFavoritos.classList.remove("d-none");
        menuLogout.classList.remove("d-none");
        menuLogin.classList.add("d-none");
    }
});
</script>