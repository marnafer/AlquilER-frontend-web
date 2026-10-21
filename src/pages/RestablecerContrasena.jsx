import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { restablecerContrasena, confirmarCambioContrasena } from '../services/api';
import { useSEO } from '../hooks/useSEO';

function RestablecerContrasena() {
    useSEO('Restablecer contraseña', 'Elegí una nueva contraseña para tu cuenta de AlquilER.', { noindex: true });
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const token = searchParams.get('token') || '';
    const email = searchParams.get('email') || '';
    const esConfirmacion = searchParams.get('confirmar') === '1';

    const [contrasena, setContrasena] = useState('');
    const [confirmacion, setConfirmacion] = useState('');
    const [error, setError] = useState('');
    const [validationErrors, setValidationErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const [estadoConfirmacion, setEstadoConfirmacion] = useState('cargando');
    const [mensajeConfirmacion, setMensajeConfirmacion] = useState('');

    useEffect(() => {
        if (!esConfirmacion) return;

        let activo = true;

        (async () => {
            if (!token || !email) {
                if (!activo) return;
                setEstadoConfirmacion('error');
                setMensajeConfirmacion('El enlace de confirmación es inválido. Solicitá uno nuevo.');
                return;
            }

            try {
                const result = await confirmarCambioContrasena({ email, token });

                if (!activo) return;

                if (result.success) {
                    setEstadoConfirmacion('exito');
                } else {
                    setEstadoConfirmacion('error');
                    setMensajeConfirmacion(
                        result.error || result.message || 'No se pudo confirmar el cambio de contraseña'
                    );
                }
            } catch (err) {
                if (!activo) return;
                setEstadoConfirmacion('error');
                setMensajeConfirmacion('Error de conexión');
            }
        })();

        return () => { activo = false; };
    }, [esConfirmacion, token, email]);

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

    if (esConfirmacion) {
        return (
            <div className="auth-container" style={{ maxWidth: '440px', margin: '40px auto', padding: '40px' }}>
                <h1 style={{ fontSize: '28px', fontWeight: '700', textAlign: 'center', marginBottom: '8px' }}>
                    Cambio de contraseña
                </h1>

                {estadoConfirmacion === 'cargando' && (
                    <p style={{ textAlign: 'center', color: 'var(--gray-500)', marginTop: '24px' }}>
                        Confirmando el cambio de tu contraseña...
                    </p>
                )}

                {estadoConfirmacion === 'exito' && (
                    <>
                        <div className="alert alert-success" style={{ marginTop: '24px' }}>
                            Tu contraseña se cambió correctamente. Ya podés iniciar
                            sesión con tu nueva contraseña.
                        </div>
                        <Link
                            to="/login"
                            className="btn-primary"
                            style={{ display: 'block', textAlign: 'center', marginTop: '16px' }}
                        >
                            Ir a iniciar sesión
                        </Link>
                    </>
                )}

                {estadoConfirmacion === 'error' && (
                    <>
                        <div className="alert alert-error" style={{ marginTop: '24px' }}>
                            {mensajeConfirmacion}
                        </div>
                        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: 'var(--gray-500)' }}>
                            <Link to="/recuperar-contrasena" style={{ color: 'var(--primary-ink)', fontWeight: '600' }}>
                                Solicitar un nuevo enlace
                            </Link>
                        </p>
                    </>
                )}
            </div>
        );
    }

    return (
        <div className="auth-container" style={{ maxWidth: '440px', margin: '40px auto', padding: '40px' }}>
            <h1 style={{ fontSize: '28px', fontWeight: '700', textAlign: 'center', marginBottom: '8px' }}>
                Nueva contraseña
            </h1>
            <p style={{ textAlign: 'center', color: 'var(--gray-500)', marginBottom: '32px' }}>
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
                        autoComplete="new-password"
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
                        autoComplete="new-password"
                        required
                    />
                </div>

                <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={loading}>
                    {loading ? 'Guardando...' : 'Restablecer contraseña'}
                </button>
            </form>

            <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: 'var(--gray-500)' }}>
                ¿Recordás tu contraseña?{' '}
                <Link to="/login" style={{ color: 'var(--primary-ink)', fontWeight: '600' }}>Iniciá sesión</Link>
            </p>
        </div>
    );
}

export default RestablecerContrasena;
