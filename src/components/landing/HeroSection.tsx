import { motion } from 'framer-motion';
import { ArrowRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export const HeroSection = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-background">
      {/* Soft organic gradient blobs */}
      <div className="absolute top-20 right-10 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-20 left-10 w-[400px] h-[400px] bg-rose-400/10 rounded-full blur-[100px] pointer-events-none" />
      
      {/* Content */}
      <div className="container mx-auto px-6 pt-28 pb-16 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex justify-center mb-8"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 text-primary text-sm font-medium">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              Now in Early Access
            </span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-6xl lg:text-7xl font-bold mb-8 leading-tight tracking-tight text-center text-balance"
          >
            Your work speaks for itself.{' '}
            <span className="text-primary">Now it can prove it.</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed text-center text-pretty"
          >
            Effortless creates verifiable proof of how your work was created, without ever seeing what you wrote. 
            Privacy-first authenticity for writers, students, and professionals.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          >
            <Button
              size="lg"
              className="bg-foreground text-background hover:bg-foreground/90 font-medium text-base px-8 h-12 rounded-full transition-all"
              asChild
            >
              <Link to="/auth">
                Start for free
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-border bg-transparent hover:bg-muted font-medium text-base px-8 h-12 rounded-full transition-all"
              asChild
            >
              <Link to="/demo">See how it works</Link>
            </Button>
          </motion.div>

          {/* Trust Points */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-muted-foreground"
          >
            {[
              "Your content stays private",
              "Cryptographic verification",
              "Works with any document"
            ].map((text, i) => (
              <div key={i} className="flex items-center gap-2">
                <Check className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">{text}</span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Visual element - simplified illustration */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-16 max-w-3xl mx-auto"
        >
          <div className="relative rounded-2xl border border-border bg-card p-8 shadow-xl shadow-black/5">
            {/* Browser chrome mockup */}
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-border">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-rose-400" />
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <div className="w-3 h-3 rounded-full bg-emerald-400" />
              </div>
              <div className="flex-1 ml-4">
                <div className="h-6 bg-muted rounded-md max-w-xs" />
              </div>
            </div>
            
            {/* Content preview */}
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-primary font-semibold text-sm">E</span>
                </div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-4 bg-muted rounded w-1/2" />
                </div>
              </div>
              <div className="pl-14 space-y-2">
                <div className="h-3 bg-muted/60 rounded w-full" />
                <div className="h-3 bg-muted/60 rounded w-5/6" />
                <div className="h-3 bg-muted/60 rounded w-4/6" />
              </div>
              <div className="pt-4 flex items-center gap-3">
                <div className="px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
                  Verified
                </div>
                <span className="text-sm text-muted-foreground">Process authenticated</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
