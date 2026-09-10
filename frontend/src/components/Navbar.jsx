function Navbar() {
  return (
    <nav className="topbar" aria-label="Navegación principal">
      <a className="brand" href="/">⌂ AlquilER</a>
      <div className="nav-links">
        <a href="/">Inicio</a>
        <a href="#propiedades">Propiedades</a>
        <a href="#categorias">Categorías</a>
        <a className="button button-quiet" href="#login">Ingresar</a>
        <a className="button button-dark" href="#register">Registrarse</a>
      </div>
    </nav>
  );
}

export default Navbar;