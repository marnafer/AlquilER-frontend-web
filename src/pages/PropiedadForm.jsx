import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { 
    getCategorias, 
    getLocalidades, 
    createPropiedad, 
    updatePropiedad, 
    getPropiedad 
} from '../services/api';
import Loader from '../components/Loader';

function PropiedadForm() {
    const { id } = useParams(); // undefined si es crear, valor si es editar
    const esEdicion = Boolean(id);
    const navigate = useNavigate();
    const { token } = useAuth();

    const [loading, setLoading] = useState(true);
    const [guardando, setGuardando] = useState(false);
    const [error, setError] = useState('');
    const [categorias, setCategorias] = useState([]);
    const [localidades, setLocalidades] = useState([]);

    const [formData, setFormData] = useState({
        titulo: '',
        descripcion: '',
        precio: '',
        expensas: '',
        direccion: '',
        cantidad_ambientes: 1,
        cantidad_dormitorios: 1,
        cantidad_banos: 1,
        capacidad: '',
        disponible: 1,
        categoria_id: '',
        localidad_id: ''
    });

    useEffect(() => {
        cargarCatalogos();
        if (esEdicion) {
            cargarPropiedad();
        } else {
            setLoading(false);
        }
    }, [id]);

    const cargarCatalogos = async () => {
        try {
            const [cats, locs] = await Promise.all([
                getCategorias(),
                getLocalidades()
            ]);
            setCategorias(cats);
            setLocalidades(locs);
        } catch (err) {
            console.error('Error cargando catálogos:', err);
        }
    };

    const cargarPropiedad = async () => {
        try {
            const prop = await getPropiedad(id);
            if (prop) {
                setFormData({
                    titulo: prop.titulo || '',
                    descripcion: prop.descripcion || '',
                    precio: prop.precio || '',
                    expensas: prop.expensas || '',
                    direccion: prop.direccion || '',
                    cantidad_ambientes: prop.cantidad_ambientes || 1,
                    cantidad_dormitorios: prop.cantidad_dormitorios || 1,
                    cantidad_banos: prop.cantidad_banos || 1,
                    capacidad: prop.capacidad || '',
                    disponible: prop.disponible ? 1 : 0,
                    categoria_id: prop.categoria_id || '',
                    localidad_id: prop.localidad_id || ''
                });
            }
        } catch (err) {
            setError('No se pudo cargar la propiedad');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setGuardando(true);

        try {
            const payload = {
                ...formData,
                precio: Number(formData.precio),
                expensas: Number(formData.expensas) || 0,
                cantidad_ambientes: Number(formData.cantidad_ambientes),
                cantidad_dormitorios: Number(formData.cantidad_dormitorios),
                cantidad_banos: Number(formData.cantidad_banos),
                capacidad: formData.capacidad ? Number(formData.capacidad) : null,
                disponible: Number(formData.disponible),
                categoria_id: Number(formData.categoria_id),
                localidad_id: Number(formData.localidad_id)
            };

            const result = esEdicion
                ? await updatePropiedad(id, payload, token)
                : await createPropiedad(payload, token);

            if (result.success) {
                navigate('/mis-propiedades');
            } else {
                setError(result.message || result.error || 'Error al guardar');
            }
        } catch (err) {
            setError('Error de conexión');
        } finally {
            setGuardando(false);
        }
    };

    if (loading) return <Loader />;

    return (
        <div className="container" style={{ padding: '40px 20px', maxWidth: '700px' }}>
            <h1>{esEdicion ? 'Editar propiedad' : 'Publicar nueva propiedad'}</h1>

            {error && <div className="alert alert-error">{error}</div>}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="form-group">
                    <label htmlFor="titulo">Título</label>
                    <input type="text" id="titulo" name="titulo"
                        value={formData.titulo} onChange={handleChange} required />
                </div>

                <div className="form-group">
                    <label htmlFor="descripcion">Descripción</label>
                    <textarea id="descripcion" name="descripcion" rows="4"
                        value={formData.descripcion} onChange={handleChange} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div className="form-group">
                        <label htmlFor="precio">Precio</label>
                        <input type="number" id="precio" name="precio" min="1"
                            value={formData.precio} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="expensas">Expensas</label>
                        <input type="number" id="expensas" name="expensas" min="0"
                            value={formData.expensas} onChange={handleChange} />
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="direccion">Dirección</label>
                    <input type="text" id="direccion" name="direccion"
                        value={formData.direccion} onChange={handleChange} required />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                    <div className="form-group">
                        <label htmlFor="cantidad_ambientes">Ambientes</label>
                        <input type="number" id="cantidad_ambientes" name="cantidad_ambientes" min="1"
                            value={formData.cantidad_ambientes} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="cantidad_dormitorios">Dormitorios</label>
                        <input type="number" id="cantidad_dormitorios" name="cantidad_dormitorios" min="1"
                            value={formData.cantidad_dormitorios} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="cantidad_banos">Baños</label>
                        <input type="number" id="cantidad_banos" name="cantidad_banos" min="1"
                            value={formData.cantidad_banos} onChange={handleChange} required />
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div className="form-group">
                        <label htmlFor="categoria_id">Categoría</label>
                        <select id="categoria_id" name="categoria_id"
                            value={formData.categoria_id} onChange={handleChange} required>
                            <option value="">Seleccionar...</option>
                            {categorias.map(c => (
                                <option key={c.id} value={c.id}>{c.nombre}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="localidad_id">Localidad</label>
                        <select id="localidad_id" name="localidad_id"
                            value={formData.localidad_id} onChange={handleChange} required>
                            <option value="">Seleccionar...</option>
                            {localidades.map(l => (
                                <option key={l.id} value={l.id}>{l.nombre}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="disponible">Disponibilidad</label>
                    <select id="disponible" name="disponible"
                        value={formData.disponible} onChange={handleChange}>
                        <option value={1}>Disponible</option>
                        <option value={0}>No disponible</option>
                    </select>
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                    <Link to="/mis-propiedades" className="btn-detalle btn-detalle-secundario">
                        Cancelar
                    </Link>
                    <button type="submit" className="btn-detalle btn-detalle-primario" disabled={guardando}>
                        {guardando ? 'Guardando...' : (esEdicion ? 'Guardar cambios' : 'Publicar')}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default PropiedadForm;