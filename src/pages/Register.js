import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { register } from '../services/api';

function Register() {
    const [formData, setFormData] = useState({
        nombre: '',
        apellido: '',
        email: '',
        password: '',
        password_confirm: '',
        telefono: '',
        domicilio: '',
        rol: 'inquilino'
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login: authLogin } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (formData.password !== formData.password_confirm) {
            setError('Las contraseñas no coinciden');
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
            domicilio: formData.domicilio,
            rol: formData.rol
        };

        try {
            const result = await register(dataToSend);
            
            if (result.success && result.token) {
                authLogin(result.token);
                navigate('/dashboard');
            } else {
                setError(result.message || 'Error al registrarse');
            }
        } catch (error) {
            setError('Error de conexión');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container" style={{ maxWidth: '480px', margin: '40px auto', padding: '40px' }}>
            <h1 style={{ fontSize: '28px', fontWeight: '700', textAlign: 'center', marginBottom: '8px' }}>Crear cuenta</h1>
            <p style={{ textAlign: 'center', color: '#64748b', marginBottom: '32px' }}>Registrate para empezar a alquilar</p>

            {error && (
                <div className="alert alert-error">
                    {error}
                </div>
            )}

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
                        placeholder="Mínimo 6 caracteres"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        minLength="6"
                    />
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
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="rol">Tipo de usuario</label>
                    <select
                        id="rol"
                        name="rol"
                        value={formData.rol}
                        onChange={handleChange}
                    >
                        <option value="inquilino">Inquilino - Busco alquilar</option>
                        <option value="propietario">Propietario - Quiero alquilar mi propiedad</option>
                    </select>
                </div>

                <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={loading}>
                    {loading ? 'Cargando...' : 'Crear cuenta'}
                </button>
            </form>

            <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: '#64748b' }}>
                ¿Ya tenés cuenta? <Link to="/login" style={{ color: '#0d9488', fontWeight: '600' }}>Iniciá sesión</Link>
            </p>
        </div>
    );
}

export default Register;