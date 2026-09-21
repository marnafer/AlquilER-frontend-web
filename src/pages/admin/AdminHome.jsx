import React from 'react';
import { Link } from 'react-router-dom';

const modulos = [
    { to: '/admin/usuarios', icono: 'fa-users', titulo: 'Usuarios', desc: 'Cuentas registradas en el sistema.' },
    { to: '/admin/categorias', icono: 'fa-tags', titulo: 'Categorías', desc: 'Tipos de propiedades.' },
    { to: '/admin/provincias', icono: 'fa-map-marked-alt', titulo: 'Provincias', desc: 'Provincias disponibles.' },
    { to: '/admin/localidades', icono: 'fa-map-pin', titulo: 'Localidades', desc: 'Ciudades de cada provincia.' },
    { to: '/admin/roles', icono: 'fa-user-shield', titulo: 'Roles', desc: 'Roles del sistema.' },
    { to: '/admin/servicios', icono: 'fa-wrench', titulo: 'Servicios', desc: 'Servicios de las propiedades.' }
];

function AdminHome() {
    return (
        <div className="admin-page">
            <div className="container">
                <section className="admin-hero">
                    <div className="admin-hero-content">
                        <span className="admin-hero-badge">
                            <i className="fas fa-tachometer-alt"></i> Administración
                        </span>
                        <h1>Panel de control</h1>
                        <p>Gestioná los datos maestros y los usuarios de AlquilER.</p>
                    </div>
                </section>

                <section className="admin-grid">
                    {modulos.map(m => (
                        <Link to={m.to} key={m.to} className="admin-card">
                            <span className="admin-card-icono">
                                <i className={`fas ${m.icono}`}></i>
                            </span>
                            <strong>{m.titulo}</strong>
                            <small>{m.desc}</small>
                        </Link>
                    ))}
                </section>
            </div>
        </div>
    );
}

export default AdminHome;