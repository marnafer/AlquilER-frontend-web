<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= $data['title'] ?? 'AlquilER' ?></title>
    
    <!-- Bootstrap 5 -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- Font Awesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <!-- Google Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
</head>
<body>

<!-- Navbar -->
<nav class="navbar navbar-expand-lg navbar-dark bg-dark fixed-top">
    <div class="container">
        <!-- ===== LOGO CON GRADIENTE NOTORIO ===== -->
        <a class="navbar-brand" href="/sistema-alquiler/home" style="font-size: 1.8rem; font-weight: 700; text-shadow: 0 2px 4px rgba(0,0,0,0.2);">
            <i class="fas fa-home" style="color: #14b8a6; margin-right: 10px; font-size: 1.6rem; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));"></i>
            <span style="background: linear-gradient(135deg, #059669 0%, #0d9488 40%, #14b8a6 70%, #34d399 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; font-size: 1.8rem;">
                AlquilER
            </span>
        </a>
        <!-- ===== FIN LOGO ===== -->
        
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
            <ul class="navbar-nav ms-auto">
                <li class="nav-item">
                    <a class="nav-link" href="/sistema-alquiler/home">Inicio</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="/sistema-alquiler/propiedades">Propiedades</a>
                </li>
                
                <?php if (isset($_SESSION['usuario_id'])): ?>
                    <li class="nav-item dropdown">
                        <a class="nav-link dropdown-toggle" href="#" data-bs-toggle="dropdown">
                            <i class="fas fa-user"></i> <?= $_SESSION['usuario_nombre'] ?? 'Usuario' ?>
                        </a>
                        <ul class="dropdown-menu dropdown-menu-end">
                            <li><a class="dropdown-item" href="/sistema-alquiler/perfil">Perfil</a></li>
                            <li><a class="dropdown-item" href="/sistema-alquiler/mis-propiedades">Mis Propiedades</a></li>
                            <li><a class="dropdown-item" href="/sistema-alquiler/favoritos">Favoritos</a></li>
                            <li><hr class="dropdown-divider"></li>
                            <li><a class="dropdown-item text-danger" href="/sistema-alquiler/logout">Cerrar Sesión</a></li>
                        </ul>
                    </li>
                <?php else: ?>
                    <li class="nav-item">
                        <a class="nav-link" href="/sistema-alquiler/login">Ingresar</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link btn btn-primary text-white ms-2" href="/sistema-alquiler/register">Registrarse</a>
                    </li>
                <?php endif; ?>
            </ul>
        </div>
    </div>
</nav>
<main class="main-content">

