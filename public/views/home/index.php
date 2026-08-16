<?php
// Datos que vienen del controlador
$title = $data['title'] ?? 'AlquilER - Encontrá tu propiedad ideal';
$description = $data['description'] ?? 'Las mejores propiedades en alquiler';
?>

<!-- ============================================ -->
<!-- HERO SECTION                                 -->
<!-- ============================================ -->
<section class="hero">
    <div class="container">
        <div class="row min-vh-100 align-items-center">
            <div class="col-lg-6 text-white">
                <!-- Logo/Badge -->
                <div class="mb-4">
                    <span class="badge bg-teal-light text-teal-dark px-4 py-2 rounded-pill mb-3">
                        <i class="fas fa-home"></i> AlquilER
                    </span>
                </div>
                
                <!-- Título -->
                <h1 class="display-3 fw-bold mb-4">
                    Encontrá tu <span class="text-teal-light">propiedad ideal</span>
                </h1>
                
                <p class="lead mb-4">
                    <?= $description ?> Departamentos, casas, locales comerciales y más.
                </p>
                
                <!-- Buscador -->
                <div class="search-box bg-white p-3 p-md-4 rounded-4 shadow-lg">
                    <form action="/sistema-alquiler/propiedades" method="GET">
                        <div class="row g-2 g-md-3 align-items-center">
                            <div class="col-12 col-md-5">
                                <div class="input-group">
                                    <span class="input-group-text bg-transparent border-0">
                                        <i class="fas fa-map-marker-alt text-teal"></i>
                                    </span>
                                    <input 
                                        type="text" 
                                        name="ubicacion" 
                                        class="form-control form-control-lg border-0 ps-0" 
                                        placeholder="¿Dónde querés vivir?"
                                        id="searchUbicacion"
                                    >
                                </div>
                            </div>
                            <div class="col-6 col-md-3">
                                <div class="input-group">
                                    <span class="input-group-text bg-transparent border-0">
                                        <i class="fas fa-tag text-teal"></i>
                                    </span>
                                    <select 
                                        name="categoria_id" 
                                        class="form-select form-select-lg border-0 ps-0" 
                                        id="searchCategoria"
                                    >
                                        <option value="">Categoría</option>
                                    </select>
                                </div>
                            </div>
                            <div class="col-6 col-md-2">
                                <div class="input-group">
                                    <span class="input-group-text bg-transparent border-0">
                                        <i class="fas fa-dollar-sign text-teal"></i>
                                    </span>
                                    <input 
                                        type="number" 
                                        name="precio_max" 
                                        class="form-control form-control-lg border-0 ps-0" 
                                        placeholder="Precio máx."
                                        id="searchPrecio"
                                    >
                                </div>
                            </div>
                            <div class="col-12 col-md-2">
                                <button type="submit" class="btn btn-primary btn-lg w-100">
                                    <i class="fas fa-search me-2"></i> Buscar
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
            
            <!-- Imagen Hero -->
            <div class="col-lg-6 d-none d-lg-block">
                <div class="text-center">
                    <img 
                        src="http://localhost/sistema-alquiler/assets/img/hero-default.png" 
                        alt="AlquilER" 
                        class="img-fluid"
                        style="max-height: 400px;"
                        onerror="this.src='http://localhost/sistema-alquiler/assets/img/hero-default.png'"
                    >
                </div>
            </div>
        </div>
    </div>
    
    <!-- Ola decorativa -->
    <div class="wave-divider">
        <svg viewBox="0 0 1440 100" xmlns="http://www.w3.org/2000/svg">
            <path fill="#f0fdf4" d="M0,50 C360,100 720,0 1080,50 C1260,75 1380,85 1440,90 L1440,100 L0,100 Z"/>
        </svg>
    </div>
</section>

