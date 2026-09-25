import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { restablecerContrasena } from '../services/api';

function RestablecerContrasena() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const [contrasena, setContrasena] = useState('');
    const [confirmacion, setConfirmacion] = useState('');
    const [error, setError] = useState('');
    const [validationErrors, setValidationErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const token = searchParams.get('token') || '';
    const email = searchParams.get('email') || '';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setValidationErrors({});

        if (contrasena !== confirmacion) {
            setError('Las contraseñas no coinciden');
            return;
        }

        if (!token || !email) {
            setError('El enlace de recuperación es inválido. Solicitá uno nuevo.');
            return;
        }

        setLoading(true);

        try {
            const result = await restablecerContrasena({
                email,
                token,
                contrasena
            });

            if (result.success) {
                navigate('/login', {
                    state: {
                        mensaje: 'Contraseña restablecida correctamente. Iniciá sesión con tu nueva contraseña.'
                    }
                });
            } else {
                if (result.validation_errors) {
                    setValidationErrors(result.validation_errors);
                } else {
                    setError(result.error || result.message || 'No se pudo restablecer la contraseña');
                }
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
                Nueva contraseña
            </h1>
            <p style={{ textAlign: 'center', color: '#64748b', marginBottom: '32px' }}>
                Elegí una contraseña nueva para tu cuenta
            </p>

            {error && (
                <div className="alert alert-error">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
                <div className="form-group">
                    <label htmlFor="contrasena">Nueva contraseña</label>
                    <input
                        type="password"
                        id="contrasena"
                        placeholder="••••••••"
                        value={contrasena}
                        onChange={(e) => setContrasena(e.target.value)}
                        required
                    />
                    {validationErrors.contrasena && (
                        <span className="contact-form-error">{validationErrors.contrasena}</span>
                    )}
                </div>

                <div className="form-group">
                    <label htmlFor="confirmacion">Confirmá la contraseña</label>
                    <input
                        type="password"
                        id="confirmacion"
                        placeholder="••••••••"
                        value={confirmacion}
                        onChange={(e) => setConfirmacion(e.target.value)}
                        required
                    />
                </div>

                <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={loading}>
                    {loading ? 'Guardando...' : 'Restablecer contraseña'}
                </button>
            </form>

            <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: '#64748b' }}>
                ¿Recordás tu contraseña?{' '}
                <Link to="/login" style={{ color: '#0d9488', fontWeight: '600' }}>Iniciá sesión</Link>
            </p>
        </div>
    );
}

export default RestablecerContrasena;