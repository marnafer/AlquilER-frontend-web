import SearchForm from './SearchForm';
import heroImage from '../assets/img/hero-default.png';

function Hero() {
  return (
    <section className="hero" aria-labelledby="hero-title">
        <div className="hero-copy">
          <div className="hero-badge">⌂ AlquilER</div>
          <h1 id="hero-title">Encontrá tu <span>propiedad ideal</span></h1>
          <p className="hero-text">Las mejores propiedades en alquiler. Departamentos, casas, locales comerciales y más.</p>
          <SearchForm />
        </div>
        <div className="hero-art">
          <img src={heroImage} alt="AlquilER" />
        </div>
    </section>
  );
}

export default Hero;