<!-- ============================================ -->
<!-- PROPIEDADES DESTACADAS                        -->
<!-- ============================================ -->
<section class="propiedades-destacadas py-5">
    <div class="container">
        <div class="text-center mb-5">
            <span class="badge bg-teal-soft text-teal-dark px-4 py-2 rounded-pill mb-2">
                <i class="fas fa-star"></i> Destacadas
            </span>
            <h2 class="fw-bold text-teal-dark">Propiedades Destacadas</h2>
            <p class="text-muted">Las propiedades más visitadas del momento</p>
        </div>
        
        <div class="row" id="propiedadesDestacadas">
            <!-- Se carga con JavaScript -->
            <div class="col-12 text-center py-5">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Cargando...</span>
                </div>
            </div>
        </div>
    </div>
</section>

<!-- ============================================ -->
<!-- CATEGORÍAS                                   -->
<!-- ============================================ -->
<section class="categorias py-5 bg-teal-light">
    <div class="container">
        <div class="text-center mb-5">
            <span class="badge bg-teal-soft text-teal-dark px-4 py-2 rounded-pill mb-2">
                <i class="fas fa-tags"></i> Categorías
            </span>
            <h2 class="fw-bold text-teal-dark">Explorar por Categoría</h2>
            <p class="text-teal-dark-50">Encontrá lo que buscás</p>
        </div>
        
        <div class="row" id="listaCategorias">
            <!-- Se carga con JavaScript -->
            <div class="col-12 text-center py-5">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Cargando...</span>
                </div>
            </div>
        </div>
    </div>
</section>

<!-- ============================================ -->
<!-- SERVICIOS                                    -->
<!-- ============================================ -->
<section class="servicios py-5">
    <div class="container">
        <div class="text-center mb-5">
            <span class="badge bg-teal-soft text-teal-dark px-4 py-2 rounded-pill mb-2">
                <i class="fas fa-concierge-bell"></i> Servicios
            </span>
            <h2 class="fw-bold text-teal-dark">Servicios Destacados</h2>
            <p class="text-muted">Comodidades que ofrecen nuestras propiedades</p>
        </div>
        
        <div class="row" id="listaServicios">
            <!-- Se carga con JavaScript -->
            <div class="col-12 text-center py-5">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Cargando...</span>
                </div>
            </div>
        </div>
    </div>
</section>

<!-- ============================================ -->
<!-- ALQUILER EN NÚMEROS                          -->
<!-- ============================================ -->
<section class="estadisticas py-5 text-white">
    <div class="container">
        <div class="row text-center g-4">
            <div class="col-md-3">
                <div class="display-1 fw-bold" id="statPropiedades">0</div>
                <p class="text-white-50">Propiedades publicadas</p>
            </div>
            <div class="col-md-3">
                <div class="display-1 fw-bold" id="statUsuarios">0</div>
                <p class="text-white-50">Usuarios registrados</p>
            </div>
            <div class="col-md-3">
                <div class="display-1 fw-bold" id="statReservas">0</div>
                <p class="text-white-50">Reservas realizadas</p>
            </div>
            <div class="col-md-3">
                <div class="display-1 fw-bold" id="statCiudades">0</div>
                <p class="text-white-50">Ciudades disponibles</p>
            </div>
        </div>
    </div>
</section>

<!-- ============================================ -->
<!-- JAVASCRIPT                                   -->
<!-- ============================================ -->
<script>
// URL base de la API
const API_URL = '/sistema-alquiler/api';

// ==============================================
// 1. CARGAR ESTADÍSTICAS
// ==============================================
async function cargarEstadisticas() {
    try {
        const response = await fetch(`${API_URL}/debug/stats`);
        const data = await response.json();
        
        if (data.success) {
            const stats = data.data;
            
            document.getElementById('statPropiedades').textContent = stats.detalle?.propiedades || 0;
            document.getElementById('statUsuarios').textContent = stats.detalle?.usuarios || 0;
            document.getElementById('statReservas').textContent = stats.detalle?.reservas || 0;
            document.getElementById('statCiudades').textContent = stats.detalle?.localidades || 0;
        }
    } catch (error) {
        console.error('Error cargando estadísticas:', error);
    }
}

