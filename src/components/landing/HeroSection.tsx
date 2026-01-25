import { motion } from 'framer-motion';
import { ArrowRight, Shield, Fingerprint, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ParticleBackground } from './ParticleBackground';
import { Link } from 'react-router-dom';
import heroAbstractBg from '@/assets/hero-abstract-bg.jpg';

export const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0a0a0a]">
      {/* Background Image */}
      <motion.div
        initial={{ scale: 1 }}
        animate={{ scale: 1.05 }}
        transition={{
          duration: 20,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "linear"
        }}
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30 mix-blend-screen contrast-110 saturate-105 filter brightness-110"
        style={{ backgroundImage: `url(${heroAbstractBg})` }}
      />

      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/50 to-black pointer-events-none" />
      <ParticleBackground />

      {/* Radial gradient overlay - Enhanced */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-cyan-500/15 rounded-full blur-[150px] pointer-events-none animate-pulse-slow" />
      <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-blue-600/15 rounded-full blur-[150px] pointer-events-none animate-pulse-slow delay-1000" />

      {/* Content */}
      <div className="container mx-auto px-6 pt-32 pb-20 relative z-10">
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-cyan-500/20 bg-cyan-500/5 backdrop-blur-md mb-10 hover:bg-cyan-500/10 transition-colors cursor-default shadow-[0_0_20px_-10px_rgba(6,182,212,0.3)]"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </span>
            <span className="text-sm text-cyan-100 font-medium tracking-wide">
              Privacy-First Work Verification
            </span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-5xl md:text-7xl lg:text-8xl font-bold mb-8 leading-tight tracking-tight text-white drop-shadow-2xl"
          >
            Prove Your Work is{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-blue-500 to-purple-500 animate-gradient-x drop-shadow-lg">
              Authentic
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-xl md:text-2xl text-zinc-300 mb-12 max-w-3xl mx-auto leading-relaxed drop-shadow-md"
          >
            Effortless verifies how your work was created and cryptographically binds that proof to your final document, without ever storing your text.

          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col sm:flex-row items-center justify-center gap-5 mb-16"
          >
            <Button
              size="lg"
              className="bg-white text-black hover:bg-cyan-50 hover:text-cyan-950 font-semibold text-lg px-8 h-14 rounded-full transition-all transform hover:scale-105 active:scale-95 shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_-15px_rgba(6,182,212,0.5)] border-2 border-transparent hover:border-cyan-200"
              asChild
            >
              <Link to="/auth">
                Start Verification
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/10 bg-white/5 hover:bg-white/10 text-white backdrop-blur-md font-semibold text-lg px-8 h-14 rounded-full transition-all hover:scale-105 active:scale-95 shadow-lg"
              asChild
            >
              <Link to="/demo">Watch Demo</Link>
            </Button>
          </motion.div>

          {/* Trust Badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6 text-zinc-500"
          >
            {[
              { icon: Shield, text: "Zero-Knowledge" },
              { icon: Fingerprint, text: "Writing Behavior" },
              { icon: CheckCircle, text: "Cryptographic Proof" }
            ].map(({ icon: Icon, text }, i) => (
              <div key={i} className="flex items-center gap-3 group hover:text-cyan-400 transition-colors duration-300">
                <Icon className="w-6 h-6 text-zinc-600 group-hover:text-cyan-500 transition-colors" />
                <span className="text-sm font-medium tracking-wide uppercase">{text}</span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
        >
          <div className="flex flex-col items-center gap-2">
            <span className="text-[10px] uppercase tracking-widest text-zinc-600">Scroll</span>
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="w-5 h-9 rounded-full border-2 border-zinc-800 flex items-start justify-center p-1.5"
            >
              <motion.div
                className="w-1.5 h-1.5 rounded-full bg-cyan-500"
              />
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
