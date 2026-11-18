import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { verificarEmail, reenviarVerificacion } from '../services/api';
import { useSEO } from '../hooks/useSEO';

function VerificarEmail() {
    useSEO('Verificar correo', 'Verificá tu correo electrónico para activar tu cuenta de AlquilER.', { noindex: true });
    const [searchParams] = useSearchParams();

    const token = searchParams.get('token') || '';
    const email = searchParams.get('email') || '';

    const [estado, setEstado] = useState('cargando');
    const [mensaje, setMensaje] = useState('');
    const [reenviando, setReenviando] = useState(false);
    const [mensajeReenvio, setMensajeReenvio] = useState('');

    useEffect(() => {
        let activo = true;

        (async () => {
            if (!token || !email) {
                if (!activo) return;
                setEstado('error');
                setMensaje('El enlace de verificación es inválido. Faltan datos.');
                return;
            }

            try {
                const result = await verificarEmail(token, email);

                if (!activo) return;

                if (result.success) {
                    setEstado('exito');
                    setMensaje(result.message || 'Tu correo se verificó correctamente.');
                } else {
                    setEstado('error');
                    setMensaje(result.error || result.message || 'No se pudo verificar el correo.');
                }
            } catch (err) {
                if (!activo) return;
                setEstado('error');
                setMensaje('Error de conexión');
            }
        })();

        return () => { activo = false; };
    }, [token, email]);

    const handleReenviar = async () => {
        if (!email || reenviando) return;

        setReenviando(true);
        setMensajeReenvio('');

        try {
            const result = await reenviarVerificacion(email);
            if (result.success) {
                setMensajeReenvio('Te enviamos un nuevo enlace. Revisá tu correo (y spam).');
            } else {
                setMensajeReenvio(result.error || result.message || 'No se pudo reenviar el correo.');
            }
        } catch {
            setMensajeReenvio('Error de conexión al reenviar.');
        } finally {
            setReenviando(false);
        }
    };

    return (
        <div className="auth-container" style={{ maxWidth: '440px', margin: '40px auto', padding: '40px' }}>
            <h1 style={{ fontSize: '28px', fontWeight: '700', textAlign: 'center', marginBottom: '8px' }}>
                Verificación de correo
            </h1>

            {estado === 'cargando' && (
                <p style={{ textAlign: 'center', color: 'var(--gray-500)', marginTop: '24px' }}>
                    Verificando tu correo electrónico...
                </p>
            )}

            {estado === 'exito' && (
                <>
                    <div className="alert alert-success" style={{ marginTop: '24px' }}>
                        {mensaje}
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

            {estado === 'error' && (
                <>
                    <div className="alert alert-error" style={{ marginTop: '24px' }}>
                        {mensaje}
                    </div>

                    {email && (
                        <button
                            type="button"
                            className="btn-primary"
                            onClick={handleReenviar}
                            disabled={reenviando}
                            style={{ display: 'block', width: '100%', textAlign: 'center', marginTop: '16px' }}
                        >
                            {reenviando ? 'Reenviando...' : 'Reenviar correo de verificación'}
                        </button>
                    )}

                    {mensajeReenvio && (
                        <p style={{ textAlign: 'center', marginTop: '12px', fontSize: '14px', color: 'var(--gray-500)' }}>
                            {mensajeReenvio}
                        </p>
                    )}

                    <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: 'var(--gray-500)' }}>
                        <Link to="/register" style={{ color: 'var(--primary-ink)', fontWeight: '600' }}>
                            Volver a registrarse
                        </Link>
                    </p>
                </>
            )}
        </div>
    );
}

export default VerificarEmail;