// ==============================================
// 2. CARGAR PROPIEDADES DESTACADAS
// ==============================================
async function cargarPropiedadesDestacadas() {
    try {
        const response = await fetch(`${API_URL}/propiedades`);
        const data = await response.json();
        
        if (data.success && data.data?.length > 0) {
            const container = document.getElementById('propiedadesDestacadas');
            const propiedades = data.data.slice(0, 6);
            
            container.innerHTML = propiedades.map(prop => `
                <div class="col-md-4 mb-4">
                    <div class="card h-100 shadow-sm propiedad-card">
                        <div class="position-relative">
                            <img 
                                src="/uploads/propiedades/${prop.id}.jpg" 
                                class="card-img-top" 
                                alt="${prop.titulo}"
                                style="height: 200px; object-fit: cover;"
                                onerror="this.src='/assets/img/propiedad-default.jpg'"
                            >
                            <span class="position-absolute top-0 end-0 badge bg-teal m-2">
                                Destacado
                            </span>
                        </div>
                        <div class="card-body">
                            <h5 class="card-title">${prop.titulo}</h5>
                            <p class="card-text text-muted small">
                                <i class="fas fa-map-marker-alt"></i> ${prop.direccion}
                            </p>
                            <p class="fw-bold text-teal-dark fs-4">
                                $${Number(prop.precio).toLocaleString()}
                            </p>
                            <div class="d-flex justify-content-between text-muted small">
                                <span><i class="fas fa-bed"></i> ${prop.cantidad_dormitorios} dorm.</span>
                                <span><i class="fas fa-bath"></i> ${prop.cantidad_banos} baños</span>
                                <span><i class="fas fa-arrows-alt"></i> ${prop.cantidad_ambientes} amb.</span>
                            </div>
                        </div>
                        <div class="card-footer bg-transparent border-0 d-grid">
                            <a href="/sistema-alquiler/propiedades/${prop.id}" class="btn btn-teal">
                                <i class="fas fa-eye"></i> Ver más
                            </a>
                        </div>
                    </div>
                </div>
            `).join('');
        } else {
            document.getElementById('propiedadesDestacadas').innerHTML = `
                <div class="col-12 text-center py-5">
                    <p class="text-muted">No hay propiedades destacadas aún</p>
                    <a href="/sistema-alquiler/propiedades" class="btn btn-teal">Ver todas</a>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error cargando propiedades:', error);
    }
}

// ==============================================
// 3. CARGAR CATEGORÍAS
// ==============================================
async function cargarCategorias() {
    try {
        const response = await fetch(`${API_URL}/categorias`);
        const data = await response.json();
        
        if (data.success && data.data?.length > 0) {
            const container = document.getElementById('listaCategorias');
            const select = document.getElementById('searchCategoria');
            
            container.innerHTML = data.data.map(cat => `
                <div class="col-md-3 col-6 mb-3">
                    <a href="/sistema-alquiler/propiedades?categoria_id=${cat.id}" class="text-decoration-none">
                        <div class="card categoria-card text-center p-3 h-100">
                            <div class="categoria-icon">
                                <i class="fas fa-${getIconoCategoria(cat.nombre)} fa-2x"></i>
                            </div>
                            <h6 class="mt-2 mb-0">${cat.nombre}</h6>
                            <small class="text-muted">0 propiedades</small>
                        </div>
                    </a>
                </div>
            `).join('');
            
            select.innerHTML = '<option value="">Todas las categorías</option>' + 
                data.data.map(cat => `<option value="${cat.id}">${cat.nombre}</option>`).join('');
        }
    } catch (error) {
        console.error('Error cargando categorías:', error);
    }
}

// ==============================================
// 4. CARGAR SERVICIOS
// ==============================================
async function cargarServicios() {
    try {
        const response = await fetch(`${API_URL}/servicios`);
        const data = await response.json();
        
        if (data.success && data.data?.length > 0) {
            const container = document.getElementById('listaServicios');
            const servicios = data.data.slice(0, 8);
            
            const iconos = ['wifi', 'snowflake', 'fire', 'swimming-pool', 'car', 'tv', 'utensils', 'shower'];
            
            container.innerHTML = servicios.map((serv, i) => `
                <div class="col-md-3 col-sm-6 mb-3">
                    <div class="servicio-item text-center p-3">
                        <i class="fas fa-${iconos[i % iconos.length]} servicio-icon"></i>
                        <h6>${serv.nombre}</h6>
                    </div>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Error cargando servicios:', error);
    }
}

// ==============================================
// 5. ÍCONOS POR CATEGORÍA
// ==============================================
function getIconoCategoria(nombre) {
    const iconos = {
        'casa': 'home',
        'departamento': 'building',
        'cabaña': 'tree',
        'ph': 'building',
        'oficina': 'briefcase',
        'local': 'store',
        'quincho': 'tree',
        'cochera': 'car',
        'terreno': 'map',
        'chalet': 'home'
    };
    return iconos[nombre.toLowerCase()] || 'tag';
}

// ==============================================
// 6. INICIALIZAR
// ==============================================
document.addEventListener('DOMContentLoaded', function() {
    cargarEstadisticas();
    cargarPropiedadesDestacadas();
    cargarCategorias();
    cargarServicios();
});
</script>

<!-- ============================================ -->
<!-- ESTILOS CSS                                  -->
<!-- ============================================ -->
<style>
/* ========== PALETA VERDE-AZUL ========== */
:root {
    --teal-dark: #0f766e;
    --teal: #0d9488;
    --teal-light: #14b8a6;
    --teal-soft: #ccfbf1;
    --teal-bg: #f0fdf4;
    --emerald: #059669;
    --emerald-light: #10b981;
    --navy: #1e293b;
    --white: #ffffff;
}

/* Hero */
.hero {
    background: linear-gradient(135deg, #0f766e 0%, #059669 50%, #0d9488 100%);
    position: relative;
    overflow: hidden;
    min-height: 100vh;
    display: flex;
    align-items: center;
}

.hero .container {
    position: relative;
    z-index: 2;
}

.hero::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -20%;
    width: 60%;
    height: 200%;
    background: rgba(255,255,255,0.05);
    transform: rotate(15deg);
    border-radius: 50%;
}

.wave-divider {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 1;
}

.wave-divider svg {
    display: block;
    width: 100%;
}

/* Badges */
.bg-teal-light {
    background-color: var(--teal-soft) !important;
}
.bg-teal-soft {
    background-color: var(--teal-soft) !important;
}
.text-teal-dark {
    color: var(--teal-dark) !important;
}
.text-teal-dark-50 {
    color: rgba(15, 118, 110, 0.7) !important;
}
.text-teal-light {
    color: var(--teal-light) !important;
}
.bg-teal {
    background-color: var(--teal) !important;
}

/* Search Box */
.search-box {
    background: white;
    border-radius: 60px !important;
    box-shadow: 0 20px 60px rgba(15, 118, 110, 0.15) !important;
    padding: 8px !important;
}

.search-box .input-group {
    background: #f8f9fa;
    border-radius: 50px;
    transition: all 0.3s ease;
}

.search-box .input-group:focus-within {
    background: white;
    box-shadow: 0 0 0 3px rgba(15, 118, 110, 0.1);
}

.search-box .input-group-text {
    color: #0f766e;
    font-size: 1.1rem;
    padding-left: 15px;
    padding-right: 5px;
}

.search-box .form-control,
.search-box .form-select {
    border: none;
    background: transparent;
    padding: 12px 15px 12px 0;
    height: 54px;
    font-size: 1rem;
    color: #333;
}

.search-box .form-control:focus,
.search-box .form-select:focus {
    box-shadow: none;
    background: transparent;
}

.search-box .form-control::placeholder {
    color: #adb5bd;
    font-weight: 400;
}

.search-box .btn-primary {
    background: linear-gradient(135deg, #0f766e 0%, #059669 100%);
    border: none;
    color: #fff;
    height: 54px;
    border-radius: 50px !important;
    font-weight: 600;
    font-size: 1rem;
    transition: all 0.3s ease;
}

.search-box .btn-primary:hover {
    background: linear-gradient(135deg, #0d9488 0%, #10b981 100%);
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(5, 150, 105, 0.4);
}

/* Botones */
.btn-primary {
    background: linear-gradient(135deg, #0f766e 0%, #059669 100%);
    border: none;
    color: #fff;
    transition: all 0.3s ease;
}

.btn-primary:hover {
    background: linear-gradient(135deg, #0d9488 0%, #10b981 100%);
    transform: translateY(-2px);
    box-shadow: 0 5px 20px rgba(5, 150, 105, 0.4);
}

.btn-teal {
    background: linear-gradient(135deg, #0f766e 0%, #059669 100%);
    border: none;
    color: #fff;
    padding: 0.5rem 1rem;
    border-radius: 10px;
    transition: all 0.3s ease;
}

.btn-teal:hover {
    background: linear-gradient(135deg, #0d9488 0%, #10b981 100%);
    color: #fff;
    transform: translateY(-2px);
    box-shadow: 0 5px 20px rgba(5, 150, 105, 0.4);
}

/* Propiedad Card */
.propiedad-card {
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    border: none;
    border-radius: 16px;
    overflow: hidden;
}

.propiedad-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 40px rgba(15, 118, 110, 0.15) !important;
}

.propiedad-card .card-footer {
    background: transparent;
    border-top: 1px solid rgba(15, 118, 110, 0.05);
}

/* Categoría Card */
.categoria-card {
    border: 1px solid #e9ecef;
    border-radius: 16px;
    transition: all 0.3s ease;
    background: #fff;
}

.categoria-card:hover {
    background: linear-gradient(135deg, #0f766e 0%, #059669 100%);
    color: #fff;
    transform: translateY(-5px);
    border-color: transparent;
    box-shadow: 0 10px 30px rgba(15, 118, 110, 0.3);
}

.categoria-card:hover .text-muted {
    color: rgba(255,255,255,0.7) !important;
}

.categoria-card:hover .categoria-icon {
    color: #fff !important;
}

.categoria-icon {
    color: var(--teal-dark);
}

/* Servicio Item */
.servicio-item {
    transition: all 0.3s ease;
    border-radius: 16px;
    background: #fff;
    box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}

.servicio-item:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 30px rgba(15, 118, 110, 0.1);
}

.servicio-icon {
    color: var(--teal-dark);
    font-size: 2.5rem;
    margin-bottom: 10px;
}

/* Estadísticas */
.estadisticas {
    background: linear-gradient(135deg, #0f766e 0%, #059669 50%, #0d9488 100%);
}

.estadisticas .display-1 {
    font-size: 4rem;
    font-weight: 700;
}

/* Navbar */
.navbar {
    background-color: var(--navy) !important;
}

/* Footer */
footer {
    background-color: var(--navy) !important;
}

/* Responsive */
@media (max-width: 768px) {
    .hero {
        min-height: auto;
        padding: 120px 0 60px;
    }
    
    .search-box {
        border-radius: 20px !important;
        padding: 15px !important;
    }
    
    .search-box .input-group {
        border-radius: 12px;
        margin-bottom: 8px;
    }
    
    .search-box .form-control,
    .search-box .form-select {
        height: 48px;
        font-size: 0.95rem;
    }
    
    .search-box .btn-primary {
        height: 48px;
        border-radius: 12px !important;
    }
    
    .estadisticas .display-1 {
        font-size: 2.5rem;
    }
    
    .wave-divider {
        display: none;
    }
}
</style>