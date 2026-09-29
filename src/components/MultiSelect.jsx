import React, { useState, useRef, useEffect, useMemo } from 'react';

// Selector multiple con checkboxes. Se usa para categorias, localidades y
// servicios, donde el catalogo acepta mas de un valor a la vez.
export default function MultiSelect({
    label,
    icon,
    options,
    selected,
    onChange,
    placeholder = 'Todas',
    disabled = false
}) {
    const [abierto, setAbierto] = useState(false);
    const contenedor = useRef(null);

    const opcionesOrdenadas = useMemo(() => {
        return [...options].sort((a, b) =>
            (a.nombre || '')
                .localeCompare(
                    b.nombre || '',
                    'es'
                )
        );
    }, [options]);

    useEffect(() => {
        if (!abierto) return;

        const alClickFuera = (evento) => {
            if (contenedor.current && !contenedor.current.contains(evento.target)) {
                setAbierto(false);
            }
        };
        const alEscape = (evento) => {
            if (evento.key === 'Escape') setAbierto(false);
        };

        document.addEventListener('mousedown', alClickFuera);
        document.addEventListener('keydown', alEscape);
        return () => {
            document.removeEventListener('mousedown', alClickFuera);
            document.removeEventListener('keydown', alEscape);
        };
    }, [abierto]);

    const alternar = (id) => {
        const valor = String(id);
        const yaEsta = selected.some(seleccionado => String(seleccionado) === valor);
        onChange(yaEsta
            ? selected.filter(seleccionado => String(seleccionado) !== valor)
            : [...selected, id]);
    };

    const nombreDe = (id) => options.find(opcion => String(opcion.id) === String(id))?.nombre;

    const resumen = selected.length === 0
        ? placeholder
        : selected.length === 1
            ? (nombreDe(selected[0]) ?? '1 seleccionada')
            : `${selected.length} seleccionados`;

    return (
        <div className="filtro-group" ref={contenedor}>
            <label><i className={`fas ${icon}`}></i> {label}</label>
            <div className="multi-select">
                <button
                    type="button"
                    className="multi-select-btn"
                    onClick={() => setAbierto(v => !v)}
                    disabled={disabled}
                    aria-expanded={abierto}
                    aria-label={`${label}: ${resumen}`}
                >
                    <span>{resumen}</span>
                    <i className={`fas fa-chevron-${abierto ? 'up' : 'down'}`}></i>
                </button>

                {abierto && (
                    <div className="multi-select-panel">
                        {opcionesOrdenadas.length === 0 ? (
                            <span className="multi-select-vacio">Sin opciones</span>
                        ) : (
                            opcionesOrdenadas.map(opcion => (
                                <label className="multi-select-item" key={opcion.id}>
                                    <input
                                        type="checkbox"
                                        checked={selected.some(seleccionado => String(seleccionado) === String(opcion.id))}
                                        onChange={() => alternar(opcion.id)}
                                    />
                                    <span>{opcion.nombre}</span>
                                </label>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
