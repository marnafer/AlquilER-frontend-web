<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Iniciar Sesión - AlquilarER</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        :root {
            --primary: #2563EB;
            --primary-dark: #1D4ED8;
            --primary-light: #60A5FA;
            --secondary: #1E293B;
            --gray-600: #475569;
            --gray-400: #94A3B8;
            --gray-100: #F1F5F9;
            --white: #FFFFFF;
            --shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
            --shadow-lg: 0 10px 25px -3px rgba(0,0,0,0.15);
            --radius: 12px;
            --transition: all 0.3s ease;
        }

        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: var(--gray-100);
            min-height: 100vh;
            display: flex;
            flex-direction: column;
        }

        /* ===== HEADER ===== */
        .header {
            background: var(--white);
            padding: 16px 40px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            box-shadow: var(--shadow);
            position: sticky;
            top: 0;
            z-index: 100;
        }

        .logo {
            font-size: 24px;
            font-weight: 700;
            color: var(--secondary);
            text-decoration: none;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .logo span {
            color: var(--primary);
        }

        .logo svg {
            width: 32px;
            height: 32px;
        }

        .nav-links {
            display: flex;
            gap: 24px;
            align-items: center;
        }

        .nav-links a {
            color: var(--gray-600);
            text-decoration: none;
            font-weight: 500;
            font-size: 14px;
            transition: var(--transition);
        }

        .nav-links a:hover {
            color: var(--primary);
        }

        .nav-links .btn-header {
            padding: 8px 20px;
            border-radius: 8px;
            background: var(--primary);
            color: var(--white);
            font-weight: 600;
        }

        .nav-links .btn-header:hover {
            background: var(--primary-dark);
            color: var(--white);
        }

        /* ===== MAIN ===== */
        .main {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 40px 20px;
        }

        .login-container {
            background: var(--white);
            border-radius: var(--radius);
            box-shadow: var(--shadow-lg);
            padding: 48px 40px;
            width: 100%;
            max-width: 420px;
        }

        .login-container h1 {
            font-size: 28px;
            font-weight: 700;
            color: var(--secondary);
            margin-bottom: 8px;
        }

        .login-container .subtitle {
            color: var(--gray-600);
            font-size: 14px;
            margin-bottom: 32px;
        }

        .form-group {
            margin-bottom: 20px;
        }

        .form-group label {
            display: block;
            font-weight: 500;
            font-size: 14px;
            color: var(--secondary);
            margin-bottom: 6px;
        }

        .form-group input {
            width: 100%;
            padding: 12px 16px;
            border: 2px solid #E2E8F0;
            border-radius: 8px;
            font-size: 15px;
            transition: var(--transition);
            font-family: inherit;
        }

        .form-group input:focus {
            outline: none;
            border-color: var(--primary);
            box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
        }

        .form-group input::placeholder {
            color: var(--gray-400);
        }

        .form-options {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 24px;
            font-size: 14px;
        }

        .form-options label {
            display: flex;
            align-items: center;
            gap: 8px;
            color: var(--gray-600);
            cursor: pointer;
        }

        .form-options a {
            color: var(--primary);
            text-decoration: none;
            font-weight: 500;
        }

        .form-options a:hover {
            text-decoration: underline;
        }

        .btn-primary {
            width: 100%;
            padding: 14px;
            background: var(--primary);
            color: var(--white);
            border: none;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: var(--transition);
        }

        .btn-primary:hover {
            background: var(--primary-dark);
            transform: translateY(-1px);
        }

        .btn-primary:active {
            transform: translateY(0);
        }

        .register-link {
            text-align: center;
            margin-top: 24px;
            font-size: 14px;
            color: var(--gray-600);
        }

        .register-link a {
            color: var(--primary);
            font-weight: 600;
            text-decoration: none;
        }

        .register-link a:hover {
            text-decoration: underline;
        }

        .alert {
            padding: 12px 16px;
            border-radius: 8px;
            margin-bottom: 20px;
            font-size: 14px;
        }

        .alert-error {
            background: #FEE2E2;
            color: #DC2626;
            border: 1px solid #FECACA;
        }

        .alert-success {
            background: #DCFCE7;
            color: #16A34A;
            border: 1px solid #BBF7D0;
        }

        /* ===== FOOTER ===== */
        .footer {
            text-align: center;
            padding: 24px;
            color: var(--gray-400);
            font-size: 13px;
            border-top: 1px solid #E2E8F0;
            background: var(--white);
        }

        /* ===== RESPONSIVE ===== */
        @media (max-width: 640px) {
            .header {
                padding: 12px 20px;
                flex-wrap: wrap;
                gap: 12px;
            }

            .nav-links {
                gap: 12px;
                flex-wrap: wrap;
            }

            .login-container {
                padding: 32px 24px;
            }

            .login-container h1 {
                font-size: 24px;
            }

            .form-options {
                flex-direction: column;
                gap: 12px;
                align-items: flex-start;
            }
        }
    </style>
</head>
<body>

    <!-- ===== HEADER ===== -->
    <header class="header">
        <a href="/" class="logo">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1m-2 0h2" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Alquilar<span>ER</span>
        </a>
        <nav class="nav-links">
            <a href="/">Inicio</a>
            <a href="/propiedades">Propiedades</a>
            <a href="/login" class="btn-header">Ingresar</a>
            <a href="/register" style="background: var(--gray-100); color: var(--secondary); padding: 8px 20px; border-radius: 8px; font-weight: 600;">Registrarse</a>
        </nav>
    </header>

    <!-- ===== MAIN ===== -->
    <main class="main">
        <div class="login-container">
            <h1>Bienvenido 👋</h1>
            <p class="subtitle">Iniciá sesión para continuar</p>

            <?php if (isset($_SESSION['error'])): ?>
                <div class="alert alert-error"><?= htmlspecialchars($_SESSION['error']); unset($_SESSION['error']); ?></div>
            <?php endif; ?>

            <?php if (isset($_SESSION['success'])): ?>
                <div class="alert alert-success"><?= htmlspecialchars($_SESSION['success']); unset($_SESSION['success']); ?></div>
            <?php endif; ?>

            <form method="POST" action="/login">
                <div class="form-group">
                    <label for="email">Correo electrónico</label>
                    <input type="email" id="email" name="email" placeholder="ejemplo@correo.com" required autofocus>
                </div>

                <div class="form-group">
                    <label for="password">Contraseña</label>
                    <input type="password" id="password" name="password" placeholder="••••••••" required>
                </div>

                <div class="form-options">
                    <label>
                        <input type="checkbox" name="remember"> Recordarme
                    </label>
                    <a href="/recuperar-contrasena">¿Olvidaste tu contraseña?</a>
                </div>

                <button type="submit" class="btn-primary">Iniciar sesión</button>
            </form>

            <p class="register-link">
                ¿No tenés cuenta? <a href="/register">Registrate</a>
            </p>
        </div>
    </main>

    <!-- ===== FOOTER ===== -->
    <footer class="footer">
        &copy; <?= date('Y') ?> AlquilarER - Todos los derechos reservados
    </footer>

</body>
</html>