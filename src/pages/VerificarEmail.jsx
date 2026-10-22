import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { verificarEmail } from '../services/api';
import { useSEO } from '../hooks/useSEO';

function VerificarEmail() {
    useSEO('Verificar correo', 'Verific? tu correo electr?nico para activar tu cuenta de AlquilER.', { noindex: true });
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const token = searchParams.get('token') || '';
    const email = searchParams.get('email') || '';

    const [estado, setEstado] = useState('cargando');
    const [mensaje, setMensaje] = useState('');

    useEffect(() => {
        let activo = true;

        (async () => {
            if (!token || !email) {
                if (!activo) return;
                setEstado('error');
                setMensaje('El enlace de verificaci?n es inv?lido. Solicit? uno nuevo.');
                return;
            }

            try {
                const result = await verificarEmail(token, email);

                if (!activo) return;

                if (result.success) {
                    setEstado('exito');
                    setMensaje(result.message || 'Tu correo se verific? correctamente.');
                } else {
                    setEstado('error');
                    setMensaje(result.error || result.message || 'No se pudo verificar el correo.');
                }
            } catch (err) {
                if (!activo) return;
                setEstado('error');
                setMensaje('Error de conexi?n');
            }
        })();

        return () => { activo = false; };
    }, [token, email]);

    return (
        <div className="auth-container" style={{ maxWidth: '440px', margin: '40px auto', padding: '40px' }}>
            <h1 style={{ fontSize: '28px', fontWeight: '700', textAlign: 'center', marginBottom: '8px' }}>
                Verificaci?n de correo
            </h1>

            {estado === 'cargando' && (
                <p style={{ textAlign: 'center', color: 'var(--gray-500)', marginTop: '24px' }}>
                    Verificando tu correo electr?nico...
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
                        Ir a iniciar sesi?n
                    </Link>
                </>
            )}

            {estado === 'error' && (
                <>
                    <div className="alert alert-error" style={{ marginTop: '24px' }}>
                        {mensaje}
                    </div>
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
