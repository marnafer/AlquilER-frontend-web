import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
    getCategorias,
    getLocalidades,
    getPropiedad,
    createPropiedad,
    updatePropiedad
} from '../services/api';
import Loader from '../components/Loader';

// ============================================
// ESTADO INICIAL DEL FORMULARIO
// ============================================
const FORM_INICIAL = {
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
};

function PropiedadForm() {
    const { id } = useParams();
    const esEdicion = Boolean(id);
    const navigate = useNavigate();
    const { token } = useAuth();

    // Estados de datos
    const [loading, setLoading] = useState(true);
    const [guardando, setGuardando] = useState(false);
    const [categorias, setCategorias] = useState([]);
    const [localidades, setLocalidades] = useState([]);

    // Estados del formulario
    const [formData, setFormData] = useState(FORM_INICIAL);
    const [errores, setErrores] = useState({});
    const [errorGeneral, setErrorGeneral] = useState('');

    // ============================================
    // CARGA INICIAL
    // ============================================
    useEffect(() => {
        cargarCatalogos();

        if (esEdicion) {
            cargarPropiedad();
        } else {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
            setErrorGeneral('No se pudieron cargar las categorías o localidades.');
        }
    };

    const cargarPropiedad = async () => {
        try {
            const prop = await getPropiedad(id);
            if (!prop) {
                setErrorGeneral('La propiedad que intentás editar no existe.');
                return;
            }
            setFormData({
                titulo: prop.titulo || '',
                descripcion: prop.descripcion || '',
                precio: prop.precio ?? '',
                expensas: prop.expensas ?? '',
                direccion: prop.direccion || '',
                cantidad_ambientes: prop.cantidad_ambientes ?? 1,
                cantidad_dormitorios: prop.cantidad_dormitorios ?? 1,
                cantidad_banos: prop.cantidad_banos ?? 1,
                capacidad: prop.capacidad ?? '',
                disponible: prop.disponible ? 1 : 0,
                categoria_id: prop.categoria_id ?? '',
                localidad_id: prop.localidad_id ?? ''
            });
        } catch (err) {
            setErrorGeneral('Error al cargar la propiedad.');
        } finally {
            setLoading(false);
        }
    };

    // ============================================
    // MANEJO DE CAMPOS
    // ============================================
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Si el usuario corrige un campo, limpiamos su error
        if (errores[name]) {
            setErrores(prev => {
                const next = { ...prev };
                delete next[name];
                return next;
            });
        }
    };

    // ============================================
    // VALIDACIÓN EN CLIENTE
    // ============================================
    const validar = () => {
        const nuevosErrores = {};

        if (!formData.titulo.trim()) {
            nuevosErrores.titulo = 'El título es obligatorio';
        } else if (formData.titulo.length > 150) {
            nuevosErrores.titulo = 'Máximo 150 caracteres';
        }

        if (!formData.direccion.trim()) {
            nuevosErrores.direccion = 'La dirección es obligatoria';
        }

        if (!formData.precio || Number(formData.precio) <= 0) {
            nuevosErrores.precio = 'El precio debe ser mayor a 0';
        }

        if (formData.expensas !== '' && Number(formData.expensas) < 0) {
            nuevosErrores.expensas = 'Las expensas no pueden ser negativas';
        }

        if (Number(formData.cantidad_ambientes) < 1) {
            nuevosErrores.cantidad_ambientes = 'Mínimo 1 ambiente';
        }

        if (Number(formData.cantidad_dormitorios) < 1) {
            nuevosErrores.cantidad_dormitorios = 'Mínimo 1 dormitorio';
        }

        if (Number(formData.cantidad_dormitorios) > Number(formData.cantidad_ambientes)) {
            nuevosErrores.cantidad_dormitorios = 'No puede superar los ambientes';
        }

        if (Number(formData.cantidad_banos) < 1) {
            nuevosErrores.cantidad_banos = 'Mínimo 1 baño';
        }

        if (!formData.categoria_id) {
            nuevosErrores.categoria_id = 'Seleccioná una categoría';
        }

        if (!formData.localidad_id) {
            nuevosErrores.localidad_id = 'Seleccioná una localidad';
        }

        setErrores(nuevosErrores);
        return Object.keys(nuevosErrores).length === 0;
    };

    // ============================================
    // SUBMIT
    // ============================================
    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorGeneral('');

        if (!validar()) {
            setErrorGeneral('Revisá los campos marcados en rojo.');
            return;
        }

        setGuardando(true);

        try {
            const payload = {
                titulo: formData.titulo.trim(),
                descripcion: formData.descripcion.trim() || null,
                precio: Number(formData.precio),
                expensas: Number(formData.expensas) || 0,
                direccion: formData.direccion.trim(),
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
                // Si el backend devuelve errores por campo (422)
                if (result.validation_errors) {
                    setErrores(result.validation_errors);
                }
                setErrorGeneral(
                    result.message || result.error || 'No se pudo guardar la propiedad.'
                );
            }
        } catch (err) {
            console.error('Error al guardar:', err);
            setErrorGeneral('Error de conexión con el servidor.');
        } finally {
            setGuardando(false);
        }
    };

    const handleCancelar = () => {
        navigate('/mis-propiedades');
    };

    // ============================================
    // RENDER
    // ============================================
    if (loading) return <Loader />;

    return (
        <div className="propform-page">
            <div className="container propform-container">

                {/* HEADER DE LA PÁGINA */}
                <div className="propform-header">
                    <Link to="/mis-propiedades" className="detalle-volver">
                        <i className="fas fa-arrow-left"></i> Volver
                    </Link>
                    <span className="section-badge">
                        {esEdicion ? 'Edición' : 'Publicación'}
                    </span>
                    <h1>
                        {esEdicion ? 'Editar propiedad' : 'Publicar nueva propiedad'}
                    </h1>
                    <p>
                        {esEdicion
                            ? 'Actualizá los datos de tu propiedad y guardá los cambios.'
                            : 'Completá los datos de tu propiedad para publicarla en AlquilER.'}
                    </p>
                </div>

                {/* ALERTA GENERAL */}
                {errorGeneral && (
                    <div className="alert alert-error" role="alert">
                        <i className="fas fa-exclamation-circle" style={{ marginRight: 8 }}></i>
                        {errorGeneral}
                    </div>
                )}

                <form onSubmit={handleSubmit} noValidate>

                    {/* ============================================
                        SECCIÓN 1: INFORMACIÓN BÁSICA
                       ============================================ */}
                    <section className="propform-card">
                        <div className="propform-card-header">
                            <h3>
                                <i className="fas fa-info-circle"></i> Información básica
                            </h3>
                        </div>

                        <div className="propform-grid">
                            <div className="form-group propform-col-full">
                                <label htmlFor="titulo">
                                    Título <span className="propform-required">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="titulo"
                                    name="titulo"
                                    placeholder="Ej: Departamento 2 ambientes en el centro"
                                    value={formData.titulo}
                                    onChange={handleChange}
                                    maxLength="150"
                                    className={errores.titulo ? 'input-error' : ''}
                                />
                                {errores.titulo && (
                                    <span className="form-error">{errores.titulo}</span>
                                )}
                            </div>

                            <div className="form-group propform-col-full">
                                <label htmlFor="descripcion">Descripción</label>
                                <textarea
                                    id="descripcion"
                                    name="descripcion"
                                    rows="4"
                                    placeholder="Contá los detalles importantes: estado, comodidades, alrededores..."
                                    value={formData.descripcion}
                                    onChange={handleChange}
                                    maxLength="5000"
                                />
                                <span className="form-help">
                                    {formData.descripcion.length} / 5000 caracteres
                                </span>
                            </div>

                            <div className="form-group">
                                <label htmlFor="categoria_id">
                                    Categoría <span className="propform-required">*</span>
                                </label>
                                <select
                                    id="categoria_id"
                                    name="categoria_id"
                                    value={formData.categoria_id}
                                    onChange={handleChange}
                                    className={errores.categoria_id ? 'input-error' : ''}
                                >
                                    <option value="">Seleccionar...</option>
                                    {categorias.map(c => (
                                        <option key={c.id} value={c.id}>{c.nombre}</option>
                                    ))}
                                </select>
                                {errores.categoria_id && (
                                    <span className="form-error">{errores.categoria_id}</span>
                                )}
                            </div>

                            <div className="form-group">
                                <label htmlFor="localidad_id">
                                    Localidad <span className="propform-required">*</span>
                                </label>
                                <select
                                    id="localidad_id"
                                    name="localidad_id"
                                    value={formData.localidad_id}
                                    onChange={handleChange}
                                    className={errores.localidad_id ? 'input-error' : ''}
                                >
                                    <option value="">Seleccionar...</option>
                                    {localidades.map(l => (
                                        <option key={l.id} value={l.id}>{l.nombre}</option>
                                    ))}
                                </select>
                                {errores.localidad_id && (
                                    <span className="form-error">{errores.localidad_id}</span>
                                )}
                            </div>

                            <div className="form-group propform-col-full">
                                <label htmlFor="direccion">
                                    Dirección <span className="propform-required">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="direccion"
                                    name="direccion"
                                    placeholder="Ej: Av. San Martín 1234, Piso 4 Depto A"
                                    value={formData.direccion}
                                    onChange={handleChange}
                                    maxLength="125"
                                    className={errores.direccion ? 'input-error' : ''}
                                />
                                {errores.direccion && (
                                    <span className="form-error">{errores.direccion}</span>
                                )}
                            </div>
                        </div>
                    </section>

                    {/* ============================================
                        SECCIÓN 2: DETALLES
                       ============================================ */}
                    <section className="propform-card">
                        <div className="propform-card-header">
                            <h3>
                                <i className="fas fa-home"></i> Detalles de la propiedad
                            </h3>
                        </div>

                        <div className="propform-grid propform-grid-4">
                            <div className="form-group">
                                <label htmlFor="cantidad_ambientes">
                                    Ambientes <span className="propform-required">*</span>
                                </label>
                                <input
                                    type="number"
                                    id="cantidad_ambientes"
                                    name="cantidad_ambientes"
                                    min="1"
                                    value={formData.cantidad_ambientes}
                                    onChange={handleChange}
                                    className={errores.cantidad_ambientes ? 'input-error' : ''}
                                />
                                {errores.cantidad_ambientes && (
                                    <span className="form-error">{errores.cantidad_ambientes}</span>
                                )}
                            </div>

                            <div className="form-group">
                                <label htmlFor="cantidad_dormitorios">
                                    Dormitorios <span className="propform-required">*</span>
                                </label>
                                <input
                                    type="number"
                                    id="cantidad_dormitorios"
                                    name="cantidad_dormitorios"
                                    min="1"
                                    value={formData.cantidad_dormitorios}
                                    onChange={handleChange}
                                    className={errores.cantidad_dormitorios ? 'input-error' : ''}
                                />
                                {errores.cantidad_dormitorios && (
                                    <span className="form-error">{errores.cantidad_dormitorios}</span>
                                )}
                            </div>

                            <div className="form-group">
                                <label htmlFor="cantidad_banos">
                                    Baños <span className="propform-required">*</span>
                                </label>
                                <input
                                    type="number"
                                    id="cantidad_banos"
                                    name="cantidad_banos"
                                    min="1"
                                    value={formData.cantidad_banos}
                                    onChange={handleChange}
                                    className={errores.cantidad_banos ? 'input-error' : ''}
                                />
                                {errores.cantidad_banos && (
                                    <span className="form-error">{errores.cantidad_banos}</span>
                                )}
                            </div>

                            <div className="form-group">
                                <label htmlFor="capacidad">Capacidad</label>
                                <input
                                    type="number"
                                    id="capacidad"
                                    name="capacidad"
                                    min="1"
                                    placeholder="Personas"
                                    value={formData.capacidad}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    </section>

                    {/* ============================================
                        SECCIÓN 3: PRECIO Y DISPONIBILIDAD
                       ============================================ */}
                    <section className="propform-card">
                        <div className="propform-card-header">
                            <h3>
                                <i className="fas fa-dollar-sign"></i> Precio y disponibilidad
                            </h3>
                        </div>

                        <div className="propform-grid">
                            <div className="form-group">
                                <label htmlFor="precio">
                                    Precio mensual <span className="propform-required">*</span>
                                </label>
                                <div className="propform-input-prefix">
                                    <span>$</span>
                                    <input
                                        type="number"
                                        id="precio"
                                        name="precio"
                                        min="0"
                                        step="0.01"
                                        placeholder="0"
                                        value={formData.precio}
                                        onChange={handleChange}
                                        className={errores.precio ? 'input-error' : ''}
                                    />
                                </div>
                                {errores.precio && (
                                    <span className="form-error">{errores.precio}</span>
                                )}
                            </div>

                            <div className="form-group">
                                <label htmlFor="expensas">Expensas</label>
                                <div className="propform-input-prefix">
                                    <span>$</span>
                                    <input
                                        type="number"
                                        id="expensas"
                                        name="expensas"
                                        min="0"
                                        step="0.01"
                                        placeholder="0"
                                        value={formData.expensas}
                                        onChange={handleChange}
                                        className={errores.expensas ? 'input-error' : ''}
                                    />
                                </div>
                                {errores.expensas && (
                                    <span className="form-error">{errores.expensas}</span>
                                )}
                            </div>

                            <div className="form-group propform-col-full">
                                <label htmlFor="disponible">Estado</label>
                                <select
                                    id="disponible"
                                    name="disponible"
                                    value={formData.disponible}
                                    onChange={handleChange}
                                >
                                    <option value={1}>Disponible para alquilar</option>
                                    <option value={0}>No disponible</option>
                                </select>
                                <span className="form-help">
                                    Las propiedades no disponibles se siguen viendo en tu panel, pero no en el catálogo público.
                                </span>
                            </div>
                        </div>
                    </section>

                    {/* ============================================
                        ACCIONES
                       ============================================ */}
                    <div className="propform-actions">
                        <button
                            type="button"
                            className="btn-detalle btn-detalle-secundario"
                            onClick={handleCancelar}
                            disabled={guardando}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="btn-detalle btn-detalle-primario"
                            disabled={guardando}
                        >
                            {guardando ? (
                                <>
                                    <i className="fas fa-spinner fa-spin"></i> Guardando...
                                </>
                            ) : (
                                <>
                                    <i className={`fas ${esEdicion ? 'fa-save' : 'fa-plus'}`}></i>
                                    {esEdicion ? 'Guardar cambios' : 'Publicar propiedad'}
                                </>
                            )}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}

export default PropiedadForm;