function Footer() {
  return (
    <footer className="site-footer">
      <div>
        <h2>⌂ AlquilER</h2>
        <p>La mejor plataforma para encontrar tu próximo alquiler.</p>
      </div>
      <div>
        <h3>Enlaces rápidos</h3>
        <a href="/">Inicio</a>
        <a href="#propiedades">Propiedades</a>
        <a href="#calculadora">Calculadora</a>
      </div>
      <div>
        <h3>Contacto</h3>
        <p>info@alquiler.com</p>
        <p>+54 11 1234-5678</p>
      </div>
      <p className="footer-copyright">© {new Date().getFullYear()} AlquilER. Todos los derechos reservados.</p>
    </footer>
  );
}

export default Footer;
