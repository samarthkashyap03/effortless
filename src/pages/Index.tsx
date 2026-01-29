import { Navbar } from '@/components/landing/Navbar';
import { HeroSection } from '@/components/landing/HeroSection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { HowItWorksSection } from '@/components/landing/HowItWorksSection';
import { SecuritySection } from '@/components/landing/SecuritySection';
import { CTASection } from '@/components/landing/CTASection';
import { VerificationTeaser } from '@/components/landing/VerificationTeaser';
import { Footer } from '@/components/landing/Footer';

import { SEO } from '@/components/SEO';

const Index = () => {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-foreground overflow-x-hidden selection:bg-cyan-500/30 selection:text-cyan-100">
      <SEO
        title="Effortless - Authentic Verification"
        description="Verify the authenticity of your work with privacy-first proof-of-process technology. Created by Samarth Kashyap."
        keywords={['Authenticity', 'Verification', 'Proof of Process']}
      />
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <SecuritySection />
      <VerificationTeaser />
      <CTASection />
      <Footer />
    </div>
  );
};

export default Index;
