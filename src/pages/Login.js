import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { login } from '../services/api';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login: authLogin } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const result = await login(email, password);
            console.log('Respuesta del backend:', result);

            // El backend devuelve { success: true, data: { token: ... } }
            if (result.success && result.data && result.data.token) {
                authLogin(result.data.token);
                navigate('/dashboard');
            } else {
                setError(result.message || 'Error al iniciar sesión');
            }
        } catch (error) {
            console.error('Error en login:', error);
            setError('Error de conexión');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container" style={{ maxWidth: '440px', margin: '40px auto', padding: '40px' }}>
            <h1 style={{ fontSize: '28px', fontWeight: '700', textAlign: 'center', marginBottom: '8px' }}>Iniciar Sesión</h1>
            <p style={{ textAlign: 'center', color: '#64748b', marginBottom: '32px' }}>Ingresá tus credenciales para continuar</p>

            {error && (
                <div className="alert alert-error">
                    {error}
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
                </div>

                <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={loading}>
                    {loading ? 'Cargando...' : 'Iniciar sesión'}
                </button>
            </form>

            <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: '#64748b' }}>
                ¿No tenés cuenta? <Link to="/register" style={{ color: '#0d9488', fontWeight: '600' }}>Registrate</Link>
            </p>
        </div>
    );
}

export default Login;