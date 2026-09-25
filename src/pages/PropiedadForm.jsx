import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useUI } from '../context/UIContext';
import { 
    getCategorias, 
    getLocalidades, 
    getServicios,
    getServiciosByPropiedad,
    guardarServiciosPropiedad,
    sincronizarServiciosPropiedad,
    getUsuarios,
    createPropiedad, 
    updatePropiedad, 
    getPropiedad, 
    subirImagenPropiedad, 
    establecerImagenPrincipal, 
    eliminarImagenPropiedad, 
    API_URL 
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
    localidad_id: '',
    propietario_id: ''
};

function PropiedadForm() {
    const { id } = useParams();
    const esEdicion = Boolean(id);
    const navigate = useNavigate();
    const location = useLocation();
    const recienCreada = Boolean(location.state?.recienCreada);
    const { token, usuario } = useAuth();
    const { confirm, showToast } = useUI();
    const esAdmin = Number(usuario?.rol_id) === 2;

    // Estados de datos
const [loading, setLoading] = useState(true);
    const [guardando, setGuardando] = useState(false);
    const [error, setError] = useState('');
    const [categorias, setCategorias] = useState([]);
    const [localidades, setLocalidades] = useState([]);
    const [serviciosCat, setServiciosCat] = useState([]);
    const [serviciosSeleccionados, setServiciosSeleccionados] = useState([]);
    const [usuarios, setUsuarios] = useState([]);

    const [imagenes, setImagenes] = useState([]);
    const [archivoImagen, setArchivoImagen] = useState(null);
    const [subiendoImagen, setSubiendoImagen] = useState(false);
    const [imagenError, setImagenError] = useState('');
    const [archivosCrear, setArchivosCrear] = useState([]);
    const imagenInputRef = useRef(null);
    const imagenesSectionRef = useRef(null);

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
            const [cats, locs, servs] = await Promise.all([
                getCategorias(),
                getLocalidades(),
                getServicios()
            ]);
            setCategorias(cats);
            setLocalidades(locs);
            setServiciosCat(Array.isArray(servs) ? servs : []);
        } catch (err) {
            console.error('Error cargando catálogos:', err);
            setErrorGeneral('No se pudieron cargar las categorías o localidades.');
        }

        if (esAdmin) {
            try {
                const res = await getUsuarios(token);
                const lista = res?.data?.items ?? res?.data ?? [];
                setUsuarios(Array.isArray(lista) ? lista : []);
            } catch (err) {
                console.error('Error cargando usuarios:', err);
            }
        }
    };

    const cargarPropiedad = async () => {
        try {
            const prop = await getPropiedad(id);
            if (!prop) {
                setErrorGeneral('La propiedad que intentás editar no existe.');
                return;
            }

            // Guard de ownership: solo el dueño o un administrador puede editar
            const esAdmin = Number(usuario?.rol_id) === 2;
            const esDuenio = Number(prop.usuario_id) === Number(usuario?.id);
            if (!esAdmin && !esDuenio) {
                setErrorGeneral('No tenés permisos para editar esta propiedad.');
                return;
            }

            const servicios = await getServiciosByPropiedad(id);
            setServiciosSeleccionados(
                Array.isArray(servicios)
                    ? servicios.map(s => Number(s.id)).filter(Boolean)
                    : []
            );

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
                localidad_id: prop.localidad_id ?? '',
                propietario_id: prop.usuario_id ?? ''
            });
            setImagenes(Array.isArray(prop.imagenes) ? prop.imagenes : []);
        } catch (err) {
            setErrorGeneral('Error al cargar la propiedad.');
        } finally {
            setLoading(false);
        }
    };

    // Si la propiedad se acaba de crear, resaltamos la sección de imágenes
    useEffect(() => {
        if (recienCreada && esEdicion && !loading) {
            const timer = setTimeout(() => {
                imagenesSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [recienCreada, esEdicion, loading]);

    // ============================================
    // MANEJO DE IMÁGENES
    // ============================================
    const urlImagen = (imagen) => {
        if (!imagen?.ruta) return '';
        return imagen.ruta.startsWith('http') ? imagen.ruta : `${API_URL}${imagen.ruta}`;
    };

    const cargarImagenes = async () => {
        const prop = await getPropiedad(id);
        if (prop) setImagenes(Array.isArray(prop.imagenes) ? prop.imagenes : []);
    };

    const handleArchivoImagen = (e) => {
        setArchivoImagen(e.target.files[0] || null);
        setImagenError('');
    };

    const validarArchivo = (file) => {
        const permitidos = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!permitidos.includes(file.type)) {
            return 'Formato no permitido (usá JPG, PNG, GIF o WEBP).';
        }
        if (file.size > 5 * 1024 * 1024) {
            return `${file.name} supera los 5 MB.`;
        }
        return null;
    };

    const handleArchivosCrear = (e) => {
        setImagenError('');
        const seleccionados = Array.from(e.target.files || []);
        if (seleccionados.length === 0) return;
        const invalidos = seleccionados.map(validarArchivo).filter(Boolean);
        if (invalidos.length > 0) {
            setImagenError(invalidos[0]);
            if (imagenInputRef.current) imagenInputRef.current.value = '';
            return;
        }
        setArchivosCrear(prev => {
            const total = prev.length + seleccionados.length;
            if (total > 10) {
                setImagenError('Máximo 10 imágenes por propiedad.');
                return prev;
            }
            return [...prev, ...seleccionados];
        });
        if (imagenInputRef.current) imagenInputRef.current.value = '';
    };

    const quitarArchivoCrear = (index) => {
        setArchivosCrear(prev => prev.filter((_, i) => i !== index));
    };

    const urlArchivoCrear = (file) => URL.createObjectURL(file);

    const handleSubirImagen = async () => {
        if (!archivoImagen) {
            setImagenError('Seleccioná un archivo de imagen primero.');
            return;
        }
        setSubiendoImagen(true);
        setImagenError('');
        try {
            const result = await subirImagenPropiedad(id, archivoImagen, token);
            if (result.success) {
                setArchivoImagen(null);
                if (imagenInputRef.current) imagenInputRef.current.value = '';
                await cargarImagenes();
            } else {
                setImagenError(result.message || result.error || 'No se pudo subir la imagen.');
            }
        } catch (err) {
            setImagenError('Error de conexión al subir la imagen.');
        } finally {
            setSubiendoImagen(false);
        }
    };

    const handleSetPrincipal = async (imagenId) => {
        setImagenError('');
        const result = await establecerImagenPrincipal(imagenId, token);
        if (result.success) {
            await cargarImagenes();
        } else {
            setImagenError(result.message || result.error || 'No se pudo actualizar la imagen principal.');
        }
    };

    const handleEliminarImagen = async (imagenId) => {
        const confirmado = await confirm({
            titulo: '¿Eliminar esta imagen?',
            mensaje: 'La imagen se quitará de la propiedad.',
            textoAceptar: 'Sí, eliminar',
            textoCancelar: 'Cancelar',
            peligro: true
        });
        if (!confirmado) return;
        setImagenError('');
        const result = await eliminarImagenPropiedad(imagenId, token);
        if (result.success) {
            await cargarImagenes();
        } else {
            setImagenError(result.message || result.error || 'No se pudo eliminar la imagen.');
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

        if (esAdmin && !esEdicion && !formData.propietario_id) {
            nuevosErrores.propietario_id = 'Seleccioná el propietario de la propiedad';
        }

        setErrores(nuevosErrores);
        return Object.keys(nuevosErrores).length === 0;
    };

    // ============================================
    // MANEJO DE SERVICIOS
    // ============================================
    const toggleServicio = (servicioId) => {
        const id = Number(servicioId);
        setServiciosSeleccionados(prev =>
            prev.includes(id)
                ? prev.filter(x => x !== id)
                : [...prev, id]
        );
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

            if (esAdmin && !esEdicion && formData.propietario_id) {
                payload.propietario_id = Number(formData.propietario_id);
            }

            const result = esEdicion
                ? await updatePropiedad(id, payload, token)
                : await createPropiedad(payload, token);

if (result.success) {
                const propiedadId = Number(id || result.data?.id || result.id);
                if (propiedadId) {
                    if (esEdicion) {
                        await sincronizarServiciosPropiedad(
                            propiedadId,
                            serviciosSeleccionados,
                            token
                        );
                    } else {
                        if (serviciosSeleccionados.length > 0) {
                            await guardarServiciosPropiedad(
                                propiedadId,
                                serviciosSeleccionados,
                                token
                            );
                        }
                        // Subimos las fotos seleccionadas antes de publicar
                        if (archivosCrear.length > 0) {
                            let erroresSubida = 0;
                            for (const archivo of archivosCrear) {
                                const subida = await subirImagenPropiedad(propiedadId, archivo, token);
                                if (!subida.success) erroresSubida += 1;
                            }
                            if (erroresSubida > 0) {
                                showToast(
                                    `Se publicó la propiedad pero ${erroresSubida} fotos no se pudieron subir.`,
                                    'error'
                                );
                            } else {
                                showToast('Propiedad publicada correctamente.', 'success');
                            }
                        }
                    }
                }
                navigate(esEdicion || !propiedadId
                    ? '/mis-propiedades'
                    : `/propiedades/${propiedadId}/editar`, {
                    state: (esEdicion || archivosCrear.length > 0)
                        ? undefined
                        : { recienCreada: true }
                });
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

                            {esAdmin && !esEdicion && (
                                <div className="form-group propform-col-full">
                                    <label htmlFor="propietario_id">
                                        Propietario <span className="propform-required">*</span>
                                    </label>
                                    <select
                                        id="propietario_id"
                                        name="propietario_id"
                                        value={formData.propietario_id}
                                        onChange={handleChange}
                                        className={errores.propietario_id ? 'input-error' : ''}
                                    >
                                        <option value="">Seleccionar propietario...</option>
                                        {usuarios.map(u => (
                                            <option key={u.id} value={u.id}>
                                                {u.nombre} {u.apellido} — {u.rol_id === 2 ? 'Administrador' : 'Usuario'}
                                            </option>
                                        ))}
                                    </select>
                                    {errores.propietario_id && (
                                        <span className="form-error">{errores.propietario_id}</span>
                                    )}
                                    <span className="form-help">
                                        Solo visible para administradores. La propiedad se asociará a este usuario.
                                    </span>
                                </div>
                            )}

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
                        SECCIÓN 4: IMÁGENES
                       ============================================ */}
                    <section className="propform-card" ref={imagenesSectionRef}>
                        <div className="propform-card-header">
                            <h3>
                                <i className="fas fa-images"></i> Imágenes de la propiedad
                            </h3>
                        </div>

                        {esEdicion ? (
                            <>
                                {recienCreada && (
                                    <div style={{
                                        background: '#d1fae5',
                                        color: '#065f46',
                                        padding: '12px 16px',
                                        borderRadius: 12,
                                        fontSize: 14,
                                        marginBottom: 18
                                    }}>
                                        <i className="fas fa-check-circle"></i>{' '}
                                        Propiedad creada correctamente. ¡Sumale fotos ahora para que se vea en el catálogo!
                                    </div>
                                )}

                                <div
                                    style={{
                                        display: 'flex',
                                        flexWrap: 'wrap',
                                        gap: 12,
                                        marginBottom: 18
                                    }}
                                >
                                    {imagenes.length === 0 && (
                                        <p className="form-help">
                                            Todavía no hay imágenes. Subí la primera para que aparezca en el catálogo.
                                        </p>
                                    )}
                                    {imagenes.map(img => (
                                        <div
                                            key={img.id}
                                            style={{
                                                width: 160,
                                                border: Number(img.es_principal) === 1
                                                    ? '3px solid #16a34a'
                                                    : '1px solid #ddd',
                                                borderRadius: 8,
                                                overflow: 'hidden',
                                                position: 'relative'
                                            }}
                                        >
                                            <img
                                                src={urlImagen(img)}
                                                alt={img.descripcion || 'Imagen de la propiedad'}
                                                style={{ width: '100%', height: 110, objectFit: 'cover', display: 'block' }}
                                            />
                                            <div style={{ padding: 8 }}>
                                                {Number(img.es_principal) === 1 ? (
                                                    <span
                                                        className="propform-gallery-principal"
                                                        style={{
                                                            color: '#16a34a',
                                                            fontWeight: 700,
                                                            fontSize: 13,
                                                            display: 'block',
                                                            marginBottom: 4
                                                        }}
                                                    >
                                                        <i className="fas fa-star" style={{ color: '#f59e0b' }}></i> Principal
                                                    </span>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        className="btn-detalle btn-detalle-secundario"
                                                        style={{ marginBottom: 4 }}
                                                        onClick={() => handleSetPrincipal(img.id)}
                                                    >
                                                        <i className="fas fa-star"></i> Principal
                                                    </button>
                                                )}
                                                <button
                                                    type="button"
                                                    className="btn-detalle btn-detalle-danger"
                                                    onClick={() => handleEliminarImagen(img.id)}
                                                >
                                                    <i className="fas fa-trash-alt"></i> Eliminar
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="form-group">
                                    <label htmlFor="imagen-file-input">Agregar imagen</label>
                                    <input
                                        id="imagen-file-input"
                                        className="imagen-input"
                                        type="file"
                                        accept="image/jpeg,image/png,image/gif,image/webp"
                                        onChange={handleArchivoImagen}
                                        ref={imagenInputRef}
                                    />
                                    <span className="form-help">
                                        Máx. 5 MB. Formatos: JPG, PNG, GIF, WEBP.
                                    </span>
                                    {archivoImagen && (
                                        <span className="form-help">
                                            Archivo seleccionado: {archivoImagen.name} ({(archivoImagen.size / 1024).toFixed(0)} KB)
                                        </span>
                                    )}
                                    {imagenError && (
                                        <span className="form-error">{imagenError}</span>
                                    )}
                                    <div style={{ marginTop: 10 }}>
                                        <button
                                            type="button"
                                            className="btn-detalle btn-detalle-primario"
                                            onClick={handleSubirImagen}
                                            disabled={subiendoImagen || !archivoImagen}
                                        >
                                            {subiendoImagen ? (
                                                <>
                                                    <i className="fas fa-spinner fa-spin"></i> Subiendo...
                                                </>
                                            ) : (
                                                <>
                                                    <i className="fas fa-upload"></i> Subir imagen
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                <p className="form-help" style={{ marginBottom: 16 }}>
                                    Elegí las fotos de la propiedad. Se subirán automáticamente al
                                    publicar. Después podés elegir cuál es la principal.
                                </p>

                                <div className="form-group">
                                    <label htmlFor="imagen-file-input-create">Agregar fotos</label>
                                    <input
                                        id="imagen-file-input-create"
                                        className="imagen-input"
                                        type="file"
                                        accept="image/jpeg,image/png,image/gif,image/webp"
                                        multiple
                                        onChange={handleArchivosCrear}
                                        ref={imagenInputRef}
                                    />
                                    <span className="form-help">
                                        Máx. 5 MB cada una y hasta 10 imágenes. Formatos: JPG, PNG, GIF, WEBP.
                                    </span>
                                    {imagenError && (
                                        <span className="form-error">{imagenError}</span>
                                    )}
                                </div>

                                {archivosCrear.length > 0 && (
                                    <div
                                        style={{
                                            display: 'flex',
                                            flexWrap: 'wrap',
                                            gap: 12,
                                            marginTop: 6
                                        }}
                                    >
                                        {archivosCrear.map((archivo, index) => (
                                            <div
                                                key={`${archivo.name}-${archivo.lastModified}-${index}`}
                                                style={{
                                                    width: 160,
                                                    border: '1px solid #ddd',
                                                    borderRadius: 8,
                                                    overflow: 'hidden',
                                                    position: 'relative'
                                                }}
                                            >
                                                <img
                                                    src={urlArchivoCrear(archivo)}
                                                    alt={`Foto ${index + 1}`}
                                                    style={{ width: '100%', height: 110, objectFit: 'cover', display: 'block' }}
                                                />
                                                <button
                                                    type="button"
                                                    className="btn-detalle btn-detalle-danger"
                                                    style={{
                                                        width: '100%',
                                                        borderRadius: 0,
                                                        fontSize: 12,
                                                        padding: '6px 8px'
                                                    }}
                                                    onClick={() => quitarArchivoCrear(index)}
                                                    aria-label={`Quitar foto ${index + 1}`}
                                                >
                                                    <i className="fas fa-times"></i> Quitar
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </section>

                    {/* ============================================
                        SECCIÓN 5: SERVICIOS
                       ============================================ */}
                    <section className="propform-card">
                        <div className="propform-card-header">
                            <h3>
                                <i className="fas fa-concierge-bell"></i> Servicios de la propiedad
                            </h3>
                        </div>

                        {serviciosCat.length === 0 ? (
                            <p className="form-help">
                                Todavía no hay servicios cargados en el sistema.
                            </p>
                        ) : (
                            <div className="servicios-checkbox-grid">
                                {serviciosCat.map(serv => {
                                    const activo = serviciosSeleccionados.includes(Number(serv.id));
                                    return (
                                        <label
                                            key={serv.id}
                                            className={`servicio-checkbox ${activo ? 'activo' : ''}`}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={activo}
                                                onChange={() => toggleServicio(serv.id)}
                                            />
                                            <span className="servicio-checkbox-radio">
                                                {activo && <i className="fas fa-check"></i>}
                                            </span>
                                            <span className="servicio-checkbox-nombre">{serv.nombre}</span>
                                        </label>
                                    );
                                })}
                            </div>
                        )}
                        <span className="form-help">
                            Marcá las comodidades que ofrece la propiedad. Quién la vea podrá filtrar
                            y conocer estos servicios desde el detalle.
                        </span>
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