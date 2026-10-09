import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useUI } from "../context/UIContext";
import { useSEO } from "../hooks/useSEO";
import {
    getReserva,
    aprobarReserva,
    rechazarReserva,
    finalizarReserva,
    cancelarReserva,
    getResenasByReserva
} from "../services/api";
import { rutaImagenPropiedad } from "../utils/imagenes";
import Loader from "../components/Loader";
import EmptyState from "../components/EmptyState";

const ESTADO_INFO = {
    pendiente: { etiqueta: "Pendiente", icono: "fa-hourglass-half", color: "#92400e", bg: "#fef3c7" },
    confirmada: { etiqueta: "Confirmada", icono: "fa-check-circle", color: "#065f46", bg: "#a7f3d0" },
    rechazada: { etiqueta: "Rechazada", icono: "fa-times-circle", color: "#991b1b", bg: "#fecaca" },
    cancelada: { etiqueta: "Cancelada", icono: "fa-ban", color: "#475569", bg: "#e2e8f0" },
    finalizada: { etiqueta: "Finalizada", icono: "fa-flag-checkered", color: "#1e3a8a", bg: "#bfdbfe" }
};

const soloDia = (f) => (f ? String(f).slice(0, 10) : "—");

const formatearFechaHora = (f) => {
    if (!f) return "—";
    const d = new Date(f);
    return d.toLocaleString("es-AR", {
        dateStyle: "short",
        timeStyle: "short"
    });
};

