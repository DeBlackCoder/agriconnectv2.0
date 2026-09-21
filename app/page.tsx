import { Navbar, Footer } from '@/components/layout';
import {
  HeroSection,
  StatsSection,
  MissionSection,
  ProductsSection,
  FeaturesSection,
  SustainabilitySection,
  CTASection,
} from '@/components/home';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <HeroSection />
      <StatsSection />
      <MissionSection />
      <ProductsSection />
      <FeaturesSection />
      <SustainabilitySection />
      <CTASection />
      <Footer />
    </div>
  );
}
