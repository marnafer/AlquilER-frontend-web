import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import PropertyGrid from '../components/PropertyGrid';
import CategoryGrid from '../components/CategoryGrid';
import ServicesGrid from '../components/ServicesGrid';
import StatsSection from '../components/StatsSection';
import Footer from '../components/Footer';

function Home() {
  return (
    <div className="app-shell">
      <Navbar />
      <main>
        <Hero />
        <PropertyGrid />
        <CategoryGrid />
        <ServicesGrid />
        <StatsSection />
      </main>
      <Footer />
    </div>
  );
}

export default Home;