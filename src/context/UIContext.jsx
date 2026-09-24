// Provee feedback global a toda la app:
// - showToast(mensaje, tipo): notificación flotante auto-descartable.
// - confirm({...}): modal de confirmación que reemplaza el window.confirm nativo.

import React, { createContext, useCallback, useContext, useRef, useState } from 'react';

const UIContext = createContext();

export const useUI = () => useContext(UIContext);

export function UIProvider({ children }) {
    const [toasts, setToasts] = useState([]);
    const [confirmacion, setConfirmacion] = useState(null);
    const confirmResolver = useRef(null);

    const showToast = useCallback((mensaje, tipo = 'success') => {
        const id = Date.now() + Math.random();
        setToasts(prev => [...prev, { id, mensaje, tipo }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 4000);
    }, []);

    const confirm = useCallback((opciones) => {
        setConfirmacion({
            titulo: '¿Estás seguro?',
            mensaje: '',
            textoAceptar: 'Confirmar',
            textoCancelar: 'Cancelar',
            peligro: false,
            ...opciones
        });
        return new Promise(resolve => {
            confirmResolver.current = resolve;
        });
    }, []);

    const cerrarConfirm = useCallback((resultado) => {
        setConfirmacion(null);
        if (confirmResolver.current) {
            confirmResolver.current(resultado);
            confirmResolver.current = null;
        }
    }, []);

    return (
        <UIContext.Provider value={{ showToast, confirm }}>
            {children}

            {/* TOASTS */}
            <div className="toast-stack" aria-live="polite">
                {toasts.map(t => (
                    <div key={t.id} className={`toast-global ${t.tipo}`} role="status">
                        <i className={`fas ${t.tipo === 'success' ? 'fa-check-circle' : t.tipo === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}`}></i>
                        <span>{t.mensaje}</span>
                    </div>
                ))}
            </div>

            {/* MODAL DE CONFIRMACIÓN */}
            {confirmacion && (
                <div
                    className="modal-backdrop-custom"
                    onClick={() => cerrarConfirm(false)}
                    role="presentation"
                >
                    <div
                        className="modal-custom"
                        role="alertdialog"
                        aria-modal="true"
                        aria-labelledby="ui-confirm-titulo"
                        aria-describedby="ui-confirm-mensaje"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className={`modal-icon ${confirmacion.peligro ? 'modal-icon-danger' : 'modal-icon-info'}`}>
                            <i className={`fas ${confirmacion.peligro ? 'fa-triangle-exclamation' : 'fa-circle-question'}`}></i>
                        </div>
                        <h3 id="ui-confirm-titulo">{confirmacion.titulo}</h3>
                        <p id="ui-confirm-mensaje">{confirmacion.mensaje}</p>
                        <div className="modal-actions">
                            <button
                                type="button"
                                className="btn-detalle btn-detalle-secundario"
                                onClick={() => cerrarConfirm(false)}
                            >
                                {confirmacion.textoCancelar}
                            </button>
                            <button
                                type="button"
                                className={`btn-detalle ${confirmacion.peligro ? 'btn-detalle-danger' : 'btn-detalle-primario'}`}
                                onClick={() => cerrarConfirm(true)}
                                autoFocus
                            >
                                {confirmacion.textoAceptar}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </UIContext.Provider>
    );
}