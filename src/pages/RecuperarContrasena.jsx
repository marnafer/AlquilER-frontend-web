import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { recuperarContrasena } from '../services/api';

function RecuperarContrasena() {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [enviado, setEnviado] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const result = await recuperarContrasena(email);

            if (result.success) {
                setEnviado(true);
            } else {
                setError(
                    result.error
                    || result.message
                    || 'No se pudo enviar el correo'
                );
            }
        } catch (err) {
            setError('Error de conexión');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container" style={{ maxWidth: '440px', margin: '40px auto', padding: '40px' }}>
            <h1 style={{ fontSize: '28px', fontWeight: '700', textAlign: 'center', marginBottom: '8px' }}>
                Recuperar contraseña
            </h1>
            <p style={{ textAlign: 'center', color: '#64748b', marginBottom: '32px' }}>
                Ingresá tu correo y te enviaremos un enlace para restablecerla
            </p>

            {enviado ? (
                <div className="alert alert-success">
                    <i className="fas fa-envelope-open-text"></i> Si el correo existe,
                    recibirás un enlace para restablecer tu contraseña. Revisá tu bandeja
                    de entrada o la carpeta de spam.
                </div>
            ) : (
                <>
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

                        <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={loading}>
                            {loading ? 'Enviando...' : 'Enviar enlace de recuperación'}
                        </button>
                    </form>
                </>
            )}

            <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: '#64748b' }}>
                ¿Recordás tu contraseña?{' '}
                <Link to="/login" style={{ color: '#0d9488', fontWeight: '600' }}>Iniciá sesión</Link>
            </p>
        </div>
    );
}

export default RecuperarContrasena;