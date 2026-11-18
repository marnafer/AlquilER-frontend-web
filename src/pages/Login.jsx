import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useSEO } from '../hooks/useSEO';
import { login } from '../services/api';

function Login() {
    useSEO('Iniciar sesión', 'Entrá a tu cuenta de AlquilER para reservar propiedades y gestionar tus alquileres.', { noindex: true });
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login: authLogin } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const aviso = location.state?.mensaje || '';
    const errorRef = useRef(null);

    // Cuando aparece un error, se hace scroll para que sea visible
    // (en movil el formulario puede empujarlo fuera de la pantalla).
    useEffect(() => {
        if (error && errorRef.current) {
            errorRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [error]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const result = await login(email, password);

            // El backend establece las cookies HttpOnly al iniciar sesión.
            if (result.success) {
                authLogin(result.data?.access_token);
                navigate('/dashboard');
            } else {
                const mensaje = result.error || result.message || 'Error al iniciar sesión';
                // Mensaje mas claro y accionable para el caso de email no verificado.
                if (/verific/i.test(mensaje)) {
                    setError('Tu email aun no esta verificado. Revisa tu bandeja de entrada (y la carpeta de spam) para el enlace de verificacion y vuelve a intentar.');
                } else {
                    setError(mensaje);
                }
            }
        } catch (error) {
            console.error('Error en login:', error);
            setError('Error de conexión. Probá de nuevo en unos momentos.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container" style={{ maxWidth: '440px', margin: '40px auto', padding: '40px' }}>
            <h1 style={{ fontSize: '28px', fontWeight: '700', textAlign: 'center', marginBottom: '8px' }}>Iniciar Sesión</h1>
            <p style={{ textAlign: 'center', color: 'var(--gray-500)', marginBottom: '32px' }}>Ingresá tus credenciales para continuar</p>

            {error && (
                <div className="alert alert-error" ref={errorRef} role="alert">
                    {error}
                </div>
            )}

            {aviso && (
                <div className="alert alert-success">
                    {aviso}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="email">Correo electrónico</label>
                    <input
                        type="email"
                        id="email"
                        placeholder="ejemplo@correo.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="password">Contraseña</label>
                    <input
                        type="password"
                        id="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <div style={{ textAlign: 'right', marginTop: '4px' }}>
                        <Link
                            to="/recuperar-contrasena"
                            style={{ fontSize: '13px', color: 'var(--gray-500)' }}
                        >
                            ¿Olvidaste tu contraseña?
                        </Link>
                    </div>
                </div>

                <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={loading}>
                    {loading ? 'Cargando...' : 'Iniciar sesión'}
                </button>
            </form>

            <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: 'var(--gray-500)' }}>
                ¿No tenés cuenta?                 <Link to="/register" style={{ color: 'var(--primary-ink)', fontWeight: '600' }}>Registrate</Link>
            </p>
        </div>
    );
}

export default Login;