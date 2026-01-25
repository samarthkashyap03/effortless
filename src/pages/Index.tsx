import { Navbar } from '@/components/landing/Navbar';
import { HeroSection } from '@/components/landing/HeroSection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { HowItWorksSection } from '@/components/landing/HowItWorksSection';
import { SecuritySection } from '@/components/landing/SecuritySection';
import { CTASection } from '@/components/landing/CTASection';
import { VerificationTeaser } from '@/components/landing/VerificationTeaser';
import { Footer } from '@/components/landing/Footer';

const Index = () => {
  return (
    <main className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <SecuritySection />
      <VerificationTeaser />
      <CTASection />
      <Footer />
    </main>
  );
};

export default Index;