function ReservaDetalle() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { token, usuario } = useAuth();
    const { confirm, showToast } = useUI();
    useSEO("Detalle de reserva", "Detalle de reserva en AlquilER.", { noindex: true });

    const [loading, setLoading] = useState(true);
    const [accionando, setAccionando] = useState(false);
    const [reserva, setReserva] = useState(null);
    const [resenas, setResenas] = useState([]);
    const [error, setError] = useState("");

    const extraer = (res) => {
        if (res?.data !== undefined) return res.data;
        return res;
    };

    const cargar = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const res = await getReserva(id, token);
            const data = extraer(res);
            if (res.success) {
                setReserva(data);
                try {
                    const rRes = await getResenasByReserva(id, token);
                    const rData = extraer(rRes);
                    setResenas(Array.isArray(rData?.items) ? rData.items : Array.isArray(rData) ? rData : []);
                } catch (e) {
                    setResenas([]);
                }
            } else {
                setError(res.message || res.error || "No se pudo cargar la reserva.");
            }
        } catch (e) {
            setError("Error de conexión al cargar la reserva.");
        } finally {
            setLoading(false);
        }
    }, [id, token]);

    useEffect(() => {
        cargar();
    }, [cargar]);

    if (!id) return null;

    if (loading) return <Loader />;

    if (!reserva) {
        return (
            <div className="container" style={{ marginTop: 40, marginBottom: 40 }}>
                <EmptyState
                    icono="fa-calendar-times"
                    titulo="Reserva no encontrada"
                    descripcion={error || "La reserva solicitada no existe o no tenés permisos para verla."}
                    action={
                        <button className="btn-ver-todas" onClick={() => navigate("/reservas")}>
                            <i className="fas fa-arrow-left"></i> Volver a mis reservas
                        </button>
                    }
                />
            </div>
        );
    }

    const propiedad = reserva.propiedad || reserva.propiedad_obj || null;
    const inquilino = reserva.usuario || reserva.inquilino || null;
    const propietario = propiedad?.usuario || null;
    const esPropietario = propietario && usuario && String(propietario.id) === String(usuario.id);
    const esInquilino = inquilino && usuario && String(inquilino.id) === String(usuario.id);
    const esAdmin = usuario && Number(usuario.rol_id) === 2;

    const puedeAprobar = esPropietario && reserva.estado === "pendiente";
    const puedeRechazar = esPropietario && reserva.estado === "pendiente";
    const puedeFinalizar = esPropietario && reserva.estado === "confirmada";
    const puedeCancelar = (esInquilino || esPropietario || esAdmin) && ["pendiente", "confirmada"].includes(reserva.estado);

    const hoy = new Date();
    const finStr = reserva.fecha_fin_alquiler ? String(reserva.fecha_fin_alquiler).slice(0, 10) : null;
    const vencida = reserva.estado === "confirmada" && finStr && finStr < hoy.toISOString().slice(0, 10);

    const ejecutarAccion = async (accion) => {
        setAccionando(true);
        let result;
        try {
            if (accion === "aprobar") result = await aprobarReserva(reserva.id, token);
            if (accion === "rechazar") result = await rechazarReserva(reserva.id, token);
            if (accion === "finalizar") result = await finalizarReserva(reserva.id, token);
            if (accion === "cancelar") result = await cancelarReserva(reserva.id, token);

            if (result && result.success) {
                showToast(result.message || "Reserva actualizada correctamente.");
                await cargar();
            } else {
                showToast(result?.message || result?.error || "No se pudo actualizar la reserva.", "error");
            }
        } catch (e) {
            showToast("Error de conexión.", "error");
        } finally {
            setAccionando(false);
        }
    };

    const eInfo = ESTADO_INFO[reserva.estado] || { etiqueta: reserva.estado, icono: "fa-circle", color: "#475569", bg: "#f1f5f9" };
    const img = propiedad ? rutaImagenPropiedad(propiedad) : "";

    return (
        <div className="misprops-page">
            <div className="container" style={{ maxWidth: 1000 }}>
                <section className="misprops-hero">
                    <div className="misprops-hero-content">
                        <span className="misprops-hero-badge">
                            <i className="fas fa-calendar-check"></i> Reserva #{reserva.id}
                        </span>
                        <h1>
                            Detalle de <span>Reserva</span>
                        </h1>
                        <p>
                            Seguimiento completo del estado, fechas, participantes y acciones disponibles.
                        </p>
                        <div style={{ marginTop: 16 }}>
                            <Link to="/reservas" className="btn-detalle btn-detalle-secundario">
                                <i className="fas fa-arrow-left"></i> Volver a mis reservas
                            </Link>
                        </div>
                    </div>
                </section>

                <div className="dashboard-grid" style={{ gridTemplateColumns: "2fr 1fr", gap: 24 }}>
                    <div>
                        <section className="perfil-card">
                            <div className="perfil-card-header">
                                <h3>
                                    <i className="fas fa-info-circle"></i> Información general
                                </h3>
                            </div>
                            <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: 16 }}>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
                                    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 999, background: eInfo.bg, color: eInfo.color, fontWeight: 600 }}>
                                        <i className={`fas ${eInfo.icono}`}></i> {eInfo.etiqueta}
                                    </span>
                                    {vencida && (
                                        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 999, background: "#fef3c7", color: "#92400e", border: "1px solid #fcd34d", fontWeight: 600 }}>
                                            <i className="fas fa-exclamation-triangle"></i> Vencida (sin finalizar)
                                        </span>
                                    )}
                                </div>

                                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
                                    <div>
                                        <div style={{ fontSize: 13, color: "#64748b", marginBottom: 4 }}>Fechas</div>
                                        <div style={{ fontSize: 14 }}>
                                            <i className="far fa-calendar-alt"></i> Desde {soloDia(reserva.fecha_inicio_alquiler)}
                                        </div>
                                        <div style={{ fontSize: 14 }}>
                                            <i className="far fa-calendar-check"></i> Hasta {soloDia(reserva.fecha_fin_alquiler)}
                                        </div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 13, color: "#64748b", marginBottom: 4 }}>Timestamps</div>
                                        <div style={{ fontSize: 13 }}>Creada: {formatearFechaHora(reserva.created_at)}</div>
                                        <div style={{ fontSize: 13 }}>Actualizada: {formatearFechaHora(reserva.updated_at)}</div>
                                        {reserva.fecha_confirmacion && (
                                            <div style={{ fontSize: 13 }}>Confirmada: {formatearFechaHora(reserva.fecha_confirmacion)}</div>
                                        )}
                                    </div>
                                </div>

                                {(puedeAprobar || puedeRechazar || puedeFinalizar || puedeCancelar) && (
                                    <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                                        {puedeAprobar && (
                                            <button className="btn-detalle btn-detalle-primario" disabled={accionando} onClick={() => ejecutarAccion("aprobar")}>
                                                <i className="fas fa-check"></i> Aprobar
                                            </button>
                                        )}
                                        {puedeFinalizar && (
                                            <button className="btn-detalle btn-detalle-primario" disabled={accionando} onClick={() => ejecutarAccion("finalizar")}>
                                                <i className="fas fa-flag-checkered"></i> {vencida ? "Finalizar (vencida)" : "Finalizar"}
                                            </button>
                                        )}
                                        {puedeRechazar && (
                                            <button className="btn-detalle btn-detalle-danger" disabled={accionando} onClick={async () => {
                                                const ok = await confirm({ titulo: "Rechazar solicitud?", mensaje: "El inquilino recibirá el rechazo.", textoAceptar: "Rechazar", textoCancelar: "Cancelar", peligro: true });
                                                if (ok) ejecutarAccion("rechazar");
                                            }}>
                                                <i className="fas fa-times"></i> Rechazar
                                            </button>
                                        )}
                                        {puedeCancelar && (
                                            <button className="btn-detalle btn-detalle-secundario" disabled={accionando} onClick={async () => {
                                                const ok = await confirm({ titulo: "Cancelar reserva?", mensaje: "Esta acción puede cambiar el estado de la reserva.", textoAceptar: "Cancelar reserva", textoCancelar: "Volver", peligro: true });
                                                if (ok) ejecutarAccion("cancelar");
                                            }}>
                                                <i className="fas fa-ban"></i> Cancelar
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </section>

                        <section className="perfil-card" style={{ marginTop: 24 }}>
                            <div className="perfil-card-header">
                                <h3>
                                    <i className="fas fa-home"></i> Propiedad
                                </h3>
                            </div>
                            <div style={{ padding: "20px", display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
                                {img && (
                                    <img src={img} alt={propiedad.titulo || "Propiedad"} loading="lazy" style={{ width: 120, height: 90, objectFit: "cover", borderRadius: 10, border: "1px solid #e2e8f0" }} />
                                )}
                                <div>
                                    <div style={{ fontWeight: 600 }}>{propiedad?.titulo || "—"}</div>
                                    {propiedad?.direccion && <div style={{ fontSize: 14, color: "#64748b" }}>{propiedad.direccion}</div>}
                                    {propiedad?.id && (
                                        <Link to={`/propiedades/${propiedad.id}`} className="link-underline" style={{ fontSize: 14 }}>
                                            Ver propiedad <i className="fas fa-external-link-alt"></i>
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </section>

                        {resenas.length > 0 && (
                            <section className="perfil-card" style={{ marginTop: 24 }}>
                                <div className="perfil-card-header">
                                    <h3>
                                        <i className="fas fa-star"></i> Reseñas asociadas
                                    </h3>
                                </div>
                                <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: 12 }}>
                                    {resenas.map((r) => (
                                        <article key={r.id} style={{ border: "1px solid #e2e8f0", borderRadius: 10, padding: "12px 14px" }}>
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                                    {[1,2,3,4,5].map(n => (
                                                        <i key={n} className="fas fa-star" style={{ fontSize: 12, color: n <= Number(r.calificacion) ? "#f59e0b" : "#cbd5e1" }}></i>
                                                    ))}
                                                    <span style={{ fontSize: 13, fontWeight: 600 }}>{r.calificacion}/5</span>
                                                </div>
                                                <span style={{ fontSize: 12, color: "#64748b" }}>{formatearFechaHora(r.created_at)}</span>
                                            </div>
                                            <div style={{ fontSize: 13, color: "#475569", marginTop: 6 }}>Tipo: {r.tipo} • Calificador #{r.calificador_id}</div>
                                            {r.comentario && <p style={{ margin: "6px 0 0", fontSize: 13 }}>{r.comentario}</p>}
                                        </article>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>

                    <aside>
                        <section className="perfil-card">
                            <div className="perfil-card-header">
                                <h3>
                                    <i className="fas fa-users"></i> Participantes
                                </h3>
                            </div>
                            <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: 14 }}>
                                {inquilino && (
                                    <div>
                                        <div style={{ fontSize: 13, color: "#64748b" }}>Inquilino</div>
                                        <div style={{ fontWeight: 600 }}>{[inquilino.nombre, inquilino.apellido].filter(Boolean).join(" ") || `#${inquilino.id}`}</div>
                                        {inquilino.email && <div style={{ fontSize: 13 }}><i className="fas fa-envelope"></i> {inquilino.email}</div>}
                                        {inquilino.telefono && <div style={{ fontSize: 13 }}><i className="fas fa-phone-alt"></i> {inquilino.telefono}</div>}
                                    </div>
                                )}
                                {propietario && (
                                    <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: 14 }}>
                                        <div style={{ fontSize: 13, color: "#64748b" }}>Propietario</div>
                                        <div style={{ fontWeight: 600 }}>{[propietario.nombre, propietario.apellido].filter(Boolean).join(" ") || `#${propietario.id}`}</div>
                                        {propietario.email && <div style={{ fontSize: 13 }}><i className="fas fa-envelope"></i> {propietario.email}</div>}
                                        {propietario.telefono && <div style={{ fontSize: 13 }}><i className="fas fa-phone-alt"></i> {propietario.telefono}</div>}
                                    </div>
                                )}
                            </div>
                        </section>
                    </aside>
                </div>
            </div>
        </div>
    );
}

export default ReservaDetalle;
