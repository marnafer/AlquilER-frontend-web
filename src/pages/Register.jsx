import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../services/api';
import { useUI } from '../context/UIContext';
import { useSEO } from '../hooks/useSEO';

// Calcula la fuerza de una contraseña (0..4) según longitud,
// mayúsculas, números y caracteres especiales.
function fuerzaPassword(password) {
    if (!password) return null;
    let puntaje = 0;
    if (password.length >= 8) puntaje++;
    if (/[A-ZÁÉÍÓÚÑ]/.test(password)) puntaje++;
    if (/[0-9]/.test(password)) puntaje++;
    if (/[^A-Za-zÁÉÍÓÚÑáéíóúñ0-9]/.test(password)) puntaje++;
    const niveles = [
        { etiqueta: 'Muy débil', color: '#ef4444' },
        { etiqueta: 'Débil', color: '#f97316' },
        { etiqueta: 'Media', color: '#eab308' },
        { etiqueta: 'Fuerte', color: '#22c55e' },
        { etiqueta: 'Muy fuerte', color: '#16a34a' }
    ];
    return { puntaje, ...niveles[puntaje] };
}

function Register() {
    useSEO('Crear cuenta', 'Registrate gratis en AlquilER para publicar propiedades o reservar tu próxima vivienda.', { noindex: true });
    const [formData, setFormData] = useState({
        nombre: '',
        apellido: '',
        email: '',
        password: '',
        password_confirm: '',
        telefono: '',
        domicilio: '',
        acepta_privacidad: false
    });
    const [loading, setLoading] = useState(false);
    const { showToast } = useUI();
    const navigate = useNavigate();

    const primerErrorValidacion = (result) => {
        const validationErrors = result?.validation_errors;
        if (!validationErrors) return '';
        const primerCampo = Object.values(validationErrors)[0];
        return Array.isArray(primerCampo) && primerCampo.length > 0 ? primerCampo[0] : '';
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (formData.password !== formData.password_confirm) {
            showToast('Las contraseñas no coinciden', 'error');
            setLoading(false);
            return;
        }

        // El backend exige teléfono (6-15 dígitos) y domicilio (mínimo 5 caracteres)
        const telefonoDigitos = (formData.telefono || '').replace(/\D/g, '');
        if (telefonoDigitos.length < 6) {
            showToast('El teléfono debe tener al menos 6 dígitos', 'error');
            setLoading(false);
            return;
        }
        if (telefonoDigitos.length > 15) {
            showToast('El teléfono no puede superar los 15 dígitos', 'error');
            setLoading(false);
            return;
        }
        if ((formData.domicilio || '').trim().length < 5) {
            showToast('El domicilio debe tener al menos 5 caracteres', 'error');
            setLoading(false);
            return;
        }

        if (!formData.acepta_privacidad) {
            showToast('Debés aceptar la política de privacidad para registrarte', 'error');
            setLoading(false);
            return;
        }

        // Datos que se envían al backend
        const dataToSend = {
            nombre: formData.nombre,
            apellido: formData.apellido,
            email: formData.email,
            password: formData.password,
            telefono: formData.telefono,
            domicilio: formData.domicilio
        };

        try {
            const result = await register(dataToSend);

            if (result.success) {
                showToast('Usuario registrado. Te enviamos un correo para verificar tu cuenta.');
                setTimeout(() => navigate('/login'), 2000);
            } else {
                showToast(primerErrorValidacion(result) || result.error || result.message || 'Error al registrarse', 'error');
            }
        } catch (error) {
            showToast('Error de conexión', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container" style={{ maxWidth: '480px', margin: '40px auto', padding: '40px' }}>
            <h1 style={{ fontSize: '28px', fontWeight: '700', textAlign: 'center', marginBottom: '8px' }}>Crear cuenta</h1>
            <p style={{ textAlign: 'center', color: 'var(--gray-500)', marginBottom: '32px' }}>Registrate para alquilar o publicar propiedades</p>

            <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div className="form-group">
                        <label htmlFor="nombre">Nombre</label>
                        <input
                            type="text"
                            id="nombre"
                            name="nombre"
                            placeholder="Tu nombre"
                            value={formData.nombre}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="apellido">Apellido</label>
                        <input
                            type="text"
                            id="apellido"
                            name="apellido"
                            placeholder="Tu apellido"
                            value={formData.apellido}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="email">Correo electrónico</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        placeholder="ejemplo@correo.com"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="password">Contraseña</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        placeholder="Mínimo 8 caracteres, 1 mayúscula y 1 número"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        minLength="8"
                    />
                    {(() => {
                        const fuerza = fuerzaPassword(formData.password);
                        if (!fuerza) return null;
                        return (
                            <div style={{ marginTop: '6px' }} aria-live="polite">
                                <div style={{ height: '6px', borderRadius: '3px', background: '#e5e7eb', overflow: 'hidden' }}>
                                    <div style={{ width: `${fuerza.puntaje * 25}%`, height: '100%', background: fuerza.color, transition: 'width .2s ease' }} />
                                </div>
                                <small style={{ color: fuerza.color, fontSize: '12px', fontWeight: 600 }}>{fuerza.etiqueta}</small>
                            </div>
                        );
                    })()}
                </div>

                <div className="form-group">
                    <label htmlFor="password_confirm">Confirmar contraseña</label>
                    <input
                        type="password"
                        id="password_confirm"
                        name="password_confirm"
                        placeholder="Repetí tu contraseña"
                        value={formData.password_confirm}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="telefono">Teléfono</label>
                    <input
                        type="tel"
                        id="telefono"
                        name="telefono"
                        placeholder="Ej: 341 1234567"
                        value={formData.telefono}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="domicilio">Domicilio</label>
                    <input
                        type="text"
                        id="domicilio"
                        name="domicilio"
                        placeholder="Ej: Av. San Martín 123"
                        value={formData.domicilio}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group" style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '16px' }}>
                    <input
                        type="checkbox"
                        id="acepta_privacidad"
                        name="acepta_privacidad"
                        checked={formData.acepta_privacidad}
                        onChange={(e) => setFormData({ ...formData, acepta_privacidad: e.target.checked })}
                        required
                        style={{ marginTop: '4px' }}
                    />
                    <label htmlFor="acepta_privacidad" style={{ fontSize: '14px', lineHeight: '1.4' }}>
                        Acepto la <Link to="/privacidad" target="_blank" rel="noopener noreferrer">política de privacidad</Link> y el tratamiento de mis datos personales.
                    </label>
                </div>

                <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={loading}>
                    {loading ? 'Cargando...' : 'Crear cuenta'}
                </button>
            </form>

            <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: 'var(--gray-500)' }}>
                ¿Ya tenés cuenta?                 <Link to="/login" style={{ color: 'var(--primary-ink)', fontWeight: '600' }}>Iniciá sesión</Link>
            </p>
        </div>
    );
}

export default Register;